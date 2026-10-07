import { apiClient } from "./axiosClient";

export const authApi = {
  register: (payload) => apiClient.post("/users/register", payload),
  login: (payload) => apiClient.post("/users/login", payload),
  logout: () => apiClient.post("/users/logout"),
  getCurrentUser: () => apiClient.get("/users/current-user"),
  changePassword: (payload) =>
    apiClient.post("/users/change-password", payload),
  verifyEmail: (token) => apiClient.get(`/users/verify-email/${token}`),
  resendVerificationEmail: () =>
    apiClient.post("/users/resend-email-verification"),
  forgotPassword: (email) =>
    apiClient.post("/users/forget-password-mail", { email }),
  resetPassword: (token, newPassword) =>
    apiClient.post(`/users/reset-password/${token}`, { newPassword }),
  updateProfileImage: (formData) =>
    apiClient.post("/users/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateUserDetails: (payload) =>
    apiClient.patch("/users/update-details", payload),
};
