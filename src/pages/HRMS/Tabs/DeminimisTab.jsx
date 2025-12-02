export default function DeminimisTab({ formData, handleInputChange, handleSubmit }) {
  return (
    <div className="tab-content">
      <div className="text-center py-5">
        <h4>Deminimis Tab</h4>
        <p className="text-muted">Coming soon...</p>
      </div>
      
      <div className="d-flex justify-content-end">
        <button 
          type="button"
          className="btn btn-success"
          onClick={handleSubmit}
          style={{ 
            padding: "10px 40px", 
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500"
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}