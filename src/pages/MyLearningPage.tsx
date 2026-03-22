import { CourseGrid } from '../components/CourseGrid'
import { CourseToolbar } from '../components/CourseToolbar'
import { EngagementSection } from '../components/EngagementSection'
import { Header } from '../components/Header'
import { LearningSubNav } from '../components/LearningSubNav'

export function MyLearningPage() {
  return (
    <div className="ud-app">
      <Header />
      <LearningSubNav />
      <main className="ud-main">
        <EngagementSection />
        <CourseToolbar />
        <CourseGrid />
      </main>
    </div>
  )
}
