import { z } from 'zod'
import { formatMoney } from '../lib/format'

/**
 * The ONE definition of the "new recipient" rules (brief §3.3).
 * Every place that validates a new recipient — the recipient step form and
 * any future reuse — runs these exact rules and messages. They are never
 * re-implemented by hand elsewhere.
 */
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

export type NewRecipient = z.infer<typeof newRecipientSchema>

/**
 * Recipient step: either a saved payee is chosen, or the "someone new" fields
 * are filled. We keep a flat object (rather than a discriminated union) because
 * it plays far more nicely with React Hook Form's `FieldErrors` typing, but we
 * do NOT duplicate the recipient rules — we delegate to `newRecipientSchema`
 * via `.safeParse` and forward its issues, so the rules stay single-sourced.
 */
export const recipientStepSchema = z
  .object({
    isNewRecipient: z.boolean(),
    payeeId: z.string().optional(),
    recipient: newRecipientSchema.partial().optional(),
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
      return
    }

    // Run the single source of truth and re-map any issue onto the
    // `recipient.<field>` path so RHF can show it inline.
    const result = newRecipientSchema.safeParse(data.recipient ?? {})
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recipient', ...issue.path],
          message: issue.message,
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
        .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
          message: 'Amount can have at most 2 decimal places.',
        }),
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
