import simpledown from './simpledown'
import expose, { LevelDOWNEasier } from '..'

export default expose( // convert easier-leveldown -> leveldown
  () => new LevelDOWNEasier( // convert leveldown -> easier-leveldown
    simpledown() // leveldown (converted from easier-leveldown)
  )
)
