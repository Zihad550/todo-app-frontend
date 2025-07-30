export interface Draft {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDraftInput {
  title: string;
  content?: string;
  tags?: string[];
}

export interface UpdateDraftInput {
  title?: string;
  content?: string;
  tags?: string[];
}
