import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../../components/Navbar";
import Destination from "./Destination";
import "../../../assets/styles/destinations.css";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function ListDestination() {
  const navigate=useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [current, setCurrent] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => (r.name || "").toLowerCase().includes(s));
  }, [rows, q]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/destinations`);
      const j = await r.json();
      setRows(Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setOpen(true);
  };

  const openEdit = (row) => {
    setMode("edit");
    setCurrent(row);
    setOpen(true);
  };

  const onSave = async ({ id, name }) => {
    try {
      const opts = {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      };
      const url = mode === "edit" ? `${API_BASE}/destinations/${id}` : `${API_BASE}/destinations`;
      const r = await fetch(url, opts);
      const j = await r.json();
      if (!r.ok || j?.ok === false) throw new Error(j?.msg || "Error al guardar");
      setOpen(false);
      await fetchRows();
    } catch (e) {
      alert(e.message || "No se pudo guardar");
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`¿Eliminar "${row.name}"?`)) return;
    try {
      const r = await fetch(`${API_BASE}/destinations/${row.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("No se pudo eliminar");
      await fetchRows();
    } catch (e) {
      alert(e.message || "No se pudo eliminar");
    }
  };

  return (
    <div className="dst">
      <Navbar />
        <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate('/roadmap-options')}>⬅ Volver</button>
      </div>

      <div className="dst-page">
        <div className="dst-header">
          <h1>DESTINOS</h1>
        </div>

        <div className="dst-actions">
          <div className="dst-search">
            <input
              className="dst-input"
              placeholder="Buscar"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="dst-btn dst-btn-light" onClick={() => setQ(q.trim())}>Buscar</button>
          </div>

          <button className="dst-btn dst-btn-primary" onClick={openCreate}>
            Nuevo Destino +
          </button>
        </div>

        <div className="dst-card">
          <table className="dst-table">
            <thead>
              <tr>
                <th style={{ width: "70%" }}>Zona</th>
                <th className="center" style={{ width: "30%" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2} className="muted">Cargando…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={2} className="muted">Sin resultados</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td className="center">
                      <button className="dst-mini dst-mini-blue" title="Editar" onClick={() => openEdit(r)}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button className="dst-mini dst-mini-red" title="Eliminar" onClick={() => onDelete(r)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Destination
        open={open}
        mode={mode}
        initial={current}
        onCancel={() => setOpen(false)}
        onSave={onSave}
      />
    </div>
  );
}
