// ** Reducers Imports
import navbar from './navbar'
import layout from './layout'
import auth from './authentication'
import dashboard from './analyticsSlice'
import teachers from './teacherSlice'
import students from './studentSlice'
import payments from './paymentSlice'


const rootReducer = {
  auth,
  navbar,
  layout,
  dashboard,
  teachers,
  students,
  payments

} 

export default rootReducer
