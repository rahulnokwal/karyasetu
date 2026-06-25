import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Project from "../models/project.models.js";
import Task from "../models/task.models.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description } = req.body;

  if (!projectId) throw new apiError(400, "Project Id is missing");

  const project = await Project.findOne({ _id: projectId });
  if (!project) throw new apiError(404, "Project not found");

  const task = new Task({
    title,
    description,
    projectId,
    workspaceId: project.workspaceId,
    createdBy: req.user._id,
  });

  try {
    if (req.files) {
      task.attachments = [];
      const files = req.files;
      for (let file of files) {
        const uploadedFile = await uploadOnCloudinary(file.path);
        task.attachments.push({
          url: uploadedFile.url,
          publicId: uploadedFile.publicId,
          mimetype: uploadedFile.mimetype,
          size: uploadedFile.size,
        });
      }
    }
  } catch (error) {
    for (let file of task.attachments) {
      await deleteOnCloudinary(file.publicId);
    }
    throw new apiError(500, "File uploadation fails");
  }

  const createdTask = await task.save();
  res
    .status(200)
    .json(new apiResponse(200, "Task created successfully", createdTask));
});

export { createTask };
