import React from 'react'
import type { Customer } from '../../api'
import { formatMoney } from '../../lib/format'
import './daily-limit.css'

interface DailyLimitProps {
  customer: Customer
}

export const DailyLimit: React.FC<DailyLimitProps> = ({ customer }) => {
  const remaining = Math.max(
    0,
    customer.dailyTransferLimit - customer.transferredToday,
  )
  const percentUsed = Math.min(
    100,
    Math.round((customer.transferredToday / customer.dailyTransferLimit) * 100),
  )

  return (
    <aside className="daily-limit-card" aria-labelledby="daily-limit-heading">
      <div id="daily-limit-heading" className="daily-limit-header">
        Daily Limit
      </div>
      <div>
        <div className="daily-limit-amount amount">
          {formatMoney(remaining)}
        </div>
        <div className="daily-limit-subtitle">remaining today</div>
      </div>

      <div
        className="daily-limit-progress-bg"
        role="progressbar"
        aria-valuenow={remaining}
        aria-valuemin={0}
        aria-valuemax={customer.dailyTransferLimit}
        aria-label="Remaining daily transfer limit"
      >
        <div
          className="daily-limit-progress-fill"
          style={{ width: `${100 - percentUsed}%` }}
        />
      </div>

      <div className="daily-limit-footer">
        Resets daily. Applies to all transfers.
      </div>
    </aside>
  )
}

