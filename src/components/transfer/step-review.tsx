import React from 'react'
import { useAccounts, usePayees } from '../../api'
import { Button } from '../../common'
import { formatMoney } from '../../lib/format'
import type { TransferFormData } from '../../types'
import './transfer-dialog.css'

interface StepReviewProps {
  formData: TransferFormData
  isSubmitting: boolean
  submitError: string | null
  onBack: () => void
  onConfirm: () => void
}

export const StepReview: React.FC<StepReviewProps> = ({
  formData,
  isSubmitting,
  submitError,
  onBack,
  onConfirm,
}) => {
  const { data: accountsData } = useAccounts()
  const { data: payeesData } = usePayees()

  const fromAccount = accountsData?.accounts.find(
    (acc) => acc.id === formData.fromAccountId,
  )

  let recipientDisplay = ''
  if (formData.recipient) {
    recipientDisplay = `${formData.recipient.name} · ${formData.recipient.bank} · •••• ${formData.recipient.accountNumber.slice(-4)}`
  } else if (formData.payeeId) {
    const payee = payeesData?.payees.find((p) => p.id === formData.payeeId)
    if (payee) {
      recipientDisplay = `${payee.name} · ${payee.bank} · ${payee.accountNumberMasked}`
    }
  }

  const numericAmount = parseFloat(formData.amount) || 0
  const formattedAmount = formatMoney(numericAmount)

  return (
    <div className="dialog-step-form">
      <div className="step-content">
        <h2 className="step-title">Check the details</h2>

        {submitError && (
          <div className="review-error-banner" role="alert">
            <span className="error-badge" aria-hidden="true">
              !
            </span>
            <span>{submitError}</span>
          </div>
        )}

        <div className="review-summary-card">
          <div className="review-row">
            <span className="review-label">From</span>
            <span className="review-value">
              {fromAccount
                ? `${fromAccount.name} · ${fromAccount.maskedNumber}`
                : formData.fromAccountId}
            </span>
          </div>

          <div className="review-row">
            <span className="review-label">To</span>
            <span className="review-value">{recipientDisplay}</span>
          </div>

          <div className="review-row">
            <span className="review-label">Amount</span>
            <span className="review-value amount font-semibold">
              {formattedAmount}
            </span>
          </div>

          <div className="review-row">
            <span className="review-label">Fee</span>
            <span className="review-value amount">SGD 0.00</span>
          </div>

          {formData.note && (
            <div className="review-row">
              <span className="review-label">Note</span>
              <span className="review-value">{formData.note}</span>
            </div>
          )}

          <div className="review-divider" />

          <div className="review-row review-total-row">
            <span className="review-label">Total</span>
            <span className="review-value amount font-bold">
              {formattedAmount}
            </span>
          </div>
        </div>

        <div className="review-info-notice">
          <span className="notice-icon" aria-hidden="true">
            ⓘ
          </span>
          <span>Usually arrives in minutes.</span>
        </div>
      </div>

      <div className="dialog-footer">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          ← Back
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending…' : 'Confirm transfer'}
        </Button>
      </div>
    </div>
  )
}
