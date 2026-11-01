import React from 'react'
import type { TransferStep } from '../../types'
import './stepper.css'

interface StepperProps {
  currentStep: TransferStep
}

const STEPS: { key: TransferStep; number: number; label: string }[] = [
  { key: 'recipient', number: 1, label: 'Recipient' },
  { key: 'amount', number: 2, label: 'Amount' },
  { key: 'review', number: 3, label: 'Review' },
]

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  if (currentStep === 'success') return null

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <nav className="stepper-container" aria-label="Transfer steps">
      {STEPS.map((step, idx) => {
        const isActive = step.key === currentStep
        const isCompleted = idx < currentIndex

        return (
          <React.Fragment key={step.key}>
            <div
              className={`step-item ${isActive ? 'active' : ''} ${
                isCompleted ? 'completed' : ''
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="step-number" aria-hidden="true">
                {isCompleted ? '✓' : step.number}
              </span>
              <span>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <span className="stepper-separator" aria-hidden="true">
                ·
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
