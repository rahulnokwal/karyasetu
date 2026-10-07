import React, { useState, useEffect } from "react";
import { noteApi } from "../../api/noteApi";
import { useAuthStore } from "../../store/authStore";
import { Avatar } from "../common/Avatar";
import { Button } from "../common/Button";
import { Pagination } from "../common/Pagination";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { formatRelativeTime } from "../../utils/formatDate";
import {
  MessageSquare,
  Trash2,
  Edit2,
  Send,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function TaskNotes({ taskId, isProjectAdmin }) {
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();

  const loadNotes = async (targetPage = 1) => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const response = await noteApi.getTaskNotes(taskId, targetPage);
      const incoming = response.data?.notes || [];

      setNotes((prev) =>
        targetPage === 1 ? incoming : [...prev, ...incoming],
      );
      setHasNextPage(!!response.data?.hasNextPage);
      setPage(targetPage);
    } catch (error) {
      toast.error(error.message || "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadNotes(1);
  }, [taskId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await noteApi.addNote(taskId, newContent.trim());
      setNewContent("");
      toast.success("Note added");

      await loadNotes(1);
    } catch (error) {
      toast.error(error.message || "Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editContent.trim()) return;
    try {
      await noteApi.updateNote(noteId, editContent.trim());
      setEditingNoteId(null);
      toast.success("Note updated");
      await loadNotes(1);
    } catch (error) {
      toast.error(error.message || "Failed to update note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    setIsDeleting(true);
    try {
      await noteApi.deleteNote(noteId);
      toast.success("Note deleted");
      setPendingDeleteId(null);
      await loadNotes(1);
    } catch (error) {
      toast.error(error.message || "Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
        <MessageSquare className="w-4 h-4 text-slate-500" />
        Discussion & Notes ({notes.length})
      </div>

      <form onSubmit={handleAddNote} className="relative">
        <textarea
          rows={2}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Add a comment or note..."
          className="w-full p-3 pr-14 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newContent.trim()}
          className="absolute right-2.5 bottom-3 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {isLoading ? (
        <div className="py-6 flex justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          No notes yet. Be the first to leave a comment.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const author = note.createdBy;
            const isAuthor =
              author?._id === user?._id || note.createdBy === user?._id;
            const canDelete = isAuthor || isProjectAdmin;

            return (
              <div
                key={note._id}
                className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={author?.profile}
                      name={author?.fullName || "User"}
                      size="xs"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      {author?.fullName || "Team Member"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(note.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isAuthor && editingNoteId !== note._id && (
                      <button
                        onClick={() => {
                          setEditingNoteId(note._id);
                          setEditContent(note.content);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setPendingDeleteId(note._id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {editingNoteId === note._id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingNoteId(null)}
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateNote(note._id)}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        hasNextPage={hasNextPage}
        hasPreviousPage={page > 1}
        isLoading={isLoading}
        onPageChange={(p) => loadNotes(p)}
      />

      <ConfirmDialog
        isOpen={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => handleDeleteNote(pendingDeleteId)}
        title="Delete Note?"
        message="This comment will be permanently removed. This action cannot be undone."
        confirmText="Delete Note"
        isLoading={isDeleting}
      />
    </div>
  );
}
