import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Project from "../models/project.models.js";
import Task from "../models/task.models.js";
import Note from "../models/note.model.js";
import ProjectMember from "../models/projectMember.js";

const addNote = asyncHandler(async (req, res) => {
  const { taskId, projectId } = req.params;
  const { content } = req.body;
  if (!taskId || !projectId)
    throw new apiError(400, "Task Id or Project Id not found");

  const task = await Task.findOne({ _id: taskId, projectId }).lean();
  if (!task) throw new apiError(404, "Task not found");

  const note = await Note.create({
    content: content,
    taskId: taskId,
    projectId: task.projectId,
    workspaceId: task.workspaceId,
    createdBy: req.user._id,
  });
  if (!note)
    throw new apiError(500, "Something went wrong while creating notes");

  res.status(200).json(new apiResponse(200, "Note created successfully", note));
});

export { addNote };
