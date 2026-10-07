import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { toast } from "sonner";

export function CreateWorkspaceModal({ isOpen, onClose }) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createWorkspace } = useWorkspaceStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim() || workspaceName.length < 3) {
      toast.error("Workspace name must be at least 3 characters");
      return;
    }

    setIsLoading(true);
    try {
      await createWorkspace(workspaceName.trim());
      toast.success("Workspace created successfully!");
      setWorkspaceName("");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
      description="Workspaces help you organize projects, teams, and tasks in one place."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Workspace Name"
          placeholder="e.g. Acme Corp / Engineering"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          autoFocus
          required
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}
