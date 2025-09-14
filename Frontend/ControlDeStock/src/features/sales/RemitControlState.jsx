import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function RemitControlState() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [header, setHeader] = useState(null);
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("system");
  const [note, setNote] = useState("");
  const [alreadyGenerated, setAlreadyGenerated] = useState(false); // 👈 nuevo

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE}/remits/from-order/${id}/preview`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!data.ok) throw new Error(data.msg || "Error preview");
        setHeader(data.header);
        setItems(data.items || []);
        // si tu backend lo envía, lo usamos; si no, queda false
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
    // Abre el PDF del remito existente por ID de orden
    window.open(`${API_BASE}/remits/from-order/${id}/pdf`, "_blank");
  };

  const onSave = async () => {
    try {
      const r = await fetch(`${API_BASE}/remits/from-order/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generated_by: mode, note })
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.msg || "Error al crear remito");

      // 👇 si el backend devuelve remit_id, abrimos el PDF inmediato
      if (data.remit_id) {
        window.open(`${API_BASE}/remits/${data.remit_id}/pdf`, "_blank");
      } else {
        // fallback por las dudas
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

          {/* Encabezado resumido */}
          <div style={{ border: "1px solid #e7ecf5", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div><b>N° COMPROBANTE ASOCIADO:</b> {header?.receipt_number}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
              <div><b>FECHA</b> {header?.date_order}</div>
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
                {items.map((it, idx) => (
                  <tr key={idx} style={{ borderTop: "1px solid #eef2f8" }}>
                    <td style={{ padding: 8 }}>{it.product_name}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>{it.units_count}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>{it.unidad_venta || "-"}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {Number(it.net_weight || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Radios + nota + botones */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, alignItems: "start" }}>
            <div style={{ border: "1px solid #e7ecf5", borderRadius: 8, padding: 12 }}>
              <b>Generación</b>
              <div style={{ marginTop: 8 }}>
                <label style={{ marginRight: 12 }}>
                  <input
                    type="radio"
                    name="gen"
                    value="system"
                    checked={mode === "system"}
                    onChange={() => setMode("system")}
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
                  />{" "}
                  Generar por AFIP
                </label>
              </div>
            </div>

            <div>
              <label><b>Observaciones</b></label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Agregar observaciones…"
                style={{ width: "100%", height: 80, borderRadius: 8, border: "1px solid #e7ecf5", padding: 8 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              onClick={onSave}
              disabled={alreadyGenerated}
              style={{
                background: alreadyGenerated ? "#9bbcf0" : "#1f7ae0",
                color: "#fff",
                padding: "10px 14px",
                border: 0,
                borderRadius: 8,
                fontWeight: 700,
                cursor: alreadyGenerated ? "not-allowed" : "pointer",
                opacity: alreadyGenerated ? 0.7 : 1
              }}
              title={alreadyGenerated ? "La orden ya tiene un remito generado" : "Generar remito"}
            >
              {alreadyGenerated ? "Remito ya generado" : "Guardar y generar remito"}
            </button>

            <button
              onClick={onPrintExisting}
              style={{
                background: "#f0f3f8",
                color: "#111",
                padding: "10px 14px",
                border: "1px solid #d7deea",
                borderRadius: 8,
                fontWeight: 700
              }}
              title="Imprimir PDF del remito generado"
            >
              Imprimir PDF
            </button>

            <button
              onClick={() => navigate(-1)}
              style={{
                background: "#eef2f7",
                color: "#111",
                padding: "10px 14px",
                border: "1px solid #d7deea",
                borderRadius: 8,
                fontWeight: 700
              }}
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
