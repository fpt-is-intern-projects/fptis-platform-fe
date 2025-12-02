export type ApiResponse<T> = {
  code: number;
  message?: string;
  result: T;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
};

export type PaginationParams = {
  page: number;
  size: number;
  filter?: string | null;
};
