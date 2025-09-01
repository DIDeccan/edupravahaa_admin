
import { Container, Row, Col } from "reactstrap"
import ApexBarChart from "./BarChart"

const Dashboard = () => {
  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h4>Dashboard</h4>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <ApexBarChart />
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard
