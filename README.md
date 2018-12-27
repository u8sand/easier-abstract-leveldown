# easier-abstract-leveldown
A convenient wrapper of Abstract LevelDOWN for those who like TypeScript / ESnext features including async/await/generators.

## Discussion
Things are made as straightforward as possible, anything non-integral can be ommitted and will be taken care of.
- batch operations automatically get mapped to just calling each operation in a loop
  - you can also handle batch operations if needed
- iterators are tested, in the worst case you can just yield everything
  - options are provided in the cleanest form
    `{ lt, gt, lte, gte, reverse, limit }`
- In general buffers and strings are taken care of, use whatever internal representation you want
  and if their conversion to StringOrBuffer is non-trivial, you can set up encode/decode key/val functions.
- `easier`-derived leveldowns pass the same traditional leveldown tests
- All methods expect standard promises to enable `async/await` features
- Support passing events on to level-up via `exposeLevelUp` with optional dependency `levelup`

## Example
This is how easy it is to make a fully featured memdown. It could be more efficient, or not!

```ts
import expose, { EasierLevelDOWN } from 'easier-abstract-leveldown'

class MyLevelDOWN implements EasierLevelDOWN<string, string> {
  _store: {[key: string]: string}

  async open() {
    this._store = {}
  }

  async get(k) {
    const v = this._store[k]
    if (v === undefined)
      throw new Error('NotFound')
    return v
  }

  async put(k: string, v: string) {
    this._store[k] = v
  }

  async del(k) {
    delete this._store[k]
  }

  async *iterator(opts) {
    const keys = Object.keys(this._store).sort()
    if (opts.reverse) keys.reverse()

    for (const k of keys) {
      yield {
        key: k,
        value: this._store[k]
      }
    }
  }
}

export default expose(MyLevelDOWN)
```
