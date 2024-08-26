import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CheckMimeType = (file: File) => {
  const validMimeTypes = ["image/png", "image/jpeg", "image/gif"];
  return validMimeTypes.includes(file.type);
};

export const getAgo = (isoDate: string): string => {
  const pastDate = new Date(isoDate);
  const now = new Date();

  // Calculate the difference in milliseconds
  const diffMs = now.getTime() - pastDate.getTime();

  // Calculate each component of the duration
  const diffYears = now.getFullYear() - pastDate.getFullYear();
  const diffMonths = diffYears * 12 + now.getMonth() - pastDate.getMonth();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffSeconds = Math.floor(diffMs / 1000);

  // Determine the most significant unit and return the appropriate duration
  if (diffYears >= 1) {
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  } else if (diffMonths >= 1) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  } else if (diffDays >= 1) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours >= 1) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffMinutes >= 1) {
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  } else {
    return `${diffSeconds} second${diffSeconds > 1 ? "s" : ""} ago`;
  }
};
