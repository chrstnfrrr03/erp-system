export default function PersonalInfoTab({ formData, handleInputChange, handleNext }) {
  const handleSameAsPresent = (e) => {
    const checked = e.target.checked;

    handleInputChange({
      target: {
        name: "same_as_present",
        type: "checkbox",
        checked: checked
      }
    });

    if (checked) {
      handleInputChange({
        target: {
          name: "home_address",
          value: formData.present_address
        }
      });
    }
  };

  return (
    <div className="tab-content" style={{ maxWidth: "100%", overflowX: "hidden" }}>

      {/* Row 1: Birthdate, Age, Birth Place */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Birthdate:</label>
          <input
            type="date"
            name="birthdate"
            className="form-control"
            value={formData.birthdate}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Age:</label>
          <input
            type="number"
            name="age"
            className="form-control"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Age"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Birth Place:</label>
          <input
            type="text"
            name="birth_place"
            className="form-control"
            value={formData.birth_place}
            onChange={handleInputChange}
            placeholder="Birth Place"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Row 2: Nationality, Civil Status, Religion */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Nationality:</label>
          <input
            type="text"
            name="nationality"
            className="form-control"
            value={formData.nationality}
            onChange={handleInputChange}
            placeholder="Nationality"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Civil Status:</label>
          <select
            name="civil_status"
            className="form-select"
            value={formData.civil_status}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          >
            <option value="">Select Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Religion:</label>
          <input
            type="text"
            name="religion"
            className="form-control"
            value={formData.religion}
            onChange={handleInputChange}
            placeholder="Religion"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Row 3: Gender */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Gender:</label>
          <div style={{ display: "flex", gap: "20px", paddingTop: "6px" }}>
            <div className="form-check">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleInputChange}
                className="form-check-input"
                id="genderMale"
              />
              <label className="form-check-label" htmlFor="genderMale" style={{ fontSize: "14px" }}>Male</label>
            </div>

            <div className="form-check">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleInputChange}
                className="form-check-input"
                id="genderFemale"
              />
              <label className="form-check-label" htmlFor="genderFemale" style={{ fontSize: "14px" }}>Female</label>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Present Address */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Present Address:</label>
          <input
            type="text"
            name="present_address"
            className="form-control"
            value={formData.present_address}
            onChange={handleInputChange}
            placeholder="Present Address"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Row 5: Home Address + Checkbox */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between mb-1">
            <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Home Address:</label>
            <div className="form-check">
              <input
                type="checkbox"
                name="same_as_present"
                checked={formData.same_as_present}
                onChange={handleSameAsPresent}
                className="form-check-input"
                id="sameAsPresent"
              />
              <label className="form-check-label" htmlFor="sameAsPresent" style={{ fontSize: "14px", color: "#007bff" }}>
                -- Same as Present Address --
              </label>
            </div>
          </div>

          <input
            type="text"
            name="home_address"
            className="form-control"
            value={formData.home_address}
            onChange={handleInputChange}
            disabled={formData.same_as_present}
            placeholder="Home Address"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Row 6: Email + Mobile Number */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Email Address:</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter Email or N/A if None"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Mobile Number:</label>
          <input
            type="text"
            name="mobile_number"
            className="form-control"
            value={formData.mobile_number}
            onChange={handleInputChange}
            placeholder="Mobile Number"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Row 7: Dependents + Lodged */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>No. of Dependents:</label>
          <input
            type="number"
            name="no_of_dependents"
            className="form-control"
            value={formData.no_of_dependents}
            onChange={handleInputChange}
            placeholder="No. of Dependents"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Declaration of Lodged:</label>
          <select
            name="declaration_of_lodged"
            className="form-select"
            value={formData.declaration_of_lodged}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {/* Emergency Section */}
      <div className="mb-4">
        <h5 className="mb-3" style={{ fontWeight: "600", fontSize: "15px", borderBottom: "2px solid #dee2e6", paddingBottom: "10px" }}>
          In case of Emergency
        </h5>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Contact Person:</label>
            <input
              type="text"
              name="emergency_contact_person"
              className="form-control"
              value={formData.emergency_contact_person}
              onChange={handleInputChange}
              placeholder="Contact Person"
              style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Contact Number:</label>
            <input
              type="text"
              name="emergency_contact_number"
              className="form-control"
              value={formData.emergency_contact_number}
              onChange={handleInputChange}
              placeholder="Contact Number"
              style={{ borderRadius: "8px", padding: "10px", fontSize: "14px" }}
            />
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          style={{
            padding: "10px 40px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
