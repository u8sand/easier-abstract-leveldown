import { LevelUp } from "levelup";
import { MaybeLocation } from "./abstract";
import { LevelDOWNEasier } from "./leveldown-easier";
import { StringOrBuffer } from "./types";
import { AbstractLevelDOWN } from "abstract-leveldown";

// Undocumented levelup private members
interface LevelUpEx<K, V, DB = AbstractLevelDOWN<K, V>> extends LevelUp<DB> {
  db?: DB
  _db?: DB
}

export class LevelUpEasier<K extends StringOrBuffer, V = any, O extends MaybeLocation = any> extends LevelDOWNEasier<K, V, O> {
  _levelup: LevelUp

  constructor(levelup: LevelUp) {
    const _levelup = levelup as LevelUpEx<K, V>
    const _leveldown = _levelup.db || _levelup._db
    if (_leveldown === undefined) {
      throw "Could not find underlying leveldown"
    }
    
    super(_leveldown)
    this._levelup = _levelup

    // Levelups will handle opening/closing the
    //  underlying levelup/leveldown
    this.open = async () => {}
    this.close = async () => {}
  }
}
