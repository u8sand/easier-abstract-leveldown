import { EasierAbstractLevelDOWN } from "./level-down";
import { EasierLevelDOWN, MaybeLocation } from './abstract'

export * from './abstract'
export default function expose<
  K, V, O extends MaybeLocation = any
>(DB: { new(): EasierLevelDOWN<K, V, O> }) {
  return (location?: string) => new EasierAbstractLevelDOWN<K, V, O>(
    new DB(),
    location
  )
}
