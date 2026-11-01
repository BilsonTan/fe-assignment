import { z } from 'zod'
import { formatMoney } from '../lib/format'

export const newRecipientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must be 50 characters or less.'),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'Enter a valid 8-digit account number.'),
  bank: z.string().trim().min(1, 'Please select or enter a bank.'),
})

export const recipientStepSchema = z
  .object({
    isNewRecipient: z.boolean(),
    payeeId: z.string().optional(),
    recipient: newRecipientSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isNewRecipient) {
      if (!data.payeeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['payeeId'],
          message: 'Please choose a recipient.',
        })
      }
    } else {
      if (!data.recipient?.name || data.recipient.name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recipient', 'name'],
          message: 'Name must be at least 2 characters.',
        })
      } else if (data.recipient.name.trim().length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recipient', 'name'],
          message: 'Name must be 50 characters or less.',
        })
      }

      if (
        !data.recipient?.accountNumber ||
        !/^\d{8}$/.test(data.recipient.accountNumber.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recipient', 'accountNumber'],
          message: 'Enter a valid 8-digit account number.',
        })
      }

      if (!data.recipient?.bank || data.recipient.bank.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recipient', 'bank'],
          message: 'Please select or enter a bank.',
        })
      }
    }
  })

export interface AmountValidationLimits {
  availableBalance: number
  remainingDailyLimit: number
}

export function createAmountStepSchema(limits: AmountValidationLimits) {
  return z
    .object({
      fromAccountId: z.string().min(1, 'Please select an account.'),
      amount: z
        .string()
        .trim()
        .min(1, 'Please enter an amount.')
        .refine(
          (val) => {
            const num = parseFloat(val)
            return !isNaN(num) && num >= 1.0
          },
          { message: 'Amount must be at least SGD 1.00.' },
        )
        .refine(
          (val) => /^\d+(\.\d{1,2})?$/.test(val),
          { message: 'Amount can have at most 2 decimal places.' },
        ),
      note: z
        .string()
        .max(50, 'Note cannot exceed 50 characters.')
        .optional()
        .default(''),
    })
    .superRefine((data, ctx) => {
      const num = parseFloat(data.amount)
      if (isNaN(num)) return

      if (num > limits.availableBalance) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amount'],
          message: `Amount can't be more than your available balance (${formatMoney(limits.availableBalance)}).`,
        })
      } else if (num > limits.remainingDailyLimit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amount'],
          message: `This transfer exceeds your remaining daily limit (${formatMoney(limits.remainingDailyLimit)}).`,
        })
      }
    })
}

export type RecipientStepFormData = z.infer<typeof recipientStepSchema>
export type AmountStepFormData = {
  fromAccountId: string
  amount: string
  note?: string
}
