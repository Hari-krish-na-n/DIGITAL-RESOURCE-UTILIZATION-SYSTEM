import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#F43F5E', // Rose
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];
