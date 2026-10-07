import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date =
    typeof dateString === "string"
      ? parseISO(dateString)
      : new Date(dateString);
  if (!isValid(date)) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDateTime(dateString) {
  if (!dateString) return "";
  const date =
    typeof dateString === "string"
      ? parseISO(dateString)
      : new Date(dateString);
  if (!isValid(date)) return "";
  return format(date, "MMM d, yyyy h:mm a");
}

export function formatDateShort(dateString) {
  if (!dateString) return "";
  const date =
    typeof dateString === "string"
      ? parseISO(dateString)
      : new Date(dateString);
  if (!isValid(date)) return "";
  return format(date, "MMM d");
}
