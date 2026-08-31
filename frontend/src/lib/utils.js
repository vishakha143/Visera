import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names intelligently.
 * - Handles conditional classes
 * - Resolves Tailwind conflicts (e.g. "p-2 p-4" → "p-4")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a human-readable relative time string.
 * Example: "2 hours ago", "just now", "3 days ago"
 */
export function relativeTime(date) {
  if (!date) return "";

  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}