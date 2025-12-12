export default function DeminimisTab({ formData, handleInputChange, handleSubmit }) {
  const inputStyle = {
    borderRadius: "8px",
    padding: "10px",
    fontSize: "14px",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: 600,
  };

  const sectionTitle = {
    fontWeight: 600,
    fontSize: "16px",
    paddingBottom: "8px",
    borderBottom: "2px solid #dee2e6",
    marginBottom: "20px",
  };

  return (
    <div className="tab-content" style={{ maxWidth: "100%", overflowX: "hidden" }}>

      {/* Section Title */}
      <h5 style={sectionTitle}>De Minimis Benefits</h5>

      {/* Row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>
            Clothing Allowance (USD):
          </label>
          <input
            type="number"
            name="clothing_allowance"
            value={formData.clothing_allowance}
            onChange={handleInputChange}
            className="form-control"
            placeholder="0.00"
            style={inputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>
            Rice Subsidy (USD):
          </label>
          <input
            type="number"
            name="rice_subsidy"
            value={formData.rice_subsidy}
            onChange={handleInputChange}
            className="form-control"
            placeholder="0.00"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>
            Meal Allowance (USD):
          </label>
          <input
            type="number"
            name="meal_allowance"
            value={formData.meal_allowance}
            onChange={handleInputChange}
            className="form-control"
            placeholder="0.00"
            style={inputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>
            Transportation Allowance (USD):
          </label>
          <input
            type="number"
            name="transportation_allowance"
            value={formData.transportation_allowance}
            onChange={handleInputChange}
            className="form-control"
            placeholder="0.00"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-success"
          onClick={handleSubmit}
          style={{
            padding: "10px 40px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}