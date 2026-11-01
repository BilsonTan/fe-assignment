import { describe, expect, it } from 'vitest'
import { createAmountStepSchema } from './transfer-schema'
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

