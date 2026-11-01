import React from 'react'
import type { Account } from '../../api'
import { Button } from '../../common'
import { formatMoney } from '../../lib/format'
import { Eye, EyeOff } from 'lucide-react'
import './balance-hero.css'

interface BalanceHeroProps {
  accounts: Account[]
  onOpenTransfer: () => void
  isBalanceHidden?: boolean
  onToggleBalance?: () => void
}

export const BalanceHero: React.FC<BalanceHeroProps> = ({
  accounts,
  onOpenTransfer,
  isBalanceHidden = false,
  onToggleBalance,
}) => {
  const depositAccounts = accounts.filter((acc) => acc.type !== 'credit')
  const totalAvailable = depositAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  const depositCount = depositAccounts.length

  return (
    <section className="balance-hero" aria-labelledby="total-available-label">
      <div className="hero-top">
        <div>
          <div className="hero-label-group">
            <div id="total-available-label" className="hero-label">
              Total available
            </div>
            {onToggleBalance && (
              <button
                type="button"
                className="balance-toggle-btn"
                onClick={onToggleBalance}
                aria-label={isBalanceHidden ? 'Show balances' : 'Hide balances'}
                aria-pressed={isBalanceHidden}
                title={isBalanceHidden ? 'Show balances' : 'Hide balances'}
              >
                {isBalanceHidden ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            )}
          </div>
          <div className="hero-balance amount">
            {isBalanceHidden ? 'SGD ****' : formatMoney(totalAvailable)}
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
