// ** Third Party Components
import Chart from 'react-apexcharts'
import { Card, CardHeader, CardTitle, CardBody, CardSubtitle } from 'reactstrap'

// Dummy Data (replace with API call)
const usersByCourse = [
  { course: "React", users: 120 },
  { course: "Angular", users: 90 },
  { course: "Vue", users: 60 },
  { course: "Node.js", users: 150 },
  { course: "Python", users: 200 }
]

const ApexBarChart = () => {
  const categories = usersByCourse.map(item => item.course)
  const values = usersByCourse.map(item => item.users)

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        top: 2,
        left: 2,
        blur: 4,
        opacity: 0.1
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 6,
        distributed: true
      }
    },
    colors: ['#7367F0', '#28C76F', '#FF9F43', '#EA5455', '#00CFE8'],
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f1f1' },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: '13px', fontWeight: 500 }
      }
    },
    yaxis: {
      labels: {
        style: { fontSize: '13px' }
      }
    },
    tooltip: {
      theme: 'dark'
    }
  }

  const series = [{ name: 'Users', data: values }]

  return (
    <Card>
      <CardHeader>
        <div>
          <CardSubtitle className='text-muted mb-25'>Analytics</CardSubtitle>
          <CardTitle className='fw-bolder' tag='h4'>
            Users by Course
          </CardTitle>
        </div>
      </CardHeader>
      <CardBody>
        <Chart options={options} series={series} type='bar' height={400} />
      </CardBody>
    </Card>
  )
}

export default ApexBarChart