import React from 'react'

// 4 concentric activity rings: Move, Fuel, Build, Read.
// Each ring takes a `progress` value 0..1.

const RING_CONFIG = [
  { id: 'move',  r: 55, color: '#D85A30', track: '#FCEBEB' },
  { id: 'fuel',  r: 44, color: '#1D9E75', track: '#EAF3DE' },
  { id: 'build', r: 33, color: '#185FA5', track: '#E6F1FB' },
  { id: 'read',  r: 22, color: '#BA7517', track: '#FAEEDA' },
]

export default function FourRings({ values = {}, size = 130, strokeWidth = 7 }) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="flex-shrink-0">
      {/* Background tracks */}
      {RING_CONFIG.map(ring => (
        <circle
          key={`track-${ring.id}`}
          cx={size / 2}
          cy={size / 2}
          r={ring.r}
          fill="none"
          stroke={ring.track}
          strokeWidth={strokeWidth}
        />
      ))}
      {/* Animated rings */}
      {RING_CONFIG.map(ring => {
        const circumference = 2 * Math.PI * ring.r
        const progress = clamp(values[ring.id] ?? 0, 0, 1)
        const offset = circumference * (1 - progress)
        return (
          <circle
            key={`ring-${ring.id}`}
            cx={size / 2}
            cy={size / 2}
            r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
          />
        )
      })}
    </svg>
  )
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export const RING_COLORS = {
  move:  '#D85A30',
  fuel:  '#1D9E75',
  build: '#185FA5',
  read:  '#BA7517',
}

export const RING_LABELS = {
  move:  'Move',
  fuel:  'Fuel',
  build: 'Build',
  read:  'Read',
}
