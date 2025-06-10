import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DevicesPage from "./pages/DevicesPage";
import NotificationsPage from "./pages/NotificationsPage";
import DeviceMap from "./pages/DeviceMap";

const App = () => {
    const [token, setToken] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<LoginPage setToken={setToken} />} />
                <Route
                    path="/devices"
                    element={token ? <DevicesPage token={token} /> : <Navigate to="/login" />}
                />
                <Route path="/notifications/:deviceId" element={<NotificationsPage />} />
                <Route path="/map" element={<DeviceMap/>}/>
            </Routes>
        </Router>
    );
};

export default App;
