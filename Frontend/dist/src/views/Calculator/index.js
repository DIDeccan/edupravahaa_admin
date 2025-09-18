import React from 'react';
import PriceCalculator from './PriceCalculator';

function CalculatorApp() {
  return (
    <div className="px-2 py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-4">
          <div className="card shadow-md p-4">
            <PriceCalculator/>     
              </div>
        </div>
      </div>
    </div>
  );
}

export default CalculatorApp;