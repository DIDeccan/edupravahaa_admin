import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Chart from "react-apexcharts";
import { Card, CardHeader, CardTitle, CardBody, CardSubtitle } from "reactstrap";
import { fetchStudentCount } from "../redux/slices/DashboardSlice";

const ApexBarChart = () => {
  const dispatch = useDispatch();
  const { chartData, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchStudentCount()); // fetch API data
  }, [dispatch]);

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const categories = chartData.map((item) => item.course_name); // adjust field names according to API
  const values = chartData.map((item) => item.student_count);

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      dropShadow: { enabled: true, top: 2, left: 2, blur: 4, opacity: 0.1 },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "40%", borderRadius: 6, distributed: true },
    },
    colors: ["#7367F0", "#28C76F", "#FF9F43", "#EA5455", "#00CFE8"],
    dataLabels: { enabled: false },
    grid: { borderColor: "#f1f1f1" },
    xaxis: { categories, labels: { style: { fontSize: "13px", fontWeight: 500 } } },
    yaxis: { labels: { style: { fontSize: "13px" } } },
    tooltip: { theme: "dark" },
  };

  const series = [{ name: "Students", data: values }];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardSubtitle className="text-muted mb-25">Analytics</CardSubtitle>
          <CardTitle className="fw-bolder" tag="h4">Students by Course</CardTitle>
        </div>
      </CardHeader>
      <CardBody>
        <Chart options={options} series={series} type="bar" height={400} />
      </CardBody>
    </Card>
  );
};

export default ApexBarChart;

