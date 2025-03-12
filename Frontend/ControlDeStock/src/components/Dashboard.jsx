import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faChartBar, faCow, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar.jsx";
import "./styles/dashboard.css";


const Dashboard = () => {
    const { user} = useContext(AuthContext);
  

    return (
        <div>
           
            <Navbar />

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
