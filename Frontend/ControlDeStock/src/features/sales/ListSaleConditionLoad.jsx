import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/Navbar";
import "../../assets/styles/allSaleConditions.css";

const ListSaleConditionLoad = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [conditions, setConditions] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Cargar condiciones
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/sale-conditions`);
        const data = await res.json();
        const rows = Array.isArray(data) ? data : (data?.conditions ?? []);
        setConditions(rows);
      } catch (e) {
        console.error("Error al obtener condiciones:", e);
        Swal.fire("Error", "No se pudieron cargar las condiciones.", "error");
      }
    })();
  }, [API_URL]);

  // Buscar por nombre
  const filtered = conditions.filter((c) =>
    (c.condition_name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = filtered.slice(indexOfFirst, indexOfLast);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Eliminar
  const handleDelete = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar condición?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/sale-conditions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        Swal.fire("Error", data?.msg || "No se pudo eliminar.", "error");
        return;
      }
      setConditions((prev) => prev.filter((r) => r.id !== id));
      Swal.fire("Eliminada", "Condición eliminada correctamente.", "success");
      // ajustar página si se queda vacía
      setCurrentPage((p) => (indexOfFirst >= filtered.length - 1 ? Math.max(1, p - 1) : p));
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Error de red al intentar eliminar.", "error");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/sale-configuration")}>
          ⬅ Volver
        </button>
      </div>

      <div className="asc-container">
        <h1 className="asc-title">Condiciones de Venta</h1>

        <div className="asc-topbar">
          <div className="asc-search">
            <label htmlFor="asc-search-input">BUSCAR</label>
            <div className="asc-search-inline">
              <input
                id="asc-search-input"
                type="text"
                className="asc-search-input"
                placeholder="Buscar por nombre de condición"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <button className="asc-search-btn">Buscar</button>
            </div>
          </div>

          <button
            className="asc-new-btn"
            onClick={() => navigate("/sale-condition-load")}
          >
            Nueva condición <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <table className="asc-table">
          <thead>
            <tr>
              <th>NOMBRE CONDICIÓN</th>
              <th className="asc-actions-col">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr key={row.id}>
                <td>{row.condition_name}</td>
                <td className="asc-actions">
                  <button
                    className="asc-edit-btn"
                    onClick={() => navigate(`/sale-condition-load/${row.id}`)}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="asc-delete-btn"
                    onClick={() => handleDelete(row.id)}
                    title="Eliminar"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </td>
              </tr>
            ))}

            {currentRows.length === 0 && (
              <tr>
                <td colSpan={2} className="asc-empty">
                  No hay resultados para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="asc-pagination">
          <button onClick={goPrev} disabled={currentPage === 1}>
            ← Anterior
          </button>
          <span>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>
          <button onClick={goNext} disabled={currentPage === totalPages}>
            Siguiente →
          </button>
        </div>
      </div>
    </>
  );
};

export default ListSaleConditionLoad;
