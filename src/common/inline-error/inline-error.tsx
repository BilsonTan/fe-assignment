import React from 'react'
import './inline-error.css'

interface InlineErrorProps {
  id?: string
  message?: string
}

/**
 * Field-level error. It is linked to its input via `aria-describedby`, so
 * screen readers announce it when the field is focused — we deliberately do
 * NOT put `role="alert"` here. A live region on every field would fire a flood
 * of simultaneous announcements on submit. `role="alert"` is reserved for the
 * single submit/error banners (transfer failure, dashboard error).
 */
export const InlineError: React.FC<InlineErrorProps> = ({ id, message }) => {
  if (!message) return null

  return (
    <span id={id} className="inline-error">
      {message}
    </span>
  )
}
