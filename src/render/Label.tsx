import { Html } from '@react-three/drei'
import type { ReactNode } from 'react'

interface Props {
  position: [number, number, number]
  children: ReactNode
  /** Visually de-emphasise non-notable objects. */
  dim?: boolean
  selected?: boolean
  onClick?: () => void
  offset?: [number, number]
}

/** A DOM label pinned to a point in the scene. */
export function Label({ position, children, dim, selected, onClick, offset }: Props) {
  return (
    <Html
      position={position}
      center={false}
      zIndexRange={[20, 0]}
      style={{
        pointerEvents: onClick ? 'auto' : 'none',
        transform: `translate(${offset?.[0] ?? 10}px, ${offset?.[1] ?? -8}px)`,
      }}
    >
      <button
        type="button"
        onClick={onClick}
        tabIndex={-1}
        className={[
          'whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] leading-none tracking-wide',
          'font-medium transition-colors duration-150 backdrop-blur-[2px]',
          selected
            ? 'bg-sky-400/20 text-sky-100 ring-1 ring-sky-300/50'
            : dim
              ? 'text-white/40 hover:text-white/80'
              : 'text-white/75 hover:text-white',
          onClick ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        {children}
      </button>
    </Html>
  )
}
