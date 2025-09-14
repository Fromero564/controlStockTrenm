import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark, faEye } from "@fortawesome/free-solid-svg-icons";
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
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
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

  const handleDelete = (id, numeroRomaneo) => {
    Swal.fire({
      title: "Eliminar ingreso",
      html: `Vas a eliminar el ingreso con <strong>N° Romaneo ${numeroRomaneo}</strong> ¿Estás seguro?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar ingreso",
      cancelButtonText: "No, cancelar",
      customClass: {
        popup: "custom-popup",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_URL}/products-bill/${id}`, { method: "DELETE" })
          .then((response) => {
            if (response.ok) {
              setProducts((prev) => prev.filter((p) => p.id !== id));
              Swal.fire("Eliminado", "El ingreso ha sido eliminado.", "success");
            } else {
              Swal.fire("Error", "No se pudo eliminar el ingreso.", "error");
            }
          })
          .catch((error) => console.error("Error al eliminar:", error));
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

    token = token.toLowerCase();
    return candidates.some((c) => c.includes(token));
  };

  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const filteredProducts = (Array.isArray(products) ? products : []).filter((p) =>
    tokens.every((t) => tokenMatch(p, t))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const resetFilters = () => {
    setQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="body-meat-load">
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/operator-panel")}>
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
              <button className="search-button" onClick={() => setCurrentPage(1)}>
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

          <button className="new-button" onClick={() => navigate("/provider-form")}>
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => {
              const pesoRecepcionRomaneo = product.total_weight;
              const pesoRecepcion =
                product.income_state === "manual"
                  ? (product.manual_weight ?? product.total_weight)
                  : product.total_weight;

              return (
                <tr
                  key={product.id}
                  className={product.income_state === "manual" ? "red-row" : ""}
                >
                  <td>{product.id}</td>
                  <td>{product.supplier}</td>
                  <td>{new Date(product.createdAt).toLocaleDateString("es-ES")}</td>
                  <td>{new Date(product.createdAt).toLocaleTimeString()}</td>
                  <td>{product.romaneo_number}</td>
                  <td>{product.check_state ? "Romaneo" : "Manual"}</td>
                  <td>{pesoRecepcionRomaneo}</td>
                  <td>{product.head_quantity}</td>
                  <td>{pesoRecepcion}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-button" onClick={() => handleView(product.id)}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="edit-button" onClick={() => handleEdit(product.id)}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product.id, product.romaneo_number)}
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
                <td colSpan="10" style={{ textAlign: "center", padding: "16px" }}>
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
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeatLoad;
