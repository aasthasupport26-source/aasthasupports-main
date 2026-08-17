// Secure logging utility that sanitizes sensitive data

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'key', 'authorization',
  'cookie', 'session', 'apikey', 'api_key', 'access_token',
  'refresh_token', 'jwt', 'bearer', 'credential'
];

function sanitizeObject(obj: any, visited = new WeakSet()): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (visited.has(obj)) return '[Circular]';
  visited.add(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, visited));
  }
  
  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key], visited);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
}

export function secureLog(level: LogLevel, message: string, data?: any) {
  // Only log in development or server-side
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    return;
  }
  
  const sanitizedData = data ? sanitizeObject(data) : undefined;
  
  switch (level) {
    case 'debug':
      if (process.env.NODE_ENV !== 'production') {
        console.debug(message, sanitizedData);
      }
      break;
    case 'info':
      console.info(message, sanitizedData);
      break;
    case 'warn':
      console.warn(message, sanitizedData);
      break;
    case 'error':
      console.error(message, sanitizedData);
      break;
  }
}

export const logger = {
  debug: (msg: string, data?: any) => secureLog('debug', msg, data),
  info: (msg: string, data?: any) => secureLog('info', msg, data),
  warn: (msg: string, data?: any) => secureLog('warn', msg, data),
  error: (msg: string, data?: any) => secureLog('error', msg, data),
};
