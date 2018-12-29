import memdown from 'memdown'
import expose, { LevelDOWNEasier } from '..'

export default expose( // convert easier-leveldown -> leveldown
  () => new LevelDOWNEasier( // convert leveldown -> easier-leveldown
    memdown() // leveldown
  )
)
