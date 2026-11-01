import React, { useState } from 'react'
import { useAccounts, useCustomer, useTransactions } from '../../api'
import { Button } from '../../common'
import { SegmentSwitch } from '../header'
import { BalanceHero } from './balance-hero'
import { AccountsList } from './account-card'
import { TransactionList } from './transaction-list'
import { DailyLimit } from './daily-limit'
import { DashboardSkeleton } from './dashboard-skeleton'
import { DashboardError } from './dashboard-error'
import './dashboard.css'

interface DashboardProps {
  onOpenTransfer: () => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenTransfer }) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)
  const customerQuery = useCustomer()
  const accountsQuery = useAccounts()
  const transactionsQuery = useTransactions(8)

  const isLoading =
    customerQuery.isPending ||
    accountsQuery.isPending ||
    transactionsQuery.isPending

  const isError =
    customerQuery.isError ||
    accountsQuery.isError ||
    transactionsQuery.isError

  const handleRetry = () => {
    void customerQuery.refetch()
    void accountsQuery.refetch()
    void transactionsQuery.refetch()
  }

  if (isError) {
    return (
      <div className="dashboard-container">
        <DashboardError onRetry={handleRetry} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <DashboardSkeleton />
      </div>
    )
  }

  const customer = customerQuery.data!.customer
  const accounts = accountsQuery.data!.accounts
  const transactions = transactionsQuery.data!.transactions

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <main className="dashboard-main">
          <div className="dashboard-greeting-section">
            <div>
              <h1 className="dashboard-greeting">Good evening, Ava</h1>
              <div className="dashboard-date">Tuesday, 20 October</div>
            </div>
            <div className="mobile-segment-switch">
              <SegmentSwitch />
            </div>
          </div>

          <BalanceHero
            accounts={accounts}
            onOpenTransfer={onOpenTransfer}
            isBalanceHidden={isBalanceHidden}
            onToggleBalance={() => setIsBalanceHidden((prev) => !prev)}
          />

          <AccountsList
            accounts={accounts}
            isBalanceHidden={isBalanceHidden}
          />

          <TransactionList transactions={transactions} />
        </main>

        <div className="dashboard-rail">
          <DailyLimit customer={customer} />
        </div>
      </div>

      {/* Fixed bottom CTA for mobile */}
      <div className="mobile-transfer-bar">
        <Button
          variant="primary"
          fullWidth
          onClick={onOpenTransfer}
          aria-label="New transfer"
        >
          + New transfer
        </Button>
      </div>
    </div>
  )
}

