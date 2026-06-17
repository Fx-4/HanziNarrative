import { Component, ErrorInfo, ReactNode } from 'react'
import { createLogger } from '@/utils/debugLogger'

const errorBoundaryLogger = createLogger('ErrorBoundary')

interface Props {
  children: ReactNode
  /** Page or component name shown in the error UI — helps identify which page crashed */
  name?: string
  /** Optional fallback UI instead of default error card */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary — Catches render-time JS errors in its children.
 * Shows a styled error card with the component name, error message, and stack trace.
 * In development, the full stack is visible. In production only the message is shown.
 *
 * Usage:
 *   <ErrorBoundary name="VocabularyPage">
 *     <VocabularyPage />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const name = this.props.name ?? 'Unknown'

    // Stale chunk after a new deployment — auto-reload once.
    // vite:preloadError in main.tsx handles this first, but this is the safety net.
    const isChunkError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Importing a module script failed')
    if (isChunkError) {
      const RELOAD_KEY = 'vite_chunk_reload'
      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY)
      if (!alreadyReloaded) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
        return
      }
      // Second crash on same session → clear flag and show error UI normally
      sessionStorage.removeItem(RELOAD_KEY)
    }

    // Always log to console — visible in browser DevTools
    console.group(`%c[ErrorBoundary] Crash in: ${name}`, 'color: #ef4444; font-weight: bold; font-size: 14px;')
    errorBoundaryLogger.error('Error:', error.message)
    errorBoundaryLogger.error('Stack:', error.stack)
    errorBoundaryLogger.error('Component stack:', errorInfo.componentStack)
    console.groupEnd()

    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, name = 'Component', fallback } = this.props

    if (!hasError) return children

    if (fallback) return fallback

    const isDev = import.meta.env.DEV

    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white dark:bg-surface-card border-2 border-error-300 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-error-50 dark:bg-error-900/20 border-b border-error-200 dark:border-error-800/40 px-6 py-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💥</span>
              <div>
                <h2 className="text-lg font-bold text-error-700 dark:text-error-300">
                  Something crashed in: <span className="font-mono">{name}</span>
                </h2>
                <p className="text-sm text-error-600 dark:text-error-400 mt-0.5">
                  A render error was caught. Check the browser console for full details.
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          <div className="px-6 py-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Error message:</p>
            <code className="block bg-error-50 dark:bg-error-900/20 text-error-800 dark:text-error-200 text-sm p-3 rounded-lg font-mono whitespace-pre-wrap break-words">
              {error?.message ?? 'Unknown error'}
            </code>

            {/* Stack trace — dev only */}
            {isDev && errorInfo?.componentStack && (
              <details className="mt-4">
                <summary className="text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900">
                  Component stack trace (dev only)
                </summary>
                <pre className="mt-2 bg-gray-50 text-gray-700 text-xs p-3 rounded-lg overflow-auto max-h-48 font-mono">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}

            {isDev && error?.stack && (
              <details className="mt-2">
                <summary className="text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900">
                  JS stack trace (dev only)
                </summary>
                <pre className="mt-2 bg-gray-50 text-gray-700 text-xs p-3 rounded-lg overflow-auto max-h-48 font-mono">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-xl transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }
}
