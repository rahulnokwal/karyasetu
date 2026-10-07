import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "../store/workspaceStore";
import { workspaceApi } from "../api/workspaceApi";
import { projectApi } from "../api/projectApi";
import { WorkspaceRole } from "../constants";
import { Button } from "../components/common/Button";
import { Avatar } from "../components/common/Avatar";
import { Badge } from "../components/common/Badge";
import { ActivityFeed } from "../components/audit/ActivityFeed";
import { CreateWorkspaceModal } from "../components/workspace/CreateWorkspaceModal";
import { InviteMemberModal } from "../components/workspace/InviteMemberModal";
import { CreateProjectModal } from "../components/project/CreateProjectModal";
import {
  Building2,
  Check,
  ChevronDown,
  FolderKanban,
  Loader2,
  Plus,
  Users,
  UserPlus,
  Activity,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3 shadow-xs">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-900 leading-tight">
          {value}
        </p>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
}

export function WorkspacePage() {
  const navigate = useNavigate();
  const { workspaces, currentWorkspace, currentRole, setCurrentWorkspace } =
    useWorkspaceStore();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const workspaceId = currentWorkspace?.workspaceId;
  const canManage =
    currentRole === WorkspaceRole.OWNER || currentRole === WorkspaceRole.ADMIN;

  const loadWorkspaceOverview = useCallback(async () => {
    if (!workspaceId) {
      setMembers([]);
      setProjects([]);
      setActivity([]);
      setIsLoadingStats(false);
      return;
    }
    setIsLoadingStats(true);

    const [membersRes, projectsRes, activityRes] = await Promise.allSettled([
      workspaceApi.getMembers(workspaceId),
      projectApi.getWorkspaceProjects(workspaceId),
      workspaceApi.getActivity(workspaceId, 1, 5),
    ]);
    if (membersRes.status === "fulfilled") {
      setMembers(membersRes.value.data || []);
    } else {
      setMembers([]);
      toast.error(
        membersRes.reason?.message || "Failed to load workspace members",
      );
    }
    if (projectsRes.status === "fulfilled") {
      setProjects(projectsRes.value.data || []);
    } else {
      setProjects([]);
      toast.error(
        projectsRes.reason?.message || "Failed to load workspace projects",
      );
    }
    if (activityRes.status === "fulfilled") {
      setActivity(activityRes.value.data?.auditLogs || []);
    } else {
      setActivity([]);
    }
    setIsLoadingStats(false);
  }, [workspaceId]);

  useEffect(() => {
    loadWorkspaceOverview();
  }, [loadWorkspaceOverview]);

  const handleSelectWorkspace = (ws) => {
    setCurrentWorkspace(ws);
    setIsSwitcherOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="flex items-center gap-3 p-2 pr-3 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200/80 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                {currentWorkspace?.workspaceName || "Workspace"}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {currentRole ? (
                  <>
                    Your role:{" "}
                    <span className="font-semibold text-indigo-600">
                      {currentRole}
                    </span>
                  </>
                ) : (
                  "Workspace home"
                )}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {isSwitcherOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsSwitcherOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Your Workspaces
                </div>
                <div className="py-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.workspaceId}
                      onClick={() => handleSelectWorkspace(ws)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          ws.workspaceId === workspaceId
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ws.workspaceName?.charAt(0)?.toUpperCase() || "W"}
                      </div>
                      <span className="flex-1 truncate font-medium">
                        {ws.workspaceName}
                      </span>
                      {ws.workspaceId === workspaceId && (
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      setShowCreateWorkspace(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Workspace
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManage && (
            <Button
              variant="secondary"
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Invite
            </Button>
          )}
          {canManage && (
            <Button onClick={() => setShowCreateProject(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {isLoadingStats ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={FolderKanban}
              label="Projects"
              value={projects.length}
              tone="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              icon={Users}
              label="Members"
              value={members.length}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              icon={Activity}
              label="Recent Events"
              value={activity.length}
              tone="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Projects preview */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Projects in this workspace
                </h2>
                <Link
                  to="/projects"
                  className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {projects.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <FolderKanban className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">
                    No projects yet. Create your first project board to get
                    started.
                  </p>
                  {canManage && (
                    <Button
                      size="sm"
                      onClick={() => setShowCreateProject(true)}
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create Project
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {project.description || "No description"}
                        </p>
                      </div>
                      {project.myRoleInProject && (
                        <Badge>{project.myRoleInProject}</Badge>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Team members
                </h2>
                {canManage && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Invite
                  </button>
                )}
              </div>
              {members.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No members found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.slice(0, 6).map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Avatar
                        src={member.profile}
                        name={member.fullName}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {member.email}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 shrink-0">
                        {member.role}
                      </span>
                    </div>
                  ))}
                  {members.length > 6 && (
                    <p className="text-xs text-slate-400 text-center pt-1">
                      +{members.length - 6} more members
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Recent activity
              </h2>
              <Link
                to="/activity"
                className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ActivityFeed logs={activity} isLoading={false} />
          </div>
        </>
      )}

      <CreateWorkspaceModal
        isOpen={showCreateWorkspace}
        onClose={() => setShowCreateWorkspace(false)}
      />
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        workspaceId={workspaceId}
      />
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        workspaceId={workspaceId}
        onProjectCreated={(newProject) => {
          setProjects((prev) => [newProject, ...prev]);
          navigate(`/projects/${newProject._id}`);
        }}
      />
    </div>
  );
}
