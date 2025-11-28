import Sidebar from "./Sidebar";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

export default function DashboardLayout({ children }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ 
            display: "flex", 
            minHeight: "100vh",
            background: "#f8f9fa"
        }}>
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* RIGHT AREA */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

                {/* TOP NAVBAR */}
                <div
                    style={{
                        height: "60px",
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        padding: "0 20px",
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                    }}
                >
                    {/* User Icon + Name */}
                    <div
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{ 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "10px",
                            position: "relative"
                        }}
                    >
                        <FaUserCircle size={28} color="#444" />
                        <span style={{ fontWeight: "500", color: "#333" }}>Christian Ferrer</span>

                        {/* DROPDOWN */}
                        {showUserMenu && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "45px",
                                    right: "0",
                                    background: "#fff",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    borderRadius: "8px",
                                    padding: "8px 0",
                                    zIndex: 100,
                                    minWidth: "150px"
                                }}
                            >
                                <button
                                    style={{
                                        width: "100%",
                                        background: "none",
                                        border: "none",
                                        padding: "10px 20px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        color: "#444",
                                        fontSize: "14px",
                                        transition: "background 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                                    onMouseLeave={(e) => e.target.style.background = "none"}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <main
                    style={{
                        flex: 1,
                        padding: "30px",
                        overflowY: "auto",
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}