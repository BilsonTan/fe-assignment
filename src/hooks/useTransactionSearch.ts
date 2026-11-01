import { useMemo, useState } from 'react'
import type { Transaction } from '../api'

export function useTransactionSearch(transactions: Transaction[] = []) {
  const [query, setQuery] = useState('')

  const filteredTransactions = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return transactions

    return transactions.filter(
      (txn) =>
        txn.description.toLowerCase().includes(trimmed) ||
        txn.category.toLowerCase().includes(trimmed),
    )
  }, [transactions, query])

  const handleClear = () => setQuery('')

  return {
    query,
    setQuery,
    handleClear,
    filteredTransactions,
    hasMatches: filteredTransactions.length > 0,
    totalCount: transactions.length,
    matchCount: filteredTransactions.length,
    isSearching: query.trim().length > 0,
  }
}

