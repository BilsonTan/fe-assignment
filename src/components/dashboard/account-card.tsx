import React from 'react'
import type { Account } from '../../api'
import { formatMoney } from '../../lib/format'
import './account-card.css'

interface AccountCardProps {
  account: Account
  isBalanceHidden?: boolean
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isBalanceHidden = false,
}) => {
  const isCredit = account.type === 'credit'

  return (
    <article
      className="account-card"
      aria-label={`${account.name} account details`}
    >
      <div className="card-top">
        <div>
          <div className="card-name">{account.name}</div>
          <div className="card-masked">{account.maskedNumber}</div>
        </div>
      </div>

      <div className="card-bottom">
        <div className="card-balance amount">
          {isBalanceHidden ? 'SGD ****' : formatMoney(account.balance)}
        </div>
        {isCredit && (
          <span className="amount-due-badge">Amount due</span>
        )}
      </div>
    </article>
  )
}

interface AccountsListProps {
  accounts: Account[]
  isBalanceHidden?: boolean
}

export const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  isBalanceHidden = false,
}) => {
  return (
    <section className="accounts-section" aria-label="Accounts">
      <div className="accounts-header">Accounts</div>
      <div className="accounts-grid">
        {accounts.map((acc) => (
          <AccountCard
            key={acc.id}
            account={acc}
            isBalanceHidden={isBalanceHidden}
          />
        ))}
      </div>
    </section>
  )
}

