import {
  MdMenu,
  MdDashboard,
  MdPeople,
  MdAttachMoney,
  MdQrCodeScanner,
  MdPrecisionManufacturing,
  MdAssessment,
  MdSettings,
  MdEventNote,
  MdPerson,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { can } from "../../utils/permissions";

export default function Sidebar({ open, setOpen, user }) {
  const location = useLocation();
  const permissions = user?.permissions || [];
  const role = user?.role || "";

  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdDashboard />,
      path: "/",
      permission: null,
    },
    {
      name: "HRMS",
      icon: <MdPeople />,
      path: "/hrms",
      permission: "access_hrms",
    },
    
    // ✅ My Profile - Only for employees
    ...(role === "employee" ? [{
      name: "My Profile",
      icon: <MdPerson />,
      path: `/hrms/employee/${user?.biometric_id || ''}`,
      permission: "employee.view",
    }] : []),
    
    // ✅ Applications - Dynamic label based on role
    {
      name: role === "employee" ? "My Applications" : "Applications",
      icon: <MdEventNote />,
      path: "/hrms/applications",
      permission: "access_hrms",
    },
    
    {
      name: "Payroll",
      icon: <MdAttachMoney />,
      path: "/payroll",
      permission: "access_payroll",
    },
    {
      name: "AIMS",
      icon: <MdQrCodeScanner />,
      path: "/aims",
      permission: "access_aims",
    },
    {
      name: "MOMS",
      icon: <MdPrecisionManufacturing />,
      external: true,
      url: "http://localhost:8001",
      permission: "access_moms",
    },
    {
      name: "Reports",
      icon: <MdAssessment />,
      path: "/reports",
      permission: "access_reports",
    },
    {
      name: "Settings",
      icon: <MdSettings />,
      path: "/settings",
      permission: "access_settings",
    },
  ];

  const visibleMenuItems = menuItems.filter(
    (item) => !item.permission || can(permissions, item.permission)
  );

  return (
    <aside
      style={{
        width: open ? "80px" : "240px",
        transition: "width 0.3s ease",
        background: "#ffffff",
        borderRight: "1px solid #e5e5e5",
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        padding: "20px 10px",
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        zIndex: 1000,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "center" : "space-between",
          marginBottom: "30px",
        }}
      >
        {!open && (
          <h2
            style={{
              fontWeight: 600,
              fontSize: "20px",
              color: "#333",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            ERP System
          </h2>
        )}

        <MdMenu
          size={24}
          style={{ cursor: "pointer", color: "#444" }}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* MENU */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {visibleMenuItems.map((item, index) => {
          const isActive =
            !item.external &&
            (item.path === "/"
              ? location.pathname === "/"
              : location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/"));

          if (item.external) {
            return (
              <a 
                key={`${item.name}-${index}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: open ? "center" : "flex-start",
                  gap: open ? "0px" : "15px",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  color: "#444",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "22px" }}>{item.icon}</span>
                {!open && <span>{item.name}</span>}
              </a>
            );
          }

          return (
            <Link
              key={`${item.name}-${index}`}
              to={item.path}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: open ? "center" : "flex-start",
                gap: open ? "0px" : "15px",
                padding: "12px 15px",
                borderRadius: "8px",
                background: isActive ? "#667eea" : "transparent",
                color: isActive ? "#fff" : "#444",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#f5f5f5";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "22px" }}>{item.icon}</span>
              {!open && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}