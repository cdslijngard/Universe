import { createContext, useContext } from 'react'
import type { LevelId } from '../data/scales'

/** Which level a subtree belongs to, so it can read its own fade and scale. */
export const LevelContext = createContext<LevelId>('body')
export const useLevelId = (): LevelId => useContext(LevelContext)
