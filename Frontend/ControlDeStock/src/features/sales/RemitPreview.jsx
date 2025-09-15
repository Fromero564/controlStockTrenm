import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const nf2 = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfi = new Intl.NumberFormat("es-AR");

const fmt = (v) => (v === 0 || v ? String(v) : "—");
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

export default function RemitPreview() {
  const { id } = useParams(); // id = order_id
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null); // { readonly, header, items }

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch(`${API_BASE}/remits/from-order/${id}/preview`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!j?.ok) throw new Error(j?.msg || "Error en preview");
        setData(j);
      } catch (e) {
        console.error(e);
        setErr(e.message || "No se pudo cargar el preview");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const totals = useMemo(() => {
    if (!data?.items) return { items: 0, amount: 0 };
    let items = 0, amount = 0;
    for (const it of data.items) {
      const qty = Number(it.qty || 0);
      const unit = Number(it.unit_price || 0);
      items += qty;
      amount += qty * unit;
    }
    return { items, amount };
  }, [data]);

  const downloadPdf = () => {
    window.open(`${API_BASE}/remits/from-order/${id}/pdf`, "_blank", "noopener");
  };

  return (
    <div className="preview">
      <Navbar />
      <div style={{ padding: 16 }}>
        <button onClick={() => navigate(-1)} className="boton-volver">⬅ Volver</button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 32px" }}>
        <h1>DETALLE REMITO (vista)</h1>

        {loading ? (
          <p>Cargando…</p>
        ) : err ? (
          <p style={{ color: "crimson" }}>{err}</p>
        ) : !data ? null : (
          <>
            {data.readonly && (
              <div style={{ background: "#e6f4ea", border: "1px solid #b7dfc1", padding: 10, borderRadius: 8, marginBottom: 12 }}>
                Ya existe remito final para esta orden. Vista de solo lectura.
              </div>
            )}

            {/* Encabezado */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                gap: 12,
                background: "#f8fbff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Item k="N° COMPROBANTE" v={fmt(data.header?.receipt_number)} />
              <Item k="FECHA" v={fmtDate(data.header?.date_order)} />
              <Item k="CLIENTE" v={fmt(data.header?.client_name)} />
              <Item k="VENDEDOR" v={fmt(data.header?.salesman_name)} />
              <Item k="LISTA DE PRECIO" v={fmt(data.header?.price_list)} />
              <Item k="COND. VENTA" v={fmt(data.header?.sell_condition)} />
              <Item k="COND. COBRO" v={fmt(data.header?.payment_condition)} />
              <Item k="GENERADO POR" v={fmt(data.header?.generated_by)} />
            </div>

            {/* Tabla */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#eef2f7" }}>
                    <Th>CÓDIGO</Th>
                    <Th>PRODUCTO</Th>
                    <Th>UNIDAD</Th>
                    <Th className="r">CANT.</Th>
                    <Th className="r">PESO BRUTO</Th>
                    <Th className="r">PESO NETO</Th>
                    <Th className="r">P. UNIT</Th>
                    <Th className="r">TOTAL</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.map((it, i) => {
                    const qty = Number(it.qty || 0);
                    const unit = Number(it.unit_price || 0);
                    return (
                      <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
                        <Td>{it.product_id ?? "-"}</Td>
                        <Td>{it.product_name}</Td>
                        <Td className="c">{it.unit_measure || "-"}</Td>
                        <Td className="r">{nfi.format(qty)}</Td>
                        <Td className="r">{nf2.format(Number(it.gross_weight || 0))}</Td>
                        <Td className="r">{nf2.format(Number(it.net_weight || 0))}</Td>
                        <Td className="r">${nf2.format(unit)}</Td>
                        <Td className="r">${nf2.format(qty * unit)}</Td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #cbd5e1" }}>
                    <Td colSpan={3}></Td>
                    <Td className="r" style={{ fontWeight: 700 }}>{nfi.format(totals.items)}</Td>
                    <Td></Td>
                    <Td></Td>
                    <Td className="r" style={{ fontWeight: 700 }}>TOTAL</Td>
                    <Td className="r" style={{ fontWeight: 700 }}>${nf2.format(totals.amount)}</Td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observaciones + PDF */}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748b" }}>OBSERVACIONES</div>
                <div>{fmt(data.header?.note)}</div>
              </div>
              <button onClick={downloadPdf} className="btn-secondary">Descargar PDF</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Item({ k, v }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b" }}>{k}</div>
      <div style={{ fontWeight: 600 }}>{v}</div>
    </div>
  );
}
function Th({ children, className }) { return <th className={className} style={{ textAlign: className === "r" ? "right" : className === "c" ? "center" : "left", padding: "8px 10px" }}>{children}</th>; }
function Td({ children, className, colSpan }) { return <td colSpan={colSpan} className={className} style={{ textAlign: className === "r" ? "right" : className === "c" ? "center" : "left", padding: "8px 10px" }}>{children}</td>; }
