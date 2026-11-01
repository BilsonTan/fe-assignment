import React from 'react'
import type { TransferResponse } from '../../api'
import { Button } from '../../common'
import { formatMoney } from '../../lib/format'
import './transfer-dialog.css'

interface SuccessPanelProps {
  transferResponse: TransferResponse
  onClose: () => void
}

export const SuccessPanel: React.FC<SuccessPanelProps> = ({
  transferResponse,
  onClose,
}) => {
  const { transfer } = transferResponse
  const formattedAmount = formatMoney(transfer.amount)

  return (
    <div
      className="success-panel"
      role="region"
      aria-live="polite"
      aria-label="Transfer Confirmation"
    >
      <div className="success-icon-badge" aria-hidden="true">
        ✓
      </div>

      <h2 className="success-title">Transfer sent</h2>

      <div className="success-amount amount">{formattedAmount}</div>

      <div className="success-recipient">
        to {transfer.recipient.name} · {transfer.recipient.bank} ·{' '}
        {transfer.recipient.accountNumberMasked}
      </div>

      <div className="success-reference-card">
        <span className="reference-label">Reference</span>
        <span className="reference-code">{transfer.reference}</span>
      </div>

      <p className="success-caption">The money should arrive within minutes.</p>

      <div className="success-action-area">
        <Button variant="primary" fullWidth onClick={onClose}>
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}
