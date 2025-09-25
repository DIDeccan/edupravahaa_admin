import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setClassLevel,
  setOriginalPrice,
  setDiscount,
  reset,
  fetchCalculatePrice,
  fetchCourses,
} from "../../redux/priceSlice";

const PriceCalculator = () => {
  const dispatch = useDispatch();
  const { classLevel, originalPrice, discount, error, success, loading, courses } =
    useSelector((state) => state.pricing);

  const [previewPrice, setPreviewPrice] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

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
    <div className="price-calculator px-2">
      {(warning || success || error) && (
        <div
          className={`price-calculator-alert ${
            warning ? "bg-light-warning" : success ? "bg-light-success" : "bg-light-danger"
          }`}
        >
          {warning || (success ? "✅ Data submitted successfully!" : `❌ ${error}`)}
        </div>
      )}

      <h2 className="price-calculator-title">Price Calculator</h2>

      {/* Course Dropdown */}
      <div className="field-wrapper" style={{ maxWidth: "1400px", width: "100%" }}>
        <label htmlFor="course">Course</label>
        <select
          id="course"
          className="price-calculator-field"
          value={classLevel || ""}
          onChange={(e) => dispatch(setClassLevel(e.target.value))}
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
        </select>
      </div>

      {/* Original Price */}
      <div className="field-wrapper" style={{ maxWidth: "1400px", width: "100%" }}>
        <label htmlFor="original-price">Original Price (₹)</label>
        <input
          id="original-price"
          type="text"
          className="price-calculator-field"
          value={originalPrice}
          onChange={(e) => dispatch(setOriginalPrice(e.target.value))}
          placeholder="Enter original price"
        />
      </div>

      {/* Discount */}
      <div className="field-wrapper" style={{ maxWidth: "1400px", width: "100%" }}>
        <label htmlFor="discount">Discount (%)</label>
        <input
          id="discount"
          type="text"
          className="price-calculator-field"
          value={discount}
          onChange={(e) => dispatch(setDiscount(e.target.value))}
          placeholder="Enter discount percentage"
        />
      </div>

      {/* Final Price */}
      <div className="field-wrapper" style={{ maxWidth: "1400px", width: "100%" }}>
        <label htmlFor="final-price">Final Price (₹)</label>
        <input
          id="final-price"
          type="text"
          className="price-calculator-field final-price-field"
          value={previewPrice ? `₹${previewPrice}` : ""}
          readOnly
          placeholder="Final price will be shown"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? "Calculating..." : "Submit"}
      </button>
    </div>
  );
};

export default PriceCalculator;
