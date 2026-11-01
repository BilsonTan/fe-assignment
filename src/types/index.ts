export type Theme = 'light' | 'dark'
export type Segment = 'retail' | 'premium'

export type TransferStep = 'recipient' | 'amount' | 'review' | 'success'

export interface NewRecipientData {
  name: string
  accountNumber: string
  bank: string
}

export interface TransferFormData {
  fromAccountId: string
  amount: string
  note: string
  payeeId?: string
  recipient?: NewRecipientData
}

