import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../assets/styles/allPriceList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faArrowRightArrowLeft, faScrewdriverWrench, faPlus } from "@fortawesome/free-solid-svg-icons";

const AllPriceList = () => {
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_API_URL; // ej: http://localhost:3001/api
  const ENDPOINT = `${BASE}/all-price-list`;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [q, setQ] = useState("");
  const [groupedMode, setGroupedMode] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(ENDPOINT, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // trae una lista por número para precargar edición
  const fetchOneList = async (number) => {
    const r = await fetch(`${BASE}/price-list/${number}`, { credentials: "include" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json(); // { ok, header:{number,name,clients[]}, products[] }
  };

  // ir al editor pasando datos por state
  const handleEdit = async (number) => {
    try {
      const payload = await fetchOneList(number);
      navigate("/edit-price-list", {
        state: { mode: "edit", listNumber: number, payload },
      });
    } catch (e) {
      alert("No se pudo cargar la lista para editar");
    }
  };

  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const key = String(r.list_number ?? "");
      if (!map.has(key)) {
        map.set(key, { list_number: r.list_number, name: r.name || "", clients: new Set() });
      }
      const b = map.get(key);
      if (r.client_id !== null && r.client_id !== undefined) b.clients.add(String(r.client_id));
      if (r.name && !b.name) b.name = r.name;
    }
    return [...map.values()]
      .map((b) => ({ ...b, clients_count: b.clients.size }))
      .sort((a, b) => Number(b.list_number) - Number(a.list_number));
  }, [rows]);

  const filteredGrouped = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return grouped;
    return grouped.filter(
      (g) =>
        String(g.list_number).includes(s) ||
        String(g.name || "").toLowerCase().includes(s)
    );
  }, [grouped, q]);

  const filteredRaw = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        String(r.id).includes(s) ||
        String(r.list_number).includes(s) ||
        String(r.name || "").toLowerCase().includes(s) ||
        String(r.client_id ?? "").includes(s)
    );
  }, [rows, q]);

  return (
    <div className="pl-root">
      <Navbar />
       <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate("/sales-panel")}>
                    ⬅ Volver
                </button>
            </div>
      <div className="pl-topbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        
          <h1 className="pl-title">Listas de precios</h1>
        </div>

        {/* Acciones globales */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="pl-reload"
            onClick={() => navigate("/new-price-list")}
            title="Crear nueva lista"
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
            Nueva lista
          </button>

          <button
            className="pl-reload"
            onClick={() => navigate("/bulk-price-list-update")}
            title="Modificación masiva de listas"
          >
            <FontAwesomeIcon icon={faScrewdriverWrench} style={{ marginRight: 6 }} />
            Modificación masiva
          </button>

          <button
            className="pl-reload"
            onClick={() => navigate("/compare-price-lists")}
            title="Comparar listas de precios"
          >
            <FontAwesomeIcon icon={faArrowRightArrowLeft} style={{ marginRight: 6 }} />
            Comparar listas
          </button>
        </div>
      </div>

      <div className="pl-card">
        <div className="pl-toolbar">
          <input
            className="pl-search"
            placeholder="Buscar…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <label className="pl-toggle">
            <input
              type="checkbox"
              checked={groupedMode}
              onChange={(e) => setGroupedMode(e.target.checked)}
            />
            <span>Ver agrupado</span>
          </label>
          <button className="pl-reload" onClick={load}>↻</button>
        </div>

        {loading ? (
          <div className="pl-empty">Cargando…</div>
        ) : err ? (
          <div className="pl-error">Error: {String(err.message || err)}</div>
        ) : rows.length === 0 ? (
          <div className="pl-empty">No hay listas de precios.</div>
        ) : groupedMode ? (
          <div className="pl-tableWrap">
            <table className="pl-table">
              <thead>
                <tr>
                  <th>N° lista</th>
                  <th>Nombre</th>
                  <th>Clientes</th>
                  <th style={{ width: 160 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrouped.map((g) => (
                  <tr key={g.list_number}>
                    <td>{g.list_number}</td>
                    <td>{g.name || "—"}</td>
                    <td>{g.clients_count > 0 ? g.clients_count : "General"}</td>
                    <td>
                      <button
                        className="pl-reload"
                        title="Editar esta lista"
                        onClick={() => handleEdit(g.list_number)}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: 6 }} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="pl-tableWrap">
            <table className="pl-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>N° lista</th>
                  <th>Nombre</th>
                  <th>client_id</th>
                </tr>
              </thead>
              <tbody>
                {filteredRaw.map((r) => (
                  <tr key={`${r.id}-${r.client_id ?? "null"}`}>
                    <td>{r.id}</td>
                    <td>{r.list_number}</td>
                    <td>{r.name || "—"}</td>
                    <td>{r.client_id ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPriceList;
