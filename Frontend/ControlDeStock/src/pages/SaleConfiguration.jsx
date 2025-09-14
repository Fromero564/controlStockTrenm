import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../components/Navbar.jsx";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/salespanel.css";

const SaleConfiguration = () => {

    const navigate = useNavigate();

    const sections = [
        { title: "CONDICION DE VENTA", desc: "", viewPath: "/list-sell-condition", newPath: "/sale-condition-load", newText: "Nueva condicion de venta" },
        { title: "CONDICION DE COBRO", desc: "", viewPath: "/list-payment-condition", newPath: "/payment-condition-load", newText: "Nueva condicion de cobro" },
    ];

    return (
        <div className="">
            <Navbar />
            <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate('/sales-panel')}>
                    ⬅ Volver
                </button>
            </div>
            <h2 className="title">Configuracion de ventas</h2>

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

export default SaleConfiguration;
