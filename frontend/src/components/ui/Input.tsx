import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  animated?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, animated = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const inputClass = cn(
      "w-full px-3 py-2 border rounded-lg transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
      error
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300",
      className
    )

    const inputElement = (
      <input
        type={type}
        className={inputClass}
        ref={ref}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    )

    const content = (
      <div className="w-full">
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              isFocused ? "text-primary-600" : "text-gray-700"
            )}
            animate={animated ? { x: isFocused ? 2 : 0 } : {}}
          >
            {label}
          </motion.label>
        )}
        {inputElement}
        {error && (
          <motion.p
            className="mt-1 text-sm text-red-600"
            initial={animated ? { opacity: 0, y: -10 } : {}}
            animate={animated ? { opacity: 1, y: 0 } : {}}
          >
            {error}
          </motion.p>
        )}
      </div>
    )

    return content
  }
)

Input.displayName = "Input"

export { Input }
