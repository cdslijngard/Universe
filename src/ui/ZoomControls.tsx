import { innerOf, level, outerOf } from '../data/scales'
import { useNav } from '../state/navigation'

/**
 * The primary navigation: step one abstraction level in or out. Each button
 * names where it is going, so the jump is never a surprise.
 */
export function ZoomControls() {
  const current = useNav((s) => s.current)
  const zoomIn = useNav((s) => s.zoomIn)
  const zoomOut = useNav((s) => s.zoomOut)
  const busy = useNav((s) => s.transition !== null)

  const inner = innerOf(current)
  const outer = outerOf(current)

  return (
    <div className="pointer-events-auto absolute bottom-3 left-1/2 z-40 w-[calc(100%-1rem)] -translate-x-1/2 md:bottom-5 md:w-auto">
      <div className="flex items-stretch gap-1 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur-md md:bg-black/55">
        <ZoomButton
          disabled={!inner}
          busy={busy}
          direction="in"
          label="Zoom in"
          target={inner ? level(inner).title : null}
          onClick={zoomIn}
        />
        <div className="my-1.5 w-px bg-white/10" aria-hidden />
        <ZoomButton
          disabled={!outer}
          busy={busy}
          direction="out"
          label="Zoom out"
          target={outer ? level(outer).title : null}
          onClick={zoomOut}
        />
      </div>
    </div>
  )
}

function ZoomButton({
  disabled,
  busy,
  direction,
  label,
  target,
  onClick,
}: {
  disabled: boolean
  busy: boolean
  direction: 'in' | 'out'
  label: string
  target: string | null
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={target ? `${label} to ${target}` : label}
      className={[
        'flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-left md:min-w-[9.5rem] md:flex-none',
        'transition-colors duration-150',
        disabled
          ? 'cursor-not-allowed opacity-30'
          : busy
            ? 'bg-white/5'
            : 'hover:bg-white/10 active:bg-white/15',
        direction === 'in' ? 'flex-row' : 'flex-row-reverse text-right',
      ].join(' ')}
    >
      <span
        aria-hidden
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/15 bg-white/5 text-[13px] text-white/80"
      >
        {direction === 'in' ? '+' : '−'}
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-medium leading-tight text-white/90">{label}</span>
        <span className="block truncate text-[10.5px] leading-tight text-white/45">
          {target ?? '—'}
        </span>
      </span>
    </button>
  )
}
