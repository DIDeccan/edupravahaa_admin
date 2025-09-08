import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Flatpickr from 'react-flatpickr'
import { User, Mail, Calendar, Lock, Phone, X } from 'react-feather'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  InputGroup,
  InputGroupText,
  Input,
  Label
} from 'reactstrap'
import { registerTeacher } from '../../redux/teacherSlice'
import '@styles/react/libs/flatpickr/flatpickr.scss'

const AddNewModal = ({ open, handleModal }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    batch: [],
    weekdaysStartDate: '',
    weekendStartDate: '',
    weekdaysStart: '',
    weekdaysEnd: '',
    saturdayStart: '',
    saturdayEnd: '',
    sundayStart: '',
    sundayEnd: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const formatTime = date =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })

  const formatDate = date => date.toLocaleDateString('en-CA')

  const generateSchedule = () => {
    let schedule = []

    if (formData.batch.includes('weekdays')) {
      schedule.push({
        type: 'weekdays',
        startDate: formData.weekdaysStartDate,
        enddate: formData.weekdaysEndDate,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: `${formData.weekdaysStart} to ${formData.weekdaysEnd}`
      })
    }

    if (formData.batch.includes('weekend')) {
      if (formData.saturdayStart && formData.saturdayEnd) {
        schedule.push({
          type: 'weekend',
          startDate: formData.weekendStartDate,
          day: 'Saturday',
          time: `${formData.saturdayStart} to ${formData.saturdayEnd}`
        })
      }
      if (formData.sundayStart && formData.sundayEnd) {
        schedule.push({
          type: 'weekend',
          startDate: formData.weekendStartDate,
          day: 'Sunday',
          time: `${formData.sundayStart} to ${formData.sundayEnd}`
        })
      }
    }

    return schedule
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Map formData -> course_assignments format
    const courseAssignments = [
      {
        course_id: parseInt(formData.course, 10),
        batches: formData.batch || [],
        weekdays_start_date: formData.weekdaysStartDate || "",
        weekdays_end_date: formData.weekdaysEndDate || "",
        weekdays_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        weekdays_start: formData.weekdaysStart || "",
        weekdays_end: formData.weekdaysEnd || "",
        weekend_start_date: formData.weekendStartDate || "",
        weekend_end_date: formData.weekendEndDate || "",
        saturday_start: formData.saturdayStart || "",
        saturday_end: formData.saturdayEnd || "",
        sunday_start: formData.sundayStart || "",
        sunday_end: formData.sundayEnd || ""
      }
    ];


    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      course_assignments: courseAssignments,
    };

    console.log("Final Payload Sent:", payload);

    await dispatch(registerTeacher(payload));
    handleModal();
  };

  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className='sidebar-sm'
      modalClassName='modal-slide-in'
      contentClassName='pt-0'
    >
      <ModalHeader className='mb-3' toggle={handleModal} close={CloseBtn} tag='div'>
        <h5 className='modal-title'>New Teacher Registration</h5>
      </ModalHeader>
      <ModalBody className='flex-grow-1'>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <FormGroup>
            <Label for='name'>Full Name</Label>
            <InputGroup>
              <InputGroupText>
                <User size={15} />
              </InputGroupText>
              <Input
                id='name'
                name='name'
                placeholder='Enter full name'
                value={formData.name}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </FormGroup>

          {/* Course */}
          <FormGroup>
            <Label for='course'>Course</Label>
            <Input
              type='select'
              id='course'
              name='course'
              value={formData.course}
              onChange={handleChange}
              required
            >
              <option value=''>Select Course</option>
              <option value='3'>ReactJS</option>
              <option value='4'>Python</option>
              <option value='5'>Javascript</option>
              <option value='6'>NodeJS</option>
              <option value='7'>AWS</option>
            </Input>
          </FormGroup>

          {/* Batch */}
          <FormGroup>
            <Label>Batch Type</Label>
            <Input
              type='select'
              name='batch'
              multiple
              value={formData.batch}
              onChange={e => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setFormData({ ...formData, batch: selected })
              }}
              required
            >
              <option value='weekdays'>Weekdays</option>
              <option value='weekend'>Weekend</option>
            </Input>
            <small className="text-muted">
              Hold Ctrl (Windows) or Command (Mac) to select multiple batch types
            </small>
          </FormGroup>

          {/* Weekdays & Weekend Date/Time pickers */}


          {formData.batch.includes('weekdays') && (
            <>
              <FormGroup>
                <Label>Weekdays Course Start Date</Label>
                <Flatpickr
                  className='form-control'
                  options={{ dateFormat: 'Y-m-d' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, weekdaysStartDate: formatDate(date[0]) })
                    }
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Weekdays Course End Date</Label>
                <Flatpickr
                  className='form-control'
                  options={{ dateFormat: 'Y-m-d' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, weekdaysEndDate: formatDate(date[0]) })
                    }
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Weekdays Start Time</Label>
                <Flatpickr
                  className='form-control'
                  options={{ enableTime: true, noCalendar: true, dateFormat: 'h:i K' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, weekdaysStart: formatTime(date[0]) })
                    }
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Weekdays End Time</Label>
                <Flatpickr
                  className='form-control'
                  options={{ enableTime: true, noCalendar: true, dateFormat: 'h:i K' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, weekdaysEnd: formatTime(date[0]) })
                    }
                  }}
                />
              </FormGroup>
            </>
          )}



          {/* Weekend Date & Time */}
          {formData.batch.includes('weekend') && (
            <>
              <FormGroup>
                <Label>Weekend Course Start Date</Label>
                <Flatpickr
                  className='form-control'
                  options={{ dateFormat: 'Y-m-d' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, weekendStartDate: formatDate(date[0]) })
                    }
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Saturday Start Time</Label>
                <Flatpickr
                  className='form-control'
                  options={{ enableTime: true, noCalendar: true, dateFormat: 'h:i K' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, saturdayStart: formatTime(date[0]) })
                    }
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Saturday End Time</Label>
                <Flatpickr
                  className='form-control'
                  options={{ enableTime: true, noCalendar: true, dateFormat: 'h:i K' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, saturdayEnd: formatTime(date[0]) })
                    }
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Sunday Start Time</Label>
                <Flatpickr
                  className='form-control'
                  options={{ enableTime: true, noCalendar: true, dateFormat: 'h:i K' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, sundayStart: formatTime(date[0]) })
                    }
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Sunday End Time</Label>
                <Flatpickr
                  className='form-control'
                  options={{ enableTime: true, noCalendar: true, dateFormat: 'h:i K' }}
                  onChange={date => {
                    if (date.length > 0) {
                      setFormData({ ...formData, sundayEnd: formatTime(date[0]) })
                    }
                  }}
                />
              </FormGroup>
            </>
          )}

          {/* ... keep all Flatpickr inputs as before ... */}

          {/* Email */}
          <FormGroup>
            <Label for='email'>Email</Label>
            <InputGroup>
              <InputGroupText>
                <Mail size={15} />
              </InputGroupText>
              <Input
                type='email'
                id='email'
                name='email'
                placeholder='example@email.com'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </FormGroup>

          {/* Phone */}
          <FormGroup>
            <Label for='phone'>Phone Number</Label>
            <InputGroup>
              <InputGroupText>
                <Phone size={15} />
              </InputGroupText>
              <Input
                type='text'
                id='phone'
                name='phone'
                placeholder='Enter phone number'
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </FormGroup>

          {/* Password */}
          <FormGroup>
            <Label for='password'>Password</Label>
            <InputGroup>
              <InputGroupText>
                <Lock size={15} />
              </InputGroupText>
              <Input
                type='password'
                id='password'
                name='password'
                placeholder='Enter password'
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </FormGroup>

          {/* Confirm Password */}
          <FormGroup>
            <Label for='confirmPassword'>Confirm Password</Label>
            <InputGroup>
              <InputGroupText>
                <Lock size={15} />
              </InputGroupText>
              <Input
                type='password'
                id='confirmPassword'
                name='confirmPassword'
                placeholder='Re-enter password'
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </FormGroup>

          <Button color='primary' type='submit'>
            Submit
          </Button>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default AddNewModal
