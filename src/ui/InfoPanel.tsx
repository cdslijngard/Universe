import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { describe, LEVEL_OVERVIEW } from '../data/describe'
import { innerOf, level } from '../data/scales'
import { useNav } from '../state/navigation'
import { useCompact } from './useCompact'

/**
 * Everything known about whatever is selected — and, when nothing is, about
 * the level itself, so the panel is never empty and the app always has
 * something to tell you.
 */
export function InfoPanel() {
  const current = useNav((s) => s.current)
  const selection = useNav((s) => s.selectionByLevel[s.current])
  const select = useNav((s) => s.select)
  const zoomIn = useNav((s) => s.zoomIn)

  const compact = useCompact()
  const [expanded, setExpanded] = useState(false)

  const described = describe(selection)
  const overview = LEVEL_OVERVIEW[current]

  const title = described?.name ?? overview?.title ?? level(current).title
  const kind = described?.kind ?? 'Overview'
  const blurb = described?.blurb ?? overview?.blurb ?? ''
  const facts = described?.facts ?? overview?.facts ?? []
  const canDescend = innerOf(current) !== null && described !== null

  return (
    <aside
      aria-label="Details"
      className={[
        'pointer-events-none absolute z-30 flex',
        compact
          ? // A sheet docked above the zoom bar, collapsed to its header
            // until opened, so the scene stays visible on a phone.
            'inset-x-0 bottom-[4.25rem] items-end px-2'
          : 'right-0 top-0 h-full w-[min(23rem,88vw)] items-start p-3 sm:p-4',
      ].join(' ')}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${current}:${selection?.id ?? 'overview'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={[
            'scroll-slim pointer-events-auto w-full overflow-y-auto rounded-xl',
            'border border-white/10 bg-black/70 backdrop-blur-md md:bg-black/55',
            compact ? (expanded ? 'max-h-[52vh]' : 'max-h-[5.5rem]') : 'max-h-full',
          ].join(' ')}
        >
          <header
            className="sticky top-0 z-10 border-b border-white/8 bg-black/70 px-4 pb-3 pt-3.5 backdrop-blur-md md:bg-transparent md:backdrop-blur-none"
            onClick={compact ? () => setExpanded((v) => !v) : undefined}
            role={compact ? 'button' : undefined}
            tabIndex={compact ? 0 : undefined}
            aria-expanded={compact ? expanded : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sky-300/70">
                  {kind}
                </p>
                <h2 className="mt-1 truncate text-[17px] font-semibold leading-snug text-white">
                  {title}
                </h2>
              </div>
              {compact && (
                <span aria-hidden className="shrink-0 pt-1 text-[11px] text-white/45">
                  {expanded ? 'Hide ▾' : 'Details ▴'}
                </span>
              )}
            </div>
          </header>

          {blurb && (
            <p className="px-4 pt-3 text-[12.5px] leading-relaxed text-white/65">{blurb}</p>
          )}

          {described?.sizeBar && (
            <div className="px-4 pt-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[10.5px] uppercase tracking-wide text-white/40">
                  {described.sizeBar.label}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400/70 to-sky-200/90"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(described.sizeBar.value * 100, 1.5)}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-1 font-mono text-[10px] text-white/35">
                {described.sizeBar.caption}
              </p>
            </div>
          )}

          {facts.length > 0 && (
            <dl className="mt-3.5 divide-y divide-white/6 border-t border-white/8">
              {facts.map((f, i) => (
                <div key={`${f.label}-${i}`} className="flex gap-3 px-4 py-2">
                  <dt className="w-[42%] shrink-0 text-[11.5px] leading-snug text-white/40">
                    {f.label}
                  </dt>
                  <dd className="min-w-0 flex-1 text-[11.5px] leading-snug text-white/80">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex gap-2 px-4 pb-4 pt-3.5">
            {canDescend && (
              <button
                type="button"
                onClick={zoomIn}
                className="rounded-lg border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-[11.5px] font-medium text-sky-100 transition-colors hover:bg-sky-400/20"
              >
                Zoom in to {title}
              </button>
            )}
            {selection && (
              <button
                type="button"
                onClick={() => select(null)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-[11.5px] text-white/55 transition-colors hover:bg-white/5 hover:text-white/80"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  )
}
