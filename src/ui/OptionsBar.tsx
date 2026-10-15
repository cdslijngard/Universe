import { useNav } from '../state/navigation'

/** View options that change what the scene is claiming, not just how it looks. */
export function OptionsBar() {
  const current = useNav((s) => s.current)
  const trueScale = useNav((s) => s.trueScale)
  const setTrueScale = useNav((s) => s.setTrueScale)
  const showLabels = useNav((s) => s.showLabels)
  const setShowLabels = useNav((s) => s.setShowLabels)

  const scaleApplies = current === 'system' || current === 'solar'

  return (
    <div className="pointer-events-auto absolute left-3 top-14 z-40 flex items-center gap-1 md:top-4">
      {scaleApplies && (
        <Toggle
          on={trueScale}
          onClick={() => setTrueScale(!trueScale)}
          title={
            trueScale
              ? 'Showing real distances — most of the frame is empty, which is the point'
              : 'Distances are compressed so everything fits on screen'
          }
        >
          {trueScale ? 'True scale' : 'Compressed'}
        </Toggle>
      )}
      <Toggle on={showLabels} onClick={() => setShowLabels(!showLabels)} title="Show or hide labels">
        Labels
      </Toggle>
    </div>
  )
}

function Toggle({
  on,
  onClick,
  title,
  children,
}: {
  on: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={on}
      className={[
        'rounded-lg border px-2.5 py-1.5 text-[11px] backdrop-blur-md transition-colors',
        on
          ? 'border-sky-400/30 bg-sky-400/12 text-sky-100'
          : 'border-white/10 bg-black/45 text-white/50 hover:text-white/80',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
