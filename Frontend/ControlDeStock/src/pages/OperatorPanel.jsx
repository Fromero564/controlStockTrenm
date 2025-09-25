
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../components/Navbar.jsx";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/operatorpanel.css";

const OperatorPanel = () => {

    const navigate = useNavigate();

    const sections = [
        { title: "INGRESOS", desc: "", viewPath: "/meat-load", newPath: "/provider-form", newText: "Nuevo ingreso" },
        { title: "PROCESO PRODUCTIVO", desc: "",viewPath: "/list-production-process", newPath: "/production-process", newText: "Nuevo Proceso" },
        { title: "STOCK", desc: "", viewPath: "/general-stock", newText: "Consultar stock" },
        { title: "PROVEEDORES", desc: "", viewPath: "/provider-list", newPath: "/provider-load", newText: "Cargar" },

        { title: "CONFIGURACION", desc: "", newPath: "/product-configuration", newText: "Agregar o modificar configuración" },

    ];

    return (
        <div className="">
            <Navbar />
            <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate("/dashboard")}>
                    ⬅ Volver
                </button>
            </div>

            <h2 className="title">Producción y stock</h2>

            <div className="grid-container">
                {sections.map((section, index) => (
                    <div className="card" key={index}>
                        <h3>{section.title}</h3>
                        <p>{section.desc}</p>
                        <div className="buttons">
                            {section.viewPath && (
                                <button className="btn view-btn" onClick={() => navigate(section.viewPath)}>
                                    Ver <FontAwesomeIcon icon={faEye} />
                                </button>
                            )}
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
