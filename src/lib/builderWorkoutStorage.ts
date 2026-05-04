const storagePrefix = 'builder-workout:v2:'
const legacyStoragePrefix = 'builder-workout:'

const getUserScope = (userId?: string) => (userId ? `user:${userId}` : 'guest')

const getScopedStorageKey = (storageKey: string, userId?: string) => {
  return `${storagePrefix}${getUserScope(userId)}:${storageKey}`
}

const getLegacyStorageKey = (storageKey: string) => {
  return `${legacyStoragePrefix}${storageKey}`
}

export const readBuilderWorkoutStorage = (storageKey: string, userId?: string) => {
  if (typeof window === 'undefined') {
    return null
  }

  const scopedValue = localStorage.getItem(getScopedStorageKey(storageKey, userId))
  if (scopedValue) {
    return scopedValue
  }

  // Backward compatibility for keys saved before user-scoped storage.
  return localStorage.getItem(getLegacyStorageKey(storageKey))
}

export const writeBuilderWorkoutStorage = (storageKey: string, value: string, userId?: string) => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(getScopedStorageKey(storageKey, userId), value)
}

export const removeBuilderWorkoutStorage = (storageKey: string, userId?: string) => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(getScopedStorageKey(storageKey, userId))
  localStorage.removeItem(getLegacyStorageKey(storageKey))
}
