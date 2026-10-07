import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";

export function KanbanColumn({
  column,
  tasks = [],
  onTaskClick,
  onAddTask,
  isEditorOrAdmin,
}) {
  return (
    <div className="flex-1 min-w-[280px] max-w-[340px] bg-slate-100/70 rounded-2xl p-3 flex flex-col max-h-full border border-slate-200/60">
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {column.title}
          </h3>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200/80 text-[10px] font-bold text-slate-600">
            {tasks.length}
          </span>
        </div>

        {isEditorOrAdmin && (
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
            title="Add task in this column"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[140px] rounded-xl transition-colors ${
              snapshot.isDraggingOver
                ? "bg-indigo-50/50 ring-2 ring-indigo-200"
                : ""
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task._id)}
                isEditorOrAdmin={isEditorOrAdmin}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
