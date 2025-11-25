import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark, faEye, faIndustry } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/Navbar.jsx";
import Swal from "sweetalert2";
import "../../assets/styles/meatLoad.css";

const MeatLoad = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/allProducts`);
        const data = await res.json().catch(() => null);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setProducts(list);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setProducts([]);
      }
    };
    load();
  }, [API_URL]);

  const handleEdit = (id) => navigate(`/provider-form/${id}`);
  const handleView = (id) => navigate(`/meat-load-view/${id}`);

  // Eliminar / dar de baja / dar de alta
  const handleDelete = (product) => {
    const { id, romaneo_number, bill_state } = product;

    const isInactive =
      bill_state === 0 || bill_state === false || bill_state === "0";

    Swal.fire({
      title: "¿Qué querés hacer?",
      html: `Ingreso con <strong>N° Romaneo ${romaneo_number}</strong>`,
      icon: "warning",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Eliminar definitivamente",
      denyButtonText: isInactive ? "Dar de alta" : "Dar de baja",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "custom-popup",
        confirmButton: "custom-confirm-button",
        denyButton: "custom-deny-button",
        cancelButton: "custom-cancel-button",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      // 🔴 Eliminar definitivo
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/products-bill/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            Swal.fire(
              "Eliminado",
              "El ingreso ha sido eliminado definitivamente.",
              "success"
            );
          } else {
            Swal.fire("Error", "No se pudo eliminar el ingreso.", "error");
          }
        } catch (error) {
          console.error("Error al eliminar:", error);
          Swal.fire(
            "Error",
            "Ocurrió un error al eliminar el ingreso.",
            "error"
          );
        }
      }

      // 🟡 Dar de baja o de alta
      if (result.isDenied) {
        const endpoint = isInactive
          ? `${API_URL}/products-bill/reactivate/${id}`
          : `${API_URL}/products-bill/deactivate/${id}`;

        try {
          const response = await fetch(endpoint, { method: "PUT" });
          if (response.ok) {
            const nuevoEstado = isInactive ? 1 : 0;
            setProducts((prev) =>
              prev.map((p) =>
                p.id === id ? { ...p, bill_state: nuevoEstado } : p
              )
            );
            Swal.fire(
              isInactive ? "Activado" : "Dado de baja",
              isInactive
                ? "El ingreso volvió a estar activo."
                : "El ingreso fue dado de baja.",
              "success"
            );
          } else {
            Swal.fire(
              "Error",
              "No se pudo actualizar el estado del ingreso.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error al actualizar estado:", error);
          Swal.fire(
            "Error",
            "Ocurrió un error al actualizar el estado.",
            "error"
          );
        }
      }
    });
  };

  // Marcar / desmarcar proceso productivo
  const handleToggleProcessFlag = (product) => {
    const estaMarcado = !!product.production_process;

    const title = estaMarcado
      ? "Quitar marca de proceso productivo"
      : "No necesita proceso productivo";
    const text = estaMarcado
      ? "¿Querés volver a marcar este comprobante como pendiente de proceso productivo?"
      : "Este comprobante no va a aparecer en la pantalla de Proceso Productivo. ¿Confirmás?";

    Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`${API_URL}/bill-production-flag/${product.id}`, {
          method: "PUT",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.ok === false) {
          Swal.fire(
            "Error",
            data?.message ||
              "No se pudo actualizar el estado de proceso productivo.",
            "error"
          );
          return;
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, production_process: data.production_process }
              : p
          )
        );

        if (!estaMarcado) {
          Swal.fire("Listo", "No necesita proceso productivo.", "success");
        } else {
          Swal.fire(
            "Listo",
            "El comprobante volvió a quedar pendiente de proceso productivo.",
            "success"
          );
        }
      } catch (err) {
        console.error("Error al actualizar flag de proceso:", err);
        Swal.fire(
          "Error",
          "No se pudo actualizar el estado de proceso productivo.",
          "error"
        );
      }
    });
  };

  const tokenMatch = (p, token) => {
    const d = new Date(p.createdAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateIso = `${yyyy}-${mm}-${dd}`;
    const dateDmy = `${d.getDate()}/${d.getMonth() + 1}/${yyyy}`;
    const dateDmyPad = `${dd}/${mm}/${yyyy}`;

    const candidates = [
      String(p.id ?? ""),
      String(p.romaneo_number ?? ""),
      String(p.supplier ?? "").toLowerCase(),
      dateIso,
      dateDmy,
      dateDmyPad,
    ].map((s) => s.toLowerCase());

    const t = token.toLowerCase();
    return candidates.some((c) => c.includes(t));
  };

  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const filteredProducts = (Array.isArray(products) ? products : []).filter(
    (p) => tokens.every((t) => tokenMatch(p, t))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);

  const resetFilters = () => {
    setQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="body-meat-load">
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button
          className="boton-volver"
          onClick={() => navigate("/operator-panel")}
        >
          ⬅ Volver
        </button>
      </div>

      <div className="container">
        <h1>Mercaderías</h1>

        <div className="header" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="search-section" style={{ minWidth: 320 }}>
            <label htmlFor="search">Buscar</label>
            <div className="search-input-label">
              <input
                type="text"
                id="search"
                placeholder="Proveedor, N° Romaneo, Fecha (AAAA-MM-DD o DD/MM/AAAA) o N° Comprobante"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
              <button
                className="search-button"
                onClick={() => setCurrentPage(1)}
              >
                Buscar
              </button>
              <button
                className="search-button"
                style={{ marginLeft: 8, background: "#999" }}
                onClick={resetFilters}
              >
                Limpiar
              </button>
            </div>
          </div>

          <button
            className="new-button"
            onClick={() => navigate("/provider-form")}
          >
            Nuevo Ingreso +
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>N°Comprobante</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>N° Romaneo</th>
              <th>Estado de Carga</th>
              <th>Peso recepción Romaneo</th>
              <th>Cabezas</th>
              <th>Peso Recepcion</th>
              <th>Estado</th>
              <th>Proc. Prod.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => {
              const pesoRecepcionRomaneo = product.total_weight;
              const pesoRecepcion =
                product.income_state === "manual"
                  ? product.manual_weight ?? product.total_weight
                  : product.total_weight;

              const isInactive =
                product.bill_state === 0 ||
                product.bill_state === false ||
                product.bill_state === "0";

              return (
                <tr
                  key={product.id}
                  className={isInactive ? "red-row" : ""}
                >
                  <td>{product.id}</td>
                  <td>{product.supplier}</td>
                  <td>
                    {new Date(product.createdAt).toLocaleDateString("es-ES")}
                  </td>
                  <td>{new Date(product.createdAt).toLocaleTimeString()}</td>
                  <td>{product.romaneo_number}</td>
                  <td>{product.check_state ? "Romaneo" : "Manual"}</td>
                  <td>{pesoRecepcionRomaneo}</td>
                  <td>{product.head_quantity}</td>
                  <td>{pesoRecepcion}</td>
                  <td>{isInactive ? "Inactivo" : "Activo"}</td>
                  <td>
                    <button
                      className={`process-flag-button ${
                        product.production_process ? "on" : "off"
                      }`}
                      title={
                        product.production_process
                          ? "Marcado: no aparece en Proceso Productivo"
                          : "Pendiente de proceso productivo"
                      }
                      onClick={() => handleToggleProcessFlag(product)}
                    >
                      <FontAwesomeIcon icon={faIndustry} />
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-button"
                        onClick={() => handleView(product.id)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(product.id)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product)}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {currentProducts.length === 0 && (
              <tr>
                <td
                  colSpan="12"
                  style={{ textAlign: "center", padding: "16px" }}
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={goToPrevPage} disabled={currentPage === 1}>
            ← Anterior
          </button>
          <span>
            Página <strong>{currentPage}</strong> de{" "}
            <strong>{totalPages}</strong>
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeatLoad;
