
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "./Navbar.jsx";
import { faEye, faPlus} from "@fortawesome/free-solid-svg-icons";
import "./styles/operatorpanel.css";

const OperatorPanel = () => {
   
    const navigate = useNavigate();

    const sections = [
        { title: "INGRESOS", desc: "Ingreso Mercaderia proveniente de proveedores", viewPath: "/meat-load", newPath: "/provider-form", newText: "Nuevo ingreso" },
        { title: "PROCESO PRODUCTIVO", desc: "Realiza el desposte de piezas cargadas para obtener productos y subproductos", viewPath: "/view-desposte", newPath: "/production-process", newText: "Nuevo desposte" },
        { title: "STOCK", desc: "Revisa el stock de piezas, productos y subproductos.", viewPath: "/general-stock", newText: "Consultar stock" },
        { title: "PROVEEDORES", desc: "Administa a los agentes que proveen de mercadería al frigorífico.", viewPath: "/view-proveedores", newPath: "/provider-load", newText: "Cargar" },
        { title: "CLIENTES", desc: "Administa a los clientes del frigorífico.", viewPath: "/view-proveedores", newPath: "/provider-load", newText: "Cargar" },
        { title: "CONFIGURACION", desc: "Registra las taras para medir el peso de las mismas al momento del pesaje.", viewPath: "/view-proveedores", newPath: "/tare-load", newText: "Cargar" },
      
    ];

    return (
        <div className="">
            <Navbar />

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
