import { useEffect } from 'react'
import { LEVELS } from '../data/scales'
import { useNav } from './navigation'

/**
 * Keyboard navigation. The zoom buttons are the stated interaction, so the
 * keys mirror them exactly rather than inventing a second model.
 */
export function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const nav = useNav.getState()

      switch (e.key) {
        case '+':
        case '=':
        case 'ArrowUp':
          e.preventDefault()
          nav.zoomIn()
          break
        case '-':
        case '_':
        case 'ArrowDown':
          e.preventDefault()
          nav.zoomOut()
          break
        case 'l':
        case 'L':
          nav.setShowLabels(!nav.showLabels)
          break
        case 't':
        case 'T':
          nav.setTrueScale(!nav.trueScale)
          break
        case 'Escape':
          nav.select(null)
          break
        default: {
          // 1–8 jump straight to an abstraction level.
          const n = Number(e.key)
          if (Number.isInteger(n) && n >= 1 && n <= LEVELS.length) {
            e.preventDefault()
            nav.goTo(LEVELS[n - 1].id)
          }
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
