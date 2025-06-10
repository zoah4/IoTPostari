import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        borderBottom: "1px solid #ccc",
        paddingBottom: "0.5rem",
      }}
    >
      <h1 className="text-2xl font-bold">IoT Dashboard</h1>
      <nav>
        <Link to="/devices" style={{ marginRight: "1rem" }}>
          Devices Page
        </Link>
        <Link to="/map" style={{ marginRight: "1rem" }}>
          Device Map
        </Link>
        <button onClick={handleLogout} style={{ color: "red" }}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
