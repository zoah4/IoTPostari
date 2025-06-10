import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getDevices, getLatestTelemetry } from "../services/api";
import Header from "../components/Header";
import "leaflet/dist/leaflet.css";

const DeviceMap = ({ token: propToken }) => {
  const [devices, setDevices] = useState([]);
  const [token, setToken] = useState(propToken || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
      } else {
        console.warn("Nema tokena, potrebno se prijaviti.");
        setLoading(false);
        return;
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchDevicesAndTelemetry = async () => {
      try {
        setLoading(true);

        // 1️⃣ Dohvati uređaje
        const devicesData = await getDevices(token);
        const devices = devicesData.data || [];

        console.log(token)
        console.log(devices)

        // 2️⃣ Za svaki uređaj dohvati latest telemetry
        const telemetryPromises = devices.map(async (device) => {
            console.log("device:")
            console.log(device)
            try {
            
            const telemetry = await getLatestTelemetry(token, device.id.id);
            console.log(telemetry)
            console.log({ ...device, latestTelemetry: telemetry })
            return { ...device, latestTelemetry: telemetry };
          } catch (error) {
            console.error(`Greška za uređaj ${device.id.id}:`, error);
            return { ...device, latestTelemetry: null };
          }
        });

        const devicesWithTelemetry = await Promise.all(telemetryPromises);
        setDevices(devicesWithTelemetry);
      } catch (error) {
        console.error("Greška pri dohvaćanju uređaja ili telemetry podataka:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevicesAndTelemetry();
  }, [token]);

  if (loading) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Karta uređaja</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw"
        }}
      >
        <MapContainer
          center={[45.815399, 15.966568]}
          zoom={8}
          style={{
            height: "80vh",
            width: "80vw",
            border: "2px solid #ccc",
            borderRadius: "10px"
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {devices.map((device) => {
            let lat = null;
            let lon = null;

            if (device.latestTelemetry?.location && device.latestTelemetry.location.length > 0) {
                try {
                    const locationData = JSON.parse(device.latestTelemetry.location[0].value);
                    lat = locationData.latitude;
                    lon = locationData.longitude;
                } catch (err) {
                    console.error("Greška pri parsiranju location JSON-a:", err);
                }
            }

            lat = lat || device.location?.lat || device.latitude;
            lon = lon || device.location?.lon || device.longitude;

            if (lat && lon) {
              return (
                <Marker key={device.id.id} position={[lat, lon]}>
                  <Popup>
                    <strong>{device.name}</strong>
                    <br />
                    ID: {device.id.id}
                    <br />
                    Telemetry: {device.latestTelemetry ? JSON.stringify(device.latestTelemetry) : "Nema podataka"}
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default DeviceMap;
