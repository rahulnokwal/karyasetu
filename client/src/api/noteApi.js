import { apiClient } from "./axiosClient";

export const noteApi = {
  getTaskNotes: (taskId, page = 1, limit = 20) =>
    apiClient.get(`/tasks/${taskId}/notes?page=${page}&limit=${limit}`),
  addNote: (taskId, content) =>
    apiClient.post(`/tasks/${taskId}/notes`, { content }),
  updateNote: (noteId, content) =>
    apiClient.patch(`/notes/${noteId}`, { content }),
  deleteNote: (noteId) => apiClient.delete(`/notes/${noteId}`),
};
