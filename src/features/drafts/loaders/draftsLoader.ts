import type { LoaderFunctionArgs } from 'react-router';
import type { Draft } from '@/types/draft';

const STORAGE_KEY = 'taskflow-drafts';

export async function draftsLoader(): Promise<Draft[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedDrafts = JSON.parse(stored).map((draft: Partial<Draft>) => ({
        ...draft,
        tags: draft.tags || [], // Migration: add tags field if missing
        createdAt: new Date(draft.createdAt!),
        updatedAt: new Date(draft.updatedAt!),
      }));
      return parsedDrafts;
    }
    return [];
  } catch (error) {
    console.error('Failed to load drafts:', error);
    return [];
  }
}

export async function draftLoader({
  params,
}: LoaderFunctionArgs): Promise<Draft | null> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && params.id) {
      const parsedDrafts = JSON.parse(stored).map((draft: Partial<Draft>) => ({
        ...draft,
        tags: draft.tags || [], // Migration: add tags field if missing
        createdAt: new Date(draft.createdAt!),
        updatedAt: new Date(draft.updatedAt!),
      }));
      return (
        parsedDrafts.find((draft: Draft) => draft.id === params.id) || null
      );
    }
    return null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}
