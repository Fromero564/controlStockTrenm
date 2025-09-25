import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../../components/Navbar";
import "../../../assets/styles/listDrivers.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ListDrivers() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/drivers`);
      if (!res.ok) throw new Error("No se pudo obtener la lista de choferes");
      const data = await res.json();
      // Soportar { ok, drivers } o array directo
      const list = Array.isArray(data) ? data : (data.drivers || []);
      // normalizamos status desde driver_state si viniera así
      const norm = list.map(d => ({
        ...d,
        status:
          typeof d.status === "boolean"
            ? d.status
            : (d.driver_state === 1 || d.driver_state === true || d.driver_state === "1"),
      }));
      setRows(norm);
    } catch (err) {
      Swal.fire("Error", err.message || "Error al cargar choferes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!API_URL) {
      Swal.fire("Error", "Falta configurar VITE_API_URL", "error");
      return;
    }
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      `${r.driver_name ?? ""} ${r.driver_surname ?? ""}`.toLowerCase().includes(term)
    );
  }, [rows, q]);

  const onDelete = async (id) => {
    const ok = await Swal.fire({
      title: "Eliminar chofer",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53935",
    }).then((r) => r.isConfirmed);

    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/drivers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await safeReadError(res);
        throw new Error(msg || "No se pudo eliminar");
      }
      await Swal.fire("Listo", "Chofer eliminado", "success");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message || "Ocurrió un error al eliminar", "error");
    }
  };

  const goNew = () => navigate("/load-new-driver");
  const goEdit = (id) => navigate(`/load-new-driver/${id}`);

  return (
    <div>
      <Navbar />
       <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate('/roadmap-options')}>⬅ Volver</button>
      </div>
      <div className="drivers-container">
        <div className="drivers-header">
          <h1 className="drivers-title">CHOFERES</h1>
          <div className="drivers-actions-bar">
            <div className="drivers-search">
              <input
                type="text"
                placeholder="Buscar"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button className="btn-outline" onClick={() => setQ(q)}>Buscar</button>
            </div>
            <button className="btn-primary" onClick={goNew}>
              Nuevo Chofer <span className="plus">+</span>
            </button>
          </div>
        </div>

        <div className="drivers-card">
          <div className="drivers-table">
            <div className="drivers-thead">
              <div className="th name">NOMBRE Y APELLIDO</div>
              <div className="th state">ESTADO</div>
              <div className="th actions">ACCIONES</div>
            </div>

            {loading ? (
              <div className="drivers-empty">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="drivers-empty">Sin resultados</div>
            ) : (
              filtered.map((r) => (
                <div className="drivers-row" key={r.id}>
                  <div className="td name">
                    <div className="name-wrap">
                      <span className="line">{r.driver_name || "-"}</span>
                      <span className="line">{r.driver_surname || "-"}</span>
                    </div>
                  </div>
                  <div className="td state">
                    <span className={`chip ${r.status ? "ok" : "off"}`}>
                      {r.status ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="td actions">
                    <button className="icon-btn edit" title="Editar" onClick={() => goEdit(r.id)}>
                      ✏️
                    </button>
                    <button className="icon-btn delete" title="Eliminar" onClick={() => onDelete(r.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function safeReadError(res) {
  try {
    const j = await res.json();
    return j?.message || j?.msg || j?.error || null;
  } catch {
    try {
      const t = await res.text();
      return t;
    } catch {
      return null;
    }
  }
}
