export default function LeaveCreditsTab({
    formData,
    handleInputChange,
    handleNext,
}) {
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
        <div
            className="tab-content"
            style={{ maxWidth: "100%", overflowX: "hidden" }}
        >
            {/* Leave Credits Header */}
            <h5 style={sectionTitle}>Leave Credits</h5>

            {/* Vacation Leave */}
            <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                    <label className="form-label" style={labelStyle}>
                        Vacation Leave Year:
                    </label>
                    <input
                        type="number"
                        name="vacation_year"
                        className="form-control"
                        value={formData.vacation_year}
                        onChange={handleInputChange}
                        placeholder="e.g., 2026"
                        style={inputStyle}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label" style={labelStyle}>
                        Vacation Leave Credits:
                    </label>
                    <input
                        type="number"
                        name="vacation_total"
                        className="form-control"
                        value={formData.vacation_total}
                        onChange={handleInputChange}
                        placeholder="Total credits"
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Sick Leave */}
            <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                    <label className="form-label" style={labelStyle}>
                        Sick Leave Year:
                    </label>
                    <input
                        type="number"
                        name="sick_year"
                        className="form-control"
                        value={formData.sick_year}
                        onChange={handleInputChange}
                        placeholder="e.g., 2026"
                        style={inputStyle}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label" style={labelStyle}>
                        Sick Leave Credits:
                    </label>
                    <input
                        type="number"
                        name="sick_total"
                        className="form-control"
                        value={formData.sick_total}
                        onChange={handleInputChange}
                        placeholder="Total credits"
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Emergency Leave */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                    <label className="form-label" style={labelStyle}>
                        Emergency Leave Year:
                    </label>
                    <input
                        type="number"
                        name="emergency_year"
                        className="form-control"
                        value={formData.emergency_year}
                        onChange={handleInputChange}
                        placeholder="e.g., 2026"
                        style={inputStyle}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label" style={labelStyle}>
                        Emergency Leave Credits:
                    </label>
                    <input
                        type="number"
                        name="emergency_total"
                        className="form-control"
                        value={formData.emergency_total}
                        onChange={handleInputChange}
                        placeholder="Total credits"
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
