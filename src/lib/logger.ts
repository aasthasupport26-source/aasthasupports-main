/**
 * Professional Logging Service
 * Replaces console.log/error with structured logging
 * Integrates with Sentry for error tracking in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    const emoji = this.getEmoji(level);

    if (this.isDevelopment) {
      // Colorful, readable format for development
      const contextStr = context ? `\n   Context: ${JSON.stringify(context, null, 2)}` : '';
      return `${emoji} [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify(entry);
  }

  /**
   * Get emoji for log level (development only)
   */
  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      critical: '🚨',
    };
    return emojis[level] || 'ℹ️';
  }

  /**
   * Create log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = error;
      entry.stack = error.stack;
    }

    return entry;
  }

  /**
   * Send error to Sentry if configured
   */
  private async sendToSentry(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    try {
      const { captureError } = await import('./sentry');
      if (entry.error) {
        captureError(entry.error, entry.context);
      } else {
        // For non-error critical logs
        captureError(new Error(entry.message), entry.context);
      }
    } catch (err) {
      // Silently fail if Sentry is not configured
    }
  }

  /**
   * Debug level - Development only
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;

    const entry = this.createEntry('debug', message, context);
    console.log(this.formatLog(entry));
  }

  /**
   * Info level - General information
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createEntry('info', message, context);
    console.log(this.formatLog(entry));
  }

  /**
   * Warning level - Something unexpected but not critical
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createEntry('warn', message, context);
    console.warn(this.formatLog(entry));
  }

  /**
   * Error level - Application error that needs attention
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createEntry('error', message, context, error);
    console.error(this.formatLog(entry));

    // Send to Sentry in production
    this.sendToSentry(entry);
  }

  /**
   * Critical level - System failure, immediate attention required
   */
  critical(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createEntry('critical', message, context, error);
    console.error(this.formatLog(entry));

    // Always send to Sentry, even in development
    this.sendToSentry(entry);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, {
      type: 'api_request',
      method,
      path,
      ...context,
    });
  }

  /**
   * Log API response
   */
  apiResponse(method: string, path: string, statusCode: number, duration: number): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    this[level](`${method} ${path} - ${statusCode}`, {
      type: 'api_response',
      method,
      path,
      statusCode,
      duration,
    });
  }

  /**
   * Log security event
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level = severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'warn';

    this[level](`Security Event: ${event}`, {
      type: 'security',
      severity,
      ...context,
    });
  }

  /**
   * Log payment event
   */
  payment(event: string, context?: LogContext): void {
    this.info(`Payment: ${event}`, {
      type: 'payment',
      ...context,
    });
  }

  /**
   * Log database query (development only)
   */
  query(query: string, duration?: number): void {
    if (!this.isDevelopment) return;

    this.debug('Database Query', {
      query: query.substring(0, 100), // Truncate long queries
      duration,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common patterns
export const logApiRequest = logger.apiRequest.bind(logger);
export const logApiResponse = logger.apiResponse.bind(logger);
export const logSecurity = logger.security.bind(logger);
export const logPayment = logger.payment.bind(logger);
export const logError = logger.error.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logDebug = logger.debug.bind(logger);
