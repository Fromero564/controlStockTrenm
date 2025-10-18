import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../assets/styles/listFinalOrders.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const ENDPOINT = `${API_BASE}/final-orders`;

// ✅ IMPORTANTE: date_order es un DATE (YYYY-MM-DD). Lo formateamos como string.
const formatDate = (iso) => {
  if (!iso) return "-";
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "-";
  return `${dd}/${mm}/${yyyy.slice(-2)}`;
};

const normalize = (v) => (v ?? "").toString().trim().toLowerCase();

/** Devuelve "generated" | "pending" priorizando order_weight_check del backend */
const getOrderStatus = (row) => {
  // viene agregado como MAX(order_weight_check) desde el backend
  // y lo convertimos a boolean ya en el controller
  if (row?.order_weight_check === true) return "generated";
  if (row?.order_weight_check === false) return "pending";

  const candidates = [
    row.order_status,
    row.status,
    row.state,
    row.estado,
    row.estado_orden,
    row.orderState,
    row.order_generated,
  ];

  for (const c of candidates) {
    if (typeof c === "boolean") return c ? "generated" : "pending";
    if (typeof c === "number") return c ? "generated" : "pending";
    const n = normalize(c);
    if (["generada", "generated", "emitida", "cerrada", "1", "true", "sí", "si"].includes(n))
      return "generated";
    if (["pendiente", "pending", "abierta", "0", "false", ""].includes(n))
      return "pending";
  }
  return "pending";
};

const OrderStatusBadge = ({ status }) => (
  <span className={`status-badge ${status === "generated" ? "generated" : "pending"}`}>
    {status === "generated" ? "PESADA" : "PENDIENTE"}
  </span>
);

const ListFinalOrders = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filtros
  const [status, setStatus] = useState("all"); // all | generated | pending
  const [date, setDate] = useState("");
  const [number, setNumber] = useState("");
  const [client, setClient] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Query SOLO con filtros que van al backend (no mandamos "status")
  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (date) {
      p.set("date_from", date);
      p.set("date_to", date);
    }
    if (number) p.set("number", number);
    if (client) p.set("client", client);
    return p.toString();
  }, [date, number, client]);

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
      // El backend puede devolver array directo o { ok, rows }
      if (Array.isArray(data)) setRows(data);
      else if (data?.ok) setRows(data.rows || []);
      else {
        setRows([]);
        setErrorMsg(data?.msg || "Error al cargar órdenes");
      }
    } catch (e) {
      setErrorMsg(e.message || "No se pudo conectar con el servidor");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // Carga cuando cambian filtros que sí van al backend
  useEffect(() => {
    load();
    setPage(1);
  }, [queryString]);

  // Volver a página 1 si cambia el filtro local o pageSize
  useEffect(() => {
    setPage(1);
  }, [status, pageSize]);

  // Filtro local por estado
  const filteredRows = useMemo(() => {
    let arr = Array.isArray(rows) ? rows : [];
    if (status !== "all") {
      arr = arr.filter((r) => getOrderStatus(r) === status);
    }
    return arr;
  }, [rows, status]);

  // Paginación
  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageRows = filteredRows.slice(pageStart, pageStart + pageSize);

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);
  const pages = useMemo(() => {
    const arr = Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(0, Math.min(totalPages - 5, page - 3));
    return arr.slice(start, start + 5);
  }, [totalPages, page]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const onWeigh = (id) => navigate(`/order-weight/${id}`);

  // 👁️ OJITO → navegar a la vista de pesaje info:
  const onView = (id) => navigate(`/order-weight-info/${id}`);

  const onPDF = (_id) => {};

  return (
    <div className="lfo">
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/sales-panel")}>
          ⬅ Volver
        </button>
      </div>

      <div className="lfo-container">
        <h1 className="lfo-title">ORDENES DE VENTA</h1>

        <form className="lfo-filters" onSubmit={onSearch}>
          <div className="lfo-field">
            <label>ESTADO</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="generated">Pesada</option>
            </select>
          </div>

          <div className="lfo-field">
            <label>FECHA</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="lfo-field">
            <label>N° ORDEN</label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="ID"
              min="1"
            />
          </div>

          <div className="lfo-field">
            <label>CLIENTE</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>

          <div className="lfo-actionsBar">
            <button type="submit" className="lfo-btn lfo-btn-secondary">Buscar</button>
          </div>
        </form>

        <div className="lfo-tableWrapper">
          <table className="lfo-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>FECHA</th>
                <th>CLIENTE</th>
                <th>VENDEDOR</th>
                <th>ESTADO</th>
                <th className="right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="center">Cargando…</td></tr>
              ) : errorMsg ? (
                <tr><td colSpan={6} className="center error">{errorMsg}</td></tr>
              ) : pageRows.length === 0 ? (
                <tr><td colSpan={6} className="center">Sin resultados</td></tr>
              ) : (
                pageRows.map((r) => {
                  const id = r.order_id ?? r.id;
                  const orderStatus = getOrderStatus(r);
                  const isWeighed = orderStatus === "generated";
                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{formatDate(r.date_order)}</td>
                      <td>{r.client_name ?? r.cliente}</td>
                      <td>{r.salesman_name ?? r.vendedor}</td>
                      <td><OrderStatusBadge status={orderStatus} /></td>
                      <td className="right">
                        <div className="lfo-actions">
                          <button
                            className={`lfo-btn ${isWeighed ? "lfo-btn-disabled" : "lfo-btn-primary"}`}
                            onClick={() => !isWeighed && onWeigh(id)}
                            title={isWeighed ? "La orden ya está pesada" : "Pesar"}
                            disabled={isWeighed}
                          >
                            {isWeighed ? "Pesada" : "Pesar"}
                          </button>
                          {/* 👁️ Ver pesaje */}
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
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>de {totalFiltered || "—"} registros por página</span>
          </div>

          <div className="lfo-pagination">
            <button onClick={goFirst} disabled={page === 1} className="lfo-pageBtn">««</button>
            <button onClick={goPrev} disabled={page === 1} className="lfo-pageBtn">«</button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`lfo-pageBtn ${p === page ? "active" : ""}`}
              >
                {p}
              </button>
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
