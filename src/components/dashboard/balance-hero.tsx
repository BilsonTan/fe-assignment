import React from 'react'
import type { Account } from '../../api'
import { Button } from '../../common'
import { formatMoney } from '../../lib/format'
import './balance-hero.css'

interface BalanceHeroProps {
  accounts: Account[]
  onOpenTransfer: () => void
}

export const BalanceHero: React.FC<BalanceHeroProps> = ({
  accounts,
  onOpenTransfer,
}) => {
  const depositAccounts = accounts.filter((acc) => acc.type !== 'credit')
  const totalAvailable = depositAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  const depositCount = depositAccounts.length

  return (
    <section className="balance-hero" aria-labelledby="total-available-label">
      <div className="hero-top">
        <div>
          <div id="total-available-label" className="hero-label">
            Total available
          </div>
          <div className="hero-balance amount">
            {formatMoney(totalAvailable)}
          </div>
          <div className="hero-caption">
            Across {depositCount} deposit accounts
          </div>
        </div>

        <div className="hero-action-desktop">
          <Button
            variant="secondary"
            className="hero-transfer-btn"
            onClick={onOpenTransfer}
          >
            + New transfer
          </Button>
        </div>
      </div>
    </section>
  )
}

