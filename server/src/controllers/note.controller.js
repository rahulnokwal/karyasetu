import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Task from "../models/task.models.js";
import Note from "../models/note.model.js";
import ProjectMember from "../models/projectMember.js";
import { TaskStatusEnum } from "../constant.js";

const addNote = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  const task = await Task.findById(taskId).lean();
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

const getTaskNotes = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const task = await Task.findOne({
    _id: taskId,
    status: { $ne: TaskStatusEnum.CANCELLED },
  }).lean();
  if (!task) throw new apiError(404, "Task not found or has been cancelled");

  const [notes, totalNotes] = await Promise.all([
    Note.find({ taskId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "fullName email profile")
      .lean(),
    Note.countDocuments({ taskId }),
  ]);
  res.status(200).json(
    new apiResponse(200, "Notes fetched successfully", {
      taskId: taskId,
      title: task.title,
      notes,
      hasNextPage: skip + notes.length < totalNotes,
    })
  );
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  if (!noteId) throw new apiError(400, "Note Id is missing");

  const note = await Note.findById(noteId);
  if (!note) throw new apiError(404, "Note Id is invalid or does not exist");

  const projectMember = await ProjectMember.findOne({
    projectId: note.projectId,
    userId: req.user._id,
  });
  if (!projectMember) {
    throw new apiError(
      403,
      "You are not a Project Member. You cannot delete the note"
    );
  }
  const isCreator = note.createdBy.toString() === req.user._id.toString();
  const isAdmin = ["PROJECT_ADMIN", "OWNER"].includes(projectMember.role);
  if (!isCreator && !isAdmin) {
    throw new apiError(
      403,
      "You are not allowed to delete this note. Only the creator or an Admin can delete it"
    );
  }

  await note.deleteOne();
  res.status(200).json(new apiResponse(200, "Note deleted successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;
  if (!noteId) throw new apiError(400, "Note Id is missing");

  const note = await Note.findOne({ _id: noteId });
  if (!note) throw new apiError(404, "Note Id is invalid or does not exist");
  if (note.createdBy.toString() !== req.user._id.toString())
    throw new apiError(
      403,
      "You are not allowed to update this note. only note creator can update it"
    );

  const projectMember = await ProjectMember.findOne({
    projectId: note.projectId,
    userId: req.user._id,
  });

  if (!projectMember)
    throw new apiError(
      403,
      "You are not a Project Member. You cannot update the note"
    );

  note.content = content;
  await note.save();
  res.status(200).json(new apiResponse(200, "Note updated successfully", note));
});

export { addNote, getTaskNotes, deleteNote, updateNote };
