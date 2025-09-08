// ** Reducers Imports
import navbar from './navbar'
import layout from './layout'
import auth from './authentication'
import dashboard from './analyticsSlice'
import teachers from './teacherSlice'

const rootReducer = {
  auth,
  navbar,
  layout,
  dashboard,
  teachers
  
  
} 

export default rootReducer
