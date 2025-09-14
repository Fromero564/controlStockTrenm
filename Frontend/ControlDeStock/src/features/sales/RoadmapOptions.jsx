import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/Navbar";

const RoadmapOptions = () => {

    const navigate = useNavigate();

    const sections = [
       { title: "HOJAS DE RUTAS", desc: "", viewPath: "/", newPath: "/", newText: "Nueva hoja de ruta" },
        { title: "DESTINO", desc: "", viewPath: "/", newPath: "/", newText: "Agregar destino" },
        { title: "CAMION", desc: "", viewPath: "/",  newPath: "/", newText: "Agregar camión" },
        { title: "CHOFERES", desc: "", viewPath: "/list-drivers", newPath: "/load-new-driver", newText: "Agregar chofer" },
     
    ];

    return (
        <div className="">
            <Navbar/>
            <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate('/sales-panel')}>
                    ⬅ Volver
                </button>
            </div>
            <h2 className="title">Hojas de rutas</h2>

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

export default RoadmapOptions;
