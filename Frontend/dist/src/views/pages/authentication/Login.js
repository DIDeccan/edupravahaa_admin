// ** React Imports
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'
import useJwt from '@src/auth/jwt/useJwt'

// ** Third Party Components
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { Facebook, Twitter, Mail, GitHub, HelpCircle, Coffee, X } from 'react-feather'


// ** Context
import { AbilityContext } from '@src/utility/context/Can'

// ** Custom Components
import Avatar from '@components/avatar'
import InputPasswordToggle from '@components/input-password-toggle'

// ** Utils
import { getHomeRouteForLoggedInUser } from '@utils'
import themeConfig from '@configs/themeConfig'

// ** Reactstrap Imports
import {
  Row,
  Col,
  Form,
  Input,
  Label,
  Alert,
  Button,
  CardText,
  CardTitle,
  FormFeedback,
  UncontrolledTooltip,
  Spinner
} from 'reactstrap'

// ** Illustrations Imports
import illustrationsLight from '@src/assets/images/pages/login-v2.svg'
import illustrationsDark from '@src/assets/images/pages/login-v2-dark.svg'

// ** Styles
import '@styles/react/pages/page-authentication.scss'
import { getProfile, loginUser } from '../../../redux/authentication'

const ToastContent = ({ t, name, role }) => {
  return (
    <div className='d-flex'>
      <div className='me-1'>
        <Avatar size='sm' color='success' icon={<Coffee size={12} />} />
      </div>
      <div className='d-flex flex-column'>
        <div className='d-flex justify-content-between'>
          <h6>{name}</h6>
          <X size={12} className='cursor-pointer' onClick={() => toast.dismiss(t.id)} />
        </div>
        <span>You have successfully logged in as an {role} user to Edu Pravahaa. Now you can start to explore. Enjoy!</span>
      </div>
    </div>
  )
}

const defaultValues = {
  password: '12345678',
  loginEmail: 'admin@gmail.com'
}

const Login = () => {
  // ** Hooks
  const { skin } = useSkin()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const ability = useContext(AbilityContext)
  const [loading, setLoading] = useState(false)
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const source = skin === 'dark' ? illustrationsDark : illustrationsLight

  const onSubmit = (data) => {
    if (Object.values(data).every(field => field.length > 0)) {
      console.log("clikc")
      setLoading(true)

      dispatch(loginUser({ identifier: data.loginEmail, password: data.password }))
        .unwrap()
        .then(res => {
          // ✅ Only continue if access token is there
          if (res.data.access) {

            // Call profile API
            dispatch(getProfile())
              .unwrap()
              .then(profile => {
                const fullUser = { ...profile.data, accessToken: res.data.access, refreshToken: res.data.refresh };
                console.log('Full User Data:', fullUser);
                navigate(getHomeRouteForLoggedInUser(fullUser.role))
                toast(t => (
                  <ToastContent
                    t={t}
                    role={profile.role || res.user_type || 'student'}
                    name={profile.fullName || profile.username || 'User'}
                  />
                ));
              })
              .catch(() => {
                setError('loginEmail', {
                  type: 'manual',
                  message: 'Failed to fetch profile. Try again.'
                });
              })
              .finally(() => setLoading(false))
          } else {
            setError('loginEmail', {
              type: 'manual',
              message: 'Login failed: No access token'
            });
            setLoading(false)
          }
        })
        .catch(err => {
          setError('loginEmail', {
            type: 'manual',
            message: err?.error || 'Login failed'
          });
          setLoading(false)
        });
    } else {
      for (const key in data) {
        if (data[key].length === 0) {
          setError(key, { type: 'manual' });
        }
      }
    }
  };





  return (
    <div className='auth-wrapper auth-cover'>


      <Row className='auth-inner m-0'>
    
          <Link className='brand-logo' to='/' onClick={e => e.preventDefault()}>
          {/* <span className='brand-logo'> */}
              <img src={themeConfig.app.appLogoImage} alt='logo' height={30} width={30} />
            {/* </span> */}
          <h2 className='brand-text text-primary ms-1'>Edu Pravahaa</h2>
        </Link>
        
      
        <Col className='d-none d-lg-flex align-items-center p-5' lg='8' sm='12'>
          <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
            <img className='img-fluid' src={source} alt='Login Cover' />
          </div>
        </Col>
        <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' lg='4' sm='12'>
          <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
            <CardTitle tag='h2' className='fw-bold mb-1'>
              Welcome to Edu Pravahaa! 👋
            </CardTitle>


            <Form className='auth-login-form mt-2' onSubmit={handleSubmit(onSubmit)}>
              <div className='mb-1'>
                <Label className='form-label' for='login-email'>
                  Email or Phone
                </Label>
                <Controller
                  id='loginEmail'
                  name='loginEmail'
                  control={control}
                  render={({ field }) => (
                    <Input
                      autoFocus
                      type=''
                      placeholder='Enter your email or phone number'
                      invalid={errors.loginEmail && true}
                      {...field}
                    />
                  )}
                />
                {errors.loginEmail && <FormFeedback>{errors.loginEmail.message}</FormFeedback>}
              </div>
              <div className='mb-1'>
                <div className='d-flex justify-content-between'>
                  <Label className='form-label' for='login-password'>
                    Password
                  </Label>
                  {/* <Link to='/forgot-password'>
                    <small>Forgot Password?</small>
                  </Link> */}
                </div>
                <Controller
                  id='password'
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <InputPasswordToggle className='input-group-merge' invalid={errors.password && true} {...field} />
                  )}
                />
              </div>
              <div className='form-check mb-1'>
                <Input type='checkbox' id='remember-me' />
                <Label className='form-check-label' for='remember-me'>
                  Remember Me
                </Label>
              </div>
              <Button type='submit' color='primary' block disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size='sm' color='light' className='me-50' />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </Form>
            {/* <p className='text-center mt-2'>
              <span className='me-25'>New on our platform?</span>
              <Link to='/register'>
                <span>Create an account</span>
              </Link>
            </p> */}
            {/* <div className='divider my-2'>
              <div className='divider-text'>or</div>
            </div>
            <div className='auth-footer-btn d-flex justify-content-center'>
              <Button color='facebook'>
                <Facebook size={14} />
              </Button>
              <Button color='twitter'>
                <Twitter size={14} />
              </Button>
              <Button color='google'>
                <Mail size={14} />
              </Button>
              <Button className='me-0' color='github'>
                <GitHub size={14} />
              </Button>
            </div> */}
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default Login

