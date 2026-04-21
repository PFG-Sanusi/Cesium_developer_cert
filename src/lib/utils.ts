import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using clsx and tailwind-merge.
 * This is a standard utility for shadcn/ui components.
 * 
 * @param inputs - Class names to merge
 * @returns - A single string of merged class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
