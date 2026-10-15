import { level } from '../data/scales'
import { useNav } from '../state/navigation'

/**
 * The route the user actually took, not a fixed hierarchy — so stepping back
 * returns you the way you came rather than down a canonical path.
 */
export function Breadcrumb() {
  const route = useNav((s) => s.route)
  const current = useNav((s) => s.current)
  const goTo = useNav((s) => s.goTo)

  if (route.length < 2) return null

  return (
    <nav
      aria-label="Your route"
      className="pointer-events-auto absolute left-1/2 top-4 z-30 hidden max-w-[min(42rem,70vw)] -translate-x-1/2 md:block"
    >
      <ol className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1">
        {route.map((id, i) => {
          const isLast = i === route.length - 1
          return (
            <li key={`${id}-${i}`} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="px-1 text-[11px] text-white/22">
                  ›
                </span>
              )}
              <button
                type="button"
                onClick={() => goTo(id)}
                aria-current={id === current ? 'true' : undefined}
                className={[
                  'rounded px-1.5 py-0.5 text-[11.5px] transition-colors',
                  isLast
                    ? 'text-white/85'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/75',
                ].join(' ')}
              >
                {level(id).title}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
