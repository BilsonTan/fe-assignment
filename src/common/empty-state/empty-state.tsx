import React from 'react'
import './empty-state.css'

interface EmptyStateProps {
  message: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, action }) => {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
