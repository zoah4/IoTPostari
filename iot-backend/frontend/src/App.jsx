import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DevicesPage from "./pages/DevicesPage";
import NotificationsPage from "./pages/NotificationsPage";
import DeviceMap from "./pages/DeviceMap";
import Header from "./components/Header";

const App = () => {
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    // Spremi token u localStorage kad se promijeni
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    const Layout = ({ children }) => {
        const location = useLocation();
        // Ne prikazuj header na login stranici
        if (location.pathname === "/login") {
            return children;
        }
        return (
            <>
                <Header />
                {children}
            </>
        );
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route
                    path="/login"
                    element={<LoginPage setToken={setToken} />}
                />
                <Route
                    path="/*"
                    element={
                        <Layout>
                            <Routes>
                                <Route
                                    path="devices"
                                    element={token ? <DevicesPage token={token} /> : <Navigate to="/login" />}
                                />
                                <Route
                                    path="notifications/:deviceId"
                                    element={token ? <NotificationsPage /> : <Navigate to="/login" />}
                                />
                                <Route
                                    path="map"
                                    element={token ? <DeviceMap token={token} /> : <Navigate to="/login" />}
                                />
                                {/* Dodaj catch-all redirect ako treba */}
                                <Route path="*" element={<Navigate to="/devices" />} />
                            </Routes>
                        </Layout>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
