import test from 'tape'
import suite from '../tests'
import converteddown from './converteddown'

suite({
  test,
  factory: () => converteddown() as any,
})
