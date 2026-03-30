import { useCallback, useEffect, useState } from 'react'
import type { CourseManifestFile } from '../types/manifest'
import { resolveAssetUrl, isTauriEnv } from '../utils/tauri'

export function useCourseManifest() {
  const [data, setData] = useState<CourseManifestFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let json: CourseManifestFile

      if (isTauriEnv()) {
        // In Tauri desktop app: use custom command to read manifest from disk
        const { invoke } = await import('@tauri-apps/api/core')
        const raw = await invoke<string>('read_manifest', {
          courseContentPath: '/Users/dragosbaci/Desktop/UdemyClone/course-content',
        })
        json = JSON.parse(raw) as CourseManifestFile
      } else {
        // In browser / dev server: fetch via HTTP
        const url = resolveAssetUrl('/course-content/manifest.json')
        const res = await fetch(`${url}?t=${Date.now()}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`Manifest not found (${res.status})`)
        json = (await res.json()) as CourseManifestFile
      }
      
      // Rewrite every lesson src so <video> tags can load them
      json.courses.forEach(c => {
        c.chapters.forEach(ch => {
          ch.lessons.forEach(l => {
            l.src = resolveAssetUrl(l.src)
          })
        })
      })
      setData(json)
    } catch (e) {
      console.error('Failed to load manifest:', e)
      setError(e instanceof Error ? e.message : 'Failed to load courses')
      setData({ generatedAt: '', courses: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, error, loading, reload }
}
