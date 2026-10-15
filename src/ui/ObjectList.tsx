import { useMemo, useState } from 'react'
import { DWARFS, moonsOf, PLANETS, SUN } from '../data/bodies'
import { WEB_NODES } from '../data/cosmicWeb'
import { LANDMARKS } from '../data/galaxy'
import { LOCAL_GROUP } from '../data/localGroup'
import { BELTS, OUTER_MARKERS, PROBES, SHELLS } from '../data/outerSystem'
import type { LevelId } from '../data/scales'
import { STARS } from '../data/stars'
import { useNav, type Selection } from '../state/navigation'

interface Entry {
  id: string
  name: string
  kind: Selection['kind']
  note?: string
}

/**
 * Every selectable object on the current level, as an ordinary list. The 3D
 * scene is the nice way to pick things; this is the way that works with a
 * keyboard, a screen reader, or a crowded view where the labels overlap.
 */
function entriesFor(levelId: LevelId, focusSystem: string): Entry[] {
  switch (levelId) {
    case 'body':
    case 'system':
      return moonsOf(focusSystem).map((m) => ({
        id: m.id,
        name: m.name,
        kind: 'body' as const,
        note: m.orbit ? `${((m.orbit.a * 1.495978707e8) / 1000).toFixed(0)} thousand km` : undefined,
      }))
    case 'solar':
      return [
        { id: SUN.id, name: SUN.name, kind: 'body' as const },
        ...PLANETS.map((p) => ({
          id: p.id, name: p.name, kind: 'body' as const, note: `${p.orbit!.a.toFixed(2)} AU`,
        })),
        ...DWARFS.filter((d) => d.orbit!.a < 20).map((d) => ({
          id: d.id, name: d.name, kind: 'body' as const, note: `${d.orbit!.a.toFixed(2)} AU`,
        })),
        ...BELTS.filter((b) => b.id === 'asteroid-belt').map((b) => ({
          id: b.id, name: b.name, kind: 'belt' as const, note: `${b.inner}–${b.outer} AU`,
        })),
      ]
    case 'kuiper':
      return [
        ...BELTS.filter((b) => b.id !== 'asteroid-belt').map((b) => ({
          id: b.id, name: b.name, kind: 'belt' as const, note: `${b.inner}–${b.outer} AU`,
        })),
        ...SHELLS.map((s) => ({
          id: s.id, name: s.name, kind: 'shell' as const, note: `${s.radius.toLocaleString('en-US')} AU`,
        })),
        ...DWARFS.filter((d) => d.orbit!.a >= 20).map((d) => ({
          id: d.id, name: d.name, kind: 'body' as const, note: `${d.orbit!.a.toFixed(0)} AU`,
        })),
        ...PROBES.map((p) => ({ id: p.id, name: p.name, kind: 'probe' as const })),
        ...OUTER_MARKERS.map((m) => ({
          id: m.id, name: m.name, kind: 'body' as const, note: `${m.distAU} AU`,
        })),
      ]
    case 'stars':
      return STARS.map((s) => ({
        id: s.id, name: s.name, kind: 'star' as const,
        note: s.dist > 0 ? `${s.dist.toFixed(2)} ly` : 'here',
      }))
    case 'galaxy':
      return [
        { id: 'sol', name: 'The Sun', kind: 'star' as const, note: '26,000 ly from the centre' },
        ...LANDMARKS.map((l) => ({
          id: l.id, name: l.name, kind: 'landmark' as const,
          note: l.distFromSun > 0 ? `${l.distFromSun.toLocaleString('en-US')} ly` : undefined,
        })),
      ]
    case 'localgroup':
      return LOCAL_GROUP.map((g) => ({
        id: g.id, name: g.name, kind: 'member' as const,
        note: g.dist > 0 ? `${g.dist.toFixed(2)} Mly` : 'here',
      }))
    case 'cosmic':
      return [
        ...WEB_NODES.map((n) => ({
          id: n.id, name: n.name, kind: 'web' as const,
          note: n.dist > 0 ? `${n.dist.toLocaleString('en-US')} Mly` : 'here',
        })),
        { id: 'cmb', name: 'Cosmic microwave background', kind: 'structure' as const, note: '46.5 Gly' },
      ]
  }
}

export function ObjectList() {
  const [open, setOpen] = useState(false)
  const current = useNav((s) => s.current)
  const focusSystem = useNav((s) => s.focusSystem)
  const selection = useNav((s) => s.selectionByLevel[s.current])
  const select = useNav((s) => s.select)
  const enter = useNav((s) => s.enter)

  const entries = useMemo(() => entriesFor(current, focusSystem), [current, focusSystem])
  if (entries.length === 0) return null

  return (
    <div className="pointer-events-auto absolute right-3 top-14 z-40 flex flex-col items-end md:bottom-5 md:right-4 md:top-auto">
      {open && (
        <div className="scroll-slim order-2 mt-2 max-h-[46vh] w-60 overflow-y-auto rounded-xl border border-white/10 bg-black/80 py-1 backdrop-blur-md md:order-none md:mb-2 md:mt-0 md:max-h-[55vh] md:w-64">
          <ul>
            {entries.map((e) => {
              const active = selection?.id === e.id
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => select({ id: e.id, kind: e.kind })}
                    onDoubleClick={() => enter({ id: e.id, kind: e.kind })}
                    aria-current={active ? 'true' : undefined}
                    className={[
                      'flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left transition-colors',
                      active ? 'bg-sky-400/15 text-white' : 'text-white/65 hover:bg-white/6 hover:text-white',
                    ].join(' ')}
                  >
                    <span className="truncate text-[12px]">{e.name}</span>
                    {e.note && (
                      <span className="shrink-0 font-mono text-[10px] text-white/30">{e.note}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="ml-auto flex items-center gap-2 rounded-lg border border-white/10 bg-black/55 px-3 py-1.5 text-[11.5px] text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
      >
        {open ? 'Hide' : 'Browse'} {entries.length} objects
      </button>
    </div>
  )
}
