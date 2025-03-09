import { useContext} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import "./styles/operatorpanel.css";

const OperatorPanel = () => {
    const { user, userRol, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    return (
        <div>
            <div className="navbar">
                <a href="/dashboard" className="navbar-inicio">INICIO</a>
                <div className="navbar-options">
                    <a href="#">Configuración</a>
                    <a href="#" onClick={logout}>
                        <p>{user?.name || "Usuario"}</p>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                    </a>
                </div>
            </div>
            <h2>Panel Operaciones</h2>
            <button onClick={() => navigate("/meat-load")}>Ingreso Mercaderia</button>
            <button onClick={() => console.log("Boton a completar")}>Desposte</button>
            <button onClick={() => console.log("Boton a completar")}>Consultar Stock</button>
            <button onClick={() => console.log("Boton a completar")}>Proveedores</button>
            <button onClick={() => console.log("Boton a completar")}>Productos & subproductos (Carga)</button>
            <button onClick={() => navigate("/dashboard")}>Volver al dashboard</button>
        </div>
    );
}


export default OperatorPanel;