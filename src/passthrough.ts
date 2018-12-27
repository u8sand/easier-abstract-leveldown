import { AbstractLevelDOWN } from "abstract-leveldown"
import { EasierAbstractLevelDOWN } from "./leveldown"
import { StringOrBuffer } from "./types"

// This function is a dummy implementation
export function easier_changes_passthrough<
  K extends StringOrBuffer = any,
  V extends StringOrBuffer = any,
  I extends AbstractLevelDOWN<K, V> = any,
  E extends EasierAbstractLevelDOWN<K, V, any> = any
>(
  some_wrapper_instance: I,
  underlying_easier_db?: E,
): E {
  const wrapper_instance = some_wrapper_instance as any as E

  // try to find the underlying db
  const db = underlying_easier_db || wrapper_instance._db || wrapper_instance.db

  // can't find it, return it the way it is
  if (db === undefined) {
    console.warn('easier-abstract-leveldown.passthrough_changes: db could not be identified')
    return wrapper_instance
  }

  // we have the db, add changes to the instance
  wrapper_instance.changes = db.changes()

  return wrapper_instance
}