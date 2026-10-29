// Hand-drawn math pictures for pastel cards. Always dark ink: pastels look the same in both themes.
type DoodleProps = { className?: string }

const ink = { fill: "none", stroke: "#0B0A0F", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const

// A line through two points with the rise/run drawn in
export function LineDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 170 160" className={className} aria-hidden {...ink}>
      <path d="M30 140V20M20 120h140M30 20l-5 8M30 20l5 8M160 120l-8-5M160 120l-8 5" />
      <path d="M36 132 150 36" strokeWidth={4} />
      <circle cx="72" cy="102" r="7" fill="#fff" />
      <circle cx="118" cy="63" r="7" fill="#0B0A0F" />
      <path d="M72 102h46v-39" strokeDasharray="4 6" />
      <g transform="translate(118 2)">
        <rect width="48" height="24" rx="12" fill="#0B0A0F" stroke="none" />
        <text x="24" y="16.5" textAnchor="middle" fontFamily="var(--font-outfit)" fontSize="12" fontWeight="700" fill="#FEE7A6" stroke="none">
          y=mx
        </text>
      </g>
    </svg>
  )
}

// A parabola with its vertex marked
export function ParabolaDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 220 170" className={className} aria-hidden {...ink}>
      <path d="M30 150V20M14 130h196" />
      <path d="M48 26c26 150 106 150 132 0" strokeWidth={4} />
      <circle cx="114" cy="138" r="8" fill="#FEE7A6" />
      <text x="56" y="62" fontFamily="var(--font-outfit)" fontSize="22" fontWeight="700" fill="#0B0A0F" stroke="none">
        x²
      </text>
    </svg>
  )
}

// Two lines crossing: a system of equations and its solution
export function SystemDoodle({ className, label = "(3, 2)" }: DoodleProps & { label?: string }) {
  return (
    <svg viewBox="0 0 300 200" className={className} aria-hidden {...ink} strokeWidth={2.6}>
      <path d="M40 180V20M20 160h260" />
      <path d="M50 40 260 170" strokeWidth={4} />
      <path d="M50 170 260 60" strokeWidth={4} />
      <circle cx="160" cy="111" r="11" fill="#FEE7A6" />
      <circle cx="160" cy="111" r="3" fill="#0B0A0F" />
      <g transform="translate(176 62)">
        <rect width="92" height="30" rx="15" fill="#0B0A0F" stroke="none" />
        <text x="46" y="20" textAnchor="middle" fontFamily="var(--font-outfit)" fontSize="13" fontWeight="700" fill="#fff" stroke="none">
          {label}
        </text>
      </g>
    </svg>
  )
}
