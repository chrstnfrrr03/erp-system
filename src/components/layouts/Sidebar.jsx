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
  MdLocalGasStation,
  MdDirectionsCar,
  MdInventory,
  MdPlayArrow,
  MdBarChart,
  MdSchedule,
  MdAssignment,
  MdWarning,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { can } from "../../utils/permissions";
import { useState } from "react";

export default function Sidebar({ open, setOpen, user }) {
  const location = useLocation();
  const permissions = user?.permissions || [];
  const role = user?.role || "";
  
  const [hrmsExpanded, setHrmsExpanded] = useState(
    location.pathname.startsWith("/hrms")
  );

  const [aimsExpanded, setAimsExpanded] = useState(
    location.pathname.startsWith("/aims")
  );

  const [aimsSetupExpanded, setAimsSetupExpanded] = useState(
    location.pathname.startsWith("/aims/setup")
  );

  const [momsExpanded, setMomsExpanded] = useState(
    location.pathname.startsWith("/moms")
  );

  const [momsMaintenanceExpanded, setMomsMaintenanceExpanded] = useState(
    location.pathname.startsWith("/moms/maintenance")
  );

  const [momsOperationsExpanded, setMomsOperationsExpanded] = useState(
    location.pathname.startsWith("/moms/operations")
  );

  const [momsFinanceExpanded, setMomsFinanceExpanded] = useState(
    location.pathname.startsWith("/moms/finance")
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
        ...(role === "employee" ? [{
          name: "My Profile",
          icon: <MdPerson />,
          path: `/hrms/employee/${user?.biometric_id || ''}`,
          permission: "employee.view",
        }] : []),
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
      path: "/moms",
      permission: "access_moms",
      hasSubmenu: true,
      submenu: [
        {
          name: "Machines",
          icon: <MdPrecisionManufacturing />,
          path: "/moms/machines",
          permission: "access_moms",
        },
        {
          name: "Operators",
          icon: <MdPeople />,
          path: "/moms/operators",
          permission: "access_moms",
        },
        {
          name: "Assignments",
          icon: <MdAssignment />,
          path: "/moms/assignments",
          permission: "access_moms",
        },
        {
          name: "Fuel",
          icon: <MdLocalGasStation />,
          path: "/moms/fuel",
          permission: "access_moms",
        },
        {
          name: "Breakdowns",
          icon: <MdWarning />,
          path: "/moms/breakdowns",
          permission: "access_moms",
        },
        {
          name: "Maintenance",
          icon: <MdBuild />,
          path: "/moms/maintenance",
          permission: "access_moms",
          hasNestedSubmenu: true,
          nestedSubmenu: [
            {
              name: "Logs",
              icon: <MdEventNote />,
              path: "/moms/maintenance/logs",
              permission: "access_moms",
            },
            {
              name: "Schedules",
              icon: <MdSchedule />,
              path: "/moms/maintenance/schedules",
              permission: "access_moms",
            },
          ],
        },
        {
          name: "Fleets",
          icon: <MdDirectionsCar />,
          path: "/moms/fleets",
          permission: "access_moms",
        },
        {
          name: "Inventory",
          icon: <MdInventory />,
          path: "/moms/inventory",
          permission: "access_moms",
        },
        {
          name: "Operations",
          icon: <MdPlayArrow />,
          path: "/moms/operations",
          permission: "access_moms",
          hasNestedSubmenu: true,
          nestedSubmenu: [
            {
              name: "Start Shift",
              icon: <MdPlayArrow />,
              path: "/moms/operations/start-shift",
              permission: "access_moms",
            },
            {
              name: "Daily Ops",
              icon: <MdBarChart />,
              path: "/moms/operations/daily-ops",
              permission: "access_moms",
            },
          ],
        },
        {
          name: "Finance",
          icon: <MdAttachMoney />,
          path: "/moms/finance",
          permission: "access_moms",
          hasNestedSubmenu: true,
          nestedSubmenu: [
            {
              name: "Fuel Costs",
              icon: <MdLocalGasStation />,
              path: "/moms/finance/fuel-costs",
              permission: "access_moms",
            },
            {
              name: "Pricing",
              icon: <MdAttachMoney />,
              path: "/moms/finance/pricing",
              permission: "access_moms",
            },
          ],
        },
      ],
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
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fixed Header */}
      <div
        style={{
          padding: "20px 10px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "center" : "space-between",
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
      </div>

      {/* Scrollable Navigation */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          padding: "10px",
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",
        }}
        className="custom-scrollbar"
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>

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
                  gap: open ? "0px" : "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  color: "#444",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
                {!open && <span style={{ fontSize: "14px" }}>{item.name}</span>}
              </a>
            );
          }

          if (item.hasSubmenu && !open) {
            const isExpanded =
              item.name === "HRMS"
                ? hrmsExpanded
                : item.name === "AIMS"
                ? aimsExpanded
                : item.name === "MOMS"
                ? momsExpanded
                : false;

            const setExpanded =
              item.name === "HRMS"
                ? setHrmsExpanded
                : item.name === "AIMS"
                ? setAimsExpanded
                : item.name === "MOMS"
                ? setMomsExpanded
                : null;

            return (
              <div key={`${item.name}-${index}`} style={{ marginBottom: "4px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: isActive ? "#5b5fc7" : "transparent",
                    color: isActive ? "#fff" : "#444",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    !isActive && (e.currentTarget.style.background = "#f5f5f5")
                  }
                  onMouseLeave={(e) =>
                    !isActive && (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Link
                    to={item.path}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flex: 1,
                      color: "inherit",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: "14px" }}>{item.name}</span>
                  </Link>

                  <span
                    style={{
                      fontSize: "18px",
                      transition: "transform 0.2s ease",
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      flexShrink: 0,
                      borderRadius: "4px",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpanded(!isExpanded);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <MdExpandMore />
                  </span>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginLeft: "16px",
                      marginTop: "4px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      paddingLeft: "8px",
                      borderLeft: "2px solid #e5e7eb",
                    }}
                  >
                    {item.submenu
                      .filter((subItem) => !subItem.permission || can(permissions, subItem.permission))
                      .map((subItem, subIndex) => {
                        const isSubActive =
                          location.pathname === subItem.path ||
                          location.pathname.startsWith(subItem.path + "/");

                        if (subItem.hasNestedSubmenu) {
                          const isNestedExpanded =
                            (item.name === "AIMS" && subItem.name === "Setup" && aimsSetupExpanded) ||
                            (item.name === "MOMS" && subItem.name === "Maintenance" && momsMaintenanceExpanded) ||
                            (item.name === "MOMS" && subItem.name === "Operations" && momsOperationsExpanded) ||
                            (item.name === "MOMS" && subItem.name === "Finance" && momsFinanceExpanded);

                          return (
                            <div key={`${subItem.name}-${subIndex}`}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 10px",
                                  borderRadius: "6px",
                                  background: isSubActive ? "#e8eaf6" : "transparent",
                                  color: isSubActive ? "#5b5fc7" : "#666",
                                  fontSize: "13px",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                  !isSubActive && (e.currentTarget.style.background = "#f5f5f5")
                                }
                                onMouseLeave={(e) =>
                                  !isSubActive && (e.currentTarget.style.background = "transparent")
                                }
                              >
                                <div 
                                  style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "10px", 
                                    flex: 1,
                                    cursor: "default"
                                  }}
                                >
                                  <span style={{ fontSize: "16px", flexShrink: 0 }}>{subItem.icon}</span>
                                  <span>{subItem.name}</span>
                                </div>

                                <span
                                  style={{
                                    fontSize: "16px",
                                    transition: "transform 0.2s ease",
                                    transform: isNestedExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                                    flexShrink: 0,
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (item.name === "AIMS" && subItem.name === "Setup") {
                                      setAimsSetupExpanded(!aimsSetupExpanded);
                                    } else if (item.name === "MOMS" && subItem.name === "Maintenance") {
                                      setMomsMaintenanceExpanded(!momsMaintenanceExpanded);
                                    } else if (item.name === "MOMS" && subItem.name === "Operations") {
                                      setMomsOperationsExpanded(!momsOperationsExpanded);
                                    } else if (item.name === "MOMS" && subItem.name === "Finance") {
                                      setMomsFinanceExpanded(!momsFinanceExpanded);
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(0,0,0,0.1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <MdExpandMore />
                                </span>
                              </div>

                              {isNestedExpanded && (
                                <div
                                  style={{
                                    marginLeft: "16px",
                                    marginTop: "2px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px",
                                    paddingLeft: "8px",
                                    borderLeft: "2px solid #e5e7eb",
                                  }}
                                >
                                  {subItem.nestedSubmenu
                                    .filter((nestedItem) => !nestedItem.permission || can(permissions, nestedItem.permission))
                                    .map((nestedItem, nestedIndex) => {
                                      const isNestedActive =
                                        location.pathname === nestedItem.path ||
                                        location.pathname.startsWith(nestedItem.path + "/");

                                      return (
                                        <Link
                                          key={`${nestedItem.name}-${nestedIndex}`}
                                          to={nestedItem.path}
                                          style={{
                                            textDecoration: "none",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            padding: "7px 10px",
                                            borderRadius: "6px",
                                            background: isNestedActive ? "#d5d9f7" : "transparent",
                                            color: isNestedActive ? "#5b5fc7" : "#777",
                                            fontSize: "12px",
                                            transition: "all 0.2s ease",
                                          }}
                                          onMouseEnter={(e) =>
                                            !isNestedActive && (e.currentTarget.style.background = "#f0f0f0")
                                          }
                                          onMouseLeave={(e) =>
                                            !isNestedActive && (e.currentTarget.style.background = "transparent")
                                          }
                                        >
                                          <span style={{ fontSize: "14px", flexShrink: 0 }}>{nestedItem.icon}</span>
                                          <span>{nestedItem.name}</span>
                                        </Link>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={`${subItem.name}-${subIndex}`}
                            to={subItem.path}
                            style={{
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              background: isSubActive ? "#e8eaf6" : "transparent",
                              color: isSubActive ? "#5b5fc7" : "#666",
                              fontSize: "13px",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                              !isSubActive && (e.currentTarget.style.background = "#f5f5f5")
                            }
                            onMouseLeave={(e) =>
                              !isSubActive && (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <span style={{ fontSize: "16px", flexShrink: 0 }}>{subItem.icon}</span>
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
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
                gap: open ? "0px" : "12px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: isActive ? "#5b5fc7" : "transparent",
                color: isActive ? "#fff" : "#444",
                transition: "background 0.2s ease",
                marginBottom: "4px",
              }}
              onMouseEnter={(e) =>
                !isActive && (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                !isActive && (e.currentTarget.style.background = "transparent")
              }
            >
              <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
              {!open && <span style={{ fontSize: "14px" }}>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}