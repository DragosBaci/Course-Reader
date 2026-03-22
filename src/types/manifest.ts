export type ManifestLesson = {
  id: string
  title: string
  filename: string
  src: string
  order: number
}

export type ManifestChapter = {
  id: string
  title: string
  folderName: string
  order: number
  lessons: ManifestLesson[]
}

export type ManifestCourse = {
  id: string
  title: string
  instructor: string
  rating: number
  ratingCount: string
  image: string
  chapters: ManifestChapter[]
}

export type CourseManifestFile = {
  generatedAt: string
  courses: ManifestCourse[]
}
