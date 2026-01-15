import Sidebar from "./Sidebar";
import Breadcrumb from "../Breadcrumb"; // ✅ ADD THIS IMPORT
import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

export default function DashboardLayout({ children }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // AUTO-COLLAPSE SIDEBAR ON MOBILE
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(true); 
            } else {
                setSidebarOpen(false); 
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f8f9fa",
                overflow: "hidden"
            }}
        >
            {/* SIDEBAR */}
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* MAIN CONTENT */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: isMobile ? "80px" : (sidebarOpen ? "80px" : "240px"),
                    transition: "margin-left 0.3s ease",
                    overflow: "hidden",
                    width: isMobile ? "calc(100vw - 80px)" : "auto"
                }}
            >
                {/* TOP BAR */}
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
                        flexShrink: 0
                    }}
                >
                    <div
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            position: "relative",
                        }}
                    >
                        <FaUserCircle size={28} color="#444" />
                        <span style={{ fontWeight: "500", color: "#333" }}>
                            Christian Ferrer
                        </span>

                        {showUserMenu && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "45px",
                                    right: 0,
                                    background: "#fff",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    borderRadius: "8px",
                                    padding: "8px 0",
                                    zIndex: 100,
                                    minWidth: "150px",
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
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.target.style.background = "#f5f5f5")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.target.style.background = "none")
                                    }
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* PAGE CONTENT */}
                <main
                    style={{
                        flex: 1,
                        padding: isMobile ? "15px" : "30px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        maxWidth: "100%"
                    }}
                >
                    {/* ✅ BREADCRUMB - Add this here */}
                    <Breadcrumb />
                    
                    {children}
                </main>
            </div>
        </div>
    );
}