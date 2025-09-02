// ** Reducers Imports
import navbar from './navbar'
import layout from './layout'
import auth from './authentication'
import dashboard from'./DashboardSlice'

const rootReducer = {
  auth,
  navbar,
  layout,
  dashboard
  
  
}

export default rootReducer
