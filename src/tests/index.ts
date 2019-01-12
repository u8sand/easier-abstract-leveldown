import tape from 'tape'
import { AbstractLevelDOWN } from "abstract-leveldown"
import { LevelDOWNEasier } from "../leveldown-easier"
import { KeyVal, StringOrBuffer } from '../types'

export default function suite<K extends StringOrBuffer, V extends StringOrBuffer, O>({
  test,
  factory,
  open_opts,
  trigger_put,
  trigger_del,
}: {
  test: typeof tape,
  factory: () => AbstractLevelDOWN<K, V>,
  open_opts?: O,
  trigger_put?: (kv: KeyVal<K, V>) => Promise<void>,
  trigger_del?: (k: K) => Promise<void>
}) {
  const testCommon = require('abstract-leveldown/test/common')({
    test,
    factory,
    snapshots: false,
    createIfMissing: false,
    errorIfExists: false,
  })
  require('abstract-leveldown/test/open-test').args(test, testCommon)
  require('abstract-leveldown/test/open-test').open(test, testCommon)
  require('abstract-leveldown/test/del-test').all(test, testCommon)
  require('abstract-leveldown/test/get-test').all(test, testCommon)
  require('abstract-leveldown/test/put-test').all(test, testCommon)
  require('abstract-leveldown/test/batch-test').all(test, testCommon)
  require('abstract-leveldown/test/chained-batch-test').all(test, testCommon)
  require('abstract-leveldown/test/put-get-del-test').all(test, testCommon)
  require('abstract-leveldown/test/iterator-test').all(test, testCommon)
  require('abstract-leveldown/test/iterator-range-test').all(test, testCommon)

  test('post', async (t) => {
    const db = new LevelDOWNEasier<K, V>(
      factory()
    )
    await db.open(open_opts)

    const k1 = await db.post('a' as V)
    const v1 = await db.get(k1)
    t.equal(String(v1), 'a')

    const k2 = await db.post('b' as V)
    const v2 = await db.get(k2)
    t.equal(String(v2), 'b')

    t.notEqual(k1, k2)
    t.end()
  })

  test('changes', async (t) => {
    const db = new LevelDOWNEasier<K, V>(
      factory()
    )
    if (db.changes === undefined) {
      t.comment('skipped database does not support changes')
      t.end()
    }
    await db.open(open_opts)

    const changes = db.changes()
    const test_case: KeyVal<K, V> = {
      key: 'a' as K,
      value: 'b' as V,
    }

    if (trigger_put !== undefined) {
      const put_change = new Promise(
        (resolve, reject) =>
          changes.onPut((key, value) => {
            resolve({ key, value })
          })
      )
      trigger_put(test_case)
      t.deepEqual(
        await put_change,
        test_case
      )
    } else {
      t.comment('skipped trigger_put was not defined')
    }

    if (trigger_del !== undefined) {
      const del_change = new Promise(
        (resolve, reject) =>
          changes.onDel((key) => {
            resolve(key)
          })
      )
      trigger_del(test_case.key as K)
      t.equal(
        await del_change,
        test_case.key
      )
    } else {
      t.comment('skipped trigger_del was not defined')
    }

    // TODO: batch

    t.end()
  })
}
