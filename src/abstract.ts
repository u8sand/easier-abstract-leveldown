import { KeyVal, StringOrBuffer } from './types'

export type MaybeLocation = { location?: string }

export type EasierLevelDOWNBatchOpts<K, V> = ReadonlyArray<{
  type: 'put', key: K, value: V
} | {
  type: 'del', key: K
}>
export type EasierLevelDOWNIteratorOpts<K, V> = {
  gt?: K
  gte?: K
  lt?: K
  lte?: K
  reverse?: boolean
  limit?: number
}

export interface EasierLevelDOWNEventEmitter<K, V> {
  onPut(cb: (key: K, value: V) => void): this
  onDel(cb: (key: K) => void): this
  onBatch(cb: (array: EasierLevelDOWNBatchOpts<K, V>) => void): this
}

export interface EasierLevelDOWN<K, V = any, O extends MaybeLocation = any> {
  // Optional open handling
  open?(opts: O): Promise<void>
  // Optional close handling
  close?(): Promise<void>

  // Get the value of a document given its key
  get(k: K): Promise<V>
  // Assign a given value to a document of a given key
  put(k: K, v: V): Promise<void>
  // Delete a given document by key
  del(k: K): Promise<void>

  // Watch remote changes if applicable (only works with exposeLevelUP)
  changes?(): EasierLevelDOWNEventEmitter<K, V>

  // Iteration via generator
  iterator(opts: EasierLevelDOWNIteratorOpts<K, V>): AsyncIterableIterator<KeyVal<K, V>>

  // Optional batch processing
  batch?(opts: EasierLevelDOWNBatchOpts<K, V>): Promise<void>

  // Encode internal representations if not string or buffer
  encodeKey?(key: K): StringOrBuffer
  encodeValue?(value: V): StringOrBuffer

  // Decode internal representations if not string or buffer
  decodeKey?(key: StringOrBuffer): K
  decodeValue?(value: StringOrBuffer): V
}
