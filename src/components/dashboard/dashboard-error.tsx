import React from 'react'
import { Button } from '../../common'
import './dashboard.css'

interface DashboardErrorProps {
  onRetry: () => void
}

export const DashboardError: React.FC<DashboardErrorProps> = ({ onRetry }) => {
  return (
    <div className="dashboard-error" role="alert">
      <div className="error-icon" aria-hidden="true">
        !
      </div>
      <h2 className="error-title">We couldn't load your dashboard.</h2>
      <p className="error-desc">
        There was an issue retrieving your account details. Please try again.
      </p>
      <Button variant="primary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
