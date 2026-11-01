import React from 'react'
import { Skeleton } from '../../common'
import './dashboard.css'

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="dashboard-content" aria-busy="true" aria-label="Loading dashboard">
      <div className="dashboard-main">
        {/* Greeting Skeleton */}
        <div className="dashboard-greeting-section">
          <Skeleton width={200} height={32} />
          <Skeleton width={140} height={18} style={{ marginTop: 8 }} />
        </div>

        {/* Hero Skeleton */}
        <div className="balance-hero-skeleton">
          <Skeleton width={120} height={16} />
          <Skeleton width={260} height={48} style={{ margin: '16px 0 8px' }} />
          <Skeleton width={180} height={16} />
        </div>

        {/* Accounts Skeleton */}
        <div className="accounts-section">
          <Skeleton width={80} height={16} />
          <div className="accounts-grid">
            <div className="account-card-skeleton">
              <Skeleton width={130} height={20} />
              <Skeleton width={80} height={14} style={{ marginTop: 6 }} />
              <Skeleton width={100} height={28} style={{ marginTop: 24 }} />
            </div>
            <div className="account-card-skeleton">
              <Skeleton width={130} height={20} />
              <Skeleton width={80} height={14} style={{ marginTop: 6 }} />
              <Skeleton width={100} height={28} style={{ marginTop: 24 }} />
            </div>
            <div className="account-card-skeleton">
              <Skeleton width={130} height={20} />
              <Skeleton width={80} height={14} style={{ marginTop: 6 }} />
              <Skeleton width={100} height={28} style={{ marginTop: 24 }} />
            </div>
          </div>
        </div>

        {/* Transactions Skeleton */}
        <div className="transactions-section">
          <div className="transactions-header-row">
            <Skeleton width={180} height={24} />
            <Skeleton width={200} height={38} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width={160} height={18} />
                  <Skeleton width={100} height={14} />
                </div>
                <Skeleton width={80} height={20} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-rail">
        <div className="daily-limit-skeleton">
          <Skeleton width={100} height={16} />
          <Skeleton width={150} height={32} style={{ margin: '12px 0' }} />
          <Skeleton width="100%" height={8} borderRadius={999} />
          <Skeleton width={180} height={14} style={{ marginTop: 12 }} />
        </div>
      </div>
    </div>
  )
}

