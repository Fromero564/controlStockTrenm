import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import Navbar from "../components/Navbar.jsx";
import "../assets/styles/administrativepanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthProvider.jsx";

const AdministrativePanel = () => {
  const navigate = useNavigate();
  const { can } = useContext(AuthContext);

  const sections = [
    {
      title: "FACTURACIÓN",
      viewPath: "/invoice-list",
      newPath: "/invoice-create",
      newText: "Nueva factura",
      permView: "admin.invoices.view",
      permNew: "admin.invoices.new",
    },
    {
      title: "USUARIOS",
      viewPath: "/user-list",
      newPath: "/register",
      newText: "Nuevo usuario",
      permView: "admin.users.view",
      permNew: "admin.users.new",
    },
    {
      title: "REPORTES",
      viewPath: "/admin-reports",
      permView: "admin.reports.view",
    },
  ];

  const visibleSections = sections.filter((section) => {
    const perms = [section.permView, section.permNew].filter(Boolean);
    if (perms.length === 0) return true;
    if (typeof can !== "function") return true;
    return perms.some((p) => can(p));
  });

  return (
    <div>
      <Navbar />

      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/dashboard")}>⬅ Volver</button>
      </div>

      <h2 className="title">Administración</h2>

      <div className="grid-container">
        {visibleSections.map((section, index) => (
          <div className="card" key={index}>
            <h3>{section.title}</h3>
            <div className="buttons">
              {section.viewPath &&
                (!section.permView || can(section.permView)) && (
                  <button className="btn view-btn" onClick={() => navigate(section.viewPath)}>
                    Ver <FontAwesomeIcon icon={faEye} />
                  </button>
                )}

              {section.newPath &&
                (!section.permNew || can(section.permNew)) && (
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

export default AdministrativePanel;
