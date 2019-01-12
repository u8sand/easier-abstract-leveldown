import levelup from 'levelup'
import memdown from 'memdown'
import expose, { LevelUpEasier } from '..'

export default expose( // convert easier-leveldown -> leveldown
  () => new LevelUpEasier( // convert levelup -> easier-leveldown
    levelup( // treat level down -> level up
      memdown() // leveldown
    )
  )
)
