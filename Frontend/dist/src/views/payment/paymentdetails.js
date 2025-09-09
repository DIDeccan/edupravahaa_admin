// paymentdetails.js
import React, { Fragment, useState, useEffect, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments } from "../../redux/paymentSlice";
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import { ChevronDown } from "react-feather";
import {
  Card,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Row,
  Col,
  Button,
  Badge
} from "reactstrap";

// ** Table Columns
const columns = [
  { 
    name: "Start Date & Time", 
    selector: (row) => row.start_date, 
    sortable: true },

  { 
    name: "End Date & Time", 
    selector: (row) => row.end_date, 
    sortable: true 
  },
  { 
    name: "Course", 
    selector: (row) => row.course, 
    sortable: true 
  },
  {
    name: "Status", cell: (row) => {
      let color = "light-secondary";
      if (row.status?.toLowerCase() === "paid") color = "light-success";
      else if (row.status?.toLowerCase() === "pending") color = "light-warning";
      else if (row.status?.toLowerCase() === "failed") color = "light-danger";

      return <Badge color={color}>{row.status}</Badge>;
    }, 
    sortable: true
  },
];

// ** Bootstrap Checkbox Component
const BootstrapCheckbox = forwardRef(({ onClick, ...rest }, ref) => (
  <div className="custom-control custom-checkbox">
    <input
      type="checkbox"
      className="custom-control-input"
      ref={ref}
      {...rest}
    />
    <label className="custom-control-label" onClick={onClick} />
  </div>
));

const PaymentDetails = () => {
  const dispatch = useDispatch();
  const { list: payments, loading, error } = useSelector(
    (state) => state.payments
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Fetch payments on mount
  useEffect(() => {
    dispatch(fetchPayments()).then((res) => {
      console.log("Fetched payments:", res.payload);
    });
  }, [dispatch]);

  // Filtering logic
  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);

    if (value.length) {
      const updatedData = payments.filter((item) =>
        Object.values(item).join(" ").toLowerCase().includes(value)
      );
      setFilteredData(updatedData);
    } else {
      setFilteredData([]);
    }
  };

  // Pagination
  const handlePagination = (page) => setCurrentPage(page.selected);

  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=""
      nextLabel=""
      forcePage={currentPage}
      onPageChange={handlePagination}
      pageCount={
        searchValue.length
          ? Math.ceil(filteredData.length / 7)
          : Math.ceil(payments.length / 7) || 1
      }
      breakLabel="..."
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName="active"
      pageClassName="page-item"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      nextLinkClassName="page-link"
      nextClassName="page-item next"
      previousClassName="page-item prev"
      previousLinkClassName="page-link"
      pageLinkClassName="page-link"
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
    />
  );
  // ** CSV Export functions
  const convertArrayOfObjectsToCSV = array => {
    if (!array || !array.length) return null
    const columnDelimiter = ','
    const lineDelimiter = '\n'
    const keys = Object.keys(array[0])
    let result = ''
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

  const downloadCSV = array => {
    const link = document.createElement('a')
    let csv = convertArrayOfObjectsToCSV(array)
    if (!csv) return
    const filename = 'payments.csv'
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
        <CardHeader>
          <CardTitle tag="h4">Payment Details</CardTitle>
          <div className='d-flex mt-md-0 mt-1'>
            <Button color="success" className="ml-1"  onClick={() => downloadCSV(searchValue.length ? filteredData : payments) } >
              Export CSV
            </Button>
          </div>

        </CardHeader>

        <Row className="justify-content-end mx-0">
          <Col md="3" sm="12" className="d-flex align-items-center justify-content-end mt-1">
            <Label className="mr-1" for="search-input">
             </Label>
            <Input
              id="search-input"
              bsSize="sm"
              type="text"
              value={searchValue}
              onChange={handleFilter}
              placeholder="Search payments..."
            />
          </Col>
        </Row>

        {loading ? (
          <p className="p-2">Loading...</p>
        ) : error ? (
          <p className="p-2 text-danger">Error: {error}</p>
        ) : (
          <DataTable
            noHeader
            pagination
            selectableRows
            columns={columns}
            paginationPerPage={7}
            className="react-dataTable"
            sortIcon={<ChevronDown size={10} />}
            paginationDefaultPage={currentPage + 1}
            paginationComponent={CustomPagination}
            data={searchValue.length ? filteredData : payments || []}
            selectableRowsComponent={BootstrapCheckbox}
          />
        )}
      </Card>
    </Fragment>
  );
};

export default PaymentDetails;
