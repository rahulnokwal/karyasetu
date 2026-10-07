import React, { useState, useEffect, useCallback } from "react";
import { taskApi } from "../api/taskApi";
import { projectApi } from "../api/projectApi";
import { TaskDetailModal } from "../components/task/TaskDetailModal";
import { Badge } from "../components/common/Badge";
import { formatDateShort } from "../utils/formatDate";
import { ProjectRole } from "../constants";
import { useAuthStore } from "../store/authStore";
import { CheckSquare, FolderKanban, Paperclip, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MyTasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [taskProjectMembers, setTaskProjectMembers] = useState([]);
  const [canEditTask, setCanEditTask] = useState(false);
  const [isProjectAdmin, setIsProjectAdmin] = useState(false);

  const loadMyTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskApi.getMyTasks();

      const data = Array.isArray(response.data) ? response.data : [];
      setTasks(data);
    } catch (error) {
      toast.error(error.message || "Failed to load assigned tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyTasks();
  }, []);

  useEffect(() => {
    if (!selectedTaskId) {
      setTaskProjectMembers([]);
      setCanEditTask(false);
      setIsProjectAdmin(false);
      return;
    }

    let cancelled = false;
    const task = tasks.find((t) => t._id === selectedTaskId);

    const projectId =
      typeof task?.projectId === "object"
        ? task.projectId?._id
        : task?.projectId;

    if (!projectId) {
      setTaskProjectMembers([]);
      setCanEditTask(false);
      setIsProjectAdmin(false);
      return;
    }

    (async () => {
      try {
        const res = await projectApi.getProjectMembers(projectId);
        if (cancelled) return;
        const members = res.data || [];
        const mine = members.find((m) => m._id === user?._id);
        const role = mine?.role || null;
        setTaskProjectMembers(members);
        setCanEditTask(
          role === ProjectRole.PROJECT_ADMIN || role === ProjectRole.EDITOR,
        );
        setIsProjectAdmin(role === ProjectRole.PROJECT_ADMIN);
      } catch (error) {
        if (cancelled) return;
        setTaskProjectMembers([]);
        setCanEditTask(false);
        setIsProjectAdmin(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTaskId, tasks, user?._id]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "info";
      case "IN_REVIEW":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Tasks
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          All active tasks assigned to you across projects
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">
            No tasks assigned to you right now
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            When tasks are assigned to your user account, they will
            automatically appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div
                key={task._id}
                onClick={() => setSelectedTaskId(task._id)}
                className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">
                      TASK-{task._id?.slice(-4).toUpperCase()}
                    </span>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status?.replace("_", " ")}
                    </Badge>
                    {task.projectId?.name && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <FolderKanban className="w-3 h-3 text-slate-400" />
                        {task.projectId.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 truncate">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
                  {task.attachments?.length > 0 && (
                    <span className="flex items-center gap-1 font-medium">
                      <Paperclip className="w-3.5 h-3.5" />
                      {task.attachments.length}
                    </span>
                  )}
                  <span>{formatDateShort(task.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        projectMembers={taskProjectMembers}
        isEditorOrAdmin={canEditTask}
        isProjectAdmin={isProjectAdmin}
        onTaskUpdated={() => loadMyTasks()}
        onTaskDeleted={() => loadMyTasks()}
      />
    </div>
  );
}
