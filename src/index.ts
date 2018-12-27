import { EasierLevelDOWN, MaybeLocation } from './abstract'
import { EasierAbstractLevelDOWN } from "./leveldown"

export * from './abstract';

export function exposeLevelDOWN<
  K, V, O extends MaybeLocation = any
  >(DB: { new(): EasierLevelDOWN<K, V, O> }) {
  return (location?: string) => new EasierAbstractLevelDOWN<K, V, O>(
    new DB(),
    location
  )
}
export default exposeLevelDOWN
