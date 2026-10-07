import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
      <div className="space-y-4 max-w-sm">
        <h1 className="text-7xl font-extrabold text-indigo-600">404</h1>
        <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The page or resource you are looking for doesn't exist or has been
          moved.
        </p>
        <div className="pt-2">
          <Link to="/workspace">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
