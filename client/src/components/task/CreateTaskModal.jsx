import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { taskApi } from "../../api/taskApi";
import { projectApi } from "../../api/projectApi";
import { TaskStatus } from "../../constants";
import { Paperclip, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  projectMembers = [],
  initialStatus,
  onTaskCreated,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiBrief, setAiBrief] = useState("");
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > 3) {
      toast.error("You can upload a maximum of 3 attachments per request");
      return;
    }
    setFiles((prev) => [...prev, ...selected].slice(0, 3));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateDraft = async () => {
    const brief = aiBrief.trim();
    if (brief.length < 10) {
      toast.error(
        "Describe the task in at least 10 characters so AI can elaborate it",
      );
      return;
    }
    setIsGeneratingDraft(true);
    try {
      const response = await projectApi.generateTaskDraft(projectId, brief);
      const payload = response?.data || {};
      const draft = payload.draft || payload;
      if (!draft?.title) throw new Error("AI returned an empty draft");

      setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (
        draft.suggestedAssigneeId &&
        projectMembers.some((m) => m._id === draft.suggestedAssigneeId)
      ) {
        setAssigneeId(draft.suggestedAssigneeId);
      }
      setAiDraft(draft);

      if (payload.usedFallback) {
        toast.warning(
          "AI is unavailable — the draft is your raw brief. Review it before creating.",
        );
      } else {
        toast.success(
          "AI draft ready — review and edit the fields below, then create the task",
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate AI draft");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.length < 3) {
      toast.error("Task title must be between 3 and 100 characters");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (assigneeId) {
        formData.append("assigneeId", assigneeId);
      }
      files.forEach((file) => {
        formData.append("uploadFiles", file);
      });

      const response = await taskApi.createTask(projectId, formData);
      toast.success("Task created successfully!");
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setFiles([]);

      let createdTask = response.data;

      if (initialStatus && initialStatus !== TaskStatus.TODO) {
        try {
          const statusRes = await taskApi.updateStatus(
            response.data._id,
            initialStatus,
          );
          if (statusRes?.data) createdTask = statusRes.data;
        } catch (statusError) {
          toast.warning(
            "Task created in To Do. Assign it to yourself to move it to that column.",
          );
        }
      }
      if (onTaskCreated) onTaskCreated(createdTask);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description="Add a task to the project board."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI Assist
          </label>
          <textarea
            rows={2}
            value={aiBrief}
            onChange={(e) => setAiBrief(e.target.value)}
            placeholder="Rough idea, e.g. users can't reset their password after the email change..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              AI elaborates the brief into a title, description and suggested
              assignee — you review before creating.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateDraft}
              isLoading={isGeneratingDraft}
              disabled={aiBrief.trim().length < 10}
            >
              {!isGeneratingDraft && <Sparkles className="w-3.5 h-3.5" />}
              Elaborate with AI
            </Button>
          </div>
          {aiDraft && (
            <p className="text-xs text-indigo-700 bg-indigo-100/70 rounded-lg px-2.5 py-1.5 border border-indigo-200">
              {aiDraft.suggestedAssigneeName
                ? `Suggested assignee: ${aiDraft.suggestedAssigneeName} — ${aiDraft.rationale || "review the fields below"}`
                : aiDraft.rationale ||
                  "Draft generated. Review the fields below."}
            </p>
          )}
        </div>

        <Input
          label="Task Title"
          placeholder="e.g. Implement OAuth login with Google"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Provide context, acceptance criteria, or technical notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Assignee
          </label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Unassigned</option>
            {projectMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.fullName || m.name} ({m.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Only the assigned member can move this task between columns.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Attachments (Max 3 files)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
              Upload Files
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={files.length >= 3}
              />
            </label>
            {files.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs border border-indigo-100"
              >
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
