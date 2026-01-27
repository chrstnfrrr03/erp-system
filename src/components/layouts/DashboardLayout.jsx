import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dropdown,
    Modal,
    Button,
    Navbar,
    Container,
    Nav,
} from "react-bootstrap";

import Sidebar from "./Sidebar";
import Breadcrumb from "../Breadcrumb";
import { useAuth } from "../../contexts/AuthContext";
import baseApi from "../../api/baseApi";

export default function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    /* ==============================
       RESPONSIVE SIDEBAR
    ============================== */
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setSidebarOpen(mobile);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login", { replace: true });
        }
    }, [loading, user, navigate]);

    if (loading || !user) return null;

    // ✅ FIXED: Get first name + last name initials only
    const getInitials = (name = "") => {
        const parts = name.trim().split(" ").filter(Boolean);
        
        if (parts.length === 0) return "";
        if (parts.length === 1) return parts[0][0].toUpperCase();
        
        // Take first letter of first word and last word
        const firstInitial = parts[0][0];
        const lastInitial = parts[parts.length - 1][0];
        
        return (firstInitial + lastInitial).toUpperCase();
    };

    const handleLogout = async () => {
        try {
            await baseApi.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light overflow-hidden">
            {/* SIDEBAR */}
            <Sidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
                user={user}
            />

            {/* MAIN CONTENT */}
            <div
                className="flex-grow-1 d-flex flex-column"
                style={{
                    marginLeft: isMobile
                        ? "80px"
                        : sidebarOpen
                        ? "80px"
                        : "240px",
                    transition: "margin-left 0.3s ease",
                }}
            >
                {/* TOP NAVBAR */}
                <Navbar bg="white" className="border-bottom px-4">
                    <Container fluid>
                        <Nav className="ms-auto align-items-center">
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="light"
                                    className="d-flex align-items-center gap-2 border-0 bg-transparent shadow-none"
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            backgroundColor: "#0c2c55",
                                            color: "#fff",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {getInitials(user.name)}
                                    </div>

                                    <span className="fw-medium">
                                        {user.name}
                                    </span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="shadow-sm">
                                    <Dropdown.Item
                                        onClick={() => setShowLogoutModal(true)}
                                    >
                                        Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Container>
                </Navbar>

                {/* PAGE CONTENT */}
                <main className="flex-grow-1 p-4 overflow-auto">
                    <Breadcrumb />
                    {children}
                </main>
            </div>

            {/* LOGOUT MODAL */}
            <Modal
                show={showLogoutModal}
                onHide={() => setShowLogoutModal(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100 text-center fw-semibold">
                        Sign out of your account?
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center px-4">
                    <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            backgroundColor: "#fdecea",
                            color: "#b02a37",
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        !
                    </div>

                    <p className="mb-1">
                        You'll be signed out and need to log in again to
                        continue.
                    </p>

                    <p className="text-muted small mb-0">
                        Currently signed in as{" "}
                        <strong>{user.name}</strong>
                    </p>
                </Modal.Body>

                <Modal.Footer className="border-0 justify-content-center gap-2 pb-4">
                    <Button
                        onClick={() => setShowLogoutModal(false)}
                        style={{
                            backgroundColor: "#0c2c55",
                            borderColor: "#0c2c55",
                        }}
                    >
                        Stay Logged In
                    </Button>

                    <Button variant="danger" onClick={handleLogout}>
                        Sign Out
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}