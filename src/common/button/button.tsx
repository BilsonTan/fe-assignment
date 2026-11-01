import React from 'react'
import './button.css'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      fullWidth = false,
      className = '',
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const classNames = [
      'btn',
      `btn-${variant}`,
      size === 'sm' ? 'btn-sm' : '',
      fullWidth ? 'btn-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} type={type} className={classNames} {...rest}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

