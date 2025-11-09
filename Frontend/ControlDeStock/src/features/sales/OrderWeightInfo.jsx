// src/views/orders/OrderWeightInfo.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// Helpers
const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const sum = (arr, key) =>
  Array.isArray(arr) ? arr.reduce((a, x) => a + n(x?.[key]), 0) : 0;
const fmt = (v) => (v === 0 || v ? String(v) : "—");
const f2 = (v) => {
  const num = Number(v);
  return Number.isFinite(num) ? num.toFixed(2) : "—";
};

// Normalizador
const normalizeHeader = (h = {}) => {
  const details = Array.isArray(h.details) ? h.details : [];
  const qty_weighed = h.qty_weighed ?? sum(details, "units_count");
  const gross_total = h.gross_total ?? sum(details, "gross_weight");
  const tare_total = h.tare_total ?? sum(details, "tare_weight");
  const net_total = h.net_total ?? sum(details, "net_weight");
  const qty_requested = h.qty_requested ?? h.requested_qty ?? h.qty ?? null;
  const avg_weight =
    h.avg_weight ?? (qty_weighed > 0 ? net_total / qty_weighed : null);

  return {
    id: h.id ?? h.header_id ?? undefined,
    product_code: h.product_code ?? h.product_id ?? "",
    product_name: h.product_name ?? "",
    unit_price: h.unit_price ?? null,
    packaging_type: h.packaging_type ?? "",
    qty_requested,
    qty_weighed,
    qty_pending:
      h.qty_pending ??
      (Number.isFinite(Number(qty_requested))
        ? Math.max(
            0,
            Number(qty_requested) - Number(qty_weighed)
          )
        : null),
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
        const arr =
          data?.ok && Array.isArray(data.headers) ? data.headers : [];
        if (mounted) setHeaders(arr);
      } catch (e) {
        if (mounted) setHeaders([]);
        console.error("Error cargando pesaje:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const rows = useMemo(() => headers.map(normalizeHeader), [headers]);

  return (
    <div
      className="ow"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f8fafc", // un gris muy clarito para contraste
      }}
    >
      <Navbar />

      {/* contenedor principal */}
      <div
        style={{
          flex: 1,
          padding: "20px 24px 40px",
          width: "100%",
          maxWidth: "1400px", // opcional: límite cómodo para monitores XL
          margin: "0 auto",
        }}
      >
        {/* Botón volver */}
        <div style={{ marginBottom: 20 }}>
          <button
            className="ow-btn-back"
            onClick={() => nav(-1)}
            style={{
              background: "#fff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "14px",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            ⬅ Volver
          </button>
        </div>

        {/* Título */}
        <h2
          className="ow-pageTitle"
          style={{
            marginBottom: 12,
            fontSize: "28px",
            fontWeight: 700,
            color: "#0B4D75",
          }}
        >
          PESAJE — ORDEN #{id}
        </h2>

        {/* Contenido */}
        {loading ? (
          <p
            className="ow-muted"
            style={{ color: "#6b7280", fontSize: 15, fontStyle: "italic" }}
          >
            Cargando pesaje…
          </p>
        ) : rows.length === 0 ? (
          <div
            className="ow-card"
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #e4e9f1",
              borderRadius: 8,
              padding: 16,
              fontSize: 15,
            }}
          >
            No existe pesaje para este remito/orden.
          </div>
        ) : (
          <div
            className="ow-card"
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #e4e9f1",
              borderRadius: 8,
              padding: 16,
            }}
          >
            {rows.map((h, idx) => (
              <div
                key={h.id ?? idx}
                style={{
                  borderBottom:
                    idx < rows.length - 1
                      ? "1px solid #eef2f6"
                      : "none",
                  paddingBottom: 16,
                  marginBottom: 16,
                }}
              >
                {/* Datos generales del producto */}
                <div
                  className="ow-infoGrid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 16,
                    alignItems: "start",
                    marginBottom: 16,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <Info label="CÓDIGO" value={fmt(h.product_code)} />
                  <Info label="PRODUCTO" value={fmt(h.product_name)} />
                  <Info label="EMPAQUE" value={fmt(h.packaging_type)} />
                  <Info label="P.U. ($)" value={fmt(h.unit_price)} />
                  <Info label="SOLICITADO (UN)" value={fmt(h.qty_requested)} />
                  <Info label="PESADO (UN)" value={fmt(h.qty_weighed)} />
                  <Info label="TARA (KG)" value={f2(h.tare_total)} />
                  <Info label="BRUTO (KG)" value={f2(h.gross_total)} />
                  <Info label="NETO (KG)" value={f2(h.net_total)} />
                  <Info
                    label="PROMEDIO (KG/UN)"
                    value={f2(h.avg_weight)}
                  />
                  <Info label="PENDIENTE (UN)" value={fmt(h.qty_pending)} />
                </div>

                {/* Tabla de ítems pesados */}
                <div
                  style={{
                    width: "100%",
                    overflowX: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                  }}
                >
                  <table
                    className="ow-table"
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 700,
                    }}
                  >
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
                        const net =
                          n(d.gross_weight) - n(d.tare_weight);
                        return (
                          <tr
                            key={i}
                            style={{
                              borderTop: "1px solid #eef2f6",
                              backgroundColor: i % 2 === 0 ? "#fff" : "#fefefe",
                            }}
                          >
                            <Td>{fmt(d.sub_item ?? i + 1)}</Td>
                            <Td>{fmt(d.lot_number)}</Td>
                            <Td>{fmt(d.units_count)}</Td>
                            <Td>{fmt(n(d.tare_weight).toFixed(2))}</Td>
                            <Td>{fmt(n(d.gross_weight).toFixed(2))}</Td>
                            <Td>
                              {fmt(
                                Math.max(0, net).toFixed(2)
                              )}
                            </Td>
                          </tr>
                        );
                      })}
                      {!h.details?.length && (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              padding: 12,
                              textAlign: "center",
                              color: "#6b7280",
                              fontSize: 14,
                            }}
                          >
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
      <div
        style={{
          fontSize: 12,
          color: "#0B4D75",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 15 }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 12px",
        fontWeight: 700,
        fontSize: 13,
        color: "#0B4D75",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}
function Td({ children }) {
  return (
    <td
      style={{
        padding: "10px 12px",
        fontSize: 14,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}
