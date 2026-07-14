export type LogLevel = "INFO" | "WARN" | "ERROR" | "SECURITY" | "AUDIT" | "PERFORMANCE";

export interface LogPayload {
  message: string;
  context?: {
    service?: string;
    action?: string;
    [key: string]: any;
  };
  meta?: Record<string, any>;
  error?: Error | any;
}

export class Logger {
  private static env = process.env.NODE_ENV || "development";

  /**
   * Generates a standardized JSON envelope or pretty logs depending on NODE_ENV.
   */
  private static log(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    
    // Formatting standard JSON log shape for production collectors
    const structuredLog = {
      timestamp,
      level,
      environment: Logger.env,
      message: payload.message,
      context: payload.context || {},
      meta: payload.meta || {},
      ...(payload.error && {
        error: {
          name: payload.error.name || "Error",
          message: payload.error.message || String(payload.error),
          stack: payload.error.stack || null
        }
      })
    };

    if (Logger.env === "production") {
      // Direct raw JSON string output to stdout/stderr
      if (level === "ERROR") {
        console.error(JSON.stringify(structuredLog));
      } else {
        console.log(JSON.stringify(structuredLog));
      }
      
      // Hook for pushing to Datadog, Sentry, or CloudWatch in production
      Logger.pushToCollectors(level, structuredLog);
    } else {
      // Pretty-printed console output for developers
      Logger.prettyPrint(level, structuredLog);
    }
  }

  // ─── External Monitoring Collectors Hooks ────────────────────────────────────

  private static pushToCollectors(level: LogLevel, log: any) {
    try {
      // 1. Sentry hook (for critical errors and security issues)
      if (level === "ERROR" || level === "SECURITY") {
        // e.g., Sentry.captureException(log.error || log.message, { extra: log.meta });
      }

      // 2. Datadog / CloudWatch Agent (automatically reads stdout, but custom integrations can be bound here)
      // e.g., datadogApi.submitLog(log);
    } catch (err) {
      // Fail-silent to prevent logging failures from interrupting requests
      console.warn("[LoggerService] Failed pushing to external collectors:", err);
    }
  }

  // ─── Console Pretty Formatters ──────────────────────────────────────────────

  private static prettyPrint(level: LogLevel, log: any) {
    const time = new Date(log.timestamp).toLocaleTimeString();
    
    const colors = {
      INFO: "\x1b[32m",        // Green
      WARN: "\x1b[33m",        // Yellow
      ERROR: "\x1b[31m",       // Red
      SECURITY: "\x1b[35m",    // Magenta
      AUDIT: "\x1b[36m",       // Cyan
      PERFORMANCE: "\x1b[34m", // Blue
      reset: "\x1b[0m"
    };

    const color = colors[level] || colors.reset;
    const prefix = `${color}[${level}]${colors.reset} [${time}]`;

    console.log(`${prefix} ${log.message}`);
    
    if (Object.keys(log.context).length > 0) {
      console.log(`  Context:`, log.context);
    }
    if (Object.keys(log.meta).length > 0) {
      console.log(`  Meta:   `, log.meta);
    }
    if (log.error) {
      console.log(`  Error:   ${log.error.message}`);
      if (log.error.stack) {
        console.log(`  Stack:   ${log.error.stack.split("\n")[1] || ""}`);
      }
    }
  }

  // ─── API Logging Handlers ──────────────────────────────────────────────────

  static info(message: string, payload?: Omit<LogPayload, "message">) {
    Logger.log("INFO", { message, ...payload });
  }

  static warn(message: string, payload?: Omit<LogPayload, "message">) {
    Logger.log("WARN", { message, ...payload });
  }

  static error(message: string, error?: Error | any, payload?: Omit<LogPayload, "message" | "error">) {
    Logger.log("ERROR", { message, error, ...payload });
  }

  static security(message: string, payload?: Omit<LogPayload, "message">) {
    Logger.log("SECURITY", { message, ...payload });
  }

  static audit(message: string, payload?: Omit<LogPayload, "message">) {
    Logger.log("AUDIT", { message, ...payload });
  }

  static performance(message: string, durationMs: number, payload?: Omit<LogPayload, "message">) {
    Logger.log("PERFORMANCE", { 
      message, 
      ...payload,
      meta: {
        ...(payload?.meta || {}),
        duration_ms: durationMs
      }
    });
  }
}
