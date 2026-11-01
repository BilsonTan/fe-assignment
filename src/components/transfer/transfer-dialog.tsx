import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCreateTransfer, type TransferResponse } from '../../api'
import type { TransferFormData, TransferStep } from '../../types'
import { Stepper } from './stepper'
import { StepRecipient } from './step-recipient'
import { StepAmount } from './step-amount'
import { StepReview } from './step-review'
import { SuccessPanel } from './success-panel'
import './transfer-dialog.css'

interface TransferDialogProps {
  isOpen: boolean
  onClose: () => void
}

const INITIAL_FORM_DATA: TransferFormData = {
  fromAccountId: 'acc_checking',
  amount: '',
  note: '',
}

export const TransferDialog: React.FC<TransferDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<TransferStep>('recipient')
  const [formData, setFormData] = useState<TransferFormData>(INITIAL_FORM_DATA)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [transferResponse, setTransferResponse] =
    useState<TransferResponse | null>(null)

  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const createTransferMutation = useCreateTransfer()

  const handleClose = useCallback(() => {
    setStep('recipient')
    setFormData(INITIAL_FORM_DATA)
    setSubmitError(null)
    setTransferResponse(null)
    onClose()
  }, [onClose])

  // Track the element that triggered the dialog so we can return focus on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement
    } else if (triggerRef.current) {
      triggerRef.current.focus()
    }
  }, [isOpen])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const handleNextFromRecipient = (data: Partial<TransferFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep('amount')
  }

  const handleNextFromAmount = (data: Partial<TransferFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep('review')
  }

  const handleBackToRecipient = () => {
    setStep('recipient')
  }

  const handleBackToAmount = () => {
    setSubmitError(null)
    setStep('amount')
  }

  const handleConfirmTransfer = async () => {
    setSubmitError(null)

    const payload = {
      fromAccountId: formData.fromAccountId,
      amount: parseFloat(formData.amount),
      note: formData.note || undefined,
      payeeId: formData.payeeId,
      recipient: formData.recipient,
    }

    try {
      const res = await createTransferMutation.mutateAsync(payload)
      setTransferResponse(res)
      setStep('success')
    } catch {
      // Stay on review step with all data intact per T7
      setSubmitError(
        "Something went wrong. Your money hasn't left your account. Try again.",
      )
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !createTransferMutation.isPending) {
      handleClose()
    }
  }

  return (
    <div
      className="dialog-overlay"
      onClick={handleOverlayClick}
      data-testid="transfer-dialog-overlay"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-dialog-title"
        className="transfer-dialog"
      >
        <div className="dialog-header">
          <h1 id="transfer-dialog-title" className="dialog-title">
            New transfer
          </h1>
          <button
            type="button"
            className="dialog-close-btn"
            onClick={handleClose}
            aria-label="Close transfer dialog"
            title="Close"
            disabled={createTransferMutation.isPending}
          >
            ✕
          </button>
        </div>

        <Stepper currentStep={step} />

        {step === 'recipient' && (
          <StepRecipient
            formData={formData}
            onNext={handleNextFromRecipient}
            onCancel={handleClose}
          />
        )}

        {step === 'amount' && (
          <StepAmount
            formData={formData}
            onNext={handleNextFromAmount}
            onBack={handleBackToRecipient}
          />
        )}

        {step === 'review' && (
          <StepReview
            formData={formData}
            isSubmitting={createTransferMutation.isPending}
            submitError={submitError}
            onBack={handleBackToAmount}
            onConfirm={handleConfirmTransfer}
          />
        )}

        {step === 'success' && transferResponse && (
          <SuccessPanel
            transferResponse={transferResponse}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  )
}
