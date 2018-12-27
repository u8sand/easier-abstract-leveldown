import { EasierAbstractLevelDOWN } from "./level-down";
import { EasierLevelDOWN, MaybeLocation } from './abstract'

export * from './abstract'

export function exposeLevelDOWN<
  K, V, O extends MaybeLocation = any
  >(DB: { new(): EasierLevelDOWN<K, V, O> }) {
  return (location?: string) => new EasierAbstractLevelDOWN<K, V, O>(
    new DB(),
    location
  )
}
export default exposeLevelDOWN

export function exposeLevelUp<
  K, V, O extends MaybeLocation = any
>(DB: { new(): EasierLevelDOWN<K, V, O> }) {
  const EasierLevelUp = require('level-up').EasierLevelUp
  return (location?: string) => new EasierLevelUp(exposeLevelDOWN(DB)(location))
}
