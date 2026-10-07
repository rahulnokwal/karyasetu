import { create } from "zustand";
import { workspaceApi } from "../api/workspaceApi";

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  currentRole: null,
  isLoading: false,

  isInitialized: false,

  reset: () => {
    set({
      workspaces: [],
      currentWorkspace: null,
      currentRole: null,
      isLoading: false,
      isInitialized: false,
    });
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const response = await workspaceApi.getWorkspaces();
      const workspaces = response.data || [];
      const current = get().currentWorkspace;

      let active = null;
      if (
        current &&
        workspaces.some((w) => w.workspaceId === current.workspaceId)
      ) {
        active = workspaces.find((w) => w.workspaceId === current.workspaceId);
      } else if (workspaces.length > 0) {
        active = workspaces[0];
      }

      set({
        workspaces,
        currentWorkspace: active,
        currentRole: active?.role || null,
        isLoading: false,
        isInitialized: true,
      });

      return workspaces;
    } catch (error) {
      set({
        isLoading: false,
        isInitialized: true,
        workspaces: [],
        currentWorkspace: null,
        currentRole: null,
      });
      throw error;
    }
  },

  setCurrentWorkspace: (workspace) => {
    set({
      currentWorkspace: workspace,
      currentRole: workspace?.role || null,
    });
  },

  createWorkspace: async (workspaceName) => {
    const response = await workspaceApi.createWorkspace(workspaceName);
    await get().fetchWorkspaces();
    return response.data;
  },

  renameWorkspace: async (workspaceId, workspaceName) => {
    const response = await workspaceApi.renameWorkspace(
      workspaceId,
      workspaceName,
    );
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.workspaceId === workspaceId ? { ...w, workspaceName } : w,
      ),
      currentWorkspace:
        state.currentWorkspace?.workspaceId === workspaceId
          ? { ...state.currentWorkspace, workspaceName }
          : state.currentWorkspace,
    }));
    return response.data;
  },

  deleteWorkspace: async (workspaceId) => {
    await workspaceApi.deleteWorkspace(workspaceId);
    await get().fetchWorkspaces();
  },
}));
