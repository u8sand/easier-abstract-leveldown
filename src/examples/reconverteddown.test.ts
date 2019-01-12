import test from 'tape'
import suite from '../tests'
import reconverteddown from './reconverteddown'

suite({
  test,
  factory: () => reconverteddown() as any,
})
