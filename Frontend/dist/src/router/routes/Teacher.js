import { lazy } from 'react'

const TeacherDetails = lazy(() => import('../../views/teacher'))

const TeacherRoutes = [
  {
    path: '/teacherdetails',
    element: <TeacherDetails />
  }
]

export default TeacherRoutes
