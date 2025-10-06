// src/views/roadmap/RoadmapList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";

// 👇 igual que en tu ejemplo MeatLoad
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import "../../assets/styles/meatLoad.css"; // reutilizamos los colores/estilos de acciones

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const u = (p) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;

async function jget(path) {
  const r = await fetch(u(path));
  return r.json();
}
async function jdel(path) {
  const r = await fetch(u(path), { method: "DELETE" });
  return r.json();
}

function fmtDate(d) {
  if (!d) return "-";
  const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  if (isNaN(dt)) return "-";
  return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function normalizeRows(res) {
  const list = res?.items || res?.data || res?.rows || res || [];
  const arr = Array.isArray(list) ? list : [];
  return arr.map((r) => {
    const destinationsRaw = r.destinations || r.Destinations || r.destination || [];
    let destinations = [];
    if (Array.isArray(destinationsRaw)) {
      destinations = destinationsRaw
        .map((d) => (typeof d === "string" ? d : d?.destination || d?.name || d?.destination_name))
        .filter(Boolean);
    } else if (typeof destinationsRaw === "string") {
      destinations = [destinationsRaw];
    }

    return {
      id: r.id ?? r.roadmap_info_id ?? r.roadmapId,
      created_at: r.created_at || r.createdAt || r.created || null,
      delivery_date: r.delivery_date || r.deliveryDate || null,
      driver: r.driver || r.chofer || "",
      truck_license_plate: r.truck_license_plate || r.patente || "",
      destinations,
    };
  });
}

export default function RoadmapList() {
  const nav = useNavigate();
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const columns = useMemo(
    () => ["FECHA CREACIÓN", "FECHA REPARTO", "DESTINO", "CHOFER", "PATENTE", "ACCIONES"],
    []
  );

  const fetchData = async (q = "") => {
    try {
      setLoading(true);
      // Espera GET /roadmaps?search=...
      const res = await jget(`/roadmaps?search=${encodeURIComponent(q)}`);
      setRows(normalizeRows(res));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("");
  }, []);

  const onSearch = () => fetchData(term);

  const onDelete = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar hoja de ruta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    const res = await jdel(`/roadmaps/${id}`);
    if (res?.ok) {
      await Swal.fire("Eliminado", "La hoja de ruta fue eliminada", "success");
      fetchData(term);
    } else {
      Swal.fire("Error", res?.msg || "No se pudo eliminar", "error");
    }
  };

  return (
    <div>
      <Navbar />
       <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => nav('/roadmap-options')}>⬅ Volver</button>
      </div>
      <div className="rm-wrap" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 className="rm-title">HOJAS DE RUTA</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar"
            className="rm-input"
            style={{ flex: 1 }}
          />
          <button className="rm-btn" onClick={onSearch}>Buscar</button>
          <button className="rm-btn primary" onClick={() => nav("/new-roadmap")}>
            Nueva hoja de ruta <span style={{ marginLeft: 6 }}>＋</span>
          </button>
        </div>

        <div className="rm-card">
          <table className="rm-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c} style={{ textAlign: "left" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length}>Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={columns.length}>Sin resultados</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDate(r.created_at)}</td>
                    <td>{fmtDate(r.delivery_date)}</td>
                    <td>{r.destinations?.[0] || "-"}</td>
                    <td>{r.driver || "-"}</td>
                    <td>{r.truck_license_plate || "-"}</td>
                    <td>
                      {/* === Acciones con mismos estilos que MeatLoad === */}
                      <div className="action-buttons">
                        <button
                          className="view-button"
                          title="Ver"
                          onClick={() => nav(`/roadmaps/${r.id}/detail`)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        <button
                          className="edit-button"
                          title="Editar"
                          onClick={() => nav(`/roadmaps/${r.id}`)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>

                        <button
                          className="delete-button"
                          title="Eliminar"
                          onClick={() => onDelete(r.id)}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
