import React, { useEffect } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { useAuthStore } from "./store/authStore";
import { useWorkspaceStore } from "./store/workspaceStore";
import * as socketModule from "./api/socketClient";
import { Toaster, toast } from "sonner";

window.__karyasetuSocket = socketModule;

function AuthInitializer() {
  const { fetchCurrentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      useWorkspaceStore.getState().reset();
      toast.error("Your session has expired. Please sign in again.");
      navigate("/login");
    };

    window.addEventListener("karyasetu_auth_expired", handleAuthExpired);
    return () => {
      window.removeEventListener("karyasetu_auth_expired", handleAuthExpired);
    };
  }, [fetchCurrentUser, navigate]);

  return <AppRoutes />;
}

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <AuthInitializer />
    </BrowserRouter>
  );
}

export default App;
