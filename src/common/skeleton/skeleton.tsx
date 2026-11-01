import React from 'react'
import './skeleton.css'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  style,
  className = '',
  ...rest
}) => {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      aria-hidden="true"
      data-testid="skeleton"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        ...style,
      }}
      {...rest}
    />
  )
}
