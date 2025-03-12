import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import "./styles/operatorpanel.css";

const OperatorPanel = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const sections = [
        { title: "INGRESOS", desc: "Registra el ingreso de nuevos productos al stock del frigorífico.", viewPath: "/meat-load", newPath: "/provider-form", newText: "Nuevo ingreso" },
        { title: "DESPOSTE", desc: "Registra el ingreso de nuevos productos al stock del frigorífico.", viewPath: "/view-desposte", newPath: "/desposte", newText: "Nuevo desposte" },
        { title: "STOCK", desc: "Registra el ingreso de nuevos productos al stock del frigorífico.", viewPath: "/stock", newText: "Consultar stock" },
        { title: "PRODUCTOS Y SUBPRODUCTOS", desc: "Registra el ingreso de nuevos productos al stock del frigorífico.", viewPath: "/view-productos", newPath: "/carga-productos", newText: "Nueva carga" },
        { title: "PROVEEDORES", desc: "Registra el ingreso de nuevos productos al stock del frigorífico.", viewPath: "/view-proveedores", newPath: "/provider-load", newText: "Cargar" },
      
    ];

    return (
        <div className="">
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

            <h2 className="title">Producción y stock</h2>

            <div className="grid-container">
                {sections.map((section, index) => (
                    <div className="card" key={index}>
                        <h3>{section.title}</h3>
                        <p>{section.desc}</p>
                        <div className="buttons">
                            <button className="btn view-btn" onClick={() => navigate(section.viewPath)}>
                                Ver <FontAwesomeIcon icon={faEye} />
                            </button>
                            {section.newPath && (
                                <button className="btn new-btn" onClick={() => navigate(section.newPath)}>
                                    {section.newText} <FontAwesomeIcon icon={faPlus} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OperatorPanel;
