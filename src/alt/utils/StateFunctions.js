import assign from 'object-assign'
import * as Sym from '../symbols/symbols'

const {
  INIT_SNAPSHOT,
  LAST_SNAPSHOT,
  LIFECYCLE,
  STATE_CONTAINER
} = Sym

export function setAppState(instance, data, onStore) {
  const obj = instance.deserialize(data)
  Object.keys(obj).forEach((key) => {
    const store = instance.stores[key]
    if (store) {
      if (store[LIFECYCLE].deserialize) {
        obj[key] = store[LIFECYCLE].deserialize(obj[key]) || obj[key]
      }
      assign(store[STATE_CONTAINER], obj[key])
      onStore(store)
    }
  })
}

export function snapshot(instance, ...storeNames) {
  const stores = storeNames.length ? storeNames : Object.keys(instance.stores)
  return stores.reduce((obj, key) => {
    const store = instance.stores[key]
    if (store[LIFECYCLE].snapshot) {
      store[LIFECYCLE].snapshot()
    }
    const customSnapshot = store[LIFECYCLE].serialize &&
      store[LIFECYCLE].serialize()
    obj[key] = customSnapshot ? customSnapshot : store.getState()
    return obj
  }, {})
}

export function saveInitialSnapshot(instance, key) {
  const state = instance.deserialize(
    instance.serialize(instance.stores[key][STATE_CONTAINER])
  )
  instance[INIT_SNAPSHOT][key] = state
  instance[LAST_SNAPSHOT][key] = state
}

export function filterSnapshots(instance, snapshot, storeNames) {
  return storeNames.reduce((obj, storeName) => {
    if (!snapshot[storeName]) {
      throw new ReferenceError(`${storeName} is not a valid store`)
    }
    obj[storeName] = snapshot[storeName]
    return obj
  }, {})
}
