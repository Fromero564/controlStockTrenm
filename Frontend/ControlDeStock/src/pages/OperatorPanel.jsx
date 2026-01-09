import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../components/Navbar.jsx";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/operatorpanel.css";
import { AuthContext } from "../context/AuthProvider";

const OperatorPanel = () => {
  const navigate = useNavigate();
  const { can } = useContext(AuthContext); // viene del AuthProvider

  const sections = [
    {
      title: "INGRESOS",
      desc: "",
      viewPath: "/meat-load",
      newPath: "/provider-form",
      newText: "Nuevo ingreso",
      permView: "income.view",
      permNew: "income.create",
    },
    {
      title: "PROCESO PRODUCTIVO",
      desc: "",
      viewPath: "/list-production-process",
      newPath: "/production-process",
      newText: "Nuevo Proceso",
      permView: "process.view",
      permNew: "process.create",
    },
    {
      title: "STOCK",
      desc: "",
      viewPath: "/general-stock",
      newText: "Consultar stock",
      permView: "stock.view",
    },
    {
      title: "PROVEEDORES",
      desc: "",
      viewPath: "/provider-list",
      newPath: "/provider-load",
      newText: "Cargar",
      permView: "provider.view",
      permNew: "provider.create",
    },
    {
      title: "CONFIGURACION",
      desc: "",
      newPath: "/product-configuration",
      newText: "Agregar o modificar configuración",
      permNew: "config.product", // 👈 AHORA ESTA CARD TAMBIÉN TIENE PERMISO
    },
  ];

  // Muestro la card solo si tiene al menos uno de los permisos de la sección
  const visibleSections = sections.filter((section) => {
    const perms = [section.permView, section.permNew].filter(Boolean);

    // Si no definiste permisos para esa sección, la ve cualquiera logueado
    if (perms.length === 0) return true;

    // Si todavía no existe can en el contexto (para evitar errores), dejamos ver
    if (typeof can !== "function") return true;

    return perms.some((p) => can(p));
  });

  return (
    <div className="">
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button
          className="boton-volver"
          onClick={() => navigate("/dashboard")}
        >
          ⬅ Volver
        </button>
      </div>

      <h2 className="title">Producción y stock</h2>

      <div className="grid-container">
        {visibleSections.map((section, index) => (
          <div className="card" key={index}>
            <h3>{section.title}</h3>
            <p>{section.desc}</p>
            <div className="buttons">
              {section.viewPath &&
                (!section.permView || can?.(section.permView)) && (
                  <button
                    className="btn view-btn"
                    onClick={() => navigate(section.viewPath)}
                  >
                    Ver <FontAwesomeIcon icon={faEye} />
                  </button>
                )}

              {section.newPath &&
                (!section.permNew || can?.(section.permNew)) && (
                  <button
                    className="btn new-btn"
                    onClick={() => navigate(section.newPath)}
                  >
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
