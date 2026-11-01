import React from 'react'
import './inline-error.css'

interface InlineErrorProps {
  id?: string
  message?: string
}

export const InlineError: React.FC<InlineErrorProps> = ({ id, message }) => {
  if (!message) return null

  return (
    <span id={id} className="inline-error" role="alert">
      {message}
    </span>
  )
}
