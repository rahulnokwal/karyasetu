import { apiClient } from "./axiosClient";

export const taskApi = {
  createTask: (projectId, formData) =>
    apiClient.post(`/projects/${projectId}/tasks`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getProjectTasks: (projectId, page = 1, limit = 100) =>
    apiClient.get(`/projects/${projectId}/tasks?page=${page}&limit=${limit}`),

  getMyTasks: () => apiClient.get("/tasks/my-tasks"),

  getTaskById: (taskId) => apiClient.get(`/tasks/${taskId}`),

  updateTaskInfo: (taskId, formData) =>
    apiClient.patch(`/tasks/${taskId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),

  assignTask: (taskId, assigneeId) =>
    apiClient.patch(`/tasks/${taskId}/assign`, { assigneeId }),

  reorderTask: (taskId, prevPosition = "", nextPosition = "") =>
    apiClient.patch(`/tasks/${taskId}/reorder`, { prevPosition, nextPosition }),

  updateStatus: (taskId, status) =>
    apiClient.patch(`/tasks/${taskId}/status`, { status }),

  getActivity: (taskId) => apiClient.get(`/tasks/${taskId}/activity`),
};
