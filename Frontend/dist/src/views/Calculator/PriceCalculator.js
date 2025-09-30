// ** React Imports
import { Fragment, useEffect, useState, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";


// ** Third Party Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Row,
  Col,
  Label,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import DataTable from "react-data-table-component";
import { ChevronDown, Trash2 } from "react-feather";

// ** Redux
import {
  fetchCourses,
  fetchCalculatePrice,
  fetchPriceList,
  deletePrice,
  setClassLevel,
  setOriginalPrice,
  setDiscount,
} from "../../redux/priceSlice";


const PriceCalculator = () => {
  const dispatch = useDispatch();

  const {
    classLevel,
    originalPrice,
    discount,
    finalPrice,
    courses,
    list,
    loading,
    error,
  } = useSelector((state) => state.pricing);

  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [previewPrice, setPreviewPrice] = useState("");

  // update preview when inputs change
  useEffect(() => {
    if (originalPrice && discount !== "" && !isNaN(discount)) {
      const calculated = Number(originalPrice) - (Number(originalPrice) * Number(discount)) / 100;
      setPreviewPrice(calculated.toFixed(2));
    } else {
      setPreviewPrice("");
    }
  }, [originalPrice, discount]);


  // Fetch courses + existing records
  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchPriceList());
  }, [dispatch]);

  const [errors, setErrors] = useState({
    classLevel: "",
    originalPrice: "",
    discount: "",
  });

  const handleCalculate = () => {
    let tempErrors = { classLevel: "", originalPrice: "" };
    let hasError = false;

    if (!classLevel) {
      tempErrors.classLevel = "Please select a course";
      hasError = true;
    }
    if (!originalPrice || Number(originalPrice) <= 0) {
      tempErrors.originalPrice = "Enter original price";
      hasError = true;
    }
    setErrors(tempErrors);
    if (hasError) return;

    const calculated = previewPrice || originalPrice;
    dispatch(
      fetchCalculatePrice({
        course: classLevel,
        original_price: originalPrice,
        discount_percent: discount,
        final_price: calculated,
      })
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        // push new record into table
        const newRecord = {
          id: res.payload.id,
          course: classLevel,
          original_price: originalPrice,
          discount_percent: discount,
          final_price: calculated,
          created_at: new Date().toISOString()
        };
        dispatch(fetchPriceList());

        // Clear form fields after submit
        dispatch(setClassLevel(""));
        dispatch(setOriginalPrice(""));
        dispatch(setDiscount(""));
        setPreviewPrice("");
        setErrors({ classLevel: "", originalPrice: "" });
      }
    });
  };

  // Updated handleDelete
  const handleDelete = async (id) => {
    setLoadingDeleteId(id);

    try {
      await dispatch(deletePrice(id)).unwrap();
    } catch (error) {
      console.error("Delete failed:", error);
      dispatch(fetchPriceList());
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleString();
  };

  const columns = [
    {
      name: "Course",
      selector: (row) => {
        const courseObj = courses.find((c) => c.id === row.course);
        return courseObj ? courseObj.name : row.course;
      },
      sortable: true,
    },
    {
      name: "Original Price (₹)",
      selector: (row) => row.original_price,
      sortable: true,
    },
    {
      name: "Discount (%)",
      selector: (row) => row.discount_percent,
      sortable: true,
    },
    {
      name: "Final Price (₹)",
      selector: (row) => row.final_price,
      sortable: true,
    },
    {
      name: "Date & Time",
      selector: (row) => formatDateTime(row.created_at),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <Trash2
          size={16}
          className={
            loadingDeleteId === row.id
              ? "text-muted cursor-not-allowed"
              : "text-danger cursor-pointer"
          }
          onClick={() => handleDelete(row.id)}
        />
      ),
    },
  ];

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
          : Math.ceil(list.length / 7) || 1
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

  // Bootstrap Checkbox Component
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

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <CardTitle tag="h4" className="pt-3 ps-2">Price Calculator</CardTitle>
        </CardHeader>
        <CardBody>
          {/* Form */}
          <Row className="px-4 pt-3 ps-2">
            <Col md="6">
              <Label>Course</Label>
              <Input
                type="select"
                value={classLevel || ""}
                onChange={(e) => dispatch(setClassLevel(e.target.value))}
                required
              >
                <option value="">Select Course</option>
                {courses.length === 0 ? (
                  <option disabled>Loading...</option>
                ) : (
                  courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))
                )}
              </Input>
              {errors.classLevel && <small className="text-danger">{errors.classLevel}</small>}
            </Col>

            <Col md="6">
              <Label>Original Price (₹)</Label>
              <Input
                type="number"
                value={originalPrice}
                onChange={(e) => dispatch(setOriginalPrice(e.target.value))}
                placeholder="Enter original price"
                required
              />
              {errors.originalPrice && <small className="text-danger ">{errors.originalPrice}</small>}
            </Col>

          </Row>

          <Row className="px-4 pt-3 ps-2">
            <Col md="6">
              <Label>Discount (%)</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => dispatch(setDiscount(e.target.value))}
                placeholder="Enter discount percentage"
                required
              />

            </Col>

            <Col md="6">
              <Label>Final Price (₹)</Label>
              <Input
                type="number"
                value={previewPrice || ""}
                readOnly
                placeholder="Final price will be shown"
                style={{
                  fontWeight: "bold",
                  color: "#000000",
                  backgroundColor: "#f9f9f9"
                }}
              />
            </Col>
          </Row>

          <Row className="px-4 pt-3 mb-3">
            <Col className="d-flex align-items-end justify-content-end">
              <Button
                color="primary"
                onClick={handleCalculate}
                disabled={loading}
              >Submit
              </Button>
            </Col>
          </Row>

          {error && <p className="text-danger mt-1">Error: {error}</p>}
        </CardBody>
      </Card>

      {/* ===== Table Card ===== */}
      <Card className="mt-2">
        <CardHeader>
          <CardTitle tag="h4">Calculated Prices</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
              <Spinner color="primary" />
            </div>
          ) : list.length > 0 ? (
            <DataTable
              noHeader
              pagination
              selectableRows
              columns={columns}
              data={list}
              paginationPerPage={7}
              className="react-dataTable"
              sortIcon={<ChevronDown size={10} />}
              paginationDefaultPage={currentPage + 1}
              paginationComponent={CustomPagination}
              selectableRowsComponent={BootstrapCheckbox}
            />
          ) : (
            <p className="text-center text-danger mb-0">No records found</p>
          )}
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default PriceCalculator;
