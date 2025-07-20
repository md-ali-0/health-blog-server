export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  imageUrl?: string;
  tags: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  imageUrl?: string;
  tags?: string[];
  authorId: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: PostStatus;
  imageUrl?: string;
  tags?: string[];
}