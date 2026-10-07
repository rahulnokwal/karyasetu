import { create } from "zustand";
import { authApi } from "../api/authApi";
import {
  markSessionActive,
  clearSession,
  hasStoredSession,
} from "../api/axiosClient";
import { useWorkspaceStore } from "./workspaceStore";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem("karyasetu_access_token") || null,
  isAuthenticated:
    localStorage.getItem("karyasetu_session_active") === "1" ||
    !!localStorage.getItem("karyasetu_access_token"),
  isLoading: true,

  fetchCurrentUser: async () => {
    set({ isLoading: true });

    const sessionAtStart = hasStoredSession();
    try {
      const response = await authApi.getCurrentUser();
      if (response?.data) {
        markSessionActive();
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
        return response.data;
      }

      if (!sessionAtStart && hasStoredSession()) {
        set({ isLoading: false });
        return get().user;
      }
      clearSession();
      localStorage.removeItem("karyasetu_access_token");
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      if (!sessionAtStart && hasStoredSession()) {
        set({ isLoading: false });
        return;
      }
      clearSession();
      localStorage.removeItem("karyasetu_access_token");
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    const response = await authApi.login({ email, password });
    const { user, accessToken } = response.data;
    if (accessToken) {
      localStorage.setItem("karyasetu_access_token", accessToken);
    }
    markSessionActive();
    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
    return user;
  },

  register: async (payload) => {
    const response = await authApi.register(payload);
    const user = response.data;

    markSessionActive();
    set({
      user,
      isAuthenticated: true,
    });
    return user;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
    } finally {
      localStorage.removeItem("karyasetu_access_token");
      clearSession();
      useWorkspaceStore.getState().reset();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  updateUser: (updatedUser) => {
    set((state) => ({
      user: { ...state.user, ...updatedUser },
    }));
  },
}));
