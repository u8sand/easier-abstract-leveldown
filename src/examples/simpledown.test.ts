import test from 'tape'
import suite from '../tests'
import simpledown from './simpledown'

suite({
  test,
  factory: () => simpledown() as any,
})
