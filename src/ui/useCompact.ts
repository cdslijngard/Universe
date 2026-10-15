import { useEffect, useState } from 'react'

/**
 * True on phone-width viewports, where the side panel has to become a
 * bottom sheet and the level rail has to lie down. This is a structural
 * change, not just a restyle, so it is a hook rather than CSS alone.
 */
export function useCompact(): boolean {
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setCompact(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return compact
}
