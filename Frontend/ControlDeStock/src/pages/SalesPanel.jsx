import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../components/Navbar.jsx";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/salespanel.css";
import { AuthContext } from "../context/AuthProvider.jsx";

const SalesPanel = () => {
  const navigate = useNavigate();
  const { can } = useContext(AuthContext);

  const sections = [
    {
      title: "PEDIDOS",
      viewPath: "/list-orders",
      newPath: "/sales-orders-new",
      newText: "Nuevo pedido",
      permView: "sales.orders.view",
      permNew: "sales.orders.new",
    },
    {
      title: "ÓRDENES DE VENTA",
      viewPath: "/list-final-orders",
      newPath: "/final-order",
      newText: "Nueva orden",
      permView: "sales.finalOrders.view",
      permNew: "sales.finalOrders.new",
    },
    {
      title: "REMITOS",
      viewPath: "/list-final-remits",
      permView: "sales.remits.view",
    },
    {
      title: "VENDEDORES",
      viewPath: "/seller-list",
      newPath: "/seller-new",
      newText: "Nuevo vendedor",
      permView: "sales.sellers.view",
      permNew: "sales.sellers.new",
    },
    { title: "PREFACTURACIONES", desc: "", viewPath: "/pre-invoicing-list", newPath: "/pre-invoicing", newText: "Nueva prefacturación" },

    {
      title: "CLIENTES",
      viewPath: "/client-list",
      newPath: "/client-load",
      newText: "Nuevo cliente",
      permView: "sales.clients.view",
      permNew: "sales.clients.new",
    },
    {
      title: "LISTA DE PRECIOS",
      viewPath: "/price-list-general",
      newPath: "/new-price-list",
      newText: "Nueva lista",
      permView: "sales.pricelist.view",
      permNew: "sales.pricelist.new",
    },
    {
      title: "HOJA DE RUTA",
      newPath: "/roadmap-options",
      newText: "Nueva hoja de ruta",
      permNew: "sales.routes.new",
    },

 
    {
      title: "CONFIGURACIÓN",
      viewPath: "/sale-configuration",
    
    },

    {
      title: "REPORTES",
      viewPath: "/sales-panel",
      permView: "sales.reports.view",
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
        <button className="boton-volver" onClick={() => navigate("/dashboard")}>
          ⬅ Volver
        </button>
      </div>

      <h2 className="title">Ventas y pedidos</h2>

      <div className="grid-container">
        {visibleSections.map((section, index) => (
          <div className="card" key={index}>
            <h3>{section.title}</h3>

            <div className="buttons">
              {section.viewPath &&
                (!section.permView || can(section.permView)) && (
                  <button
                    className="btn view-btn"
                    onClick={() => navigate(section.viewPath)}
                  >
                    Ver <FontAwesomeIcon icon={faEye} />
                  </button>
                )}

              {section.newPath &&
                (!section.permNew || can(section.permNew)) && (
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

export default SalesPanel;
