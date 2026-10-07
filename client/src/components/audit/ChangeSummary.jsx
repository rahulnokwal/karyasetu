import React from "react";
import { ArrowRight } from "lucide-react";

const FIELD_LABELS = {
  title: "Title",
  description: "Description",
  name: "Name",
  status: "Status",
  attachments: "Attachments",
};

const isDiff = (value) =>
  value && typeof value === "object" && "from" in value && "to" in value;

const isActionObject = (value) =>
  value && typeof value === "object" && typeof value.action === "string";

const formatValue = (field, value) => {
  if (value === null || value === undefined || value === "") return "(none)";
  let text = String(value);
  if (field === "status") text = text.replace(/_/g, " ");
  if (field === "description" && text.length > 140) {
    text = text.slice(0, 140) + "…";
  }
  return text;
};

export function ChangeSummary({ changes }) {
  if (!changes || typeof changes !== "object") return null;

  const entries = Object.entries(changes);

  const plainAction = entries.find(
    ([key, value]) => key === "action" && typeof value === "string",
  );
  if (plainAction) {
    return (
      <span className="text-xs text-slate-600 font-medium">
        {plainAction[1]}
      </span>
    );
  }

  const diffs = entries.filter(([, value]) => isDiff(value));

  const subActions = entries.filter(([, value]) => isActionObject(value));

  const plainFields = entries.filter(
    ([key, value]) =>
      key !== "action" && value !== null && typeof value !== "object",
  );

  if (
    diffs.length === 0 &&
    subActions.length === 0 &&
    plainFields.length === 0
  ) {
    return (
      <pre className="text-[11px] font-mono bg-slate-50 p-2 rounded-lg text-slate-600 max-h-24 overflow-y-auto">
        {JSON.stringify(changes, null, 2)}
      </pre>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {diffs.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-600"
        >
          {FIELD_LABELS[key] || key}:
          <span className="font-semibold text-slate-800 break-all">
            {formatValue(key, value.from)}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-semibold text-indigo-600 break-all">
            {formatValue(key, value.to)}
          </span>
        </span>
      ))}
      {subActions.map(([key, value]) => (
        <span key={key} className="text-xs text-slate-600 font-medium">
          {value.action}
        </span>
      ))}
      {plainFields.map(([key, value]) => (
        <span key={key} className="text-xs text-slate-600">
          {FIELD_LABELS[key] || key}: {String(value)}
        </span>
      ))}
    </div>
  );
}
