import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { WorkspaceRole } from "../../constants";
import { toast } from "sonner";
import { Trash2, LogOut } from "lucide-react";
import { workspaceApi } from "../../api/workspaceApi";

export function WorkspaceSettingsModal({ isOpen, onClose, workspace }) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const { renameWorkspace, deleteWorkspace, fetchWorkspaces } =
    useWorkspaceStore();
  const isOwner = workspace?.role === WorkspaceRole.OWNER;
  const isAdminOrOwner =
    workspace?.role === WorkspaceRole.OWNER ||
    workspace?.role === WorkspaceRole.ADMIN;

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.workspaceName || "");
    }
  }, [workspace]);

  const handleRename = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim() || workspaceName.length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    setIsUpdating(true);
    try {
      await renameWorkspace(workspace.workspaceId, workspaceName.trim());
      toast.success("Workspace renamed successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to rename workspace");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkspace(workspace.workspaceId);
      toast.success("Workspace deleted");
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await workspaceApi.leaveWorkspace(workspace.workspaceId);
      toast.success("Left workspace successfully");
      await fetchWorkspaces();
      setShowLeaveConfirm(false);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to leave workspace");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Workspace Settings"
        description="Manage workspace information and member permissions."
      >
        <div className="space-y-6">
          {isAdminOrOwner && (
            <form onSubmit={handleRename} className="space-y-4">
              <Input
                label="Workspace Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Danger Zone
            </h4>

            {!isOwner && (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Leave Workspace
                  </p>
                  <p className="text-xs text-slate-500">
                    Revoke your access to all projects and tasks in this
                    workspace.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLeaveConfirm(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Leave
                </Button>
              </div>
            )}

            {isOwner && (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-200 bg-red-50/50">
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Delete Workspace
                  </p>
                  <p className="text-xs text-red-700">
                    Permanently delete this workspace, including all projects,
                    tasks, and files.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Workspace?"
        message="This action is irreversible. All projects, tasks, attachments, and data inside this workspace will be permanently wiped out."
        confirmText="Yes, Delete Workspace"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeave}
        title="Leave Workspace?"
        message="You will lose access to all projects, notes, and tasks in this workspace. You will need a new invite to rejoin."
        confirmText="Leave Workspace"
        confirmVariant="outline"
        isLoading={isLeaving}
      />
    </>
  );
}
