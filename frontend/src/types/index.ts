/**
 * Global shared types for the frontend.
 * Domain-specific types will live alongside their respective feature modules.
 */

/** Standard API success response envelope */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/** Standard API error response envelope */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

/** Pagination metadata returned with list responses */
export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
