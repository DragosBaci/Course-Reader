import { convertFileSrc } from '@tauri-apps/api/core'

/** Check if running inside a Tauri desktop application */
export const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

/**
 * Resolves a local path (e.g. /course-content/...) to a valid Tauri asset URL.
 * Automatically handles dev server versus production desktop application.
 */
export const resolveAssetUrl = (src: string) => {
  if (!isTauriEnv()) return src

  // If already absolute or URL, let it be.
  if (src.startsWith('http') || src.startsWith('asset://')) return src
  
  // Convert standard relative paths into absolute Tauri asset paths
  const absoluteCourseContentPath = '/Users/dragosbaci/Desktop/UdemyClone' + (src.startsWith('/') ? '' : '/') + src
  
  try {
    return convertFileSrc(absoluteCourseContentPath)
  } catch (e) {
    console.error('Failed to convert file src', e)
    return src
  }
}
