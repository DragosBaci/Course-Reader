export type Course = {
  id: string
  title: string
  instructor: string
  progress: number
  rating: number
  ratingCount: string
  image: string
  /** Local folder-based course; opens the player */
  href?: string
  isLocal?: boolean
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'Figma UI UX Design Essentials',
    instructor: 'Daniel Walter Scott, Instructor HQ',
    progress: 0,
    rating: 4.7,
    ratingCount: '(12,345)',
    image:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=480&h=270&fit=crop',
  },
  {
    id: '2',
    title: 'React - The Complete Guide 2025',
    instructor: 'Maximilian Schwarzmüller',
    progress: 0,
    rating: 4.8,
    ratingCount: '(210,102)',
    image:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=480&h=270&fit=crop',
  },
  {
    id: '3',
    title: 'Understanding TypeScript',
    instructor: 'Maximilian Schwarzmüller',
    progress: 0,
    rating: 4.7,
    ratingCount: '(45,678)',
    image:
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=480&h=270&fit=crop',
  },
  {
    id: '4',
    title: 'Node.js — The Complete Guide',
    instructor: 'Maximilian Schwarzmüller',
    progress: 0,
    rating: 4.7,
    ratingCount: '(89,120)',
    image:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=480&h=270&fit=crop',
  },
  {
    id: '5',
    title: 'JavaScript — The Complete Guide',
    instructor: 'Maximilian Schwarzmüller',
    progress: 0,
    rating: 4.8,
    ratingCount: '(156,000)',
    image:
      'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=480&h=270&fit=crop',
  },
  {
    id: '6',
    title: 'CSS — The Complete Guide',
    instructor: 'Academind Team',
    progress: 0,
    rating: 4.6,
    ratingCount: '(34,200)',
    image:
      'https://images.unsplash.com/photo-1507721999472-8a4421a4b07a?w=480&h=270&fit=crop',
  },
  {
    id: '7',
    title: 'Git & GitHub — The Practical Guide',
    instructor: 'Maximilian Schwarzmüller',
    progress: 0,
    rating: 4.7,
    ratingCount: '(67,890)',
    image:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=480&h=270&fit=crop',
  },
  {
    id: '8',
    title: 'Next.js 14 & React — Full Stack',
    instructor: 'Maximilian Schwarzmüller',
    progress: 0,
    rating: 4.8,
    ratingCount: '(23,400)',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=480&h=270&fit=crop',
  },
  {
    id: '9',
    title: 'Clean Code & Software Craftsmanship',
    instructor: 'Various Instructors',
    progress: 0,
    rating: 4.5,
    ratingCount: '(9,800)',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=480&h=270&fit=crop',
  },
]
