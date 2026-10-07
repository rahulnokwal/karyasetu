import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Task from "../models/task.models.js";
import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMember.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TaskStatusEnum } from "../constant.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let genAI = null;
const getClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Add it to server/.env to enable AI summaries."
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const getProjectSummary = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) throw new apiError(400, "Project Id is missing");

  const project = await Project.findById(projectId).lean();
  if (!project) throw new apiError(404, "Project not found");

  const tasks = await Task.find({
    projectId,
    status: { $ne: TaskStatusEnum.CANCELLED },
  })
    .sort({ lexicalOrder: 1 })
    .lean();

  if (tasks.length === 0) {
    throw new apiError(
      404,
      "No tasks found for this project, so there is nothing to summarise yet."
    );
  }

  const byStatus = tasks.reduce((acc, t) => {
    const key = t.status || "UNKNOWN";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const total = tasks.length;
  const done = byStatus[TaskStatusEnum.COMPLETED] || 0;
  const inProgress = byStatus[TaskStatusEnum.IN_PROGRESS] || 0;
  const inReview = byStatus[TaskStatusEnum.IN_REVIEW] || 0;
  const todo = byStatus[TaskStatusEnum.TODO] || 0;
  const unassigned = tasks.filter((t) => !t.assigneeId).length;
  const pctComplete = Math.round((done / total) * 100);

  const taskLines = tasks
    .map(
      (t, i) =>
        `${i + 1}. [${t.status}] ${t.title}` +
        (t.description ? ` — ${String(t.description).slice(0, 160)}` : "") +
        (t.assigneeId ? "" : " (UNASSIGNED)")
    )
    .join("\n");

  const prompt = `You are a senior project manager writing a status report.

Project: ${project.name}
Description: ${project.description || "No description provided."}

CURRENT TASK BREAKDOWN
- Total active tasks: ${total}
- Completed: ${done} (${pctComplete}%)
- In Progress: ${inProgress}
- In Review: ${inReview}
- To Do: ${todo}
- Unassigned tasks: ${unassigned}

TASK LIST
${taskLines}

Write a status report for a busy project manager in EXACTLY two short paragraphs.
Paragraph 1: overall delivery health — what percentage is complete, momentum, and where work is concentrated.
Paragraph 2: specific risks and recommended next actions, calling out unassigned work and any bottleneck.
Do not use markdown headings or bullet points. Write plain prose only.`;

  let summary;
  let usedFallback = false;

  try {
    const model = getClient().getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 700,
      },
    });
    const result = await model.generateContent(prompt);
    summary = result?.response?.text()?.trim();
    if (!summary) throw new Error("Model returned an empty response");
  } catch (error) {
    console.error("[ai] summary generation failed:", error.message);
    usedFallback = true;
    summary =
      `This project has ${total} active task${total === 1 ? "" : "s"}, of which ` +
      `${done} (${pctComplete}%) are complete, ${inProgress} in progress, ${inReview} in review and ` +
      `${todo} still to do.` +
      (unassigned > 0
        ? ` There ${unassigned === 1 ? "is" : "are"} ${unassigned} unassigned task${
            unassigned === 1 ? "" : "s"
          } that need an owner.`
        : " Every task currently has an owner.") +
      ` AI-generated commentary is temporarily unavailable, so this is a raw metrics summary.`;
  }

  return res.status(200).json(
    new apiResponse(200, "Project summary generated successfully", {
      projectId: project._id,
      projectName: project.name,
      summary,
      metrics: {
        total,
        done,
        inProgress,
        inReview,
        todo,
        unassigned,
        pctComplete,
      },
      model: usedFallback ? null : MODEL,
      usedFallback,
      generatedAt: new Date().toISOString(),
    })
  );
});

const generateTaskDraft = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const input = String(req.body?.input || "").trim();
  if (!projectId) throw new apiError(400, "Project Id is missing");

  const project = await Project.findById(projectId).lean();
  if (!project) throw new apiError(404, "Project not found");

  const memberships = await ProjectMember.find({ projectId })
    .populate("userId", "fullName email")
    .lean();
  const members = memberships
    .filter((m) => m.userId)
    .map((m) => ({
      userId: String(m.userId._id),
      name: m.userId.fullName || "Unknown member",
      email: m.userId.email,
      role: m.role,
    }));

  const recentTasks = await Task.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(15)
    .select("title status")
    .lean();

  const memberLines = members.length
    ? members
        .map(
          (m, i) =>
            `${i + 1}. userId=${m.userId} | name=${m.name} | email=${m.email} | project role=${m.role}`
        )
        .join("\n")
    : "(no other project members)";

  const taskLines = recentTasks.length
    ? recentTasks.map((t, i) => `${i + 1}. [${t.status}] ${t.title}`).join("\n")
    : "(no tasks yet)";

  const prompt = `You are a senior project manager turning a rough brief into ONE well-structured task for a project team.

PROJECT: ${project.name}
${project.description ? `DESCRIPTION: ${project.description}` : ""}

TEAM MEMBERS (the assignee MUST be chosen from this list):
${memberLines}

EXISTING TASKS (do not duplicate these):
${taskLines}

ROUGH BRIEF FROM THE USER:
${input}

Reply with ONLY a JSON object (no markdown fences, no commentary) in exactly this shape:
{
  "title": "concise imperative task title, 3-100 characters",
  "description": "2-5 plain-text sentences elaborating the brief: context, what must be done, and acceptance criteria. Max 500 characters.",
  "suggestedAssigneeId": "userId string of the best-suited member, or null if none fits",
  "rationale": "one short sentence (max 160 characters) explaining the assignee choice"
}`;

  const memberByUserId = new Map(members.map((m) => [m.userId, m]));

  const sanitise = (raw) => {
    let title = String(raw?.title || "")
      .trim()
      .replace(/\s+/g, " ");
    if (title.length < 3) title = input.replace(/\s+/g, " ");
    title = title.slice(0, 100);

    let description = String(raw?.description || "").trim();
    if (description.length < 3) description = input;
    description = description.slice(0, 500);

    const match = memberByUserId.get(String(raw?.suggestedAssigneeId || ""));

    return {
      title,
      description,
      suggestedAssigneeId: match ? match.userId : null,
      suggestedAssigneeName: match ? match.name : null,
      rationale: String(raw?.rationale || "")
        .trim()
        .slice(0, 160),
    };
  };

  let draft;
  let usedFallback = false;

  try {
    const model = getClient().getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 900,
        responseMimeType: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const text = result?.response?.text()?.trim();
    if (!text) throw new Error("Model returned an empty response");

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    draft = sanitise(JSON.parse(cleaned));
  } catch (error) {
    console.error("[ai] task draft generation failed:", error.message);
    usedFallback = true;
    draft = sanitise(null);
    draft.rationale =
      "AI elaboration is temporarily unavailable — the draft is your raw brief. Review it before creating.";
  }

  return res.status(200).json(
    new apiResponse(200, "Task draft generated successfully", {
      draft,
      model: usedFallback ? null : MODEL,
      usedFallback,
      generatedAt: new Date().toISOString(),
    })
  );
});

export { getProjectSummary, generateTaskDraft };
