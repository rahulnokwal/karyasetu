import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { projectApi } from "../../api/projectApi";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProjectSettingsModal({
  isOpen,
  onClose,
  project,
  isProjectAdmin,
  onProjectUpdated,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
    }
  }, [project]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    try {
      const response = await projectApi.updateProjectDetails(project._id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Project updated successfully");
      if (onProjectUpdated) onProjectUpdated(response.data);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update project");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectApi.deleteProject(project._id);
      toast.success("Project deleted");
      setShowDeleteConfirm(false);
      onClose();
      navigate("/projects");
    } catch (error) {
      toast.error(error.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Project Settings"
        description="Update project details or remove project."
      >
        <div className="space-y-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isProjectAdmin}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isProjectAdmin}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {isProjectAdmin && (
              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>

          {isProjectAdmin && (
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Danger Zone
              </h4>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-200 bg-red-50/50">
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Delete Project
                  </p>
                  <p className="text-xs text-red-700">
                    Permanently delete this project and all its tasks, notes,
                    and activity history.
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
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project?"
        message="This action cannot be undone. All tasks, notes, and attachments associated with this project will be deleted."
        confirmText="Yes, Delete Project"
        isLoading={isDeleting}
      />
    </>
  );
}
