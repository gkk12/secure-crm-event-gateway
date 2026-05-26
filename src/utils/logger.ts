type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  [key: string]: unknown;
}

const SERVICE_NAME = 'secure-crm-event-gateway';

function emit(level: LogLevel, message: string, context: LogContext = {}): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: SERVICE_NAME,
      message,
      ...context,
    }),
  );
}

export const logger = {
  info: (message: string, context?: LogContext) => emit('INFO', message, context),
  warn: (message: string, context?: LogContext) => emit('WARN', message, context),
  error: (message: string, context?: LogContext) => emit('ERROR', message, context),
};
