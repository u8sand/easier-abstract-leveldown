import { AbstractGetOptions, AbstractIterator, AbstractIteratorOptions, AbstractLevelDOWN, AbstractOptions, ErrorCallback, ErrorValueCallback } from 'abstract-leveldown'
import uuidv4 from 'uuid/v4'
import { EasierLevelDOWN, EasierLevelDOWNBatchOpts, EasierLevelDOWNEmitter, MaybeLocation } from './abstract'
import { EasierAbstractLevelDOWNIterator } from './leveldown-iterator'
import { StringOrBuffer } from './types'

export class EasierAbstractLevelDOWN<
  K, V, O extends MaybeLocation
> extends AbstractLevelDOWN<
  StringOrBuffer, StringOrBuffer
> {
  _easier: EasierLevelDOWN<K, V, O>
  _location: string | undefined

  constructor(easier: EasierLevelDOWN<K, V, O>, location?: string) {
    super(location)
    this._easier = easier
    this._location = location

    if (this._easier.changes === undefined)
      this._easier.changes = undefined
  }

  _open(options: O, callback: ErrorCallback) {
    if (this._easier.open !== undefined) {
      let opts: O = {} as O

      if (options !== undefined)
        opts = options

      if (this._location !== undefined)
        opts.location = this._location

      this._easier.open(opts).then(
        () => process.nextTick(callback)
      ).catch(
        (err) => process.nextTick(callback, err)
      )
    } else {
      process.nextTick(callback)
    }
  }

  _close(callback: ErrorCallback) {
    if (this._easier.close !== undefined) {
      this._easier.close().then(
        () => process.nextTick(callback)
      ).catch(
        (err) => process.nextTick(callback, err)
      )
    } else {
      process.nextTick(callback)
    }
  }

  _get(key: StringOrBuffer, options: AbstractGetOptions, callback: ErrorValueCallback<V>) {
    this._easier.get(
      this._decodeKey(key)
    ).then((value: V) => {
      if (options.asBuffer)
        process.nextTick(callback, null, Buffer.from(String(this._encodeValue(value))))
      else
        process.nextTick(callback, null, String(this._encodeValue(value)))
    }).catch((err) => {
      process.nextTick(callback, err)
    })
  }

  _put(key: StringOrBuffer, val: StringOrBuffer, options: AbstractOptions, callback: ErrorCallback) {
    this._easier.put(
      this._decodeKey(key),
      this._decodeValue(val)
    ).then(() => {
      process.nextTick(callback)
    }).catch((err) => {
      process.nextTick(callback, err)
    })
  }

  _del(key: StringOrBuffer, options: AbstractOptions, callback: ErrorCallback) {
    this._easier.del(
      this._decodeKey(key)
    ).then(() => {
      process.nextTick(callback)
    }).catch((err) => {
      process.nextTick(callback, err)
    })
  }

  _batch(array: EasierLevelDOWNBatchOpts<StringOrBuffer, StringOrBuffer>, options: AbstractOptions, callback: ErrorCallback) {
    if (this._easier.batch !== undefined) {
      this._easier.batch(array.map((op) => {
        if (op.type === 'put') {
          return {
            type: op.type,
            key: this._decodeKey(op.key),
            value: this._decodeValue(op.value)
          }
        } else if (op.type === 'del') {
          return {
            type: op.type,
            key: this._decodeKey(op.key)
          }
        } else
          throw new Error(`Unrecognized batch operation '${(op as { type: string }).type}'`)
      })).then(
        () => process.nextTick(callback)
      ).catch(
        (err) => process.nextTick(callback, err)
      )
    } else {
      (async () => {
        for(const op of array) {
          if (op.type === 'put') {
            await new Promise((reject, resolve) => {
              this._put(op.key, op.value, options, ((err, res) => {
                if (err !== null) {
                  reject(err)
                } else {
                  resolve(res)
                }
              }) as ErrorCallback)
            })
          } else if (op.type === 'del') {
            await new Promise((reject, resolve) => {
              this._del(op.key, options, ((err, res) => {
                if (err !== null) {
                  reject(err)
                } else {
                  resolve(res)
                }
              }) as ErrorCallback)
            })
          } else {
            throw new Error(`Unrecognized batch operation '${(op as {type: string}).type}'`)
          }
        }
      })().then((results) => {
        process.nextTick(callback, null, results)
      }).catch((err) => {
        process.nextTick(callback, err, null)
      })
    }
  }

  _iterator(options: AbstractIteratorOptions<K>): AbstractIterator<StringOrBuffer, StringOrBuffer> {
    return new EasierAbstractLevelDOWNIterator<K, V, O>(this, options)
  }

  // generate key
  post(val: StringOrBuffer): Promise<StringOrBuffer> {
    if(this._easier.post !== undefined) {
      return this._easier.post(
        this._decodeValue(val)
      ).then((key) => this._encodeKey(key))
    } else {
      const key = String(uuidv4())

      return this._easier.put(
        this._decodeKey(key),
        this._decodeValue(val)
      ).then(() => key)
    }
  }

  // Passthrough changes encoding underlying events
  changes(): EasierLevelDOWNEmitter<StringOrBuffer, StringOrBuffer> {
    const newEmitter = new EasierLevelDOWNEmitter<StringOrBuffer, StringOrBuffer>()

    if (this._easier.changes !== undefined) {
      this._easier.changes().onPut(
        (key: K, value: V) =>
          newEmitter.emitPut(
            this._encodeKey(key),
            this._encodeValue(value)
          )
      ).onDel(
        (key: K) =>
          newEmitter.emitDel(
            this._encodeKey(key)
          )
      ).onBatch(
        (array: EasierLevelDOWNBatchOpts<K, V>) =>
          newEmitter.emitBatch(
            array.map((op) => {
              if (op.type === 'put') {
                return {
                  type: op.type,
                  key: this._encodeKey(op.key),
                  value: this._encodeValue(op.value)
                }
              } else if (op.type === 'del') {
                return {
                  type: op.type,
                  key: this._encodeKey(op.key)
                }
              } else
                throw new Error(`Unrecognized batch operation '${(op as { type: string }).type}'`)
            })
          )
      )
    }

    return newEmitter
  }

  _encodeKey(key: K): StringOrBuffer {
    if (this._easier.encodeKey !== undefined)
      return this._easier.encodeKey(key)
    return key as any as StringOrBuffer
  }

  _decodeKey(key: StringOrBuffer): K {
    if (this._easier.decodeKey !== undefined)
      return this._easier.decodeKey(key)
    return key as any as K
  }

  _encodeValue(value: V): StringOrBuffer {
    if (this._easier.encodeValue !== undefined)
      return this._easier.encodeValue(value)
    return value as any as StringOrBuffer
  }

  _decodeValue(value: StringOrBuffer): V {
    if (this._easier.decodeValue !== undefined)
      return this._easier.decodeValue(value)
    return value as any as V
  }
}
