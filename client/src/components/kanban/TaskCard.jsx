import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Avatar } from "../common/Avatar";
import { Paperclip, MessageSquare, GripVertical } from "lucide-react";

export function TaskCard({ task, index, onClick, isEditorOrAdmin }) {
  return (
    <Draggable
      draggableId={task._id}
      index={index}
      isDragDisabled={!isEditorOrAdmin}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={onClick}
          className={`group bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer relative ${
            snapshot.isDragging
              ? "shadow-xl ring-2 ring-indigo-500/20 rotate-1 border-indigo-400 bg-white"
              : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {task.title}
            </h4>

            {isEditorOrAdmin && (
              <div
                {...provided.dragHandleProps}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing transition-opacity shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-400 text-[11px]">
              {task.attachments?.length > 0 && (
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <Paperclip className="w-3 h-3" />
                  {task.attachments.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {task.assigneeId ? (
                <Avatar
                  src={task.assigneeId.profile}
                  name={task.assigneeId.fullName || "Assignee"}
                  size="xs"
                />
              ) : (
                <div className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400">
                  ?
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
