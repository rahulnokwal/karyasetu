import React, { useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { KanbanColumn } from "./KanbanColumn";
import { TASK_COLUMNS, TaskStatus } from "../../constants";
import { calculateLexicalPosition } from "../../utils/lexicalOrder";
import { taskApi } from "../../api/taskApi";
import { useAuthStore } from "../../store/authStore";
import { getSocket, onSocket, joinWorkspace } from "../../api/socketClient";
import { toast } from "sonner";

export function KanbanBoard({
  tasks = [],
  setTasks,
  onTaskClick,
  onAddTask,
  isEditorOrAdmin,
  projectId,
  workspaceId,
}) {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!workspaceId) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleConnect = () => joinWorkspace(workspaceId);
    socket.on("connect", handleConnect);
    joinWorkspace(workspaceId);

    const applyTask = ({ task }) => {
      if (!task?._id) return;

      const incomingProject = task.projectId?._id || task.projectId;
      if (
        projectId &&
        incomingProject &&
        incomingProject.toString() !== projectId.toString()
      ) {
        return;
      }

      setTasks((prev) => {
        const exists = prev.some((t) => t._id === task._id);
        if (exists) {
          return prev.map((t) => (t._id === task._id ? { ...t, ...task } : t));
        }

        return [...prev, task];
      });
    };

    const unsubUpdate = onSocket("task_updated", applyTask);
    const unsubCreate = onSocket("task_created", applyTask);

    return () => {
      socket.off("connect", handleConnect);
      unsubUpdate();
      unsubCreate();
    };
  }, [workspaceId, projectId, setTasks]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const sourceColumnTasks = tasks
      .filter((t) => t.status === sourceStatus)
      .sort((a, b) => (a.lexicalOrder > b.lexicalOrder ? 1 : -1));

    const draggedTask = tasks.find((t) => t._id === draggableId);
    if (!draggedTask) return;

    const originalTasks = [...tasks];

    if (sourceStatus === destStatus) {
      const reorderedColumn = Array.from(sourceColumnTasks);
      reorderedColumn.splice(source.index, 1);
      reorderedColumn.splice(destination.index, 0, draggedTask);

      const prevTask = reorderedColumn[destination.index - 1];
      const nextTask = reorderedColumn[destination.index + 1];

      const prevPos = prevTask ? prevTask.lexicalOrder : "";
      const nextPos = nextTask ? nextTask.lexicalOrder : "";

      const newPosition = calculateLexicalPosition(prevPos, nextPos);

      setTasks((prev) =>
        prev.map((t) =>
          t._id === draggableId ? { ...t, lexicalOrder: newPosition } : t,
        ),
      );

      try {
        await taskApi.reorderTask(draggableId, prevPos, nextPos);
      } catch (error) {
        toast.error(error.message || "Failed to save task position");
        setTasks(originalTasks);
      }
    } else {
      const isAssignee =
        draggedTask.assigneeId?._id === user?._id ||
        draggedTask.assigneeId === user?._id;

      if (!isAssignee) {
        toast.error(
          "Backend Rule: Only the assigned user can move this task's status.",
        );
        return;
      }

      setTasks((prev) =>
        prev.map((t) =>
          t._id === draggableId ? { ...t, status: destStatus } : t,
        ),
      );

      try {
        await taskApi.updateStatus(draggableId, destStatus);
        toast.success(`Task moved to ${destStatus.replace("_", " ")}`);
      } catch (error) {
        toast.error(error.message || "Failed to update status");
        setTasks(originalTasks);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-230px)]">
        {TASK_COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => (a.lexicalOrder > b.lexicalOrder ? 1 : -1));

          return (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={colTasks}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              isEditorOrAdmin={isEditorOrAdmin}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
