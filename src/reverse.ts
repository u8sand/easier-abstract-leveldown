import { AbstractLevelDOWN } from "abstract-leveldown"
import { EasierLevelDOWN, EasierLevelDOWNBatchOpts, EasierLevelDOWNEmitter, EasierLevelDOWNIteratorOpts, MaybeLocation } from "./abstract"
import { ErrorCallbackToPromise, ErrorCallbackToPromiseA1, ErrorCallbackToPromiseA2, ErrorKeyValueCallbackToPromise, ErrorValueCallbackToPromiseA1 } from "./callback-promise"
import { KeyVal, StringOrBuffer } from "./types"
import uuidv4 from 'uuid/v4'

/**
 * LevelDOWNEasier helps us treat an existing AbstractLevelDOWN compliant store as an EasierLevelDOWN one!
 *  It plays smart if the store was in-fact actually originally derived from an EasierLevelDOWN store.
 */
export class LevelDOWNEasier<K extends StringOrBuffer, V = any, O extends MaybeLocation = any> implements EasierLevelDOWN<K, V, O> {
  _leveldown: AbstractLevelDOWN<K, V>

  changes?(): EasierLevelDOWNEmitter<K, V>
  encodeKey?(key: K): StringOrBuffer
  encodeValue?(value: V): StringOrBuffer
  decodeKey?(key: StringOrBuffer): K
  decodeValue?(value: StringOrBuffer): V

  constructor(leveldown: AbstractLevelDOWN<K, V>) {
    this._leveldown = leveldown

    // Reuse existing implementations if present to mitigate multiple-encapsulation code expansion

    if (this._leveldown._easier !== undefined && this._leveldown._easier.get !== undefined)
      this.get = this._leveldown._easier.get.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.put !== undefined)
      this.put = this._leveldown._easier.put.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.del !== undefined)
      this.del = this._leveldown._easier.del.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.iterator !== undefined)
      this.iterator = this._leveldown._easier.iterator.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.open !== undefined)
      this.open = this._leveldown._easier.open.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.close !== undefined)
      this.close = this._leveldown._easier.close.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.batch !== undefined)
      this.batch = this._leveldown._easier.batch.bind(this._leveldown._easier)

    if(this._leveldown._easier !== undefined && this._leveldown._easier.post !== undefined)
      this.post = this._leveldown._easier.post.bind(this._leveldown._easier)
    else if(this._leveldown.post !== undefined)
      this.post = this._leveldown.post.bind(this._leveldown)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.changes !== undefined)
      this.changes = this._leveldown._easier.changes.bind(this._leveldown._easier)
    else if(this._leveldown.changes !== undefined)
      this.changes = this._leveldown.changes.bind(this._leveldown)
    
    if (this._leveldown._easier !== undefined && this._leveldown._easier.encodeKey !== undefined)
      this.encodeKey = this._leveldown._easier.encodeKey.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.encodeValue !== undefined)
      this.encodeValue = this._leveldown._easier.encodeValue.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.decodeKey !== undefined)
      this.decodeKey = this._leveldown._easier.decodeKey.bind(this._leveldown._easier)

    if (this._leveldown._easier !== undefined && this._leveldown._easier.decodeValue !== undefined)
      this.decodeValue = this._leveldown._easier.decodeValue.bind(this._leveldown._easier)
  }

  get(k: K): Promise<V> {
    return ErrorValueCallbackToPromiseA1(this._leveldown.get.bind(this._leveldown), k)
  }

  put(k: K, v: V): Promise<void> {
    return ErrorCallbackToPromiseA2(this._leveldown.put.bind(this._leveldown), k, v)
  }

  async post(val: V): Promise<K> {
    const key = uuidv4() as K
    await this.put(key, val)
    return key
  }

  del(k: K): Promise<void> {
    return ErrorCallbackToPromiseA1(this._leveldown.del.bind(this._leveldown), k)
  }

  open(opts: O): Promise<void> {
    return ErrorCallbackToPromiseA1(this._leveldown.open.bind(this._leveldown), opts)
  }

  close(): Promise<void> {
    return ErrorCallbackToPromise(this._leveldown.close.bind(this._leveldown))
  }

  async *iterator(opts: EasierLevelDOWNIteratorOpts<K, V>): AsyncIterableIterator<KeyVal<K, V>> {
    const it = this._leveldown.iterator(opts)
    while (true) {
      const kv = await ErrorKeyValueCallbackToPromise<K, V>(it.next.bind(it))
      if (kv.key === undefined && kv.value === undefined)
        break
      yield kv
    }
  }

  batch(array: EasierLevelDOWNBatchOpts<K, V>): Promise<void> {
    return ErrorCallbackToPromiseA1(this._leveldown.batch.bind(this._leveldown), array)
  }
}
