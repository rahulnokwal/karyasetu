import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Workspace from "../models/workspace.models.js";
import WorkspaceMember from "../models/workspaceMember.models.js";
import { UserRoleEnum } from "../constant.js";

const createWorkspace = asyncHandler(async (req, res) => {
  const { workspaceName } = req.body;

  const workspace = new Workspace({
    workspaceName,
    createdBy: req.user._id,
  });

  await workspace.save();

  try {
    await WorkspaceMember.create({
      userId: req.user._id,
      workspaceId: workspace._id,
      joinedAt: Date.now(),
      role: UserRoleEnum.OWNER,
    });
  } catch (error) {
    await Workspace.findByIdAndDelete(workspace._id);
    throw new apiError(
      500,
      "Failed to initialize workspace owner. Please try again."
    );
  }

  res
    .status(201)
    .json(new apiResponse(201, "Workspace is created successfully", workspace));
});

const listWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = WorkspaceMember.aggregate([
    {
      $match: {
        userId: req.user._id,
      },
    },
    {
      $lookup: {
        from: "Workspace",
        localField: "userId",
        foreignField: "_id",
        as: "workspaces",
      },
    },
    { $first: "$workspaces" },
    {
      $project: {
        $id: "$workspaces._id",
        $workspaceName: "$workspaces.workspaceName",
        $createdBy: "$workspace.createdBy",
        $role: "$role",
        $joinedAt: "$joinedAt",
      },
    },
  ]);
  res.status(200).json(200, "Workspaces fetched successfully", workspaces);
});

export { createWorkspace, listWorkspaces };
