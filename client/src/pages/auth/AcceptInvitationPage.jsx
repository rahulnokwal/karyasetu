import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { workspaceApi } from "../../api/workspaceApi";
import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { Button } from "../../components/common/Button";
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("ready");
  const [errorMessage, setErrorMessage] = useState("");
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { fetchWorkspaces } = useWorkspaceStore();
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!token) return;

    if (!isAuthenticated || !user) {
      toast.error("Please sign in first to accept this invitation");
      navigate(
        `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
      return;
    }

    if (!user?.isEmailVerified) {
      toast.error(
        "Please verify your email address before accepting invitations",
      );
      return;
    }

    setStatus("accepting");
    try {
      await workspaceApi.acceptInvitation(token);
      await fetchWorkspaces();
      setStatus("success");
      toast.success("Successfully joined the workspace!");
      setTimeout(() => navigate("/workspace"), 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Failed to accept workspace invitation");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-lg shadow-indigo-200">
          <Building2 className="w-6 h-6" />
        </div>

        {status === "ready" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              Workspace Invitation
            </h2>
            <p className="text-xs text-slate-500">
              You've been invited to collaborate on a KaryaSetu workspace.
            </p>

            {isLoading && !user ? (
              <div className="py-4 flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <p className="text-xs">Checking your session...</p>
              </div>
            ) : !isAuthenticated || !user ? (
              <div className="pt-2">
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-4">
                  Please log in or register with the invited email address to
                  continue.
                </p>
                <Button
                  onClick={() =>
                    navigate(
                      `/login?redirect=${encodeURIComponent(
                        window.location.pathname + window.location.search,
                      )}`,
                    )
                  }
                  className="w-full"
                >
                  Log In to Accept
                </Button>
              </div>
            ) : !user?.isEmailVerified ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Email Verification Required
                </div>
                <p className="text-xs text-amber-700">
                  Backend security rule: You must verify your email (
                  <strong>{user?.email}</strong>) before you can accept
                  workspace invitations.
                </p>
              </div>
            ) : (
              <Button onClick={handleAccept} size="lg" className="w-full">
                Join Workspace
              </Button>
            )}
          </div>
        )}

        {status === "accepting" && (
          <div className="py-8 space-y-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">
              Joining Workspace...
            </h2>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">
              Welcome Aboard!
            </h2>
            <p className="text-xs text-slate-500">
              You are now a member of this workspace. Taking you to your
              projects...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="py-6 space-y-3">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">
              Invitation Invalid
            </h2>
            <p className="text-xs text-red-600">{errorMessage}</p>
            <div className="pt-4">
              <Link
                to="/workspace"
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
