import React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  page = 1,
  hasNextPage = false,
  hasPreviousPage = false,
  isLoading = false,
  onPageChange,
  className = "",
}) {
  if (!hasNextPage && !hasPreviousPage) return null;

  return (
    <div className={`flex items-center justify-center gap-2 pt-3 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage || isLoading}
        onClick={() => onPageChange(page - 1)}
        title="Previous page"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Prev
      </Button>

      <span className="text-[11px] text-slate-500 font-medium px-1">
        Page {page}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage || isLoading}
        onClick={() => onPageChange(page + 1)}
        title="Next page"
      >
        Next
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>

      {isLoading && (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
      )}
    </div>
  );
}
