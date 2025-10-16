// Production-safe logging utility
// Replaces console.* with structured, environment-aware logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  operation?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // Production: only warn and error
    return level === 'warn' || level === 'error';
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context) {
      const contextStr = Object.entries(context)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');
      
      return `${prefix} ${message} ${contextStr}`;
    }
    
    return `${prefix} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    
    const formattedMessage = this.formatMessage('debug', message, context);
    
    if (this.isClient) {
      console.debug(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    
    const formattedMessage = this.formatMessage('info', message, context);
    console.log(formattedMessage);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    
    const formattedMessage = this.formatMessage('warn', message, context);
    console.warn(formattedMessage);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const errorContext = error ? {
      ...context,
      error: error.message,
      stack: error.stack
    } : context;
    
    const formattedMessage = this.formatMessage('error', message, errorContext);
    console.error(formattedMessage);
    
    // Production error tracking could be added here
    if (!this.isDevelopment && error) {
      this.trackProductionError(message, error, context);
    }
  }

  private trackProductionError(message: string, error: Error, context?: LogContext): void {
    // TODO: Integrate with error tracking service (Sentry, DataDog, etc.)
    // For now, we'll structure the error for future integration
    const errorEvent = {
      timestamp: new Date().toISOString(),
      level: 'error' as const,
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      environment: process.env.NODE_ENV,
      userAgent: this.isClient ? navigator.userAgent : 'server'
    };
    
    // In production, this could send to an error tracking service
    console.error('PRODUCTION_ERROR:', JSON.stringify(errorEvent));
  }

  // Helper method for component logging
  createComponentLogger(componentName: string) {
    return {
      debug: (message: string, metadata?: Record<string, unknown>) =>
        this.debug(message, { component: componentName, metadata }),
      
      info: (message: string, metadata?: Record<string, unknown>) =>
        this.info(message, { component: componentName, metadata }),
      
      warn: (message: string, metadata?: Record<string, unknown>) =>
        this.warn(message, { component: componentName, metadata }),
      
      error: (message: string, error?: Error, metadata?: Record<string, unknown>) =>
        this.error(message, error, { component: componentName, metadata })
    };
  }

  // Helper method for operation logging
  createOperationLogger(operation: string, requestId?: string) {
    return {
      debug: (message: string, metadata?: Record<string, unknown>) =>
        this.debug(message, { operation, requestId, metadata }),
      
      info: (message: string, metadata?: Record<string, unknown>) =>
        this.info(message, { operation, requestId, metadata }),
      
      warn: (message: string, metadata?: Record<string, unknown>) =>
        this.warn(message, { operation, requestId, metadata }),
      
      error: (message: string, error?: Error, metadata?: Record<string, unknown>) =>
        this.error(message, error, { operation, requestId, metadata })
    };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export helper functions for common use cases
export const createComponentLogger = (componentName: string) => 
  logger.createComponentLogger(componentName);

export const createOperationLogger = (operation: string, requestId?: string) => 
  logger.createOperationLogger(operation, requestId);

// Export types for external use
export type { LogLevel, LogContext };