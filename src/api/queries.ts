import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type {
  AccountsResponse,
  CustomerResponse,
  PayeesResponse,
  TransactionsResponse,
} from './types'

export const queryKeys = {
  customer: ['customer'] as const,
  accounts: ['accounts'] as const,
  transactions: (limit?: number, q?: string) =>
    ['transactions', { limit, q }] as const,
  payees: ['payees'] as const,
}

export function useCustomer() {
  return useQuery({
    queryKey: queryKeys.customer,
    queryFn: () => apiFetch<CustomerResponse>('/api/customer'),
  })
}

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => apiFetch<AccountsResponse>('/api/accounts'),
  })
}

export function useTransactions(limit = 8, q?: string) {
  const params = new URLSearchParams()
  if (limit) params.set('limit', String(limit))
  if (q) params.set('q', q)

  const queryString = params.toString()
  const path = `/api/transactions${queryString ? `?${queryString}` : ''}`

  return useQuery({
    queryKey: queryKeys.transactions(limit, q),
    queryFn: () => apiFetch<TransactionsResponse>(path),
  })
}

export function usePayees() {
  return useQuery({
    queryKey: queryKeys.payees,
    queryFn: () => apiFetch<PayeesResponse>('/api/payees'),
  })
}

