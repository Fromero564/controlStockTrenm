import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../assets/styles/listFinalOrders.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const ENDPOINT = `${API_BASE}/final-orders`;

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

// Estado basado en PESO (order_weight_check)
const StatusBadge = ({ weighted }) => (
  <span className={`lfo-badge ${weighted ? "weighted" : "pending"}`}>
    {weighted ? "ORDEN YA PESADA" : "PENDIENTE"}
  </span>
);

const ListFinalOrders = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [number, setNumber] = useState("");
  const [client, setClient] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    if (status !== "all") p.set("status", status);
    if (date) {
      p.set("date_from", date);
      p.set("date_to", date);
    }
    if (number) p.set("number", number);
    if (client) p.set("client", client);
    return p.toString();
  }, [page, pageSize, status, date, number, client]);

  async function load() {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${ENDPOINT}?${queryString}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setRows(data);
        setTotal(data.length);
        setTotalPages(1);
      } else if (data?.ok) {
        setRows(data.rows || []);
        setTotal(data.total ?? (data.rows?.length || 0));
        setTotalPages(data.totalPages || 1);
      } else {
        setRows([]);
        setTotal(0);
        setTotalPages(1);
        setErrorMsg(data?.msg || "Error al cargar órdenes");
      }
    } catch (e) {
      setErrorMsg(e.message || "No se pudo conectar con el servidor");
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [queryString]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const onWeigh = (id) => {
  navigate(`/order-weight/${id}`)
  };
  const onView = (id) => { };
  const onPDF = (id) => { };

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(5, page + 2));

  return (
    <div className="lfo">
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <div className="lfo-container">
        <h1 className="lfo-title">ORDENES DE VENTA</h1>

        <form className="lfo-filters" onSubmit={onSearch}>
          <div className="lfo-field">
            <label>ESTADO</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">TODOS</option>
              <option value="pending">PENDIENTE</option>
              <option value="generated">GENERADA</option>
            </select>
          </div>
          <div className="lfo-field">
            <label>FECHA</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="lfo-field">
            <label>NÚMERO ORDEN</label>
            <input type="number" placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div className="lfo-field">
            <label>DESTINO</label>
            <input type="text" placeholder="Destino" value={client} onChange={(e) => setClient(e.target.value)} />
          </div>
          <button className="lfo-btn lfo-btn-outline" type="submit">Buscar</button>
        </form>

        <div className="lfo-card">
          <table className="lfo-table">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>NÚMERO ORDEN</th>
                <th>CLIENTE</th>
                <th>ESTADO PESO</th>
                <th className="right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="center muted">Cargando...</td></tr>
              ) : errorMsg ? (
                <tr><td colSpan={5} className="center error">{errorMsg}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="center muted">Sin resultados.</td></tr>
              ) : (
                rows.map((r) => {
                  const weighted = !!(r.order_weight_check); // true => ya pesada
                  const id = r.order_id ?? r.id;
                  return (
                    <tr key={id}>
                      <td>{formatDate(r.date_order || r.created_at)}</td>
                      <td>{id}</td>
                      <td>{r.client_name ?? r.cliente}</td>
                      <td><StatusBadge weighted={weighted} /></td>
                      <td className="right">
                        <div className="lfo-actions">
                          <button
                            className={`lfo-btn ${weighted ? "lfo-btn-disabled" : "lfo-btn-primary"}`}
                            onClick={() => onWeigh(id)}
                            disabled={weighted}
                            title={weighted ? "La orden ya fue pesada" : "Pesar"}
                          >
                            Pesar
                          </button>
                          <button className="lfo-icon" onClick={() => onView(id)} title="Ver">👁</button>
                          <button className="lfo-icon" onClick={() => onPDF(id)} title="PDF">PDF</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="lfo-footer">
          <div className="lfo-showing">
            <span>Mostrar</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {[5, 10, 20, 50, 100].map((n) => (<option key={n} value={n}>{n}</option>))}
            </select>
            <span>de {total || "—"} registros por página</span>
          </div>
          <div className="lfo-pagination">
            <button onClick={goFirst} disabled={page === 1} className="lfo-pageBtn">««</button>
            <button onClick={goPrev} disabled={page === 1} className="lfo-pageBtn">«</button>
            {pages.map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`lfo-pageBtn ${p === page ? "active" : ""}`}>{p}</button>
            ))}
            <button onClick={goNext} disabled={page === totalPages} className="lfo-pageBtn">»</button>
            <button onClick={goLast} disabled={page === totalPages} className="lfo-pageBtn">»»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListFinalOrders;
