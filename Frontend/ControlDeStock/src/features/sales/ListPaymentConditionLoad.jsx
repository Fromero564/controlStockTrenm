import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/Navbar";
import "../../assets/styles/allPaymentConditions.css";

const ListPaymentConditionLoad = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/payment-conditions`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.paymentConditions ?? []);
        setRows(list);
      } catch {
        Swal.fire("Error", "No se pudieron cargar las condiciones de cobro.", "error");
      }
    })();
  }, [API_URL]);

  const filtered = rows.filter(r =>
    (r.payment_condition || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const del = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar condición de cobro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/payment-conditions/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        Swal.fire("Error", data?.msg || "No se pudo eliminar.", "error");
        return;
      }
      setRows(prev => prev.filter(r => r.id !== id));
      Swal.fire("Eliminada", "Se eliminó correctamente.", "success");
      setPage(p => Math.min(p, Math.max(1, Math.ceil((filtered.length - 1) / perPage))));
    } catch {
      Swal.fire("Error", "Error de red al eliminar.", "error");
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

      <div className="apc-container">
        <h1 className="apc-title">Condiciones de Cobro</h1>

        <div className="apc-topbar">
          <div className="apc-search">
            <label htmlFor="apc-search-input">BUSCAR</label>
            <div className="apc-search-inline">
              <input
                id="apc-search-input"
                type="text"
                className="apc-search-input"
                placeholder="Buscar por nombre"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <button className="apc-search-btn">Buscar</button>
            </div>
          </div>

          <button className="apc-new-btn" onClick={() => navigate("/payment-condition-load")}>
            Nueva condición <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <table className="apc-table">
          <thead>
            <tr>
              <th>NOMBRE CONDICIÓN</th>
              <th className="apc-actions-col">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {slice.map(row => (
              <tr key={row.id}>
                <td>{row.payment_condition}</td>
                <td className="apc-actions">
                  <button
                    className="apc-edit-btn"
                    onClick={() => navigate(`/payment-condition-load/${row.id}`)}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="apc-delete-btn"
                    onClick={() => del(row.id)}
                    title="Eliminar"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={2} className="apc-empty">No hay resultados.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="apc-pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Anterior</button>
          <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente →</button>
        </div>
      </div>
    </>
  );
};

export default ListPaymentConditionLoad;
