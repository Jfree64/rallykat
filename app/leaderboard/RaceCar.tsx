interface RaceCarProps {
  color: string
  emoji: string
}

export function RaceCar({ color, emoji }: RaceCarProps) {
  const bodyColor = color || '#F4900C'
  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      <g transform="translate(36 0) scale(-1 1)">
        <path fill="#414042" d="M30 23h3l2-6h-3z" />
        <path
          fill={bodyColor}
          d="M29 19s-3-4-4-4h-9l-6 5-6.081 1.77c-.62.217-1.45.636-1.56 1.23L0 33c-.125.646.448 1 1 1h34c.553 0 1-.447 1-1V21c0-2-7-2-7-2z"
        />
        <path fill="#B0B7BD" d="M16.094 20L11 34h12l5-14z" />
        <circle fill="#292F33" cx="8" cy="31" r="4" />
        <circle fill="#58595B" cx="8" cy="31" r="2" />
        <circle fill="#292F33" cx="29" cy="31" r="4" />
        <circle fill="#58595B" cx="29" cy="31" r="2" />
        <path fill={bodyColor} d="M30 18l1-1 5-1v2z" />
        <path fill="#1F2024" d="M17 16h8v4H12z" />
        <path fill="#FFCC4D" d="M6 24c0 .553-.448 1-1 1H3c-.552 0-1-.447-1-1 0-.553.448-1 1-1h2c.552 0 1 .447 1 1z" />
        <path fill="#DD2E44" d="M36 22h-1c-.553 0-1 .447-1 1v1c0 .553.447 1 1 1h1v-3z" />
      </g>
      <text
        x="16.5"
        y="26.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontFamily="'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"
      >
        {emoji}
      </text>
    </svg>
  )
}
