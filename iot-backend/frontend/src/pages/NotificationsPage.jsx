import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDevices, getDeviceNotifications, getDeviceHistory, openDoor, getLatestTelemetry } from "../services/api";
import NotificationItem from "../components/NotificationItem";
import HistoryItem from "../components/HistoryItem";
import '../styles/NotificationsPage.css';

const NotificationsPage = ({ token: propToken }) => {
  const { deviceId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [token, setToken] = useState(propToken || null);
  const [timeRange, setTimeRange] = useState("7d");
  const [latestPostaValue, setLatestPostaValue] = useState(null);
  const [deviceName, setDeviceName] = useState('');

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
    if (!token || !deviceId) return;
  
    getDevices(token)
      .then((response) => {
        const devices = response.data; 
        if (!Array.isArray(devices)) {
          console.error("Devices nije niz:", devices);
          setDeviceName(`Uređaj ${deviceId}`);
          return;
        }
        const device = devices.find(d => d.id?.id === deviceId);
        setDeviceName(device?.name || `Uređaj ${deviceId}`);
      })
      .catch((err) => {
        console.error("Greška pri dohvaćanju liste uređaja:", err);
        setDeviceName(`Uređaj ${deviceId}`);
      });
  }, [token, deviceId]);
  


  useEffect(() => {
    if (!token || !deviceId) return;

    getDeviceNotifications(token, deviceId)
      .then((data) => {
        setNotifications(data.data || []);
      })
      .catch((err) => {
        console.error("Greška pri dohvaćanju obavijesti:", err);
      });
  }, [token, deviceId]);

  useEffect(() => {
    if (!token || !deviceId) return;

    const { startTs, endTs } = calculateTimeRange(timeRange);

    getDeviceHistory(token, deviceId, startTs, endTs)
      .then((data) => {
        const allItems = data.posta || [];
        const trueItems = allItems.filter(item => item.value === 'true');
        setHistory(trueItems);
      })
      .catch((err) => {
        console.error("Greška pri dohvaćanju povijesti:", err);
      });
  }, [token, deviceId, timeRange]);

  useEffect(() => {
    if (!token || !deviceId) return;
    getLatestTelemetry(token, deviceId)
      .then((data) => {
        const postaValue = data.posta && data.posta.length > 0 ? data.posta[0].value : "false";
        setLatestPostaValue(postaValue.trim() === "true");
      })
      .catch((err) => {
        console.error("Greška pri dohvaćanju latest telemetry:", err);
      });
  }, [token, deviceId]);

  useEffect(() => {
    if (!token || !deviceId) return;

    const intervalId = setInterval(async () => {
      try {
        const data = await getLatestTelemetry(token, deviceId);
        const postaValue = data.posta && data.posta.length > 0 ? data.posta[0].value : "false";
        const isOpen = postaValue.trim() === "true";
        setLatestPostaValue(isOpen);

        if (!isOpen) {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju latest telemetry:", err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [token, deviceId]);

  const handleOpenDoor = async (notif) => {
    try {
      console.log("Otključavanje vrata uređaja:", notif.id);
      await openDoor(token, deviceId);
    } catch (err) {
      console.error("Greška pri potvrđivanju:", err);
    }
  };

  const calculateTimeRange = (range) => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);

    switch (range) {
      case "7d":
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
    }

    return {
      startTs: start.getTime(),
      endTs: end.getTime()
    };
  };

  return (
    <div className="notifications-page">
      <h1>Obavijesti za uređaj: {deviceName || deviceId}</h1>
      {(!notifications.length || latestPostaValue === false) ? (
        <p>Nema obavijesti.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif) => (
            <li key={notif.id?.id || notif.id} className="notification-item">
              <NotificationItem notif={notif} />
            </li>
          ))}
        </ul>
      )}
      <div className="button-container">
        <button onClick={() => handleOpenDoor(deviceId)}>
          Otključaj vrata
        </button>
      </div>
      <h1>Povijest dolaska pošte za uređaj: {deviceName || deviceId}</h1>
      <div className="time-range-container">
        <label htmlFor="timeRange">Vremenski raspon:</label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7d">Zadnjih 7 dana</option>
          <option value="30d">Zadnjih 30 dana</option>
        </select>
      </div>

      {history.length === 0 ? (
        <p>Nema povijesti.</p>
      ) : (
        <div>
          <ul className="space-y-2">
            {history.map((historyItem) => (
              <li key={historyItem.ts} className="history-item">
                <HistoryItem history={historyItem} />
              </li>
            ))}
          </ul>
          <p className="mb-4">
            Ukupan broj zapisa: <strong>{history.length}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
