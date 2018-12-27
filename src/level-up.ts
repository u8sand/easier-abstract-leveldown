import LevelUp from 'levelup';
import { EasierAbstractLevelDOWN } from './level-down';
import { MaybeLocation } from './abstract';

export class EasierLevelUp<K, V, O extends MaybeLocation> extends LevelUp<EasierAbstractLevelDOWN<K, V, O>> {
  constructor(db: EasierAbstractLevelDOWN<K, V, O>, ...args) {
    super(db, ...args)

    if (db._db.changes !== undefined) {
      db._db.changes().onPut(
        (key, value) => this.emit('put', key, value)
      ).onDel(
        (key) => this.emit('del', key)
      ).onBatch(
        (array) => this.emit('batch', array)
      )
    }
  }
}
