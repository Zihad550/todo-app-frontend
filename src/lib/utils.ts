import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Subtask } from '@/types/task';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique identifier for a subtask using its title and creation timestamp.
 * This ensures uniqueness while being deterministic for the same subtask.
 */
export function getSubtaskId(subtask: Subtask): string {
  // Ensure we have a valid subtask object
  if (!subtask || typeof subtask !== 'object') {
    console.warn('Invalid subtask object passed to getSubtaskId:', subtask);
    return `invalid-subtask-${Date.now()}`;
  }

  // Ensure we have a title
  const title = (subtask.title || 'untitled').trim();
  
  // Get the timestamp from createdAt
  let timestamp: number;
  
  try {
    if (!subtask.createdAt) {
      // Fallback to current timestamp if createdAt is missing
      timestamp = Date.now();
    } else if (typeof subtask.createdAt === 'string') {
      // Parse string date to timestamp
      const parsed = new Date(subtask.createdAt);
      timestamp = isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
    } else if (subtask.createdAt instanceof Date) {
      // Use existing Date object
      timestamp = subtask.createdAt.getTime();
    } else {
      // Fallback for any other type
      timestamp = Date.now();
    }
  } catch (error) {
    console.warn('Error processing createdAt in getSubtaskId:', error);
    timestamp = Date.now();
  }
  
  // Combine title and timestamp for a unique identifier
  return `${title}-${timestamp}`;
}
