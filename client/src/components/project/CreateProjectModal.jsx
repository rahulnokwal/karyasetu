import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { projectApi } from "../../api/projectApi";
import { toast } from "sonner";

export function CreateProjectModal({
  isOpen,
  onClose,
  workspaceId,
  onProjectCreated,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.length < 3) {
      toast.error("Project name must be between 3 and 50 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await projectApi.createProject(workspaceId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Project created successfully!");
      setName("");
      setDescription("");
      if (onProjectCreated) onProjectCreated(response.data);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Create a project board to plan, track, and ship tasks with your team."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="e.g. Mobile App Redesign / Q4 Roadmap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of the project goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
