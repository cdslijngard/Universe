import { LEVELS } from '../data/scales'
import { formatDistanceTerse } from '../lib/format'
import { useNav } from '../state/navigation'
import { useCompact } from './useCompact'

/**
 * The eight abstraction levels as a single column. This is the spine of the
 * app: any level is one click away regardless of where you are, so the user
 * picks their own altitude rather than being walked up and down a ladder.
 */
export function LevelRail() {
  const current = useNav((s) => s.current)
  const goTo = useNav((s) => s.goTo)
  const route = useNav((s) => s.route)
  const compact = useCompact()

  if (compact) {
    return (
      <nav
        aria-label="Abstraction level"
        className="scroll-slim pointer-events-auto absolute inset-x-0 top-0 z-30 overflow-x-auto px-2 pb-1 pt-2"
      >
        <ol className="flex w-max gap-1">
          {LEVELS.map((l) => {
            const active = current === l.id
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => goTo(l.id)}
                  aria-current={active ? 'true' : undefined}
                  className={[
                    'whitespace-nowrap rounded-full border px-3 py-1.5 text-[11.5px] transition-colors',
                    active
                      ? 'border-sky-400/40 bg-sky-400/15 text-sky-100'
                      : 'border-white/10 bg-black/50 text-white/55',
                  ].join(' ')}
                >
                  {l.title}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }

  return (
    <nav
      aria-label="Abstraction level"
      className="pointer-events-auto absolute left-0 top-1/2 z-30 -translate-y-1/2 pl-3"
    >
      <ol className="flex flex-col gap-px">
        {LEVELS.map((l) => {
          const active = current === l.id
          const visited = route.includes(l.id)
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => goTo(l.id)}
                aria-current={active ? 'true' : undefined}
                className={[
                  'group flex w-full items-center gap-2.5 rounded-md py-1.5 pl-2 pr-3 text-left',
                  'transition-colors duration-200',
                  active ? 'bg-white/10' : 'hover:bg-white/5',
                ].join(' ')}
              >
                <span
                  aria-hidden
                  className={[
                    'h-7 w-[3px] shrink-0 rounded-full transition-colors duration-200',
                    active
                      ? 'bg-sky-300'
                      : visited
                        ? 'bg-white/35 group-hover:bg-white/55'
                        : 'bg-white/12 group-hover:bg-white/30',
                  ].join(' ')}
                />
                <span className="min-w-0">
                  <span
                    className={[
                      'block truncate text-[12.5px] font-medium leading-tight transition-colors',
                      active ? 'text-white' : 'text-white/55 group-hover:text-white/90',
                    ].join(' ')}
                  >
                    {l.title}
                  </span>
                  <span
                    className={[
                      'block font-mono text-[10px] leading-tight transition-colors',
                      active ? 'text-sky-200/80' : 'text-white/25 group-hover:text-white/45',
                    ].join(' ')}
                  >
                    {formatDistanceTerse(l.spanMetres)} across
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
