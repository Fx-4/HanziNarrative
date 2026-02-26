import { Component, ErrorInfo, ReactNode } from 'react'

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
    // Always log to console — visible in browser DevTools
    console.group(`%c[ErrorBoundary] Crash in: ${name}`, 'color: #ef4444; font-weight: bold; font-size: 14px;')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)
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
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 px-6 py-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💥</span>
              <div>
                <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
                  Something crashed in: <span className="font-mono">{name}</span>
                </h2>
                <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                  A render error was caught. Check the browser console for full details.
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          <div className="px-6 py-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Error message:</p>
            <code className="block bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 text-sm p-3 rounded-lg font-mono whitespace-pre-wrap break-words">
              {error?.message ?? 'Unknown error'}
            </code>

            {/* Stack trace — dev only */}
            {isDev && errorInfo?.componentStack && (
              <details className="mt-4">
                <summary className="text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                  Component stack trace (dev only)
                </summary>
                <pre className="mt-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs p-3 rounded-lg overflow-auto max-h-48 font-mono">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}

            {isDev && error?.stack && (
              <details className="mt-2">
                <summary className="text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                  JS stack trace (dev only)
                </summary>
                <pre className="mt-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs p-3 rounded-lg overflow-auto max-h-48 font-mono">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }
}
