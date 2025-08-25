
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../../components/Navbar.jsx";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";


const configurationProduct = () => {

    const navigate = useNavigate();

    const sections = [


        { title: "PRODUCTOS", desc: "", viewPath: "/all-products-availables", newPath: "/product-load", newText: "Nuevo producto" },
        { title: "TARAS", desc: "", viewPath: "/all-tares", newPath: "/tare-load", newText: "Nueva tara" },
        { title: "CATEGORIAS", desc: "", viewPath: "/product-categories-list", newPath: "/category-load", newText: "Nueva categoria" },
        { title: "ALMACENES", desc: "", viewPath: "/warehouses-list", newPath: "/warehouse-load", newText: "Nuevo almacen" },
    ];

    return (
        <div className="">
            <Navbar />
        <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate("/operator-panel")}>
                    ⬅ Volver
                </button>
            </div>

            <h2 className="title">Configuración</h2>

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

export default configurationProduct;