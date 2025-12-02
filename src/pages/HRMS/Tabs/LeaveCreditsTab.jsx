export default function LeaveCreditsTab({ formData, handleInputChange, handleNext }) {
  return (
    <div className="tab-content">
      <div className="text-center py-5">
        <h4>Leave Credits Tab</h4>
        <p className="text-muted">Coming soon...</p>
      </div>
      
      <div className="d-flex justify-content-end">
        <button 
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          style={{ 
            padding: "10px 40px", 
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500"
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}