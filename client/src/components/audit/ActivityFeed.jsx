import React from "react";
import { Avatar } from "../common/Avatar";
import { formatRelativeTime } from "../../utils/formatDate";
import { Activity } from "lucide-react";
import { ChangeSummary } from "./ChangeSummary";

export function ActivityFeed({ logs = [], isLoading }) {
  if (logs.length === 0 && !isLoading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No activity records found.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {logs.map((log) => (
        <div key={log._id} className="py-3.5 flex items-start gap-3">
          <Avatar
            src={log.performedBy?.profile}
            name={log.performedBy?.fullName || "User"}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {log.performedBy?.fullName || "Team Member"}
              </p>
              <span className="text-[10px] text-slate-400 shrink-0">
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>

            <div className="mt-1">
              <ChangeSummary changes={log.changes} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
