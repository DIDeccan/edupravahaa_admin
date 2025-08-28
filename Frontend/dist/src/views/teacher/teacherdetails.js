// ** React Imports
import { Fragment, useState, forwardRef } from 'react'

// ** Add New Modal Component
import AddNewModal from './addteacherdetails'

// ** Third Party Components
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus } from 'react-feather'
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Label,
  Row,
  Col
} from 'reactstrap'

// ** Sample Table Columns
const columns = [
  {
    name: 'Full Name',
    selector: row => row.full_name,
    sortable: true
  },
  {
    name: 'Email',
    selector: row => row.email,
    sortable: true
  },
  {
    name: 'Post',
    selector: row => row.post,
    sortable: true
  },
  {
    name: 'Age',
    selector: row => row.age,
    sortable: true
  },
  {
    name: 'Salary',
    selector: row => row.salary,
    sortable: true
  },
  {
    name: 'Start Date',
    selector: row => row.start_date,
    sortable: true
  },
  {
    name: 'Status',
    selector: row => row.status,
    sortable: true
  }
]

// ** Sample Data
const data = [
  {
    id: 1,
    full_name: 'John Doe',
    email: 'john@example.com',
    post: 'Software Engineer',
    age: '28',
    salary: '$5000',
    start_date: '2022-01-10',
    status: 1
  },
  {
    id: 2,
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    post: 'UI/UX Designer',
    age: '25',
    salary: '$4200',
    start_date: '2022-02-15',
    status: 2
  },
  {
    id: 3,
    full_name: 'Mike Johnson',
    email: 'mike@example.com',
    post: 'Project Manager',
    age: '35',
    salary: '$7500',
    start_date: '2021-12-01',
    status: 3
  }
]

// ** Bootstrap Checkbox Component
const BootstrapCheckbox = forwardRef(({ onClick, ...rest }, ref) => (
  <div className='custom-control custom-checkbox'>
    <input type='checkbox' className='custom-control-input' ref={ref} {...rest} />
    <label className='custom-control-label' onClick={onClick} />
  </div>
))

const DataTableWithButtons = () => {
  // ** States
  const [modal, setModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [filteredData, setFilteredData] = useState([])

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)

  // ** Function to handle filter
  const handleFilter = e => {
    const value = e.target.value
    let updatedData = []
    setSearchValue(value)

    if (value.length) {
      updatedData = data.filter(item => {
        return (
          item.full_name.toLowerCase().includes(value.toLowerCase()) ||
          item.email.toLowerCase().includes(value.toLowerCase()) ||
          item.post.toLowerCase().includes(value.toLowerCase()) ||
          item.age.toLowerCase().includes(value.toLowerCase()) ||
          item.salary.toLowerCase().includes(value.toLowerCase()) ||
          item.start_date.toLowerCase().includes(value.toLowerCase())
        )
      })
      setFilteredData(updatedData)
    }
  }

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=''
      nextLabel=''
      forcePage={currentPage}
      onPageChange={page => handlePagination(page)}
      pageCount={searchValue.length ? filteredData.length / 7 : data.length / 7 || 1}
      breakLabel='...'
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName='active'
      pageClassName='page-item'
      breakClassName='page-item'
      breakLinkClassName='page-link'
      nextLinkClassName='page-link'
      nextClassName='page-item next'
      previousClassName='page-item prev'
      previousLinkClassName='page-link'
      pageLinkClassName='page-link'
      containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
    />
  )

  // ** CSV Export function (same as yours)
  function convertArrayOfObjectsToCSV(array) {
    let result
    const columnDelimiter = ','
    const lineDelimiter = '\n'
    const keys = Object.keys(data[0])
    result = ''
    result += keys.join(columnDelimiter)
    result += lineDelimiter
    array.forEach(item => {
      let ctr = 0
      keys.forEach(key => {
        if (ctr > 0) result += columnDelimiter
        result += item[key]
        ctr++
      })
      result += lineDelimiter
    })
    return result
  }

  function downloadCSV(array) {
    const link = document.createElement('a')
    let csv = convertArrayOfObjectsToCSV(array)
    if (csv === null) return
    const filename = 'export.csv'
    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`
    }
    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', filename)
    link.click()
  }

  return (
    <Fragment>
      <Card>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h4'>Teacher Details</CardTitle>
          <div className='d-flex mt-md-0 mt-1'>
            <Button className='ml-2' color='primary' onClick={handleModal}>
              <span className='align-middle ml-50'>Add Instructor</span>
            </Button>
          </div>
        </CardHeader>
        <Row className='justify-content-end mx-0'>
          <Col className='d-flex align-items-center justify-content-end mt-1' md='2' sm='12'>
            <Label className='mr-1' for='search-input'>
              Search 
            </Label>
            &nbsp;
            <Input
              className='dataTable-filter mb-50'
              type='text'
              bsSize='sm'
              id='search-input'
              value={searchValue}
              onChange={handleFilter}
            />
          </Col>
        </Row>
        <DataTable
          noHeader
          pagination
          selectableRows
          columns={columns}
          paginationPerPage={7}
          className='react-dataTable'
          sortIcon={<ChevronDown size={10} />}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          data={searchValue.length ? filteredData : data}
          selectableRowsComponent={BootstrapCheckbox}
        />
      </Card>
      <AddNewModal open={modal} handleModal={handleModal} />
    </Fragment>
  )
}

export default DataTableWithButtons
