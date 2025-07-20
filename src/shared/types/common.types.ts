export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  status: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchQuery {
  q?: string;
  tags?: string[];
  status?: string;
}