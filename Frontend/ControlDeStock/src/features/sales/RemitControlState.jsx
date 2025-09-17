// src/views/remits/RemitControlState.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function RemitControlState() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [header, setHeader] = useState(null);
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("system");
  const [note, setNote] = useState("");
  const [alreadyGenerated, setAlreadyGenerated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE}/remits/from-order/${id}/preview`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!data.ok) throw new Error(data.msg || "Error preview");
        setHeader(data.header);
        setItems(data.items || []);
        setAlreadyGenerated(!!data.already_generated);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onPrintExisting = () => {
    window.open(`${API_BASE}/remits/from-order/${id}/pdf`, "_blank");
  };

  const onSave = async () => {
    try {
      const r = await fetch(`${API_BASE}/remits/from-order/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generated_by: mode, note }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.msg || "Error al crear remito");

      if (data.remit_id) {
        window.open(`${API_BASE}/remits/${data.remit_id}/pdf`, "_blank");
      } else {
        window.open(`${API_BASE}/remits/from-order/${id}/pdf`, "_blank");
      }

      setAlreadyGenerated(true);
      navigate(`/remits/list`);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <Navbar />
      {loading ? (
        <div style={{ padding: 16 }}>Cargando…</div>
      ) : err ? (
        <div style={{ padding: 16, color: "crimson" }}>{err}</div>
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 12 }}>
          <h1>Nuevo Remito</h1>

          {/* Encabezado */}
          <div style={{ border: "1px solid #e7ecf5", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div><b>N° COMPROBANTE ASOCIADO:</b> {header?.receipt_number}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
              <div><b>FECHA</b> {fmtDate(header?.date_order)}</div>
              <div><b>CLIENTE</b> {header?.client_name}</div>
              <div><b>VENDEDOR</b> {header?.salesman_name}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
              <div><b>LISTA DE PRECIO</b> {header?.price_list || "-"}</div>
              <div><b>COND. VENTA</b> {header?.sell_condition || "-"}</div>
              <div><b>COND. COBRO</b> {header?.payment_condition || "-"}</div>
            </div>
          </div>

          {/* Detalle */}
          <div style={{ border: "1px solid #e7ecf5", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f3f6fb" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>PRODUCTO</th>
                  <th style={{ textAlign: "right", padding: 8 }}>CANTIDAD</th>
                  <th style={{ textAlign: "right", padding: 8 }}>UNIDAD</th>
                  <th style={{ textAlign: "right", padding: 8 }}>PESO NETO</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const unit = (it.unit_measure || "-").toString().toUpperCase();
                  // 👇 cantidad mostrada (piezas) si la unidad es KG; si no, qty
                  let qtyShown = Number(it.qty || 0);
                  if (unit === "KG") {
                    const net = Number(it.net_weight || 0);
                    const avg = Number(it.avg_weight || 0);
                    if (avg > 0) qtyShown = Math.round(net / avg);
                  }
                  return (
                    <tr key={idx} style={{ borderTop: "1px solid #eef3fb" }}>
                      <td style={{ padding: 8 }}>{it.product_name}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{qtyShown}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{unit}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{Number(it.net_weight || 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Observaciones / Generación */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ border: "1px solid #e7ecf5", borderRadius: 8, padding: 12 }}>
              <b>Generación</b>
              <div style={{ marginTop: 8 }}>
                <label style={{ marginRight: 16 }}>
                  <input
                    type="radio"
                    name="gen"
                    value="system"
                    checked={mode === "system"}
                    onChange={() => setMode("system")}
                    disabled={alreadyGenerated}
                  />{" "}
                  Generar por sistema
                </label>
                <label>
                  <input
                    type="radio"
                    name="gen"
                    value="afip"
                    checked={mode === "afip"}
                    onChange={() => setMode("afip")}
                    disabled={alreadyGenerated}
                  />{" "}
                  Generar por AFIP
                </label>
              </div>
            </div>

            <div style={{ border: "1px solid #e7ecf5", borderRadius: 8, padding: 12 }}>
              <b>Observaciones</b>
              <textarea
                placeholder="Agregar observaciones…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={alreadyGenerated}
                style={{ width: "100%", height: 140, marginTop: 8, resize: "vertical" }}
              />
            </div>
          </div>

          {/* Acciones */}
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            {!alreadyGenerated ? (
              <>
                <button className="btn btn-primary" onClick={onSave}>Guardar y generar remito</button>
                <button className="btn" onClick={() => navigate(-1)}>Volver</button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={onPrintExisting}>Imprimir PDF</button>
                <button className="btn" onClick={() => navigate(-1)}>Volver</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
