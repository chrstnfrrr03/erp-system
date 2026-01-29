import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import Layout from "../../components/layouts/DashboardLayout";
import { MdArrowBack, MdDownload, MdHome } from "react-icons/md";

export default function PayslipView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslip();
  }, [id]);

  const fetchPayslip = async () => {
    try {
      const res = await baseApi.get(`/api/payroll/payslip/${id}`);
      setPayslip(res.data);
    } catch (err) {
      console.error("Failed to fetch payslip:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!payslip) {
    return (
      <Layout>
        <div className="alert alert-danger">Payslip not found</div>
      </Layout>
    );
  }

  const payroll = payslip.payroll;
  const employee = payslip.employee;

  if (!payroll || !employee) {
    return (
      <Layout>
        <div className="alert alert-danger">
          Payslip data is incomplete. Missing payroll or employee information.
        </div>
      </Layout>
    );
  }

  const department = employee?.employment_information?.department?.name || 
                    employee?.employmentInformation?.department?.name || 
                    "N/A";

  return (
    <Layout>
      <div className="container-fluid px-4">
        {/* Header - No breadcrumb here */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">Payslip Details</h3>
          <div className="d-flex gap-2">
            {payslip.pdf_path && (
              <button
                className="btn btn-primary"
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_API_URL}/storage/${payslip.pdf_path}`,
                    "_blank"
                  )
                }
              >
                <MdDownload className="me-2" />
                Download PDF
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={() => navigate(-1)}
            >
              <MdArrowBack className="me-2" />
              Back
            </button>
          </div>
        </div>

        {/* Payslip Card */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-5">
            {/* Company Header */}
            <div className="text-center mb-5 pb-4 border-bottom">
              <h2 className="fw-bold mb-2">NEXTGEN TECHNOLOGY LIMITED</h2>
              <h4 className="text-muted">EMPLOYEE PAYSLIP</h4>
            </div>

            {/* Employee Info */}
            <div className="row mb-4">
              <div className="col-md-6">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="fw-bold" style={{ width: "180px" }}>
                        Employee Name:
                      </td>
                      <td>
                        {employee.first_name} {employee.last_name}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Employee ID:</td>
                      <td>{employee.biometric_id}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Department:</td>
                      <td>{department}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="fw-bold" style={{ width: "180px" }}>
                        Pay Period:
                      </td>
                      <td>
                        {formatDate(payroll.pay_period_start)} -{" "}
                        {formatDate(payroll.pay_period_end)}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Payment Date:</td>
                      <td>{formatDate(payroll.payment_date)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Pay Type:</td>
                      <td>{payroll.pay_type}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Earnings */}
            <h5 className="fw-bold mb-3">Earnings</h5>
            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base Salary ({payroll.days_worked || 0} days)</td>
                    <td className="text-end">
                      {formatCurrency(payroll.base_salary)}
                    </td>
                  </tr>
                  <tr>
                    <td>Regular Hours ({formatNumber(payroll.total_hours)} hrs)</td>
                    <td className="text-end">
                      {formatCurrency(
                        parseFloat(payroll.gross_pay || 0) - parseFloat(payroll.overtime_pay || 0)
                      )}
                    </td>
                  </tr>
                  {parseFloat(payroll.overtime_hours || 0) > 0 && (
                    <tr>
                      <td>
                        Overtime Pay ({formatNumber(payroll.overtime_hours)} hrs @ 1.5x)
                      </td>
                      <td className="text-end">
                        {formatCurrency(payroll.overtime_pay)}
                      </td>
                    </tr>
                  )}
                  {parseFloat(payroll.bonuses || 0) > 0 && (
                    <tr>
                      <td>Bonuses</td>
                      <td className="text-end">
                        {formatCurrency(payroll.bonuses)}
                      </td>
                    </tr>
                  )}
                  <tr className="table-secondary fw-bold">
                    <td>GROSS PAY</td>
                    <td className="text-end">
                      {formatCurrency(payroll.gross_pay)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <h5 className="fw-bold mb-3">Deductions</h5>
            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Deductions</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tax (10%)</td>
                    <td className="text-end text-danger">
                      -{formatCurrency(payroll.tax)}
                    </td>
                  </tr>
                  {parseFloat(payroll.nasfund || 0) > 0 && (
                    <tr>
                      <td>NASFUND (6%)</td>
                      <td className="text-end text-danger">
                        -{formatCurrency(payroll.nasfund)}
                      </td>
                    </tr>
                  )}
                  {parseFloat(payroll.other_deductions || 0) > 0 && (
                    <tr>
                      <td>Other Deductions (Late/Absences)</td>
                      <td className="text-end text-danger">
                        -{formatCurrency(payroll.other_deductions)}
                      </td>
                    </tr>
                  )}
                  <tr className="table-secondary fw-bold">
                    <td>TOTAL DEDUCTIONS</td>
                    <td className="text-end text-danger">
                      -{formatCurrency(payroll.deductions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Net Pay */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <tbody>
                  <tr className="table-success">
                    <td className="fw-bold fs-5">NET PAY</td>
                    <td className="text-end fw-bold fs-4 text-success">
                      {formatCurrency(payslip.net_pay)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Attendance Summary */}
            <h5 className="fw-bold mb-3">Attendance Summary</h5>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <div className="text-muted small">Days Worked</div>
                    <h4 className="fw-bold mb-0">{payroll.days_worked || 0}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <div className="text-muted small">Days Absent</div>
                    <h4 className="fw-bold mb-0">{payroll.days_absent || 0}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <div className="text-muted small">Days Late</div>
                    <h4 className="fw-bold mb-0">{payroll.days_late || 0}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-muted mt-5 pt-4 border-top">
              <p className="mb-1">
                This is a computer-generated payslip. No signature is required.
              </p>
              <p className="mb-0 small">
                Generated on {formatDate(payslip.generated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}