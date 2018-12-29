import { AbstractIterator, AbstractIteratorOptions, ErrorCallback, ErrorKeyValueCallback } from 'abstract-leveldown'
import { EasierLevelDOWNIteratorOpts, MaybeLocation } from './abstract'
import { EasierAbstractLevelDOWN } from './leveldown'
import { normalize_options, test_from_options } from './leveldown-opts'
import { KeyVal, StringOrBuffer } from './types'

export class EasierAbstractLevelDOWNIterator<
  K, V, O extends MaybeLocation
> extends AbstractIterator<
  StringOrBuffer, StringOrBuffer
> {
  db: EasierAbstractLevelDOWN<K, V, O>
  _iterator: AsyncIterableIterator<KeyVal<K, V>>
  _options: AbstractIteratorOptions
  _test: (k: StringOrBuffer) => boolean
  _done: number

  constructor(db: EasierAbstractLevelDOWN<K, V, O>, options: AbstractIteratorOptions) {
    super(options)

    this.db = db
    this._options = normalize_options(options)
    this._test = test_from_options(this._options)
    this._done = 0
    this._iterator = this.db._easier.iterator({
      ...this._options,
      lt: this.db._decodeKey(this._options.lt),
      lte: this.db._decodeKey(this._options.lte),
      gt: this.db._decodeKey(this._options.gt),
      gte: this.db._decodeKey(this._options.gte),
    } as EasierLevelDOWNIteratorOpts<K, V>)
  }

  _next(callback: ErrorKeyValueCallback<K, V>) {
    if (this._done >= this._options.limit)
      return process.nextTick(callback)

    this._iterator.next().then(
      ({done, value}) => {
        if (done)
          process.nextTick(callback)
        else {
          let key = this.db._encodeKey(value.key)

          if (this._test(key)) {
            ++this._done

            if (this._options.keyAsBuffer && !Buffer.isBuffer(key))
              key = Buffer.from(String(key))

            let val = this.db._encodeValue(value.value)
            if (this._options.valueAsBuffer && !Buffer.isBuffer(val))
              val = Buffer.from(String(val))

            process.nextTick(callback, null, key, val)
          } else {
            process.nextTick(this._next.bind(this), callback)
          }
        }
      }
    ).catch(
      (err) => process.nextTick(callback, err)
    )
  }

  _end(callback: ErrorCallback) {
    process.nextTick(callback)
  }
}
