import React, { useState } from "react";
import { taskApi } from "../../api/taskApi";
import { Paperclip, Download, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TaskAttachments({
  taskId,
  attachments = [],
  isEditorOrAdmin,
  onTaskUpdated,
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 3) {
      toast.error("You can upload a maximum of 3 files at a time");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("uploadFiles", file));
      const response = await taskApi.updateTaskInfo(taskId, formData);
      toast.success("Attachment(s) uploaded successfully");
      if (onTaskUpdated) onTaskUpdated(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to upload attachments");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Paperclip className="w-4 h-4 text-slate-500" />
          Attachments ({attachments.length})
        </div>

        {isEditorOrAdmin && (
          <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Add File
            <input
              type="file"
              multiple
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-slate-400 italic">
          No attachments uploaded.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((file, idx) => (
            <div
              key={file.publicId || idx}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                  {file.mimetype ? file.mimetype.slice(0, 3) : "FIL"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">
                    Attachment {idx + 1}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors shrink-0"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
