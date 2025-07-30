import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Draft, CreateDraftInput, UpdateDraftInput } from '@/types/draft';

const STORAGE_KEY = 'taskflow-drafts';

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedDrafts = JSON.parse(stored).map(
          (draft: Partial<Draft>) => ({
            ...draft,
            tags: draft.tags || [], // Migration: add tags field if missing
            createdAt: new Date(draft.createdAt!),
            updatedAt: new Date(draft.updatedAt!),
          })
        );
        setDrafts(parsedDrafts);
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save drafts to localStorage whenever drafts change
  const saveDrafts = (newDrafts: Draft[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDrafts));
      setDrafts(newDrafts);
    } catch (error) {
      console.error('Failed to save drafts:', error);
      toast.error('Failed to save drafts');
    }
  };

  const createDraft = async (
    input: CreateDraftInput
  ): Promise<Draft | null> => {
    try {
      const newDraft: Draft = {
        id: crypto.randomUUID(),
        title: input.title,
        content: input.content || '',
        tags: input.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newDrafts = [...drafts, newDraft];
      saveDrafts(newDrafts);
      toast.success('Draft created successfully');
      return newDraft;
    } catch (error) {
      console.error('Failed to create draft:', error);
      toast.error('Failed to create draft');
      return null;
    }
  };

  const updateDraft = async (
    id: string,
    updates: UpdateDraftInput
  ): Promise<void> => {
    try {
      const newDrafts = drafts.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              ...updates,
              updatedAt: new Date(),
            }
          : draft
      );

      saveDrafts(newDrafts);
      toast.success('Draft updated successfully');
    } catch (error) {
      console.error('Failed to update draft:', error);
      toast.error('Failed to update draft');
    }
  };

  const deleteDraft = async (id: string): Promise<void> => {
    try {
      const newDrafts = drafts.filter((draft) => draft.id !== id);
      saveDrafts(newDrafts);
      toast.success('Draft deleted successfully');
    } catch (error) {
      console.error('Failed to delete draft:', error);
      toast.error('Failed to delete draft');
    }
  };

  const getDraft = (id: string): Draft | undefined => {
    return drafts.find((draft) => draft.id === id);
  };

  return {
    drafts,
    createDraft,
    updateDraft,
    deleteDraft,
    getDraft,
    isLoading,
  };
}
