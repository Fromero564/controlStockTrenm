
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../components/Navbar.jsx";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/salespanel.css";

const SalesPanel = () => {

    const navigate = useNavigate();

    const sections = [
     
      
{ title: "CLIENTES", desc: "Administa a los clientes del frigorífico.", viewPath: "/client-list", newPath: "/client-load", newText: "Cargar" },

    ];

    return (
        <div className="">
            <Navbar />

            <h2 className="title">Administrativo</h2>

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

export default SalesPanel;
