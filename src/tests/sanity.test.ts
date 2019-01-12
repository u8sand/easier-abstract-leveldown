import test from 'tape'
import memdown from 'memdown'

const testCommon = require('abstract-leveldown/test/common')({
  test: test,
  factory: () => memdown() as any,
  snapshots: false,
  createIfMissing: false,
  errorIfExists: false,
})

require('abstract-leveldown/test/open-test').args(test, testCommon)
require('abstract-leveldown/test/open-test').open(test, testCommon)
require('abstract-leveldown/test/del-test').all(test, testCommon)
require('abstract-leveldown/test/get-test').all(test, testCommon)
require('abstract-leveldown/test/put-test').all(test, testCommon)
// NOTE: memdown actually fails these, easier-downs do not
// require('abstract-leveldown/test/batch-test').all(test, testCommon)
// require('abstract-leveldown/test/chained-batch-test').all(test, testCommon)
// require('abstract-leveldown/test/put-get-del-test').all(test, testCommon)
require('abstract-leveldown/test/iterator-test').all(test, testCommon)
require('abstract-leveldown/test/iterator-range-test').all(test, testCommon)
