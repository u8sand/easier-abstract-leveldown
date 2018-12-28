import { KeyVal, StringOrBuffer } from './types'
import { EventEmitter } from 'events';

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

export class EasierLevelDOWNEmitter<K, V> extends EventEmitter {
  constructor() {
    super()

    this.emitPut = this.emitPut.bind(this)
    this.emitDel = this.emitDel.bind(this)
    this.emitBatch = this.emitBatch.bind(this)
    this.onPut = this.onPut.bind(this)
    this.onDel = this.onDel.bind(this)
    this.onBatch = this.onBatch.bind(this)
  }

  emitPut(key: K, value: V) {
    return this.emit('put', key, value)
  }
  emitDel(key: K) {
    return this.emit('del', key)
  }
  emitBatch(array: EasierLevelDOWNBatchOpts<K, V>) {
    return this.emit('batch', array)
  }

  onPut(cb: (key: K, value: V) => void) {
    return this.on('put', cb)
  }
  onDel(cb: (key: K) => void) {
    return this.on('del', cb)
  }
  onBatch(cb: (array: EasierLevelDOWNBatchOpts<K, V>) => void) {
    return this.on('batch', cb)
  }
}

export interface EasierLevelDOWN<K, V = any, O extends MaybeLocation = any> {
  // Public members (exposed by levelup and leveldown)

  // Get the value of a document given its key
  get(k: K): Promise<V>
  // Assign a given value to a document of a given key
  put(k: K, v: V): Promise<void>
  // Delete a given document by key
  del(k: K): Promise<void>


  // Protected members (exposed by leveldown but not directly by levelup)

  // Optional open handling
  open?(opts: O): Promise<void>
  // Optional close handling
  close?(): Promise<void>

  // Iteration via generator
  iterator(opts: EasierLevelDOWNIteratorOpts<K, V>): AsyncIterableIterator<KeyVal<K, V>>
  // Optional batch processing
  batch?(opts: EasierLevelDOWNBatchOpts<K, V>): Promise<void>


  // Private members (not exposed via either levelup or leveldown)

  // Encode internal representations if not string or buffer
  encodeKey?(key: K): StringOrBuffer
  encodeValue?(value: V): StringOrBuffer

  // Decode internal representations if not string or buffer
  decodeKey?(key: StringOrBuffer): K
  decodeValue?(value: StringOrBuffer): V


  // Extended features (not exposed through native levelup)

  // Create a given document and let the underlying store generate the key
  post?(v: V): Promise<K>

  // Watch remote changes if applicable supports EasierAbstractLevelDOWNs
  changes?(): EasierLevelDOWNEmitter<K, V>
}
