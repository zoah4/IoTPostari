import React, { useEffect, useState } from "react";
import { getDevices, getLatestTelemetry } from "../services/api";
import { useNavigate } from "react-router-dom";
import '../styles/DevicesPage.css';  

const DevicesPage = ({ token: propToken }) => {
    const [devices, setDevices] = useState([]);
    const [token, setToken] = useState(propToken || null);
    const [deviceStatuses, setDeviceStatuses] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
            } else {
                console.warn("Nema tokena, potrebno se prijaviti.");
                return;
            }
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;

        getDevices(token)
            .then((data) => {
                setDevices(data.data || []); 
            })
            .catch((err) => {
                console.error("Greška pri dohvaćanju uređaja:", err);
            });
    }, [token]);

    useEffect(() => {
        if (!token || devices.length === 0) return;

        devices.forEach((device) => {
            getLatestTelemetry(token, device.id.id)
            .then((data) => {
                const postaValue = data.posta && data.posta.length > 0 ? data.posta[0].value : "false";
                setDeviceStatuses((prev) => ({
                    ...prev,
                    [device.id.id]: postaValue.trim() === "true"
                }));
            })
            .catch((err) => {
                console.error(`Greška pri dohvaćanju telemetry za uređaj ${device.id.id}:`, err);
            });
        });
    }, [token, devices]);

    const handleDeviceClick = (deviceId) => {
        navigate(`/notifications/${deviceId}`);
    };

    return (
        <div className="devices-page">
            <h1>Lista uređaja</h1>
            {devices.length === 0 ? (
                <p className="no-devices">Nema uređaja.</p>
            ) : (
                <ul className="devices-list">
                    {devices.map((device) => (
                        <li
                            key={device.id.id}
                            className="device-item"
                            onClick={() => handleDeviceClick(device.id.id)}
                        >
                            <strong>{device.name}</strong> (ID: {device.id.id}) 
                            {deviceStatuses[device.id.id] && <span className="status-indicator"></span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DevicesPage;
