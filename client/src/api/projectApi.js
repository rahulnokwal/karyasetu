import { apiClient } from "./axiosClient";

export const projectApi = {
  getWorkspaceProjects: (workspaceId) =>
    apiClient.get(`/workspaces/${workspaceId}/projects`),
  createProject: (workspaceId, { name, description }) =>
    apiClient.post(`/workspaces/${workspaceId}/projects`, {
      name,
      description,
    }),
  getProjectDetails: (projectId) => apiClient.get(`/projects/${projectId}`),
  updateProjectDetails: (projectId, payload) =>
    apiClient.patch(`/projects/${projectId}`, payload),
  deleteProject: (projectId) => apiClient.delete(`/projects/${projectId}`),

  getProjectSummary: (projectId) =>
    apiClient.get(`/projects/${projectId}/summary`),

  generateTaskDraft: (projectId, input) =>
    apiClient.post(`/projects/${projectId}/ai/task-draft`, { input }),

  getProjectMembers: (projectId) =>
    apiClient.get(`/projects/${projectId}/members`),
  addProjectMember: (projectId, { userId, role }) =>
    apiClient.post(`/projects/${projectId}/members`, { userId, role }),
  updateProjectMemberRole: (projectId, userId, role) =>
    apiClient.patch(`/projects/${projectId}/members/${userId}`, { role }),
  removeProjectMember: (projectId, userId) =>
    apiClient.delete(`/projects/${projectId}/members/${userId}`),

  getActivity: (projectId, page = 1, limit = 20) =>
    apiClient.get(
      `/projects/${projectId}/activity?page=${page}&limit=${limit}`,
    ),
};
