import React, { useState, useEffect } from "react";
import { useWorkspaceStore } from "../store/workspaceStore";
import { workspaceApi } from "../api/workspaceApi";
import { ActivityFeed } from "../components/audit/ActivityFeed";
import { Pagination } from "../components/common/Pagination";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function WorkspaceActivityPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLogs(targetPage = 1) {
      if (!currentWorkspace?.workspaceId) return;
      setIsLoading(true);
      try {
        const response = await workspaceApi.getActivity(
          currentWorkspace.workspaceId,
          targetPage
        );
        if (cancelled) return;
        const incoming = response.data?.auditLogs || [];
        setLogs((prev) =>
          targetPage === 1 ? incoming : [...prev, ...incoming]
        );
        setHasNextPage(!!response.data?.hasNextPage);
        setPage(targetPage);
      } catch (error) {
        if (!cancelled)
          toast.error(error.message || "Failed to load workspace activity logs");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadLogs(1);
    return () => {
      cancelled = true;
    };
  }, [currentWorkspace?.workspaceId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Workspace Activity
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Audit history and events across{" "}
          <strong>{currentWorkspace?.workspaceName}</strong>
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        {isLoading && logs.length === 0 ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            <ActivityFeed logs={logs} isLoading={isLoading} />
            <Pagination
              page={page}
              hasNextPage={hasNextPage}
              hasPreviousPage={page > 1}
              isLoading={isLoading}
              onPageChange={(p) => loadLogs(p)}
            />
          </>
        )}
      </div>
    </div>
  );
}
