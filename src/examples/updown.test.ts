import test from 'tape'
import suite from '../tests'
import updown from './updown'

suite({
  test,
  factory: () => updown() as any,
})
