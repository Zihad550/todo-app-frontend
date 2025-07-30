export interface Blog {
  id: string;
  title: string;
  content: string; // Markdown content
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogInput {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdateBlogInput {
  title?: string;
  content?: string;
  tags?: string[];
}

export enum BlogSortBy {
  CREATED_DESC = 'created_desc',
  CREATED_ASC = 'created_asc',
  UPDATED_DESC = 'updated_desc',
  UPDATED_ASC = 'updated_asc',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
}
