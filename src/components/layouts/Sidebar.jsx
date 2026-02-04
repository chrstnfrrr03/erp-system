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
  MdExpandMore,
  MdBuild,
} from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { can } from "../../utils/permissions";
import { useState } from "react";

export default function Sidebar({ open, setOpen, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = user?.permissions || [];
  const role = user?.role || "";
  
  // ✅ State for HRMS submenu
  const [hrmsExpanded, setHrmsExpanded] = useState(
    location.pathname.startsWith("/hrms")
  );

  // ✅ State for AIMS submenu
  const [aimsExpanded, setAimsExpanded] = useState(
    location.pathname.startsWith("/aims")
  );

  // ✅ State for AIMS Setup nested submenu
  const [aimsSetupExpanded, setAimsSetupExpanded] = useState(
    location.pathname.startsWith("/aims/setup")
  );

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
      hasSubmenu: true,
      submenu: [
        // ✅ My Profile - Only for employees
        ...(role === "employee" ? [{
          name: "My Profile",
          icon: <MdPerson />,
          path: `/hrms/employee/${user?.biometric_id || ''}`,
          permission: "employee.view",
        }] : []),
        
        // ✅ Leave & OT Requests
        {
          name: role === "employee" ? "My Requests" : "Leave & OT Requests",
          icon: <MdEventNote />,
          path: "/hrms/applications",
          permission: "access_hrms",
        },
      ],
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
      hasSubmenu: true,
      submenu: [
        {
          name: "Setup",
          icon: <MdBuild />,
          path: "/aims/setup",
          permission: "access_aims",
          hasNestedSubmenu: true,
          nestedSubmenu: [
            {
              name: "Sales Order",
              icon: <MdAssessment />,
              path: "/aims/setup/sales-order",
              permission: "access_aims",
            },
            {
              name: "Customers",
              icon: <MdPeople />,
              path: "/aims/setup/customers",
              permission: "access_aims",
            },
          ],
        },
      ],
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
        overflowY: "auto",
      }}
    >
      {/* HEADER */} 
      <div style={{ display: "flex", alignItems: "center", justifyContent: open ? "center" : "space-between", marginBottom: "30px", }} > 
        {!open && ( <h2 style={{ fontWeight: 600, fontSize: "20px", color: "#333", margin: 0, whiteSpace: "nowrap", }} > ERP System </h2> )} 
        <MdMenu size={24} style={{ cursor: "pointer", color: "#444" }} onClick={() => setOpen(!open)} /> 
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

          // ✅ External link (MOMS)
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

          // ✅ Menu item with submenu (HRMS or AIMS)
          if (item.hasSubmenu && !open) {
            const isExpanded = item.name === "HRMS" ? hrmsExpanded : aimsExpanded;
            const setExpanded = item.name === "HRMS" ? setHrmsExpanded : setAimsExpanded;

            return (
              <div key={`${item.name}-${index}`}>
                {/* Main Link */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 15px",
                    borderRadius: "8px",
                    background: isActive ? "#667eea" : "transparent",
                    color: isActive ? "#fff" : "#444",
                    transition: "background 0.2s ease",
                    cursor: "pointer",
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
                  <Link
                    to={item.path}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      flex: 1,
                      color: "inherit",
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                  
                  {/* ✅ Expand/Collapse Icon - Only toggles submenu */}
                  <span 
                    style={{ 
                      fontSize: "20px",
                      transition: "transform 0.2s ease",
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Prevent navigation
                      setExpanded(!isExpanded);
                    }}
                  >
                    <MdExpandMore />
                  </span>
                </div>

                {/* ✅ Submenu Items - Only show when expanded */}
                {isExpanded && (
                  <div style={{ 
                    marginLeft: "20px", 
                    marginTop: "5px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}>
                    {item.submenu
                      .filter(subItem => !subItem.permission || can(permissions, subItem.permission))
                      .map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path ||
                          location.pathname.startsWith(subItem.path + "/");
                        
                        // ✅ Nested submenu (AIMS > Setup)
                        if (subItem.hasNestedSubmenu) {
                          return (
                            <div key={`${subItem.name}-${subIndex}`}>
                              {/* Setup Item with expand icon */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "10px 15px",
                                  borderRadius: "8px",
                                  background: isSubActive ? "#e8eaf6" : "transparent",
                                  color: isSubActive ? "#667eea" : "#666",
                                  fontSize: "14px",
                                  transition: "all 0.2s ease",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSubActive) {
                                    e.currentTarget.style.background = "#f5f5f5";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSubActive) {
                                    e.currentTarget.style.background = "transparent";
                                  }
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    flex: 1,
                                  }}
                                >
                                  <span style={{ fontSize: "18px" }}>{subItem.icon}</span>
                                  <span>{subItem.name}</span>
                                </div>
                                
                                {/* Nested expand icon */}
                                <span
                                  style={{
                                    fontSize: "18px",
                                    transition: "transform 0.2s ease",
                                    transform: aimsSetupExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAimsSetupExpanded(!aimsSetupExpanded);
                                  }}
                                >
                                  <MdExpandMore />
                                </span>
                              </div>

                              {/* ✅ Nested submenu items */}
                              {aimsSetupExpanded && (
                                <div style={{
                                  marginLeft: "20px",
                                  marginTop: "5px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "5px",
                                }}>
                                  {subItem.nestedSubmenu
                                    .filter(nestedItem => !nestedItem.permission || can(permissions, nestedItem.permission))
                                    .map((nestedItem, nestedIndex) => {
                                      const isNestedActive = location.pathname === nestedItem.path ||
                                        location.pathname.startsWith(nestedItem.path + "/");
                                      
                                      return (
                                        <Link
                                          key={`${nestedItem.name}-${nestedIndex}`}
                                          to={nestedItem.path}
                                          style={{
                                            textDecoration: "none",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "8px 12px",
                                            borderRadius: "8px",
                                            background: isNestedActive ? "#d5d9f7" : "transparent",
                                            color: isNestedActive ? "#667eea" : "#777",
                                            fontSize: "13px",
                                            transition: "all 0.2s ease",
                                          }}
                                          onMouseEnter={(e) => {
                                            if (!isNestedActive) {
                                              e.currentTarget.style.background = "#f0f0f0";
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!isNestedActive) {
                                              e.currentTarget.style.background = "transparent";
                                            }
                                          }}
                                        >
                                          <span style={{ fontSize: "16px" }}>{nestedItem.icon}</span>
                                          <span>{nestedItem.name}</span>
                                        </Link>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        // ✅ Regular submenu item
                        return (
                          <Link
                            key={`${subItem.name}-${subIndex}`}
                            to={subItem.path}
                            style={{
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "10px 15px",
                              borderRadius: "8px",
                              background: isSubActive ? "#e8eaf6" : "transparent",
                              color: isSubActive ? "#667eea" : "#666",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.background = "#f5f5f5";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.background = "transparent";
                              }
                            }}
                          >
                            <span style={{ fontSize: "18px" }}>{subItem.icon}</span>
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          }

          // ✅ Regular menu item (no submenu) or sidebar collapsed
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