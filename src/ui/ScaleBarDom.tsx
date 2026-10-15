import { metresPerUnitFor } from '../data/scales'
import { getBody } from '../data/bodies'
import { formatDistanceTerse } from '../lib/format'
import { useNav } from '../state/navigation'

/** The on-screen scale bar. Fed by ScaleProbe, which lives in the Canvas. */
export function ScaleBar({ span }: { span: number | null }) {
  const current = useNav((s) => s.current)
  const focusBody = useNav((s) => s.focusBody)
  if (span === null) return null

  // The bar is a fixed fraction of the viewport; the label does the work.
  const barFraction = 0.22
  const barMetres = span * barFraction

  return (
    <div className="pointer-events-none absolute left-4 z-30 hidden select-none md:bottom-5 md:block">
      <div className="flex flex-col gap-1">
        <div
          className="relative h-[7px] border-x border-b border-white/35"
          style={{ width: `${barFraction * 100}vw`, maxWidth: '15rem' }}
        >
          <span className="absolute inset-x-0 top-0 h-px bg-white/12" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11.5px] text-white/80">
            {formatDistanceTerse(barMetres)}
          </span>
          <span className="text-[10.5px] text-white/30">
            · 1 unit = {formatDistanceTerse(metresPerUnitFor(current, getBody(focusBody)?.radius))}
          </span>
        </div>
      </div>
    </div>
  )
}
