import { EasierLevelDOWN, MaybeLocation } from './abstract'
import { EasierAbstractLevelDOWN } from './leveldown'

export * from './abstract'
export * from './leveldown'
export * from './passthrough'
export * from './leveldown-easier'

export function exposeLevelDOWN<
  K, V, O extends MaybeLocation = any
  >(DB: () => EasierLevelDOWN<K, V, O>) {
  return (location?: string) => new EasierAbstractLevelDOWN<K, V, O>(
    DB(),
    location
  )
}

export default exposeLevelDOWN
