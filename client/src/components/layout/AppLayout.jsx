import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { EmailVerificationBanner } from "./EmailVerificationBanner";
import { CreateWorkspaceModal } from "../workspace/CreateWorkspaceModal";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { Building2, Loader2, Plus } from "lucide-react";
import { Button } from "../common/Button";

function NoWorkspaceEmptyState() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-md w-full">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Welcome to KaryaSetu!
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            You are not a member of any workspace yet. Create your first
            workspace to start organizing projects and tasks.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Your First Workspace
        </Button>
      </div>
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

export function AppLayout() {
  const { fetchWorkspaces, isLoading, isInitialized, workspaces } =
    useWorkspaceStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (!isInitialized) return;
    if (workspaces.length > 0) return;
    if (location.pathname !== "/workspace") {
      navigate("/workspace", { replace: true });
    }
  }, [isInitialized, workspaces.length, location.pathname, navigate]);

  if (!isInitialized || (isLoading && workspaces.length === 0)) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <div className="h-full w-full flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <EmailVerificationBanner />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {workspaces.length === 0 ? <NoWorkspaceEmptyState /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
