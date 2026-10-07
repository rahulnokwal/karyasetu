import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const { updateUser } = useAuthStore();

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function verify() {
      if (!token) {
        setStatus("error");
        setErrorMessage("Verification token is missing from the link");
        return;
      }

      try {
        await authApi.verifyEmail(token);
        updateUser({ isEmailVerified: true });
        setStatus("success");
      } catch (error) {
        try {
          const me = await authApi.getCurrentUser();
          if (me?.data?.isEmailVerified) {
            updateUser({ isEmailVerified: true });
            setStatus("success");
            return;
          }
        } catch {}
        setStatus("error");
        setErrorMessage(
          error.message || "Invalid or expired verification token",
        );
      }
    }

    verify();
  }, [token, updateUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-4">
        {status === "verifying" && (
          <div className="py-8 space-y-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">
              Verifying Email...
            </h2>
            <p className="text-xs text-slate-500">
              Please wait while we validate your credentials.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">
              Email Verified!
            </h2>
            <p className="text-xs text-slate-500">
              Your account has been fully verified. You now have unrestricted
              access to join workspaces and collaborate.
            </p>
            <div className="pt-4">
              <Link
                to="/workspace"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Go to Projects
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-6 space-y-3">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">
              Verification Failed
            </h2>
            <p className="text-xs text-red-600">{errorMessage}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
