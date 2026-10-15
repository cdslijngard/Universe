import { useMemo } from 'react'
import { LOCAL_GROUP } from '../data/localGroup'
import { raDecToVec3 } from '../lib/astro'
import { GalaxySprite } from '../render/GalaxySprite'
import { Label } from '../render/Label'
import { CircleRing } from '../render/OrbitPath'
import { Starfield } from '../render/Starfield'
import { useNav } from '../state/navigation'

/** One scene unit is 100,000 light years, so 1 Mly is 10 units. */
const MLY = 10

/**
 * The Local Group in real three dimensions. Every member is placed from its
 * catalogued right ascension, declination and distance, so the geometry —
 * Andromeda and Triangulum close together on one side, the Magellanic
 * Clouds hugging us on the other — is the actual arrangement, not a diagram.
 */
export default function LocalGroupLevel() {
  const showLabels = useNav((s) => s.showLabels)
  const select = useNav((s) => s.select)
  const selection = useNav((s) => s.selectionByLevel.localgroup)

  const placed = useMemo(
    () =>
      LOCAL_GROUP.map((g) => ({
        g,
        pos:
          g.dist === 0
            ? ([0, 0, 0] as [number, number, number])
            : (raDecToVec3(g.ra, g.dec, g.dist * MLY).toArray() as [number, number, number]),
        // Diameter is in kly; 1 unit is 100 kly. A floor keeps the smallest
        // dwarfs from vanishing entirely.
        size: Math.max((g.diameter / 100) * 6.5, 1.6),
      })),
    [],
  )

  return (
    <>
      <Starfield count={2_600} radius={1_800} intensity={0.3} />

      {/* Distance shells, in millions of light years. */}
      {[1, 2, 3, 4].map((d) => (
        <CircleRing key={d} radius={d * MLY} colour="#3d5280" opacity={0.22} dashed width={0.8} />
      ))}
      {showLabels &&
        [1, 2, 3, 4].map((d) => (
          <Label key={d} position={[d * MLY * 0.72, 0, d * MLY * 0.72]} dim>
            {d} Mly
          </Label>
        ))}

      {placed.map(({ g, pos, size }) => (
        <group key={g.id}>
          <GalaxySprite
            position={pos}
            size={size}
            colour={g.colour}
            shape={g.shape}
            roll={g.roll}
            incline={g.incline}
            seed={g.id.length * 7.3 + g.diameter}
            selected={selection?.id === g.id}
            onClick={() => select({ id: g.id, kind: 'member' })}
          />
          {showLabels && (g.notable || selection?.id === g.id) && (
            <Label
              position={[pos[0], pos[1] + size * 0.55, pos[2]]}
              selected={selection?.id === g.id}
              onClick={() => select({ id: g.id, kind: 'member' })}
              dim={!g.notable}
            >
              {g.name}
            </Label>
          )}
        </group>
      ))}
    </>
  )
}
