import React from 'react'
import type { Transaction } from '../../api'
import { Button, EmptyState } from '../../common'
import { formatMoney, formatShortDate } from '../../lib/format'
import { useTransactionSearch } from '../../hooks'
import { SearchInput } from './search-input'
import './transaction-list.css'

interface TransactionListProps {
  transactions: Transaction[]
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  const {
    query,
    setQuery,
    handleClear,
    filteredTransactions,
    hasMatches,
    isSearching,
    matchCount,
    totalCount,
  } = useTransactionSearch(transactions)

  return (
    <section
      className="transactions-section"
      aria-labelledby="recent-transactions-heading"
    >
      <div className="transactions-header-row">
        <div className="transactions-title-group">
          <h2 id="recent-transactions-heading" className="transactions-title">
            Recent transactions
          </h2>
          {isSearching && (
            <span className="transactions-count">
              ({matchCount} of {totalCount} matching)
            </span>
          )}
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={handleClear}
          placeholder="Search transactions"
        />
      </div>

      {!hasMatches && isSearching ? (
        <EmptyState
          message="No transactions match your search."
          action={
            <Button variant="secondary" size="sm" onClick={handleClear}>
              Clear search
            </Button>
          }
        />
      ) : (
        <ul className="transactions-list" aria-label="Recent transaction list">
          {filteredTransactions.map((txn) => {
            const isIn = txn.direction === 'in'
            const formattedAmount = isIn
              ? `+${formatMoney(txn.amount)}`
              : `-${formatMoney(txn.amount)}`

            return (
              <li key={txn.id} className="transaction-row">
                <div className="txn-left">
                  <span className="txn-description">{txn.description}</span>
                  <div className="txn-meta">
                    <span>{txn.category}</span>
                    <span>·</span>
                    <time dateTime={txn.date}>{formatShortDate(txn.date)}</time>
                  </div>
                </div>

                <div className="txn-right">
                  <span
                    className={`txn-amount amount ${isIn ? 'txn-in' : 'txn-out'}`}
                  >
                    {formattedAmount}
                  </span>
                  {txn.status === 'pending' && (
                    <span className="pending-chip">Pending</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

