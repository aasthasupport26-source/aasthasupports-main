/**
 * Response size limits to prevent DoS attacks
 */

const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_JSON_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_ARRAY_LENGTH = 1000;

export interface SizeLimitConfig {
  maxResponseSize: number;
  maxJsonSize: number;
  maxArrayLength: number;
}

/**
 * Check if response size exceeds limit
 */
export function checkResponseSize(data: any): { allowed: boolean; size: number } {
  const size = JSON.stringify(data).length;
  return {
    allowed: size <= MAX_RESPONSE_SIZE,
    size,
  };
}

/**
 * Check if JSON payload size exceeds limit
 */
export function checkJsonSize(json: string): { allowed: boolean; size: number } {
  const size = json.length;
  return {
    allowed: size <= MAX_JSON_SIZE,
    size,
  };
}

/**
 * Check if array length exceeds limit
 */
export function checkArrayLength(array: any[]): { allowed: boolean; length: number } {
  return {
    allowed: array.length <= MAX_ARRAY_LENGTH,
    length: array.length,
  };
}

/**
 * Paginate large arrays
 */
export function paginateArray<T>(
  array: T[],
  page: number = 1,
  pageSize: number = 50
): { data: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    data: array.slice(start, end),
    total: array.length,
    page,
    pageSize,
    totalPages: Math.ceil(array.length / pageSize),
  };
}

/**
 * Truncate response if too large
 */
export function truncateResponse<T>(
  data: T[],
  maxSize: number = MAX_RESPONSE_SIZE
): { data: T[]; truncated: boolean; originalLength: number } {
  let truncated = false;
  let result = data;
  
  while (JSON.stringify(result).length > maxSize && result.length > 0) {
    result = result.slice(0, Math.floor(result.length * 0.8));
    truncated = true;
  }
  
  return {
    data: result,
    truncated,
    originalLength: data.length,
  };
}
