import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../components/Navbar.jsx";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/salespanel.css";

const SalesPanel = () => {

    const navigate = useNavigate();

    const sections = [
        { title: "PEDIDOS", desc: "", viewPath: "/list-orders", newPath: "/sales-orders-new", newText: "Nuevo pedido" },
        { title: "ÓRDENES DE VENTA", desc: "", viewPath: "/list-final-orders", newText: "Nueva orden" },
        { title: "REMITOS", desc: "", viewPath: "/remito-list", newPath: "/remito-new", newText: "Generar remito" },
        { title: "VENDEDORES", desc: "", viewPath: "/seller-list", newPath: "/seller-new", newText: "Nuevo vendedor" },
        { title: "PREFACTURACIONES", desc: "", viewPath: "/prefact-list", newPath: "/prefact-new", newText: "Nueva prefacturación" },
        { title: "REPORTES", desc: "", viewPath: "/report-list", newPath: null, newText: null },
        { title: "CLIENTES", desc: "", viewPath: "/client-list", newPath: "/client-load", newText: "Cargar" },
        { title: "HOJA DE RUTA", desc: "", viewPath: "/route-list", newPath: "/route-new", newText: "Nueva hoja de ruta" },
         { title: "LISTADO DE PRECIOS", desc: "", viewPath: "/price-list-general", newPath: "/new-price-list", newText: "Nueva lista de precios" },
          { title: "CONFIGURACIÓN", desc: "", newPath: "/sale-configuration", newText: "Agregar configuracion+" },
    ];

    return (
        <div className="">
            <Navbar />
            <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate(-1)}>
                    ⬅ Volver
                </button>
            </div>
            <h2 className="title">Ventas y pedidos</h2>

            <div className="grid-container">
                {sections.map((section, index) => (
                    <div className="card" key={index}>
                        <h3>{section.title}</h3>
                        {section.desc && <p>{section.desc}</p>}
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

export default SalesPanel;
