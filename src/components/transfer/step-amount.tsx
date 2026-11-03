import React, { useMemo } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAccounts, useCustomer } from '../../api'
import { Button, InlineError } from '../../common'
import { formatMoney } from '../../lib/format'
import {
  createAmountStepSchema,
  type AmountStepFormData,
} from '../../schemas/transfer-schema'
import type { TransferFormData } from '../../types'
import './transfer-dialog.css'

interface StepAmountProps {
  formData: TransferFormData
  onNext: (data: Partial<TransferFormData>) => void
  onBack: () => void
}

const PRESET_AMOUNTS = [50, 100, 250, 500]

export const StepAmount: React.FC<StepAmountProps> = ({
  formData,
  onNext,
  onBack,
}) => {
  const { data: accountsData } = useAccounts()
  const { data: customerData } = useCustomer()

  // Only deposit accounts (checking & savings), exclude credit cards per T3
  const depositAccounts = useMemo(() => {
    return (accountsData?.accounts ?? []).filter((acc) => acc.type !== 'credit')
  }, [accountsData])

  const defaultAccountId =
    formData.fromAccountId || depositAccounts[0]?.id || 'acc_checking'

  const selectedAccount = useMemo(() => {
    return (
      depositAccounts.find((acc) => acc.id === (formData.fromAccountId || defaultAccountId)) ??
      depositAccounts[0]
    )
  }, [depositAccounts, formData.fromAccountId, defaultAccountId])

  const availableBalance = selectedAccount?.balance ?? 0
  // Derive the remaining limit from the customer data — never a hardcoded
  // figure. Until the customer loads, use Infinity (no artificial cap) so
  // validation doesn't block against a fabricated limit; the balance check
  // still applies, and the real limit takes over as soon as it arrives.
  const remainingDailyLimit = customerData?.customer
    ? Math.max(
        0,
        customerData.customer.dailyTransferLimit -
          customerData.customer.transferredToday,
      )
    : Infinity

  // Dynamic resolver: always validates against the selected account's balance
  const resolver = useMemo<Resolver<AmountStepFormData>>(() => {
    return (values, context, options) => {
      const currentAcc =
        depositAccounts.find((a) => a.id === values.fromAccountId) ?? selectedAccount
      const balance = currentAcc?.balance ?? availableBalance
      const dynamicSchema = createAmountStepSchema({
        availableBalance: balance,
        remainingDailyLimit,
      })
      return zodResolver(dynamicSchema)(values, context, options)
    }
  }, [depositAccounts, selectedAccount, availableBalance, remainingDailyLimit])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setFocus,
    formState: { errors },
  } = useForm<AmountStepFormData>({
    resolver,
    mode: 'onTouched',
    defaultValues: {
      fromAccountId: defaultAccountId,
      amount: formData.amount || '',
      note: formData.note || '',
    },
  })

  const currentNote = useWatch({ control, name: 'note' }) || ''
  const currentFromAccountId = useWatch({ control, name: 'fromAccountId' })

  // Re-sync selected account if user changes from-account select
  const currentAccount = useMemo(() => {
    return depositAccounts.find((acc) => acc.id === currentFromAccountId) ?? selectedAccount
  }, [depositAccounts, currentFromAccountId, selectedAccount])

  const onSubmit = (validData: AmountStepFormData) => {
    onNext({
      fromAccountId: validData.fromAccountId,
      amount: validData.amount,
      note: validData.note?.trim() || '',
    })
  }

  const onError = () => {
    // Focus first invalid field per requirements
    if (errors.fromAccountId) {
      setFocus('fromAccountId')
    } else if (errors.amount) {
      setFocus('amount')
    } else if (errors.note) {
      setFocus('note')
    }
  }

  const handlePresetClick = (val: number) => {
    setValue('amount', String(val), { shouldValidate: true })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="dialog-step-form"
      noValidate
    >
      <div className="step-content">
        <h2 className="step-title">How much?</h2>

        {/* From Account */}
        <div className="field-group">
          <label htmlFor="from-account-select" className="field-label">
            From account
          </label>
          <select
            id="from-account-select"
            className="input-select"
            {...register('fromAccountId')}
          >
            {depositAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} · {acc.maskedNumber} ({formatMoney(acc.balance)})
              </option>
            ))}
          </select>
          <span className="field-help-text">Deposit accounts only</span>
          {errors.fromAccountId && (
            <InlineError
              id="from-account-error"
              message={errors.fromAccountId.message}
            />
          )}
        </div>

        {/* Amount */}
        <div className="field-group">
          <label htmlFor="transfer-amount" className="field-label">
            Amount
          </label>
          <div className="amount-input-wrapper">
            <span className="amount-currency-prefix" aria-hidden="true">
              SGD
            </span>
            <input
              id="transfer-amount"
              type="text"
              inputMode="decimal"
              className={`input-text amount-input ${errors.amount ? 'input-invalid' : ''}`}
              placeholder="0.00"
              {...register('amount')}
              aria-describedby={
                errors.amount
                  ? 'amount-limits-info amount-error'
                  : 'amount-limits-info'
              }
            />
          </div>

          {/* Quick preset amount chips */}
          <div className="preset-amounts-row" role="group" aria-label="Preset amounts">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                className="preset-chip"
                onClick={() => handlePresetClick(val)}
              >
                {val}
              </button>
            ))}
          </div>

          {/* Balance and limit info */}
          <div id="amount-limits-info" className="amount-limits-info">
            <div>
              Available{' '}
              <span className="amount font-semibold">
                {formatMoney(currentAccount?.balance ?? availableBalance)}
              </span>
            </div>
            <div>
              Remaining daily limit{' '}
              <span className="amount font-semibold">
                {formatMoney(remainingDailyLimit)}
              </span>
            </div>
          </div>

          <InlineError id="amount-error" message={errors.amount?.message} />
        </div>

        {/* Optional Note */}
        <div className="field-group">
          <div className="field-label-row">
            <label htmlFor="transfer-note" className="field-label">
              Note (optional)
            </label>
            <span className="char-counter" aria-live="polite">
              {currentNote.length}/50
            </span>
          </div>
          <input
            id="transfer-note"
            type="text"
            maxLength={50}
            className={`input-text ${errors.note ? 'input-invalid' : ''}`}
            placeholder="e.g. Dinner"
            {...register('note')}
            aria-describedby={errors.note ? 'note-error' : undefined}
          />
          <InlineError id="note-error" message={errors.note?.message} />
        </div>
      </div>

      <div className="dialog-footer">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" type="submit">
          Continue
        </Button>
      </div>
    </form>
  )
}
