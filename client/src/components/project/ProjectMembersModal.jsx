import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { projectApi } from "../../api/projectApi";
import { workspaceApi } from "../../api/workspaceApi";
import { ProjectRole } from "../../constants";
import { useAuthStore } from "../../store/authStore";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProjectMembersModal({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  isProjectAdmin,
}) {
  const [projectMembers, setProjectMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState(ProjectRole.EDITOR);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const { user } = useAuthStore();

  const loadData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [pmRes, wmRes] = await Promise.all([
        projectApi.getProjectMembers(projectId),
        workspaceId
          ? workspaceApi.getMembers(workspaceId)
          : Promise.resolve({ data: [] }),
      ]);
      setProjectMembers(pmRes.data || []);
      setWorkspaceMembers(wmRes.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load project members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, projectId, workspaceId]);

  const availableUsers = workspaceMembers.filter(
    (wm) => !projectMembers.some((pm) => pm._id === wm._id),
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setActionLoading("add");
    try {
      await projectApi.addProjectMember(projectId, {
        userId: selectedUserId,
        role: selectedRole,
      });
      toast.success("Member added to project");
      setSelectedUserId("");
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (memberUserId, newRole) => {
    setActionLoading(memberUserId);
    try {
      await projectApi.updateProjectMemberRole(
        projectId,
        memberUserId,
        newRole,
      );
      toast.success("Role updated");
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    setActionLoading(memberUserId);
    try {
      await projectApi.removeProjectMember(projectId, memberUserId);
      toast.success("Member removed from project");
      setPendingRemoveId(null);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Project Members"
        description="Manage who can view, edit, or administer tasks in this project."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {isProjectAdmin && availableUsers.length > 0 && (
            <form
              onSubmit={handleAddMember}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 items-end"
            >
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Add Workspace Member
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a member...</option>
                  {availableUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-44">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Project Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={ProjectRole.EDITOR}>EDITOR</option>
                  <option value={ProjectRole.PROJECT_ADMIN}>
                    PROJECT_ADMIN
                  </option>
                  <option value={ProjectRole.VIEWER}>VIEWER</option>
                </select>
              </div>

              <Button
                type="submit"
                size="md"
                isLoading={actionLoading === "add"}
                disabled={!selectedUserId}
                className="w-full sm:w-auto shrink-0"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Add
              </Button>
            </form>
          )}

          {isLoading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projectMembers.map((member) => {
                const isSelf = member._id === user?._id;

                return (
                  <div
                    key={member._id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={member.profile}
                        name={member.fullName || member.name}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate flex items-center gap-1.5">
                          {member.fullName || member.name}
                          {isSelf && (
                            <span className="text-xs text-slate-400 font-normal">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isProjectAdmin && !isSelf ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member._id, e.target.value)
                          }
                          disabled={actionLoading === member._id}
                          className="text-xs rounded-lg border border-slate-200 px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={ProjectRole.PROJECT_ADMIN}>
                            PROJECT_ADMIN
                          </option>
                          <option value={ProjectRole.EDITOR}>EDITOR</option>
                          <option value={ProjectRole.VIEWER}>VIEWER</option>
                        </select>
                      ) : (
                        <Badge
                          variant={
                            member.role === ProjectRole.PROJECT_ADMIN
                              ? "primary"
                              : member.role === ProjectRole.EDITOR
                                ? "info"
                                : "default"
                          }
                        >
                          {member.role}
                        </Badge>
                      )}

                      {isProjectAdmin && !isSelf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Remove from project"
                          onClick={() => setPendingRemoveId(member._id)}
                          disabled={actionLoading === member._id}
                        >
                          <UserMinus className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingRemoveId}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={() => handleRemoveMember(pendingRemoveId)}
        title="Remove project member?"
        message="They will lose access to this project's board, tasks, and notes."
        confirmText="Remove Member"
        isLoading={actionLoading === pendingRemoveId}
      />
    </>
  );
}
