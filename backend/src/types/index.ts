/**
 * Global shared types for the backend.
 * Domain-specific types will live alongside their respective modules.
 */

/** Extended Error with an HTTP status code */
export interface AppError extends Error {
  statusCode?: number;
}

/** Standard API success response shape */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/** Standard API error response shape */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    stack?: string;
  };
}

/** Pagination metadata included in list responses */
export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/** Utility: make selected keys of T required */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
