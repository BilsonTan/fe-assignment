import { describe, expect, it } from 'vitest'
import { createAmountStepSchema, recipientStepSchema } from './transfer-schema'
import { formatMoney } from '../lib/format'

describe('createAmountStepSchema', () => {
  it('validates amount exceeds available balance', () => {
    const limits = { availableBalance: 4280.55, remainingDailyLimit: 5000 }
    const schema = createAmountStepSchema(limits)
    const result = schema.safeParse({
      fromAccountId: 'acc_checking',
      amount: '4500.00',
      note: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues[0]
      expect(issue.path).toEqual(['amount'])
      expect(issue.message).toBe(
        `Amount can't be more than your available balance (${formatMoney(4280.55)}).`,
      )
    }
  })
})

describe('recipientStepSchema', () => {
  it('requires a payee when not sending to someone new', () => {
    const result = recipientStepSchema.safeParse({ isNewRecipient: false })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['payeeId'])
    }
  })

  it('reuses newRecipientSchema rules for a new recipient (8-digit account)', () => {
    const result = recipientStepSchema.safeParse({
      isNewRecipient: true,
      recipient: { name: 'Alex Lim', accountNumber: '123', bank: 'OCBC' },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const accountIssue = result.error.issues.find(
        (i) => i.path.join('.') === 'recipient.accountNumber',
      )
      expect(accountIssue?.message).toBe('Enter a valid 8-digit account number.')
    }
  })

  it('accepts a complete new recipient', () => {
    const result = recipientStepSchema.safeParse({
      isNewRecipient: true,
      recipient: { name: 'Alex Lim', accountNumber: '12345678', bank: 'OCBC' },
    })
    expect(result.success).toBe(true)
  })
})

