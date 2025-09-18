import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setClassLevel,
  setOriginalPrice,
  setDiscount,
  reset,
  fetchCalculatePrice,
} from "../../redux/priceSlice";

// Manually defined class list
const classList = [
  { id: 1, name: "Course 1" },
  { id: 2, name: "Course 2" },
  { id: 3, name: "Course 3" },
  { id: 4, name: "Course 4" },
  { id: 5, name: "Course 5" },
];

const PriceCalculator = () => {
  const dispatch = useDispatch();
  const {
    classLevel,
    originalPrice,
    discount,
    finalPrice,
    error,
    success,
    loading,
  } = useSelector((state) => state.pricing);

  const [previewPrice, setPreviewPrice] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const priceNum = parseFloat(originalPrice);
    const discountNum = parseFloat(discount);

    if (!isNaN(priceNum) && !isNaN(discountNum)) {
      const calcPrice =
        Math.round((priceNum - priceNum * (discountNum / 100) + Number.EPSILON) * 100) / 100;
      setPreviewPrice(calcPrice.toFixed(2));
    } else {
      setPreviewPrice("");
    }
  }, [originalPrice, discount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!classLevel || !originalPrice || !discount) {
      setWarning("⚠ Please fill out all the fields.");
      return;
    }
    setWarning("");

    dispatch(
      fetchCalculatePrice({
        course: parseInt(classLevel, 10),
        original_price: parseFloat(originalPrice),
        discount_percent: parseFloat(discount),
        final_price: parseFloat(previewPrice),
      })
    );
  };

  useEffect(() => {
    if (success || error || warning) {
      const timer = setTimeout(() => {
        dispatch(reset());
        setWarning("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, warning, dispatch]);

  return (
    <div className="px-2 price-calculator">
      <h2
        className="mt-2 mb-2 text-center"
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontWeight: 700,
          fontSize: "2.7rem",
          letterSpacing: "0.5px",
        }}
      >
        Price Calculator
      </h2>

      {(warning || success || error) && (
        <div
          className={`mx-auto mb-1 p-1 text-center fw-bold rounded ${
            warning
              ? "bg-light-warning text-dark"
              : success
              ? "bg-light-success text-white"
              : "bg-light-danger text-white"
          }`}
          style={{ maxWidth: "600px" }}
        >
          {warning ||
            (success ? "✅ Data submitted successfully!" : `❌ ${error}`)}
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="mb-3">
          <label className="form-label fs-4 fw-bold">Course</label>
          <select
            className="form-select price-calculator-field"
            value={classLevel || ""}
            onChange={(e) => dispatch(setClassLevel(e.target.value))}
          >
            <option value="">Select Course</option>
            {classList.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fs-4 fw-bold">Original Price (₹)</label>
          <input
            type="text"
            className="form-control price-calculator-field"
            value={originalPrice}
            onChange={(e) => dispatch(setOriginalPrice(e.target.value))}
            placeholder="Enter original price"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fs-4 fw-bold">Discount (%)</label>
          <input
            type="text"
            className="form-control price-calculator-field"
            value={discount}
            onChange={(e) => dispatch(setDiscount(e.target.value))}
            placeholder="Enter discount percentage"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fs-4 fw-bold">Final Price (₹)</label>
          <input
            type="text"
            className="form-control price-calculator-field"
            value={previewPrice ? `₹${previewPrice}` : ""}
            readOnly
            placeholder="Final price will be shown"
            style={{ backgroundColor: "#f9f9f9" }}
          />
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary w-48"
            disabled={loading}
            style={{ padding: "0.9rem" }}
          >
            {loading ? "Calculating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;