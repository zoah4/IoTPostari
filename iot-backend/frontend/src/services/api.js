import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api"; // zamijeni s tvojim backend URL-om

export const login = async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
    localStorage.setItem("token", response.data.token);
    return response.data.token;
};

export const getDevices = async (token) => {
    const response = await axios.get(`${API_BASE_URL}/devices`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const getDeviceNotifications = async (token, deviceId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/notifications`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; // vraća podatke direktno
    } catch (err) {
        console.error("Greška pri dohvaćanju obavijesti:", err);
        throw err;
    }
};

export const getLatestTelemetry = async (token, deviceId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/telemetry/latest`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response)
        console.log(response.data)
        return response.data;
    } catch(err) {
        console.log("Greška prilikom dohvaćanja telemetry podataka")
    }
    
}

export const getDeviceHistory = async (token, deviceId, startTs, endTs, limit = 500) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/telemetry/history`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                startTs,
                endTs, 
                limit
            }
        });
        console.log(response)
        return response.data;
    } catch(err) {
        console.log("Greška prilikom dohvaćanja history podataka")
    }
}

export const openDoor = async (token, deviceId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/devices/${deviceId}/opendoor`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      {}
    );
    return response.data;
  } catch (err) {
    console.error("Greška pri potvrđivanju obavijesti:", err);
    throw err;
  }
};



