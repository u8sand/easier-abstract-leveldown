import { ErrorCallback, ErrorValueCallback, ErrorKeyValueCallback } from 'abstract-leveldown'
import { KeyVal } from './types'

// Note: would have been way simpler if typescript supported
//  variable arguments at the beginning...

export function ErrorCallbackToPromise(
  func: (cb: ErrorCallback) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    process.nextTick(func, (err) => {
      if (err)
        reject(err)
      else
        resolve()
    })
  })
}

export function ErrorCallbackToPromiseA1<A1>(
  func: (arg1: A1, cb: ErrorCallback) => void,
  arg1: A1
): Promise<void> {
  return new Promise((resolve, reject) => {
    process.nextTick(func, arg1, (err) => {
      if (err)
        reject(err)
      else
        resolve()
    })
  })
}

export function ErrorCallbackToPromiseA2<A1, A2>(
  func: (arg1: A1, arg2: A2, cb: ErrorCallback) => void,
  arg1: A1,
  arg2: A2
): Promise<void> {
  return new Promise((resolve, reject) => {
    process.nextTick(func, arg1, arg2, (err) => {
      if (err)
        reject(err)
      else
        resolve()
    })
  })
}

export function ErrorValueCallbackToPromise<V>(
  func: (cb: ErrorValueCallback<V>) => void
): Promise<V> {
  return new Promise((resolve, reject) => {
    process.nextTick(func, (err, value) => {
      if (err)
        reject(err)
      else
        resolve(value)
    })
  })
}

export function ErrorValueCallbackToPromiseA1<V, A1>(
  func: (arg1: A1, cb: ErrorValueCallback<V>) => void,
  arg1: A1
): Promise<V> {
  return new Promise((resolve, reject) => {
    process.nextTick(func, arg1, (err, value) => {
      if (err)
        reject(err)
      else
        resolve(value)
    })
  })
}

export function ErrorKeyValueCallbackToPromise<K, V>(
  func: (cb: ErrorKeyValueCallback<K, V>) => void
): Promise<KeyVal<K, V>> {
  return new Promise((resolve, reject) => {
    process.nextTick(func, (err, key, value) => {
      if (err)
        reject(err)
      else
        resolve({
          key,
          value,
        })
    })
  })
}
