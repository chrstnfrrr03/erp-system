import {
    MdMenu,
    MdDashboard,
    MdPeople,
    MdAttachMoney,
    MdQrCodeScanner,
    MdPrecisionManufacturing,
    MdDescription,
    MdSettings,
} from "react-icons/md";

import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", icon: <MdDashboard />, path: "/" },
        { name: "HRMS", icon: <MdPeople />, path: "/hrms" },
        { name: "Payroll", icon: <MdAttachMoney />, path: "/payroll" },
        { name: "AIMS", icon: <MdQrCodeScanner />, path: "/aims" },
        { name: "MOMS", icon: <MdPrecisionManufacturing />, path: "/moms" },
        { name: "Reports", icon: <MdDescription />, path: "/reports" },
        { name: "Settings", icon: <MdSettings />, path: "/settings" },
    ];

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
                    style={{
                        cursor: "pointer",
                        color: "#444",
                        transition: "0.2s",
                    }}
                    onClick={() => setOpen(!open)}
                />
            </div>

            {/* MENU LINKS */}
            <nav
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {menuItems.map((item) => {
                    const isActive =
                        item.path === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: open ? "center" : "flex-start",
                                gap: open ? "0px" : "15px",
                                padding: "12px 15px",
                                borderRadius: "8px",
                                background: isActive
                                    ? "#667eea"
                                    : "transparent",
                                color: isActive ? "#fff" : "#444",
                                transition: "0.2s ease",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <span style={{ fontSize: "22px" }}>
                                {item.icon}
                            </span>

                            {!open && (
                                <span style={{ fontSize: "15px" }}>
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
