import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { workspaceApi } from "../../api/workspaceApi";
import { WorkspaceRole } from "../../constants";
import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { UserMinus, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function WorkspaceMembersModal({ isOpen, onClose, workspaceId }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const [pendingTransferId, setPendingTransferId] = useState(null);
  const { user } = useAuthStore();
  const { currentRole, fetchWorkspaces } = useWorkspaceStore();

  const isOwner = currentRole === WorkspaceRole.OWNER;
  const isAdminOrOwner =
    currentRole === WorkspaceRole.OWNER || currentRole === WorkspaceRole.ADMIN;

  const loadMembers = async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const response = await workspaceApi.getMembers(workspaceId);
      setMembers(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, workspaceId]);

  const handleRoleChange = async (memberUserId, newRole) => {
    setActionLoading(memberUserId);
    try {
      await workspaceApi.updateMemberRole(workspaceId, memberUserId, newRole);
      toast.success("Member role updated");
      await loadMembers();
    } catch (error) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    setActionLoading(memberUserId);
    try {
      await workspaceApi.removeMember(workspaceId, memberUserId);
      toast.success("Member removed successfully");
      setPendingRemoveId(null);
      await loadMembers();
    } catch (error) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransferOwnership = async (memberUserId) => {
    setActionLoading(memberUserId);
    try {
      await workspaceApi.transferOwnership(workspaceId, memberUserId);
      toast.success("Ownership transferred successfully");
      setPendingTransferId(null);

      await loadMembers();
      await fetchWorkspaces();
    } catch (error) {
      toast.error(error.message || "Failed to transfer ownership");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Workspace Members"
        description="View and manage members and access levels."
        maxWidth="max-w-2xl"
      >
        {isLoading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => {
              const isSelf = member._id === user?._id;
              const isMemberOwner = member.role === WorkspaceRole.OWNER;

              return (
                <div
                  key={member._id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={member.profile}
                      name={member.fullName}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate flex items-center gap-1.5">
                        {member.fullName}
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
                    {isAdminOrOwner && !isMemberOwner && !isSelf ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member._id, e.target.value)
                        }
                        disabled={actionLoading === member._id}
                        className="text-xs rounded-lg border border-slate-200 px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={WorkspaceRole.MEMBER}>MEMBER</option>
                        <option value={WorkspaceRole.ADMIN}>ADMIN</option>
                      </select>
                    ) : (
                      <Badge
                        variant={
                          member.role === WorkspaceRole.OWNER
                            ? "primary"
                            : member.role === WorkspaceRole.ADMIN
                              ? "info"
                              : "default"
                        }
                      >
                        {member.role}
                      </Badge>
                    )}

                    {isOwner && !isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Transfer Ownership"
                        onClick={() => setPendingTransferId(member._id)}
                        disabled={actionLoading === member._id}
                      >
                        <Crown className="w-4 h-4 text-amber-500" />
                      </Button>
                    )}

                    {isAdminOrOwner && !isMemberOwner && !isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Remove Member"
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
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingRemoveId}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={() => handleRemoveMember(pendingRemoveId)}
        title="Remove workspace member?"
        message="They will immediately lose access to every project and task in this workspace."
        confirmText="Remove Member"
        isLoading={actionLoading === pendingRemoveId}
      />

      <ConfirmDialog
        isOpen={!!pendingTransferId}
        onClose={() => setPendingTransferId(null)}
        onConfirm={() => handleTransferOwnership(pendingTransferId)}
        title="Transfer ownership?"
        message="Ownership will move to this member and you will become an ADMIN. Only they can give it back."
        confirmText="Transfer Ownership"
        isLoading={actionLoading === pendingTransferId}
      />
    </>
  );
}
