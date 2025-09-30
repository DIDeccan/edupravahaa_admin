import React from "react";
import { Col } from 'reactstrap'
import PriceCalculator from "./PriceCalculator";

function CalculatorApp() {
  return (
      <Col sm='12'>
            <PriceCalculator />
        </Col>
  );
}

export default CalculatorApp;