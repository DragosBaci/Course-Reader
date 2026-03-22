import { Route, Routes } from 'react-router-dom'
import { CoursePlayerPage } from './pages/CoursePlayerPage'
import { MyLearningPage } from './pages/MyLearningPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MyLearningPage />} />
      <Route path="/course/:courseId" element={<CoursePlayerPage />} />
    </Routes>
  )
}
