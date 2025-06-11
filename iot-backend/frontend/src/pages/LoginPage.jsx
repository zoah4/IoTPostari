import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import '../styles/LoginPage.css';  
const LoginPage = ({ setToken }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await login(username, password);
            setToken(token);
            localStorage.setItem("token", token);
            navigate("/map");
        } catch (err) {
            setError("Pogrešni podaci. Pokušajte ponovno.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="error">{error}</div>}
                    <button type="submit">Prijavi se</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
