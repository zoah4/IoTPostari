import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

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
            console.log(token)
            navigate("/map");
        } catch (err) {
            setError("Pogrešni podaci. Pokušajte ponovno.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-80">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1">Username</label>
                        <input
                            type="text"
                            className="border w-full p-2"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Password</label>
                        <input
                            type="password"
                            className="border w-full p-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
                    >
                        Prijavi se
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
