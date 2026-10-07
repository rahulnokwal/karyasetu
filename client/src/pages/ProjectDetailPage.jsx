import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { projectApi } from "../api/projectApi";
import { taskApi } from "../api/taskApi";
import { useAuthStore } from "../store/authStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import { ProjectRole, TaskStatus, WorkspaceRole } from "../constants";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { CreateTaskModal } from "../components/task/CreateTaskModal";
import { TaskDetailModal } from "../components/task/TaskDetailModal";
import { ProjectSettingsModal } from "../components/project/ProjectSettingsModal";
import { ProjectMembersModal } from "../components/project/ProjectMembersModal";
import { ActivityFeed } from "../components/audit/ActivityFeed";
import { Pagination } from "../components/common/Pagination";
import { Button } from "../components/common/Button";
import {
  FolderKanban,
  Plus,
  Settings,
  Users,
  Activity,
  ArrowLeft,
  LayoutGrid,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { currentRole: workspaceRole } = useWorkspaceStore();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [userProjectRole, setUserProjectRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [activeTab, setActiveTab] = useState("board");
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [hasNextActivityPage, setHasNextActivityPage] = useState(false);

  const [summary, setSummary] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState(undefined);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const isProjectAdmin = userProjectRole === ProjectRole.PROJECT_ADMIN;
  const isEditorOrAdmin =
    userProjectRole === ProjectRole.PROJECT_ADMIN ||
    userProjectRole === ProjectRole.EDITOR;

  const isWorkspaceScopedViewer =
    !userProjectRole &&
    (workspaceRole === WorkspaceRole.OWNER ||
      workspaceRole === WorkspaceRole.ADMIN);
  const canViewOnly = isWorkspaceScopedViewer;

  const loadProjectData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);

    const [projResult, tasksResult, membersResult] = await Promise.allSettled([
      projectApi.getProjectDetails(projectId),
      taskApi.getProjectTasks(projectId, 1, 100),
      projectApi.getProjectMembers(projectId),
    ]);

    if (projResult.status === "rejected") {
      setLoadError(
        projResult.reason?.message || "Failed to load project details",
      );
      setProject(null);
      setTasks([]);
      setProjectMembers([]);
      setUserProjectRole(null);
      setIsLoading(false);
      return;
    }

    setProject(projResult.value.data);
    setTasks(
      tasksResult.status === "fulfilled"
        ? tasksResult.value.data?.tasks || []
        : [],
    );

    if (membersResult.status === "fulfilled") {
      const mList = membersResult.value.data || [];
      setProjectMembers(mList);

      const myMembership = mList.find((m) => m._id === user?._id);
      setUserProjectRole(myMembership?.role || null);
    } else {
      setProjectMembers([]);
      setUserProjectRole(null);
    }

    setIsLoading(false);
  };

  const loadProjectActivity = async (targetPage = 1) => {
    if (!projectId) return;
    setIsLoadingActivity(true);
    try {
      const res = await projectApi.getActivity(projectId, targetPage);
      const incoming = res.data?.auditLogs || [];
      setActivityLogs((prev) =>
        targetPage === 1 ? incoming : [...prev, ...incoming],
      );
      setHasNextActivityPage(!!res.data?.hasNextPage);
      setActivityPage(targetPage);
    } catch (error) {
      console.error("Failed to load project activity:", error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "activity") {
      loadProjectActivity(1);
    }
  }, [activeTab, projectId]);

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
    );
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const handleSummary = async () => {
    setIsSummaryOpen(true);
    if (summary) return;
    setIsLoadingSummary(true);
    try {
      const res = await projectApi.getProjectSummary(projectId);
      setSummary(res.data);
    } catch (error) {
      toast.error(error.message || "Failed to generate project summary");
      setIsSummaryOpen(false);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  if (!isLoading && loadError) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <FolderKanban className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Unable to open this project
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">{loadError}</p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {project?.name || "Loading..."}
              </h1>
              {userProjectRole ? (
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  {userProjectRole}
                </span>
              ) : canViewOnly ? (
                <span
                  className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
                  title="You are viewing this project through your workspace role. Ask a project admin to add you for editing rights."
                >
                  VIEW ONLY
                </span>
              ) : null}
            </div>
            {project?.description && (
              <p className="text-xs text-slate-500 mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-200/70 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "board"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "activity"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Activity
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSummary}
            title="AI Project Status Summary"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
            AI Summary
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMembers(true)}
            title="Manage Project Members"
          >
            <Users className="w-4 h-4 mr-1.5" />
            Members ({projectMembers.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            title="Project Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {isEditorOrAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setCreateTaskStatus(undefined);
                setShowCreateTask(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {isSummaryOpen && (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-6 border border-indigo-100 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                AI Project Status Report
              </h2>
              {summary?.model && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {summary.model}
                </span>
              )}
              {summary?.usedFallback && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  METRICS ONLY
                </span>
              )}
            </div>
            <button
              onClick={() => setIsSummaryOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
              title="Close summary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoadingSummary ? (
            <div className="py-10 flex items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analysing project tasks...
            </div>
          ) : (
            <>
              {summary?.metrics && (
                <div className="flex flex-wrap gap-4 mt-4 mb-4">
                  {[
                    ["Total", summary.metrics.total, "text-slate-900"],
                    ["Done", summary.metrics.done, "text-emerald-600"],
                    [
                      "In Progress",
                      summary.metrics.inProgress,
                      "text-blue-600",
                    ],
                    ["In Review", summary.metrics.inReview, "text-amber-600"],
                    ["To Do", summary.metrics.todo, "text-slate-600"],
                    [
                      "Unassigned",
                      summary.metrics.unassigned,
                      summary.metrics.unassigned > 0
                        ? "text-red-600"
                        : "text-slate-600",
                    ],
                  ].map(([label, value, color]) => (
                    <div
                      key={label}
                      className="bg-white/70 rounded-xl px-3 py-2 border border-indigo-50"
                    >
                      <p className={`text-lg font-bold leading-none ${color}`}>
                        {value}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">
                        {label}
                      </p>
                    </div>
                  ))}
                  <div className="bg-white/70 rounded-xl px-3 py-2 border border-indigo-50">
                    <p className="text-lg font-bold leading-none text-indigo-600">
                      {summary.metrics.pctComplete}%
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">
                      Complete
                    </p>
                  </div>
                </div>
              )}

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {summary?.summary}
              </div>
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 py-32">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : activeTab === "board" ? (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard
            tasks={tasks}
            setTasks={setTasks}
            projectId={projectId}
            workspaceId={project?.workspaceId}
            onTaskClick={(id) => setSelectedTaskId(id)}
            onAddTask={(columnId) => {
              setCreateTaskStatus(columnId);
              setShowCreateTask(true);
            }}
            isEditorOrAdmin={isEditorOrAdmin}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs max-w-3xl">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Project Audit Activity
          </h2>
          <ActivityFeed logs={activityLogs} isLoading={isLoadingActivity} />
          <Pagination
            page={activityPage}
            hasNextPage={hasNextActivityPage}
            hasPreviousPage={activityPage > 1}
            isLoading={isLoadingActivity}
            onPageChange={(p) => loadProjectActivity(p)}
          />
        </div>
      )}

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => {
          setShowCreateTask(false);
          setCreateTaskStatus(undefined);
        }}
        projectId={projectId}
        projectMembers={projectMembers}
        initialStatus={createTaskStatus}
        onTaskCreated={handleTaskCreated}
      />

      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        projectMembers={projectMembers}
        isEditorOrAdmin={isEditorOrAdmin}
        isProjectAdmin={isProjectAdmin}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      <ProjectMembersModal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        projectId={projectId}
        workspaceId={project?.workspaceId}
        isProjectAdmin={isProjectAdmin}
      />

      <ProjectSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        project={project}
        isProjectAdmin={isProjectAdmin}
        onProjectUpdated={(up) => setProject(up)}
      />
    </div>
  );
}
