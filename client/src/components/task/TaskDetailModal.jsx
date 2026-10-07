import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { Avatar } from "../common/Avatar";
import { TaskNotes } from "./TaskNotes";
import { TaskAttachments } from "./TaskAttachments";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { ChangeSummary } from "../audit/ChangeSummary";
import { taskApi } from "../../api/taskApi";
import { TASK_COLUMNS, TaskStatus } from "../../constants";
import { useAuthStore } from "../../store/authStore";
import { formatDateShort, formatRelativeTime } from "../../utils/formatDate";
import {
  Calendar,
  User,
  Trash2,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const TASK_ACTION_PHRASES = {
  CREATED: "created this task",
  UPDATED: "updated this task",
  CANCELLED: "cancelled this task",
};

export function TaskDetailModal({
  isOpen,
  onClose,
  taskId,
  projectMembers = [],
  isEditorOrAdmin = false,
  isProjectAdmin = false,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const { user } = useAuthStore();

  const loadTask = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const response = await taskApi.getTaskById(taskId);
      const data = response.data;
      setTask(data);
      setTitle(data.title || "");
      setDescription(data.description || "");
      setAssigneeId(data.assigneeId || "");
    } catch (error) {
      toast.error(error.message || "Failed to load task details");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivity = async () => {
    if (!taskId) return;
    setIsLoadingLogs(true);
    try {
      const response = await taskApi.getActivity(taskId);
      setActivityLogs(response.data || []);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      loadTask();
      setActiveTab("details");
    }
  }, [isOpen, taskId]);

  useEffect(() => {
    if (activeTab === "activity") {
      loadActivity();
    }
  }, [activeTab]);

  const handleSaveChanges = async () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      const response = await taskApi.updateTaskInfo(taskId, formData);
      setTask(response.data);
      toast.success("Task updated successfully");
      if (onTaskUpdated) onTaskUpdated(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignChange = async (newAssigneeId) => {
    try {
      const response = await taskApi.assignTask(taskId, newAssigneeId);
      setTask(response.data);
      setAssigneeId(newAssigneeId);
      toast.success("Assignee updated");
      if (onTaskUpdated) onTaskUpdated(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to assign task");
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (task?.assigneeId?._id !== user?._id && task?.assigneeId !== user?._id) {
      toast.error("Only the assigned member can update the task status");
      return;
    }

    try {
      const response = await taskApi.updateStatus(taskId, newStatus);
      setTask(response.data);
      toast.success(`Status updated to ${newStatus}`);
      if (onTaskUpdated) onTaskUpdated(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      await taskApi.deleteTask(taskId);
      toast.success("Task cancelled");
      setShowDeleteConfirm(false);
      if (onTaskDeleted) onTaskDeleted(taskId);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-3xl">
        {isLoading || !task ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-slate-400">
                  TASK-{task._id?.slice(-4).toUpperCase()}
                </span>

                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-semibold rounded-lg px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {TASK_COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeTab === "details"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      activeTab === "activity"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Activity
                  </button>
                </div>

                {isEditorOrAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Cancel Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {activeTab === "details" ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  {isEditorOrAdmin ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-1 transition-colors"
                      placeholder="Task title..."
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-slate-900">
                      {task.title}
                    </h2>
                  )}

                  {isEditorOrAdmin ? (
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add detailed task description..."
                      className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {task.description || (
                        <span className="italic text-slate-400">
                          No description provided.
                        </span>
                      )}
                    </p>
                  )}

                  {isEditorOrAdmin && (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleSaveChanges}
                        isLoading={isSaving}
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Assignee
                    </label>
                    {isEditorOrAdmin ? (
                      <select
                        value={assigneeId}
                        onChange={(e) => handleAssignChange(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Unassigned</option>
                        {projectMembers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.fullName || m.name} ({m.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <Avatar
                          src={task.assigneeId?.profile}
                          name={task.assigneeId?.fullName || "Unassigned"}
                          size="xs"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {task.assigneeId?.fullName || "Unassigned"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Created
                    </label>
                    <p className="text-xs text-slate-700 pt-2">
                      {formatDateShort(task.createdAt)} by{" "}
                      <strong>{task.createdBy?.fullName || "Author"}</strong>
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <TaskAttachments
                    taskId={task._id}
                    attachments={task.attachments || []}
                    isEditorOrAdmin={isEditorOrAdmin}
                    onTaskUpdated={(updated) => setTask(updated)}
                  />
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <TaskNotes
                    taskId={task._id}
                    isProjectAdmin={isProjectAdmin}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isLoadingLogs ? (
                  <div className="py-12 flex justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No activity logs recorded for this task yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activityLogs.map((log) => (
                      <div
                        key={log._id}
                        className="py-3 flex items-start gap-3"
                      >
                        <Avatar
                          src={log.performedBy?.profile}
                          name={log.performedBy?.fullName || "User"}
                          size="xs"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-800">
                            <strong>
                              {log.performedBy?.fullName || "Someone"}
                            </strong>{" "}
                            <span className="text-slate-500 font-normal">
                              {TASK_ACTION_PHRASES[log.actionType] ||
                                `performed ${log.actionType}`}
                            </span>
                          </p>
                          {log.changes && (
                            <div className="mt-1">
                              <ChangeSummary changes={log.changes} />
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatRelativeTime(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTask}
        title="Cancel this task?"
        message="This task will be marked as cancelled and removed from the board. Notes and attachments are retained for auditing."
        confirmText="Yes, Cancel Task"
        isLoading={isDeleting}
      />
    </>
  );
}
