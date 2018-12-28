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
  _db: EasierLevelDOWN<K, V, O>
  _location: string | undefined

  constructor(db: EasierLevelDOWN<K, V, O>, location?: string) {
    super(location)
    this._db = db
    this._location = location
  }

  _open(options: O, callback: ErrorCallback) {
    if (this._db.open !== undefined) {
      let opts: O = {} as O

      if (options !== undefined)
        opts = options

      if (this._location !== undefined)
        opts.location = this._location

      this._db.open(opts).then(
        () => process.nextTick(callback)
      ).catch(
        (err) => process.nextTick(callback, err)
      )
    } else {
      process.nextTick(callback)
    }
  }

  _close(callback: ErrorCallback) {
    if (this._db.close !== undefined) {
      this._db.close().then(
        () => process.nextTick(callback)
      ).catch(
        (err) => process.nextTick(callback, err)
      )
    } else {
      process.nextTick(callback)
    }
  }

  _get(key: StringOrBuffer, options: AbstractGetOptions, callback: ErrorValueCallback<V>) {
    this._db.get(
      this._decodeKey(key)
    ).then((value: V) => {
      if (options.asBuffer)
        process.nextTick(callback, null, Buffer.from(String(this._encodeValue(value))))
      else
        process.nextTick(callback, null, this._encodeValue(value))
    }).catch((err) => {
      process.nextTick(callback, err)
    })
  }

  _put(key: StringOrBuffer, val: StringOrBuffer, options: AbstractOptions, callback: ErrorCallback) {
    this._db.put(
      this._decodeKey(key),
      this._decodeValue(val)
    ).then(() => {
      process.nextTick(callback)
    }).catch((err) => {
      process.nextTick(callback, err)
    })
  }

  _del(key: StringOrBuffer, options: AbstractOptions, callback: ErrorCallback) {
    this._db.del(
      this._decodeKey(key)
    ).then(() => {
      process.nextTick(callback)
    }).catch((err) => {
      process.nextTick(callback, err)
    })
  }

  _batch(array: EasierLevelDOWNBatchOpts<StringOrBuffer, StringOrBuffer>, options: AbstractOptions, callback: ErrorCallback) {
    if (this._db.batch !== undefined) {
      this._db.batch(array.map((op) => {
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
    if(this._db.post !== undefined) {
      return this._db.post(
        this._decodeValue(val)
      ).then((key) => this._encodeKey(key))
    } else {
      const key = String(uuidv4())

      return this._db.put(
        this._decodeKey(key),
        this._decodeValue(val)
      ).then(() => key)
    }
  }

  // Passthrough changes encoding underlying events
  changes(): EasierLevelDOWNEmitter<StringOrBuffer, StringOrBuffer> {
    const newEmitter = new EasierLevelDOWNEmitter<StringOrBuffer, StringOrBuffer>()

    this._db.changes().onPut(
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

    return newEmitter
  }

  _encodeKey(key: K): StringOrBuffer {
    if (this._db.encodeKey !== undefined)
      return this._db.encodeKey(key)
    return key as any as StringOrBuffer
  }

  _decodeKey(key: StringOrBuffer): K {
    if (this._db.decodeKey !== undefined)
      return this._db.decodeKey(key)
    return key as any as K
  }

  _encodeValue(value: V): StringOrBuffer {
    if (this._db.encodeValue !== undefined)
      return this._db.encodeValue(value)
    return value as any as StringOrBuffer
  }

  _decodeValue(value: StringOrBuffer): V {
    if (this._db.decodeValue !== undefined)
      return this._db.decodeValue(value)
    return value as any as V
  }
}
