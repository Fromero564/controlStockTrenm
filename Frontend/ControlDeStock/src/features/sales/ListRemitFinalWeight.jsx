// src/views/remits/ListRemitFinalWeight.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../assets/styles/listRemitFinalWeight.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const ENDPOINT_ORDERS = `${API_BASE}/final-orders`;
const ENDPOINT_FINAL_REMIT = `${API_BASE}/final-remits`;

// ✅ date_order es DATE (YYYY-MM-DD). No usar new Date(iso).
const fmtDate = (iso) => {
  if (!iso) return "-";
  const [yyyy, mm, dd] = String(iso).split("-");
  if (!yyyy || !mm || !dd) return "-";
  return `${dd}/${mm}/${yyyy}`;
};

export default function ListRemitFinalWeight() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [date, setDate] = useState("");
  const [number, setNumber] = useState("");
  const [client, setClient] = useState("");

  // pestaña activa: "pending" (a remitir) | "remitted" (lista de remitos)
  const [activeTab, setActiveTab] = useState("pending");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    // solo órdenes con order_check = true (orden de venta generada)
    p.set("status", "generated");
    if (date) {
      p.set("date_from", date);
      p.set("date_to", date);
    }
    if (number) p.set("number", number);
    if (client) p.set("client", client);
    return p.toString();
  }, [date, number, client]);

  // Chequear si la orden ya tiene remito final
  const checkHasFinalRemit = async (orderId) => {
    try {
      const res = await fetch(`${ENDPOINT_FINAL_REMIT}?order_id=${orderId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // backend puede responder { exists: boolean } o lista
      if (typeof data?.exists === "boolean") return data.exists;
      if (Array.isArray(data)) return data.length > 0;
      if (Array.isArray(data?.rows)) return data.rows.length > 0;
      return false;
    } catch {
      // Ante error de red NO lo marcamos remitido
      return false;
    }
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${ENDPOINT_ORDERS}?${queryString}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const list = Array.isArray(data) ? data : data?.rows || [];

      // Agrego flags: hasRemit y normalizo order_id
      const withFlags = await Promise.all(
        list.map(async (r) => {
          const orderId = r.order_id ?? r.id;
          const hasRemit = await checkHasFinalRemit(orderId);
          return {
            ...r,
            order_id: orderId,
            hasRemit,
            // me aseguro que order_weight_check sea boolean real
            order_weight_check: !!r.order_weight_check,
          };
        })
      );

      setRows(withFlags);
    } catch (e) {
      setErr(e.message || "Error al cargar remitos");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [queryString]);

  // 🔍 Filtrado según pestaña:
  // A REMITIR → solo órdenes PESADAS y sin remito
  // LISTA DE REMITOS → solo órdenes con remito
  const filteredRows = useMemo(() => {
    if (activeTab === "pending") {
      return rows.filter(
        (r) => !r.hasRemit && r.order_weight_check === true
      );
    }
    return rows.filter((r) => r.hasRemit);
  }, [rows, activeTab]);

  const onRemit = (orderId) => navigate(`/remit-control-state/${orderId}`);
  const onView = (orderId) => navigate(`/remits/preview/${orderId}`);
  const onPDF = (orderId) => {
    window.open(
      `${API_BASE}/remits/from-order/${orderId}/pdf`,
      "_blank",
      "noopener"
    );
  };

  return (
    <div className="lrf">
      <Navbar />
      <div className="lrf-back">
        <button
          className="boton-volver"
          onClick={() => navigate("/sales-panel")}
        >
          ⬅ Volver
        </button>
      </div>

      <div className="lrf-container">
        <h1>REMITOS</h1>

        {/* Pestañas */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            A REMITIR
          </button>
          <button
            className={`tab ${activeTab === "remitted" ? "active" : ""}`}
            onClick={() => setActiveTab("remitted")}
          >
            LISTA DE REMITOS
          </button>
        </div>

        {/* Filtros */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="filters"
        >
          <div>
            <label>FECHA</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label>NÚMERO ORDEN</label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="ID / receipt"
            />
          </div>
          <div>
            <label>CLIENTE</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Nombre cliente"
            />
          </div>
          <div className="filters-submit">
            <button type="submit" className="btn-secondary">
              Buscar
            </button>
          </div>
        </form>

        {/* Tabla */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>NÚMERO ORDEN</th>
                <th>CLIENTE</th>
                <th className="text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    Cargando…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={4} className="text-center error">
                    {err}
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    {activeTab === "pending"
                      ? "No hay órdenes pendientes de remitar (o aún no fueron pesadas)."
                      : "No hay remitos generados para los filtros seleccionados."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.order_id}>
                    <td>{fmtDate(r.date_order)}</td>
                    <td>{r.order_id}</td>
                    <td>{r.client_name}</td>
                    <td className="text-right">
                      <div className="actions">
                        {activeTab === "pending" && !r.hasRemit && (
                          <button
                            className="btn-primary"
                            onClick={() => onRemit(r.order_id)}
                          >
                            Remitar
                          </button>
                        )}

                        {activeTab === "remitted" && r.hasRemit && (
                          <span
                            style={{
                              opacity: 0.7,
                              marginRight: 8,
                              fontSize: 13,
                            }}
                          >
                            Ya remitido
                          </span>
                        )}

                        <button
                          className="btn-icon"
                          title="Ver"
                          onClick={() => onView(r.order_id)}
                        >
                          👁
                        </button>
                        <button
                          className="btn-icon danger"
                          title="PDF"
                          onClick={() => onPDF(r.order_id)}
                        >
                          PDF
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
