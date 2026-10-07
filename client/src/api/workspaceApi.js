import { apiClient } from "./axiosClient";

export const workspaceApi = {
  getWorkspaces: () => apiClient.get("/workspaces"),
  createWorkspace: (workspaceName) =>
    apiClient.post("/workspaces", { workspaceName }),
  renameWorkspace: (workspaceId, workspaceName) =>
    apiClient.patch(`/workspaces/${workspaceId}`, { workspaceName }),
  deleteWorkspace: (workspaceId) =>
    apiClient.delete(`/workspaces/${workspaceId}`),
  leaveWorkspace: (workspaceId) =>
    apiClient.delete(`/workspaces/${workspaceId}/leave`),
  transferOwnership: (workspaceId, targetUserId) =>
    apiClient.patch(
      `/workspaces/${workspaceId}/transfer-ownership/${targetUserId}`,
    ),

  getMembers: (workspaceId) =>
    apiClient.get(`/workspaces/${workspaceId}/members`),
  updateMemberRole: (workspaceId, userId, role) =>
    apiClient.patch(`/workspaces/${workspaceId}/members/${userId}`, { role }),
  removeMember: (workspaceId, userId) =>
    apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`),

  sendInvitation: (workspaceId, email, role) =>
    apiClient.post(`/workspaces/${workspaceId}/invites`, { email, role }),
  acceptInvitation: (token) =>
    apiClient.post(`/workspaces/invites-accept/${token}`),

  getActivity: (workspaceId, page = 1, limit = 20) =>
    apiClient.get(
      `/workspaces/${workspaceId}/activity?page=${page}&limit=${limit}`,
    ),
};
