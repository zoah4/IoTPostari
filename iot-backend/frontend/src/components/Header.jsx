import React from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Header.css'; 

const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header>
      <h1>IoT Dashboard</h1>
      <nav>
        <Link to="/devices">Devices Page</Link>
        <Link to="/map">Device Map</Link>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
};

export default Header;
