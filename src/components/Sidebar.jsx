import { FaBars, FaTachometerAlt, FaUsers, FaMoneyCheckAlt, FaBoxes, FaClipboardList, FaFileAlt, FaCog } from "react-icons/fa";

export default function Sidebar({ open, setOpen }) {
    const menuItems = [
        { name: "Dashboard", icon: <FaTachometerAlt />, active: true },
        { name: "HRMS", icon: <FaUsers />, active: false },
        { name: "Payroll", icon: <FaMoneyCheckAlt />, active: false },
        { name: "AIMS", icon: <FaClipboardList />, active: false },
        { name: "MOMS", icon: <FaBoxes />, active: false },
        { name: "Reports", icon: <FaFileAlt />, active: false },
        { name: "Settings", icon: <FaCog />, active: false },
    ];

    return (
        <aside
            style={{
                width: open ? "70px" : "250px",
                transition: "width 0.3s ease",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "20px 10px",
                minHeight: "100vh",
                position: "sticky",
                top: 0,
                boxShadow: "2px 0 10px rgba(0,0,0,0.05)"
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: open ? "center" : "space-between",
                    marginBottom: "30px",
                    padding: "0 5px"
                }}
            >
                {!open && (
                    <h2 style={{ 
                        fontWeight: "600", 
                        fontSize: "22px", 
                        color: "#333",
                        margin: 0 
                    }}>
                        ERP System
                    </h2>
                )}

                <FaBars
                    size={22}
                    style={{ 
                        cursor: "pointer",
                        color: "#555",
                        transition: "color 0.2s"
                    }}
                    onClick={() => setOpen(!open)}
                    onMouseEnter={(e) => e.target.style.color = "#667eea"}
                    onMouseLeave={(e) => e.target.style.color = "#555"}
                />
            </div>

            {/* LINKS */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: open ? "center" : "flex-start",
                            gap: "15px",
                            fontSize: "15px",
                            color: item.active ? "#fff" : "#555",
                            background: item.active ? "#667eea" : "transparent",
                            padding: open ? "12px 0" : "12px 15px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            if (!item.active) {
                                e.currentTarget.style.background = "#667eea";
                                e.currentTarget.style.color = "#fff";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!item.active) {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#555";
                            }
                        }}
                    >
                        <span style={{ 
                            fontSize: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "20px"
                        }}>
                            {item.icon}
                        </span>
                        {!open && <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>}
                    </div>
                ))}
            </nav>
        </aside>
    );
}