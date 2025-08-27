// src/views/orders/OrderWeight.jsx
import { useEffect, useMemo, useState, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/orderWeight.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const isCapon = (name = "") =>
  name.toLowerCase().includes("capón") || name.toLowerCase().includes("capon");

const fmt = (v) => (v === 0 || v ? String(v) : "—");
const n2 = (v) => Number(v || 0).toFixed(2);

export default function OrderWeight() {
  const { id } = useParams(); // sell_order_id / receipt_number
  const navigate = useNavigate();

  // Header / Top data
  const [header, setHeader] = useState(null);
  const [loadingHeader, setLoadingHeader] = useState(false);

  // Lines to weigh (products_sell_order)
  const [lines, setLines] = useState([]);
  const [loadingLines, setLoadingLines] = useState(false);

  // Sub-rows draft: { `${line.id}-${i}`: { garron, tara, bruto } }
  const [draft, setDraft] = useState({});
  // Accordion open/close per line
  const [open, setOpen] = useState({});

  // Tares from API
  const [tares, setTares] = useState([]);

  // Comment
  const [comment, setComment] = useState("");

  // === Load header ===
  useEffect(() => {
    const loadHeader = async () => {
      setLoadingHeader(true);
      try {
        const res = await fetch(`${API_BASE}/orders/${id}/header`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data?.ok) throw new Error(data?.msg || "Error encabezado");
        setHeader(data.header);
        setComment(data.header?.observation_order || "");
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "No se pudo obtener el encabezado.", "error");
      } finally {
        setLoadingHeader(false);
      }
    };
    loadHeader();
  }, [id]);

  // === Load tares ===
  useEffect(() => {
    const loadTares = async () => {
      try {
        const res = await fetch(`${API_BASE}/allTares`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTares(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando taras:", e);
        setTares([]);
      }
    };
    loadTares();
  }, []);

  // === Load lines ===
  useEffect(() => {
    const loadLines = async () => {
      setLoadingLines(true);
      try {
        const res = await fetch(`${API_BASE}/sell-order-products/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data?.ok) throw new Error(data?.msg || "Error productos");
        const rows = data.products || [];
        setLines(rows);

        // initialize draft + accordion
        const initDraft = {};
        const initOpen = {};
        rows.forEach((ln) => {
          const qty = Number(ln.product_quantity || 0);
          initOpen[ln.id] = false;
          for (let i = 1; i <= qty; i++) {
            initDraft[`${ln.id}-${i}`] = { garron: 0, tara: 0, bruto: 0 };
          }
        });
        setOpen(initOpen);
        setDraft(initDraft);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "No se pudieron cargar los productos.", "error");
      } finally {
        setLoadingLines(false);
      }
    };
    loadLines();
  }, [id]);

  const setField = (subKey, field, value) => {
    setDraft((old) => ({ ...old, [subKey]: { ...(old[subKey] || {}), [field]: value } }));
  };

  // === Calculations for main row (grouped by product line) ===
  const computedByLine = useMemo(() => {
    const group = {};
    lines.forEach((ln) => {
      const qty = Number(ln.product_quantity || 0);
      let netoTotal = 0;
      let piezasPesadas = 0;
      let taraTotal = 0;
      let brutoTotal = 0;

      for (let i = 1; i <= qty; i++) {
        const d = draft[`${ln.id}-${i}`] || {};
        const bruto = Number(d.bruto) || 0;
        const tara = Number(d.tara) || 0;
        if (bruto > 0 || tara > 0) piezasPesadas += 1;
        brutoTotal += bruto;
        taraTotal += tara;
        const neto = Math.max(0, bruto - tara);
        netoTotal += neto;
      }

      // CAPÓN: add 2%
      const applyExtra = isCapon(ln.product_name);
      const netoAjustado = Math.max(0, netoTotal + (applyExtra ? netoTotal * 0.02 : 0));
      const solicitada = qty;
      const pendiente = Math.max(0, solicitada - piezasPesadas);
      const promedio = piezasPesadas > 0 ? netoAjustado / piezasPesadas : 0;

      group[ln.id] = {
        netoAjustado,
        piezasPesadas,
        solicitada,
        pendiente,
        promedio,
        applyExtra,
        taraTotal,
        brutoTotal,
      };
    });
    return group;
  }, [lines, draft]);

  const toggleOpen = (lineId) => setOpen((o) => ({ ...o, [lineId]: !o[lineId] }));

  // === Save weighing (POST) with success SweetAlert ===
  const saveWeighing = async () => {
    // Build payload
    const items = lines.map((ln) => {
      const qty = Number(ln.product_quantity || 0);
      const details = [];
      for (let i = 1; i <= qty; i++) {
        const d = draft[`${ln.id}-${i}`] || {};
        details.push({
          sub_item: i,
          lot_number: d.garron ?? 0,
          tare_weight: Number(d.tara || 0),
          gross_weight: Number(d.bruto || 0),
        });
      }
      return {
        line_id: ln.id,
        product_id: ln.product_id,
        product_name: ln.product_name,
        unit_price: Number(ln.product_price || 0),
        qty_requested: qty,
        is_capon: isCapon(ln.product_name),
        details,
      };
    });

    try {
      const res = await fetch(`${API_BASE}/orders/${id}/weighings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, items }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.msg || "No se pudo guardar el pesaje");

      // Success alert after saving
      await Swal.fire({
        title: "¡Guardado!",
        text: "El pesaje se guardó correctamente.",
        icon: "success",
        confirmButtonText: "Continuar",
      });

      return true;
    } catch (e) {
      console.error(e);
      await Swal.fire("Error", e.message || "No se pudo guardar el pesaje", "error");
      return false;
    }
  };

  // === Finalize (mark as weighed) ===
  const finalize = async () => {
    const ok = await saveWeighing();
    if (!ok) return;

    const { isConfirmed } = await Swal.fire({
      title: "Marcar como PESADA",
      text: "¿Confirmás marcar la orden como PESADA?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, finalizar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/orders/${id}/weight-check`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.msg || "No se pudo finalizar");

      await Swal.fire("Listo", "Se guardó el pesaje y la orden fue marcada como PESADA.", "success");
      navigate(-1);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo finalizar", "error");
    }
  };

  return (
    <div className="ow">
      <Navbar />
      <div className="ow-topbar">
        <button className="ow-btn-back" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>

      {/* Header */}
      <div className="ow-headerCard">
        <h2 className="ow-pageTitle">DETALLE ORDEN DE VENTA</h2>
        {!header || loadingHeader ? (
          <p className="ow-muted">{loadingHeader ? "Cargando encabezado…" : "Sin datos de encabezado."}</p>
        ) : (
          <div className="ow-infoGrid">
            <div><div className="ow-k">N° COMPROBANTE AUTOMÁTICO</div><div className="ow-v">{header.id}</div></div>
            <div><div className="ow-k">FECHA</div><div className="ow-v">{fmt(header.date_order)}</div></div>
            <div><div className="ow-k">CLIENTE</div><div className="ow-v">{fmt(header.client_name)}</div></div>
            <div><div className="ow-k">VENDEDOR</div><div className="ow-v">{fmt(header.salesman_name)}</div></div>
            <div><div className="ow-k">LISTA DE PRECIO</div><div className="ow-v">{fmt(header.price_list)}</div></div>
            <div><div className="ow-k">CONDICIÓN DE VENTA</div><div className="ow-v">{fmt(header.sell_condition)}</div></div>
            <div><div className="ow-k">CONDICIÓN DE COBRO</div><div className="ow-v">{fmt(header.payment_condition)}</div></div>
            <div><div className="ow-k">COMPROBANTE</div><div className="ow-v">{header.id}</div></div>
          </div>
        )}
      </div>

      {/* Grouped detail */}
      <div className="ow-card">
        {loadingLines ? (
          <p className="ow-muted">Cargando productos…</p>
        ) : lines.length === 0 ? (
          <p className="ow-muted">No hay productos generados para esta orden.</p>
        ) : (
          <>
            <table className="ow-table">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>CORTE</th>
                  <th>PRECIO</th>
                  <th>CANTIDAD SOLICITADA</th>
                  <th>CANTIDAD PESADA</th>
                  <th>PESO TARA</th>
                  <th>PESO BRUTO</th>
                  <th>PESO NETO</th>
                  <th>PROMEDIO</th>
                  <th>PENDIENTE</th>
                  <th>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((ln) => {
                  const comp = computedByLine[ln.id] || {
                    netoAjustado: 0,
                    piezasPesadas: 0,
                    solicitada: Number(ln.product_quantity || 0),
                    pendiente: 0,
                    promedio: 0,
                    applyExtra: false,
                    taraTotal: 0,
                    brutoTotal: 0,
                  };

                  return (
                    <Fragment key={ln.id}>
                      <tr>
                        <td className="ow-code">{ln.product_id ?? "-"}</td>
                        <td className="ow-cut">{ln.product_name}</td>
                        <td className="ow-money">${n2(ln.product_price)}</td>
                        <td className="ow-number">{comp.solicitada}</td>

                        <td>
                          <button
                            type="button"
                            className="ow-chipButton"
                            onClick={() => toggleOpen(ln.id)}
                            title="Cargar piezas"
                          >
                            {comp.piezasPesadas}
                          </button>
                        </td>

                        <td className="ow-number">{n2(comp.taraTotal)}</td>
                        <td className="ow-number">{n2(comp.brutoTotal)}</td>

                        <td className="ow-number">
                          {n2(comp.netoAjustado)}
                          {comp.applyExtra && <span className="ow-extra"> (+2%)</span>}
                        </td>

                        <td className="ow-number">{n2(comp.promedio)}</td>
                        <td><span className="ow-pend">{comp.pendiente}</span></td>

                        <td>
                          <button type="button" className="ow-btn-sm" onClick={() => toggleOpen(ln.id)}>
                            {open[ln.id] ? "Ocultar" : "Cargar +"}
                          </button>
                        </td>
                      </tr>

                      {open[ln.id] && (
                        <tr className="ow-subrow">
                          <td colSpan={11}>
                            <table className="ow-subtable">
                              <thead>
                                <tr>
                                  <th>SUB-ITEM</th>
                                  <th>GARRÓN / LOTE</th>
                                  <th>PESO TARA</th>
                                  <th>PESO BRUTO</th>
                                  <th>PESO NETO</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array.from({ length: Number(ln.product_quantity || 0) }, (_, i) => {
                                  const subKey = `${ln.id}-${i + 1}`;
                                  const d = draft[subKey] || {};
                                  const neto = Math.max(0, Number(d.bruto) - Number(d.tara));
                                  const netoAdj = isCapon(ln.product_name) ? Math.max(0, neto * 1.02) : neto;

                                  return (
                                    <tr key={subKey}>
                                      <td className="center">{i + 1}</td>
                                      <td>
                                        <div className="ow-pillInput">
                                          <input
                                            type="number"
                                            min="0"
                                            value={d.garron ?? 0}
                                            onChange={(e) => setField(subKey, "garron", Number(e.target.value))}
                                          />
                                        </div>
                                      </td>
                                      <td>
                                        <div className="ow-pillSelect">
                                          <select
                                            value={d.tara ?? 0}
                                            onChange={(e) => setField(subKey, "tara", Number(e.target.value))}
                                          >
                                            <option value={0}>0</option>
                                            {tares.map((t) => (
                                              <option key={t.id} value={t.tare_weight}>
                                                {t.tare_name} ({t.tare_weight})
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="ow-pillInput">
                                          <input
                                            type="number"
                                            min="0"
                                            value={d.bruto ?? 0}
                                            onChange={(e) => setField(subKey, "bruto", Number(e.target.value))}
                                          />
                                        </div>
                                      </td>
                                      <td className="ow-number">{n2(netoAdj)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Comments */}
            <div className="ow-comments">
              <div className="ow-k">COMENTARIOS</div>
              <textarea
                className="ow-textarea"
                placeholder="Escribir…."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="ow-actions">
              <button className="ow-btn-primary" onClick={finalize}>
                Finalizar y guardar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
