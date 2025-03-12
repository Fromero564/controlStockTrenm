import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs, faSignOutAlt, faChartBar, faCow, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import "./styles/dashboard.css";


const Dashboard = () => {
    const { user, userRol, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div>
            <div className="navbar">
                <a href="#" className="navbar-inicio">INICIO</a>
                <div className="navbar-options">
                    <a href="#">Configuración</a>
                    <a href="#" onClick={logout}>
                        <p>{user?.name || "Usuario"}</p>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                    </a>
                </div>
            </div>
            <div className="dashboard-title">
                <h1 >¡Hola, {user?.name || "Usuario"}!</h1>
            </div>
            <div className="dashboard-options">
                <a href="/operator-panel" className="dashboard-card">
                    <FontAwesomeIcon icon={faCow} size="2x" />
                    <span>Producción y stock</span>
                </a>

                <a href="" className="dashboard-card">
                    <FontAwesomeIcon icon={faDollarSign} size="2x" />
                    <span>Ventas y pedidos</span>
                </a>

                <a href="/administrative-panel" className="dashboard-card">
                    <FontAwesomeIcon icon={faChartBar} size="2x" />
                    <span>Administración y facturación</span>
                </a>
            </div>
        </div>
    );
};

export default Dashboard;
