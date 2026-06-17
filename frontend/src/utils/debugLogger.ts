/**
 * Debug Logger Utility
 * Provides consistent, component-aware debug logging.
 * In production builds, all debug/info logs are suppressed automatically.
 */

const isDev = import.meta.env.DEV

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const COLORS: Record<LogLevel, string> = {
  debug: '#6366f1',   // indigo
  info:  '#10b981',   // emerald
  warn:  '#f59e0b',   // amber
  error: '#ef4444',   // red
}

function formatMessage(component: string, message: string, level: LogLevel): string {
  const timestamp = new Date().toISOString().slice(11, 23) // HH:MM:SS.ms
  return `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`
}

// Anything printable by console — most call sites pass a caught `unknown` error,
// a context object, or nothing at all.
type LogData = unknown

function log(level: LogLevel, component: string, message: string, data?: LogData): void {
  if (!isDev && (level === 'debug' || level === 'info')) return

  const formatted = formatMessage(component, message, level)
  const color = COLORS[level]
  const style = `color: ${color}; font-weight: bold;`

  if (data !== undefined) {
    if (level === 'error') {
      console.error(`%c${formatted}`, style, data)
    } else if (level === 'warn') {
      console.warn(`%c${formatted}`, style, data)
    } else {
      console.info(`%c${formatted}`, style, data)
    }
  } else {
    if (level === 'error') {
      console.error(`%c${formatted}`, style)
    } else if (level === 'warn') {
      console.warn(`%c${formatted}`, style)
    } else {
      console.info(`%c${formatted}`, style)
    }
  }
}

/**
 * Creates a namespaced logger for a specific component or module.
 *
 * Usage:
 *   const logger = createLogger('VocabularyPage')
 *   logger.debug('Loading words', { hskLevel: 3 })
 *   logger.error('API failed', error)
 */
export function createLogger(component: string) {
  return {
    debug: (msg: string, data?: LogData) => log('debug', component, msg, data),
    info:  (msg: string, data?: LogData) => log('info',  component, msg, data),
    warn:  (msg: string, data?: LogData) => log('warn',  component, msg, data),
    error: (msg: string, data?: LogData) => log('error', component, msg, data),
  }
}

/** Global app-level logger */
export const appLogger = createLogger('App')

/** API service logger */
export const apiLogger = createLogger('API')
