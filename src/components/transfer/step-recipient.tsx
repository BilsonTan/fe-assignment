import React, { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePayees } from '../../api'
import { Button, EmptyState, InlineError, Skeleton } from '../../common'
import {
  recipientStepSchema,
  type RecipientStepFormData,
} from '../../schemas/transfer-schema'
import type { TransferFormData } from '../../types'
import { PayeeOption } from './payee-option'
import './transfer-dialog.css'

interface StepRecipientProps {
  formData: TransferFormData
  onNext: (data: Partial<TransferFormData>) => void
  onCancel: () => void
}

const SG_BANKS = [
  'DBS',
  'OCBC',
  'UOB',
  'Standard Chartered',
  'Citibank',
  'HSBC',
]

export const StepRecipient: React.FC<StepRecipientProps> = ({
  formData,
  onNext,
  onCancel,
}) => {
  const { data, isPending, isError } = usePayees()
  const [payeeFilter, setPayeeFilter] = useState('')

  const isNew = Boolean(formData.recipient)

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    control,
    formState: { errors },
  } = useForm<RecipientStepFormData>({
    resolver: zodResolver(recipientStepSchema),
    mode: 'onTouched',
    defaultValues: isNew
      ? {
          isNewRecipient: true,
          recipient: formData.recipient,
        }
      : {
          isNewRecipient: false,
          payeeId: formData.payeeId ?? '',
        },
  })

  const isNewRecipient = useWatch({ control, name: 'isNewRecipient' })
  const selectedPayeeId = useWatch({ control, name: 'payeeId' })

  const payees = useMemo(() => data?.payees ?? [], [data?.payees])

  const filteredPayees = useMemo(() => {
    const q = payeeFilter.trim().toLowerCase()
    if (!q) return payees
    return payees.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.bank.toLowerCase().includes(q),
    )
  }, [payees, payeeFilter])

  const onSubmit = (validData: RecipientStepFormData) => {
    if (validData.isNewRecipient && validData.recipient) {
      onNext({
        payeeId: undefined,
        recipient: validData.recipient as TransferFormData['recipient'],
      })
    } else {
      onNext({
        payeeId: validData.payeeId,
        recipient: undefined,
      })
    }
  }

  // Move focus to the first invalid field on Continue (brief §3.3).
  const onError = () => {
    if (errors.recipient?.name) {
      setFocus('recipient.name')
    } else if (errors.recipient?.accountNumber) {
      setFocus('recipient.accountNumber')
    } else if (errors.recipient?.bank) {
      setFocus('recipient.bank')
    }
    /**
     * Payee-selection error can't take focus (it's a radiogroup); the inline
     * error is surfaced visually and linked via aria-describedby instead.
     */
  }

  const handleSelectSavedPayee = (id: string) => {
    setValue('isNewRecipient', false, { shouldValidate: true })
    setValue('payeeId', id, { shouldValidate: true })
  }

  const handleToggleNewRecipient = () => {
    const nextIsNew = !isNewRecipient
    setValue('isNewRecipient', nextIsNew, { shouldValidate: true })
    if (nextIsNew) {
      setValue('payeeId', undefined)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="dialog-step-form"
      noValidate
    >
      <div className="step-content">
        <h2 className="step-title">Who are you sending to?</h2>

        {/* Search Payees */}
        <div className="field-group">
          <label htmlFor="payee-search" className="sr-only">
            Search payees
          </label>
          <input
            id="payee-search"
            type="search"
            className="input-text"
            placeholder="Search payees"
            value={payeeFilter}
            onChange={(e) => setPayeeFilter(e.target.value)}
          />
        </div>

        {/* Payee Selection List */}
        <div className="payees-list-section">
          {isPending ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton height={56} borderRadius={8} />
              <Skeleton height={56} borderRadius={8} />
              <Skeleton height={56} borderRadius={8} />
            </div>
          ) : isError ? (
            <p className="step-error-banner" role="alert">
              Failed to load payees.
            </p>
          ) : filteredPayees.length === 0 ? (
            <EmptyState
              message={
                payeeFilter.trim()
                  ? 'No payees match your search.'
                  : 'No saved payees yet.'
              }
              action={
                payeeFilter.trim() ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPayeeFilter('')}
                  >
                    Clear search
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="payees-list" role="radiogroup" aria-label="Saved recipients">
              {filteredPayees.map((payee) => (
                <PayeeOption
                  key={payee.id}
                  payee={payee}
                  isSelected={!isNewRecipient && selectedPayeeId === payee.id}
                  onSelect={() => handleSelectSavedPayee(payee.id)}
                />
              ))}
            </div>
          )}
        </div>

        {!isNewRecipient && errors.payeeId && (
          <InlineError
            id="payee-selection-error"
            message={errors.payeeId.message}
          />
        )}

        {/* Send to someone new disclosure */}
        <div className="new-recipient-disclosure">
          <button
            type="button"
            className={`disclosure-toggle-btn ${isNewRecipient ? 'expanded' : ''}`}
            onClick={handleToggleNewRecipient}
            aria-expanded={isNewRecipient}
            aria-controls="new-recipient-fields"
          >
            <span>+ Send to someone new</span>
            <span className="disclosure-chevron" aria-hidden="true">
              {isNewRecipient ? '▲' : '▼'}
            </span>
          </button>

          {isNewRecipient && (
            <div
              id="new-recipient-fields"
              className="new-recipient-fields-container"
            >
              {/* Recipient name */}
              <div className="field-group">
                <label htmlFor="recipient-name" className="field-label">
                  Recipient name
                </label>
                <input
                  id="recipient-name"
                  type="text"
                  className={`input-text ${errors.recipient?.name ? 'input-invalid' : ''}`}
                  placeholder="e.g. Alex Lim"
                  {...register('recipient.name')}
                  aria-describedby={
                    errors.recipient?.name ? 'recipient-name-error' : undefined
                  }
                />
                <InlineError
                  id="recipient-name-error"
                  message={errors.recipient?.name?.message}
                />
              </div>

              {/* Account number (8 digits) */}
              <div className="field-group">
                <label htmlFor="recipient-account" className="field-label">
                  Account number (8 digits)
                </label>
                <input
                  id="recipient-account"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  className={`input-text ${errors.recipient?.accountNumber ? 'input-invalid' : ''}`}
                  placeholder="12345678"
                  {...register('recipient.accountNumber')}
                  aria-describedby={
                    errors.recipient?.accountNumber
                      ? 'recipient-account-error'
                      : undefined
                  }
                />
                <InlineError
                  id="recipient-account-error"
                  message={errors.recipient?.accountNumber?.message}
                />
              </div>

              {/* Bank selector */}
              <div className="field-group">
                <label htmlFor="recipient-bank" className="field-label">
                  Bank
                </label>
                <select
                  id="recipient-bank"
                  className={`input-select ${errors.recipient?.bank ? 'input-invalid' : ''}`}
                  {...register('recipient.bank')}
                  aria-describedby={
                    errors.recipient?.bank ? 'recipient-bank-error' : undefined
                  }
                >
                  <option value="">Select a bank</option>
                  {SG_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <InlineError
                  id="recipient-bank-error"
                  message={errors.recipient?.bank?.message}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dialog-footer">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Continue
        </Button>
      </div>
    </form>
  )
}
