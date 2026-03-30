/**
 * Scans public/course-content/<course>/<chapter>/*.mp4 and writes manifest.json
 * Run: node scripts/scan-courses.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', 'course-content')
const OUT = path.join(ROOT, 'manifest.json')

const VIDEO_EXT = new Set(['.mp4', '.webm', '.m4v', '.ogg'])

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function titleFromSlug(name) {
  const base = path.parse(name).name
  return base
    .replace(/^[\d_.\s-]+/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || base
}

function readJsonSafe(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(naturalCompare)
}

function listVideos(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((f) => f.isFile() && VIDEO_EXT.has(path.extname(f.name).toLowerCase()))
    .map((f) => f.name)
    .sort(naturalCompare)
}

function build() {
  if (!fs.existsSync(ROOT)) {
    fs.mkdirSync(ROOT, { recursive: true })
  }

  const courseDirs = listDirs(ROOT)
  const courses = []

  for (const courseDir of courseDirs) {
    if (courseDir.startsWith('.') || courseDir === 'node_modules') continue

    const coursePath = path.join(ROOT, courseDir)
    const metaPath = path.join(coursePath, 'course.json')
    const meta = readJsonSafe(metaPath) || {}

    const chapterDirs = listDirs(coursePath).filter(
      (d) => d !== 'resources' && !d.startsWith('.'),
    )

    const chapters = []
    let chapterOrder = 0

    for (const chDir of chapterDirs) {
      chapterOrder += 1
      const chapterPath = path.join(coursePath, chDir)
      const videos = listVideos(chapterPath)
      if (videos.length === 0) continue

      const lessons = videos.map((filename, i) => {
        const src = `/course-content/${courseDir}/${chDir}/${filename}`
        const lessonId = `${courseDir}/${chDir}/${filename}`
        return {
          id: lessonId,
          title: titleFromSlug(filename),
          filename,
          src,
          order: i + 1,
        }
      })

      chapters.push({
        id: `${courseDir}/${chDir}`,
        title: titleFromSlug(chDir),
        folderName: chDir,
        order: chapterOrder,
        lessons,
      })
    }

    if (chapters.length === 0) continue

    const courseId = courseDir
    courses.push({
      id: courseId,
      title: typeof meta.title === 'string' ? meta.title : titleFromSlug(courseDir),
      instructor:
        typeof meta.instructor === 'string' ? meta.instructor : 'Local library',
      rating: typeof meta.rating === 'number' ? meta.rating : 0,
      ratingCount:
        typeof meta.ratingCount === 'string' ? meta.ratingCount : 'Your files',
      image:
        typeof meta.image === 'string'
          ? meta.image
          : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop',
      chapters,
    })
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    courses,
  }

  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2), 'utf8')
  console.log(
    `Wrote ${OUT} (${courses.length} course${courses.length === 1 ? '' : 's'})`,
  )
}

build()
