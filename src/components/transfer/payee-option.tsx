import React from 'react'
import type { Payee } from '../../api'
import './transfer-dialog.css'

interface PayeeOptionProps {
  payee: Payee
  isSelected: boolean
  onSelect: () => void
}

export const PayeeOption: React.FC<PayeeOptionProps> = ({
  payee,
  isSelected,
  onSelect,
}) => {
  return (
    <label
      className={`payee-card ${isSelected ? 'selected' : ''}`}
      htmlFor={`payee-${payee.id}`}
    >
      <input
        type="radio"
        id={`payee-${payee.id}`}
        name="payeeSelection"
        value={payee.id}
        checked={isSelected}
        onChange={onSelect}
        className="payee-radio"
      />
      <div className="payee-avatar" aria-hidden="true">
        {payee.initials}
      </div>
      <div className="payee-details">
        <div className="payee-name">{payee.name}</div>
        <div className="payee-meta">
          <span>{payee.bank}</span>
          <span>·</span>
          <span className="payee-account-mask">{payee.accountNumberMasked}</span>
        </div>
      </div>
    </label>
  )
}
