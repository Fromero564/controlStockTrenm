import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../../components/Navbar";
import Truck from "./Truck";
import "../../../assets/styles/trucks.css";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function ListTruck() {
  const navigate=useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [current, setCurrent] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.brand || "").toLowerCase().includes(s) ||
      (r.model || "").toLowerCase().includes(s) ||
      (r.plate || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/trucks`);
      const j = await r.json();
      setRows(Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const openCreate = () => { setMode("create"); setCurrent(null); setOpen(true); };
  const openEdit = (row) => { setMode("edit"); setCurrent(row); setOpen(true); };

  const onSave = async ({ id, brand, model, plate }) => {
    try {
      const body = JSON.stringify({ brand, model, plate });
      const url  = mode === "edit" ? `${API_BASE}/trucks/${id}` : `${API_BASE}/trucks`;
      const r = await fetch(url, { method: mode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body });
      const j = await r.json();
      if (!r.ok || j?.ok === false) throw new Error(j?.msg || "Error al guardar");
      setOpen(false);
      await fetchRows();
    } catch (e) {
      alert(e.message || "No se pudo guardar");
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`¿Eliminar el camión ${row.model} (${row.plate})?`)) return;
    try {
      const r = await fetch(`${API_BASE}/trucks/${row.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("No se pudo eliminar");
      await fetchRows();
    } catch (e) {
      alert(e.message || "No se pudo eliminar");
    }
  };

  return (
    <div className="tck">
      <Navbar />
       <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate('/roadmap-options')}>⬅ Volver</button>
      </div>

      <div className="tck-page">
        <div className="tck-header"><h1>CAMIONES</h1></div>

        <div className="tck-actions">
          <div className="tck-search">
            <input className="tck-input" placeholder="Buscar marca, modelo o patente" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="tck-btn tck-btn-light" onClick={() => setQ(q.trim())}>Buscar</button>
          </div>
          <button className="tck-btn tck-btn-primary" onClick={openCreate}>Nuevo Camión +</button>
        </div>

        <div className="tck-card">
          <table className="tck-table">
            <thead>
              <tr>
                <th style={{width:"60%"}}>Modelo</th>
                <th style={{width:"25%"}}>Patente</th>
                <th className="center" style={{width:"15%"}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="muted">Cargando…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="muted">Sin resultados</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{fontWeight:600}}>{r.model}</div>
                      <div style={{fontSize:12, color:"#77859b"}}>{r.brand}</div>
                    </td>
                    <td>{r.plate}</td>
                    <td className="center">
                      <button className="tck-mini tck-mini-blue" title="Editar" onClick={() => openEdit(r)}>
                        <FontAwesomeIcon icon={faPen}/>
                      </button>
                      <button className="tck-mini tck-mini-red" title="Eliminar" onClick={() => onDelete(r)}>
                        <FontAwesomeIcon icon={faTrash}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Truck open={open} mode={mode} initial={current} onCancel={() => setOpen(false)} onSave={onSave}/>
    </div>
  );
}
