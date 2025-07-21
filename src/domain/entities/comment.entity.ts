export interface Comment {
  id: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  postId: string;
  parentId?: string;
}

export interface CreateCommentData {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content?: string;
  isActive?: boolean;
}
