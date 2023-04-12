import styles from './index.module.css'

export interface SpinnerProps {
  fgColor?: string
  bgColor?: string
  size?: number
  thickness?: number
}

export function Spinner({
  fgColor = '#808080',
  bgColor = '#80808080',
  size = 48,
  thickness: strokeWidth = 5,
}: SpinnerProps): JSX.Element {

  const radius = size / 2
  const visualRadius = radius - strokeWidth
  const circumference = radius * 2 * Math.PI
  const progress = 0.1

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      height={size}
      width={size}
    >
      <circle
        strokeWidth={strokeWidth}
        stroke={bgColor}
        fill='transparent'
        r={visualRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className={styles.circle}
        strokeWidth={strokeWidth}
        stroke={fgColor}
        style={{
          strokeLinecap: 'round',
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset: circumference - (progress * circumference),
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
        fill='transparent'
        r={visualRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  )
}
