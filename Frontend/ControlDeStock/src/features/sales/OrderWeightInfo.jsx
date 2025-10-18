// src/views/orders/OrderWeightInfo.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// Helpers
const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const sum = (arr, key) => (Array.isArray(arr) ? arr.reduce((a, x) => a + n(x?.[key]), 0) : 0);
const fmt = (v) => (v === 0 || v ? String(v) : "—");
// ⬅️ NUEVO: formateo seguro a 2 decimales (acepta string/number/null)
const f2 = (v) => {
  const num = Number(v);
  return Number.isFinite(num) ? num.toFixed(2) : "—";
};

// Del header intento usar campos agregados si existen; si no, calculo desde details
const normalizeHeader = (h = {}) => {
  const details = Array.isArray(h.details) ? h.details : [];
  const qty_weighed = h.qty_weighed ?? sum(details, "units_count");
  const gross_total = h.gross_total ?? sum(details, "gross_weight");
  const tare_total = h.tare_total ?? sum(details, "tare_weight");
  const net_total = h.net_total ?? sum(details, "net_weight");
  const qty_requested = h.qty_requested ?? h.requested_qty ?? h.qty ?? null;
  const avg_weight =
    h.avg_weight ??
    (qty_weighed > 0 ? net_total / qty_weighed : null);

  return {
    id: h.id ?? h.header_id ?? undefined,
    product_code: h.product_code ?? h.product_id ?? "",
    product_name: h.product_name ?? "",
    unit_price: h.unit_price ?? null,
    packaging_type: h.packaging_type ?? "",
    qty_requested,
    qty_weighed,
    qty_pending: h.qty_pending ?? (Number.isFinite(Number(qty_requested)) ? Math.max(0, Number(qty_requested) - Number(qty_weighed)) : null),
    gross_total,
    tare_total,
    net_total,
    avg_weight,
    details,
  };
};

export default function OrderWeightInfo() {
  const { id } = useParams(); // id de la ORDEN
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/orders/${id}/weighings`);
        const data = await res.json();
        const arr = data?.ok && Array.isArray(data.headers) ? data.headers : [];
        if (mounted) setHeaders(arr);
      } catch (e) {
        if (mounted) setHeaders([]);
        console.error("Error cargando pesaje:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const rows = useMemo(() => headers.map(normalizeHeader), [headers]);

  return (
    <div className="ow">
      <Navbar />
      <div style={{ margin: 20 }}>
        <button className="ow-btn-back" onClick={() => nav(-1)}>⬅ Volver</button>
      </div>

      <div className="ow-headerCard" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="ow-pageTitle" style={{ marginBottom: 6 }}>
          PESAJE — ORDEN #{id}
        </h2>

        {loading ? (
          <p className="ow-muted">Cargando pesaje…</p>
        ) : rows.length === 0 ? (
          <div className="ow-card" style={{ padding: 16, borderRadius: 8, background: "#f6f8fb", border: "1px solid #e4e9f1" }}>
            No existe pesaje para este remito/orden.
          </div>
        ) : (
          <div className="ow-card" style={{ padding: 16, borderRadius: 8, background: "#fff", border: "1px solid #e4e9f1" }}>
            {rows.map((h, idx) => (
              <div key={h.id ?? idx} style={{ borderBottom: idx < rows.length - 1 ? "1px solid #eef2f6" : "none", paddingBottom: 16, marginBottom: 16 }}>
                {/* Encabezado del producto */}
                <div
                  className="ow-infoGrid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, minmax(140px, 1fr))",
                    gap: 12,
                    alignItems: "start",
                    marginBottom: 12,
                  }}
                >
                  <Info label="CÓDIGO" value={fmt(h.product_code)} />
                  <Info label="PRODUCTO" value={fmt(h.product_name)} />
                  <Info label="EMPAQUE" value={fmt(h.packaging_type)} />
                  <Info label="P.U. ($)" value={fmt(h.unit_price)} />
                  <Info label="SOLICITADO (UN)" value={fmt(h.qty_requested)} />
                  <Info label="PESADO (UN)" value={fmt(h.qty_weighed)} />
                  {/* ⬇️ Usar formateo seguro */}
                  <Info label="TARA (KG)" value={f2(h.tare_total)} />
                  <Info label="BRUTO (KG)" value={f2(h.gross_total)} />
                  <Info label="NETO (KG)" value={f2(h.net_total)} />
                  <Info label="PROMEDIO (KG/UN)" value={f2(h.avg_weight)} />
                  <Info label="PENDIENTE (UN)" value={fmt(h.qty_pending)} />
                </div>

                {/* Detalle de pesadas */}
                <div style={{ overflowX: "auto" }}>
                  <table className="ow-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f3f6fb" }}>
                        <Th># Ítem</Th>
                        <Th>GARRÓN / LOTE</Th>
                        <Th>PIEZAS</Th>
                        <Th>TARA (KG)</Th>
                        <Th>BRUTO (KG)</Th>
                        <Th>NETO (KG)</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {(h.details?.length ? h.details : []).map((d, i) => {
                        const net = n(d.gross_weight) - n(d.tare_weight);
                        return (
                          <tr key={i} style={{ borderTop: "1px solid #eef2f6" }}>
                            <Td>{fmt(d.sub_item ?? i + 1)}</Td>
                            <Td>{fmt(d.lot_number)}</Td>
                            <Td>{fmt(d.units_count)}</Td>
                            <Td>{fmt(n(d.tare_weight).toFixed(2))}</Td>
                            <Td>{fmt(n(d.gross_weight).toFixed(2))}</Td>
                            <Td>{fmt(Math.max(0, net).toFixed(2))}</Td>
                          </tr>
                        );
                      })}
                      {!h.details?.length && (
                        <tr>
                          <td colSpan={6} style={{ padding: 12, textAlign: "center", color: "#6b7280" }}>
                            Sin detalles de pesaje para este producto.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#0B4D75", fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, fontSize: 13, color: "#0B4D75" }}>
      {children}
    </th>
  );
}
function Td({ children }) {
  return (
    <td style={{ padding: "8px 8px", fontSize: 14 }}>{children}</td>
  );
}
