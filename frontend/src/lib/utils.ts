import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CheckMimeType = (file: File) => {
  const validMimeTypes = ["image/png", "image/jpeg", "image/gif"];
  return validMimeTypes.includes(file.type);
};
