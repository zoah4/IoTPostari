import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDeviceNotifications, getDeviceHistory, openDoor, getLatestTelemetry } from "../services/api";
import NotificationItem from "../components/NotificationItem"; 
import HistoryItem from "../components/HistoryItem";
import Header from "../components/Header";

const NotificationsPage = ({ token: propToken }) => {
  const { deviceId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [token, setToken] = useState(propToken || null);
  const [timeRange, setTimeRange] = useState("7d");
  const [latestPostaValue, setLatestPostaValue] = useState(null);

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
        const allItems = data.posta;
        console.log(allItems)
        const trueItems = allItems.filter(item => item.value === 'true');
        console.log(trueItems)

        setHistory(trueItems);
      })
      .catch((err) => {
        console.error("Greška pri dohvaćanju povijesti:", err);
      });
  }, [token, deviceId]);

  useEffect(() => {
    if (!token || !deviceId) return;
    getLatestTelemetry(token, deviceId)
      .then((data) => {
        const postaValue = data.posta && data.posta.length > 0 ? data.posta[0].value : "false";
        setLatestPostaValue(postaValue.trim() === "true");
        console.log(latestPostaValue)
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

        // Ako se vrata zatvore (postaValue == false), očisti obavijesti
        if (!isOpen) {
            setNotifications([]); // briše sve obavijesti
        }
        } catch (err) {
        console.error("Greška pri dohvaćanju latest telemetry:", err);
        }
    }, 3000); // provjerava svake 3 sekunde

    return () => clearInterval(intervalId); // očisti interval kad komponenta unmounta
  }, [token, deviceId]);


  const handleOpenDoor = async (notif) => {
    try {
      console.log(notif)
      console.log("Otključavanje vrata uređaja: ", notif.id);
      // Ovdje možeš pozvati backend API za potvrdu:
      await openDoor(token, deviceId);
      // Ili samo setati lokalno open state itd.
      // Za primjer:
      console.log(latestPostaValue)

    } catch (err) {
      console.error("Greška pri potvrđivanju:", err);
    }
  };

  const calculateTimeRange = (range) => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999); // kraj dana

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
        startTs: start.getTime(), // milisekunde
        endTs: end.getTime()
    };
  };


  return (
    <div className="p-8">
      <Header/>
      <h1 className="text-2xl font-bold mb-4">
        Obavijesti za uređaj ID: {deviceId}
      </h1>
      {notifications.length === 0 || latestPostaValue === false ? (
        <p>Nema obavijesti.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif) => (
            <NotificationItem key={notif.id?.id || notif.id} notif={notif} openDoor={handleOpenDoor}/>
          ))}
        </ul>
      )}
      <h1 className="text-2xl font-bold mb-4">
        Povijest za uređaj ID: {deviceId}
      </h1>
      <div className="mb-4">
        <label htmlFor="timeRange" className="mr-2 font-semibold">Vremenski raspon:</label>
        <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded p-2"
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
            {history.map((history) => (
                <HistoryItem key={history.ts} history={history}/>
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
