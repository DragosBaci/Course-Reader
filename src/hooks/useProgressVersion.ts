import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'udemyclone-lesson-progress-v1'

export function useProgressVersion() {
  return useSyncExternalStore(
    (onStore) => {
      const onCustom = () => onStore()
      const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) onStore()
      }
      window.addEventListener('udemyclone-progress', onCustom)
      window.addEventListener('storage', onStorage)
      return () => {
        window.removeEventListener('udemyclone-progress', onCustom)
        window.removeEventListener('storage', onStorage)
      }
    },
    () => localStorage.getItem(STORAGE_KEY) ?? '',
    () => '',
  )
}
