import { useCallback, useEffect, useState } from 'react'
import type { CourseManifestFile } from '../types/manifest'

export function useCourseManifest() {
  const [data, setData] = useState<CourseManifestFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/course-content/manifest.json?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Manifest not found (${res.status})`)
      const json = (await res.json()) as CourseManifestFile
      setData(json)
    } catch (e) {
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
