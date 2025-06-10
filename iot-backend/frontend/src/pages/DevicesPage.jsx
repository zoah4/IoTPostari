import React, { useEffect, useState } from "react";
import { getDevices, getLatestTelemetry } from "../services/api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
//import "../App.css"

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
                setDevices(data.data || []); // pretpostavka da API vraća { data: [...] }
            })
            .catch((err) => {
                console.error("Greška pri dohvaćanju uređaja:", err);
            });
    }, [token]);

    useEffect(() => {
        if (!token || devices.length === 0) return;
        console.log(devices)
        devices.forEach((device) => {
            getLatestTelemetry(token, device.id.id)
            .then((data) => {
                const postaValue = data.posta && data.posta.length > 0 ? data.posta[0].value : "false";
                console.log(".", postaValue, ".")
                console.log(postaValue.trim() === "true")
                setDeviceStatuses((prev) => ({
                ...prev,
                [device.id.id]: postaValue.trim() === "true"
                }));
                console.log(deviceStatuses)
            })
            .catch((err) => {
                console.error(`Greška pri dohvaćanju telemetry za uređaj ${device.id.id}:`, err);
            });
        });
    }, [token, devices]);

    useEffect(() => {
        console.log("deviceStatuses updated:", deviceStatuses);
        console.log(deviceStatuses["c1678c90-3c04-11f0-a544-db21b46190ed"])
    }, [deviceStatuses]);

    const handleDeviceClick = (deviceId) => {
        navigate(`/notifications/${deviceId}`);
    };

    return (
        <div className="p-8">
            <Header />
            <h1 className="text-2xl font-bold mb-4">Lista uređaja</h1>
            {devices.length === 0 ? (
                <p>Nema uređaja.</p>
            ) : (
                <ul className="space-y-2">
                    {devices.map((device) => (
                        <li
                            key={device.id.id}
                            className="p-4 border rounded shadow hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleDeviceClick(device.id.id)}
                        >
                            <strong>{device.name}</strong> (ID: {device.id.id}) {deviceStatuses[device.id.id] && (
                                <span style={{display: "inline-block",
                                    width: "10px",         
                                    height: "10px",
                                    backgroundColor: "red",
                                    borderRadius: "50%",
                                    marginLeft: "8px"}}></span>
                              )}
                            
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DevicesPage;
