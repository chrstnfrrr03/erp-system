export default function AccountInformationTab({ formData, handleInputChange, handleNext }) {
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

      {/* Account Information Header */}
      <h5 style={sectionTitle}>Account Information</h5>

      {/* Row 1: Nasfund Number / TIN Number */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>Nasfund Number:</label>
          <input
            type="text"
            name="nasfund_number"
            className="form-control"
            value={formData.nasfund_number}
            onChange={handleInputChange}
            placeholder="Nasfund Number"
            style={inputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>TIN Number:</label>
          <input
            type="text"
            name="tin_number"
            className="form-control"
            value={formData.tin_number}
            onChange={handleInputChange}
            placeholder="TIN Number"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 2: Work Permit Number / Work Permit Expiry */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>Work Permit Number:</label>
          <input
            type="text"
            name="work_permit_number"
            className="form-control"
            value={formData.work_permit_number}
            onChange={handleInputChange}
            placeholder="Work Permit Number"
            style={inputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>Work Permit Expiry Date:</label>
          <input
            type="date"
            name="work_permit_expiry"
            className="form-control"
            value={formData.work_permit_expiry}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 3: Visa Number / Visa Expiry */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>Visa Number:</label>
          <input
            type="text"
            name="visa_number"
            className="form-control"
            value={formData.visa_number}
            onChange={handleInputChange}
            placeholder="Visa Number"
            style={inputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>Visa Expiry Date:</label>
          <input
            type="date"
            name="visa_expiry"
            className="form-control"
            value={formData.visa_expiry}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Bank Information Header */}
      <h5 style={sectionTitle}>Bank Information</h5>

      {/* Row 4: BSB Code / Bank Name */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>BSB Code:</label>
          <input
            type="text"
            name="bsb_code"
            className="form-control"
            value={formData.bsb_code}
            onChange={handleInputChange}
            placeholder="BSB Code"
            style={inputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>Bank Name:</label>
          <input
            type="text"
            name="bank_name"
            className="form-control"
            value={formData.bank_name}
            onChange={handleInputChange}
            placeholder="Bank Name"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 5: Account Number / Account Name */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>Account Number:</label>
          <input
            type="text"
            name="account_number"
            className="form-control"
            value={formData.account_number}
            onChange={handleInputChange}
            placeholder="Account Number"
            style={inputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={labelStyle}>Account Name:</label>
          <input
            type="text"
            name="account_name"
            className="form-control"
            value={formData.account_name}
            onChange={handleInputChange}
            placeholder="Account Name"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          style={{
            padding: "10px 40px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
