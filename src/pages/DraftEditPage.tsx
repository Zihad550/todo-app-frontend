import { useLoaderData } from 'react-router';
import { DraftEditor, useDrafts } from '@/features/drafts';
import type { Draft } from '@/types/draft';

export function DraftEditPage() {
  const draft = useLoaderData() as Draft | null;
  const { updateDraft } = useDrafts();

  return (
    <div className="container mx-auto px-4 py-8">
      <DraftEditor draft={draft} onDraftUpdate={updateDraft} />
    </div>
  );
}
