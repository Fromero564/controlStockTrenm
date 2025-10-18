// src/features/sales/pre-invoicing/PreInvoiceCharge.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faTruck, faUserTie, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import "../../../assets/styles/preInvoiceCharge.css";

const API_URL = import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || "";

// helpers
const toDDMMYY = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}` : "-");
const money = (n) => new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n || 0));
const nf2 = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf3 = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default function PreInvoiceCharge() {
  const { prod = "", del = "" } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // recibido por ítem (inputs de la grilla)
  const [received, setReceived] = useState({});

  // clientes (react-select)
  const [clientsOptions, setClientsOptions] = useState([]);

  // popup de redirección
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupCtx, setPopupCtx] = useState(null); // {remit, shortage}
  const [popupTo, setPopupTo] = useState("client"); // 'client' | 'stock'
  const [popupClientOpt, setPopupClientOpt] = useState(null);
  const [popupUnits, setPopupUnits] = useState("");
  const [popupKg, setPopupKg] = useState("");
  const [popupMaxUnits, setPopupMaxUnits] = useState(0);
  const [popupMaxKg, setPopupMaxKg] = useState(0);

  // log local de redirecciones por ítem
  // redirectMap[itemId] = { entries: [{ type:'client'|'stock', client_name?, units, kg, ts }, ...] }
  const [redirectMap, setRedirectMap] = useState({});

  const title = useMemo(() => `PREFACTURACIÓN • Prod: ${toDDMMYY(prod)} • Entrega: ${toDDMMYY(del)}`, [prod, del]);

  // Carga datos base (detalle) e inicializa recibidos con lo remitido
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/preinvoices/detail?production_date=${prod}&delivery_date=${del}`);
        const js = await res.json();
        if (cancel) return;

        const payload = js?.ok ? js : { ok: false, roadmaps: [] };
        setData(payload);

        // Inicializa recibidos con lo REMITIDO
        const base = {};
        (payload.roadmaps || []).forEach((r) =>
          (r.remits || []).forEach((rm) =>
            (rm.items || []).forEach((it) => {
              base[it.id] = { units: Number(it.qty || 0), kg: Number(it.net_weight || 0) };
            })
          )
        );
        setReceived(base);

        // Hidrata recibidos guardados (por comprobantes) y pisa los inputs
        const receipts = [];
        (payload.roadmaps || []).forEach((r) =>
          (r.remits || []).forEach((rm) => {
            if (rm?.receipt_number != null) receipts.push(String(rm.receipt_number));
          })
        );
        if (receipts.length) {
          const savedRes = await fetch(
            `${API_URL}/preinvoices/saved/receipts/${encodeURIComponent(receipts.join(","))}`
          );
          if (savedRes.ok) {
            const saved = await savedRes.json();
            const map = saved?.byItemId || {};
            if (!cancel) {
              setReceived((prev) => {
                const next = { ...prev };
                for (const itemId in map) {
                  const v = map[itemId] || {};
                  next[itemId] = {
                    units: Number(v.received_units ?? prev[itemId]?.units ?? 0),
                    kg: Number(v.received_kg ?? prev[itemId]?.kg ?? 0),
                  };
                }
                return next;
              });
            }
          }
        }
      } catch {
        if (!cancel) {
          setData({ ok: false, roadmaps: [] });
          setReceived({});
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [prod, del]);

  // Hidratar "redirectMap" (devoluciones) guardadas previamente
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const u = `${API_URL}/preinvoices/returns?production_date=${prod}&delivery_date=${del}`;
        const r = await fetch(u);
        const js = await r.json();
        if (cancel) return;
        if (js?.ok && Array.isArray(js.items)) {
          const map = {};
          js.items.forEach((row) => {
            if (!map[row.item_id]) map[row.item_id] = { entries: [] };
            map[row.item_id].entries.push({
              type: row.reason === "client" ? "client" : "stock",
              client_name: row.client_name || null,
              units: Number(row.units_redirected || 0),
              kg: Number(row.kg_redirected || 0),
              ts: Date.parse(row.updated_at || row.created_at || Date.now()),
            });
          });
          setRedirectMap(map);
        }
      } catch {}
    })();
    return () => {
      cancel = true;
    };
  }, [prod, del]);

  // Carga clientes para el select
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/allClients`);
        if (!r.ok) return;
        const js = await r.json();
        const list = Array.isArray(js) ? js : js?.data || [];
        const opts = list.map((c) => ({
          value: String(c.id),
          label: c.client_name || c.name || `ID ${c.id}`,
        }));
        setClientsOptions(opts);
      } catch {}
    })();
  }, []);

  const updateReceived = (itemId, field, value) => {
    setReceived((prev) => ({
      ...prev,
      [itemId]: {
        units: field === "units" ? Number(value) : Number(prev[itemId]?.units || 0),
        kg: field === "kg" ? Number(value) : Number(prev[itemId]?.kg || 0),
      },
    }));
  };

  // Calcula faltantes de un remito contra lo recibido
  const shortagesForRemit = (rm) => {
    const out = [];
    (rm.items || []).forEach((it) => {
      const expU = Number(it.qty || 0);
      const expK = Number(it.net_weight || 0);
      const rec = received[it.id] || { units: 0, kg: 0 };
      const missU = Math.max(0, expU - Number(rec.units || 0));
      const missK = Math.max(0, expK - Number(rec.kg || 0));
      if (missU > 0 || missK > 0) {
        out.push({
          item_id: it.id,
          product_id: it.product_id,
          product_name: it.product_name,
          unit_measure: it.unit_measure,
          expected_units: expU,
          expected_kg: expK,
          received_units: Number(rec.units || 0),
          received_kg: Number(rec.kg || 0),
          missing_units: missU,
          missing_kg: missK,
        });
      }
    });
    return out;
  };

  // Helpers popup: cálculo de máximos y carga de valores si ya existía una redirección para ese destino
  const calcPopupState = (ctx, to, clientOpt) => {
    if (!ctx) return { maxU: 0, maxK: 0, seedU: "", seedK: "", editIdx: -1 };
    const entries = redirectMap[ctx.shortage.item_id]?.entries || [];
    const targetName = to === "client" ? (clientOpt?.label || "") : null;

    const editIdx =
      to === "client"
        ? entries.findIndex((e) => e.type === "client" && e.client_name === targetName)
        : entries.findIndex((e) => e.type === "stock");

    const others = entries.filter((_, i) => i !== editIdx);
    const othersU = others.reduce((a, e) => a + Number(e.units || 0), 0);
    const othersK = others.reduce((a, e) => a + Number(e.kg || 0), 0);

    const maxU = Math.max(0, Number(ctx.shortage.missing_units) - othersU);
    const maxK = Math.max(0, Number(ctx.shortage.missing_kg) - othersK);

    const seedU = editIdx >= 0 ? String(entries[editIdx].units ?? "") : "";
    const seedK = editIdx >= 0 ? String(entries[editIdx].kg ?? "") : "";

    return { maxU, maxK, seedU, seedK, editIdx };
  };

  // Popup
  const openPopup = (remit, shortage) => {
    const lastClientName = (redirectMap[shortage.item_id]?.entries || [])
      .slice()
      .reverse()
      .find((e) => e.type === "client")?.client_name;

    const lastOpt = clientsOptions.find((o) => o.label === lastClientName) || null;
    const remitOpt =
      clientsOptions.find(
        (o) => (o.label || "").toLowerCase() === String(remit.client_name || "").toLowerCase()
      ) || null;

    const initialClient = lastOpt || remitOpt || null;
    setPopupCtx({ remit, shortage });
    setPopupTo("client");
    setPopupClientOpt(initialClient);
    setPopupOpen(true);
  };

  // Recalcula máximos y seeds cada vez que cambia selección/modo
  useEffect(() => {
    if (!popupOpen || !popupCtx) return;
    const { maxU, maxK, seedU, seedK } = calcPopupState(popupCtx, popupTo, popupClientOpt);
    setPopupMaxUnits(maxU);
    setPopupMaxKg(maxK);
    setPopupUnits(seedU);
    setPopupKg(seedK);
  }, [popupOpen, popupCtx, popupTo, popupClientOpt, redirectMap]);

  const clamp = (val, max) => Math.min(Math.max(0, Number(val || 0)), Number(max || 0));
  const onUnitsChange = (e) => setPopupUnits(String(clamp(e.target.value, popupMaxUnits)));
  const onKgChange = (e) => setPopupKg(String(clamp(e.target.value, popupMaxKg)));

  const closePopup = () => {
    setPopupOpen(false);
    setPopupCtx(null);
    setPopupUnits("");
    setPopupKg("");
    setPopupClientOpt(null);
  };

  // Confirmar redirección (EDITA si ya existe ese destino; si pones 0 y 0, elimina)
  const confirmRedirect = async () => {
    if (!popupCtx) return;

    if (popupTo === "client" && !popupClientOpt) {
      alert("Seleccioná un cliente para redirigir.");
      return;
    }

    const units = clamp(popupUnits === "" ? 0 : popupUnits, popupMaxUnits);
    const kg = clamp(popupKg === "" ? 0 : popupKg, popupMaxKg);

    const payload = {
      production_date: prod,
      delivery_date: del,
      final_remit_id: popupCtx.remit.final_remit_id,
      item_id: popupCtx.shortage.item_id,
      to: popupTo, // 'client' | 'stock'
      client_id: popupTo === "client" ? popupClientOpt?.value || null : null,
      client_name: popupTo === "client" ? popupClientOpt?.label || null : null,
      units,
      kg,
    };

    try {
      await fetch(`${API_URL}/preinvoices/redirect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setRedirectMap((prev) => {
        const list = prev[payload.item_id]?.entries || [];
        const idx =
          payload.to === "client"
            ? list.findIndex((e) => e.type === "client" && e.client_name === payload.client_name)
            : list.findIndex((e) => e.type === "stock");

        let newList = [...list];

        if (Number(units) === 0 && Number(kg) === 0) {
          if (idx >= 0) newList.splice(idx, 1);
        } else if (idx >= 0) {
          newList[idx] = { ...newList[idx], units: Number(units), kg: Number(kg), ts: Date.now() };
        } else {
          newList.push({
            type: payload.to,
            client_name: payload.client_name,
            units: Number(units),
            kg: Number(kg),
            ts: Date.now(),
          });
        }

        return { ...prev, [payload.item_id]: { entries: newList } };
      });

      closePopup();
    } catch {
      closePopup();
    }
  };

  return (
    <div className="charge-wrap">
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate("/sales-panel")}>
          <FontAwesomeIcon icon={faArrowLeftLong} /> Volver
        </button>
      </div>

      <div className="charge-container">
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 14px" }}>
          <h1 className="charge-title" style={{ margin: 0 }}>{title}</h1>
        </div>

        {!data?.ok && !loading && <div className="charge-empty">No hay datos para esas fechas.</div>}
        {loading && <div className="charge-empty">Cargando...</div>}

        {data?.ok &&
          (data.roadmaps || []).map((r) => (
            <div key={r.roadmap_id} style={{ marginBottom: 18 }}>
              {/* Encabezado */}
              <div className="charge-table" style={{ marginBottom: 8 }}>
                <div className="charge-thead">ENCABEZADO</div>
                <div className="charge-tbody">
                  <div className="charge-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div><FontAwesomeIcon icon={faTruck} /> Patente: <b>{r.truck_license_plate || "-"}</b></div>
                    <div><FontAwesomeIcon icon={faUserTie} /> Chofer: <b>{r.driver || "-"}</b></div>
                    <div><FontAwesomeIcon icon={faFileInvoice} /> Roadmap ID: <b>{r.roadmap_id}</b></div>
                  </div>
                </div>
              </div>

              {/* Remitos */}
              {(r.remits || []).map((rm) => {
                const shortages = shortagesForRemit(rm);
                return (
                  <div key={rm.final_remit_id} className="charge-table" style={{ marginBottom: 12 }}>
                    <div className="charge-thead" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
                      <div>COMPROBANTE</div>
                      <div>CLIENTE</div>
                      <div>DESTINO</div>
                      <div>ORDEN</div>
                      <div style={{ textAlign: "right" }}>TOTALES</div>
                    </div>
                    <div className="charge-tbody">
                      <div className="charge-row" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
                        <div>
                          #{rm.receipt_number || rm.final_remit_id}{" "}
                          <span style={{ color: "#7a8aa0" }}>({rm.generated_by || "—"})</span>
                        </div>
                        <div>{rm.client_name || "-"}</div>
                        <div>{rm.destination || "-"}</div>
                        <div>{rm.order_id || "-"}</div>
                        <div style={{ textAlign: "right" }}>
                          Ítems: <b>{rm.total_items || 0}</b> · $ <b>{money(rm.total_amount)}</b>
                        </div>
                      </div>

                      {/* Tabla de ítems */}
                      <div className="charge-row" style={{ display: "block", padding: "0 0 12px" }}>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ background: "#f0f5fb" }}>
                              <tr>
                                <th style={{ textAlign: "left", padding: "8px 10px" }}>CÓDIGO</th>
                                <th style={{ textAlign: "left", padding: "8px 10px" }}>PRODUCTO</th>
                                <th style={{ textAlign: "center", padding: "8px 10px" }}>UNIDAD</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>UNI.REM</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>UNI.RECEP</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>KG REM</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>KG RECEP</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>P. UNIT</th>
                                <th style={{ textAlign: "right", padding: "8px 10px" }}>TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(rm.items || []).map((it) => {
                                const isKG = String(it.unit_measure || "").toUpperCase() === "KG";
                                const total =
                                  Number(it.unit_price || 0) *
                                  (isKG ? Number(it.net_weight || 0) : Number(it.qty || 0));
                                const rec = received[it.id] || { units: 0, kg: 0 };
                                const warnUnits = Number(rec.units || 0) < Number(it.qty || 0);
                                const warnKg = Number(rec.kg || 0) < Number(it.net_weight || 0);

                                return (
                                  <tr key={it.id} style={{ borderTop: "1px solid #eef2f7" }}>
                                    <td style={{ padding: "8px 10px" }}>{it.product_id ?? ""}</td>
                                    <td style={{ padding: "8px 10px" }}>{it.product_name ?? ""}</td>
                                    <td style={{ padding: "8px 10px", textAlign: "center" }}>{it.unit_measure || "-"}</td>
                                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{Number(it.qty || 0)}</td>
                                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                                      <input
                                        type="number"
                                        className={`charge-inp ${warnUnits ? "warn" : ""}`}
                                        min={0}
                                        step="1"
                                        value={rec.units ?? 0}
                                        onChange={(e) => updateReceived(it.id, "units", e.target.value)}
                                        style={{ width: 90, textAlign: "right" }}
                                      />
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                                      {Number(it.net_weight || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                                      <input
                                        type="number"
                                        className={`charge-inp ${warnKg ? "warn" : ""}`}
                                        min={0}
                                        step="0.01"
                                        value={rec.kg ?? 0}
                                        onChange={(e) => updateReceived(it.id, "kg", e.target.value)}
                                        style={{ width: 110, textAlign: "right" }}
                                      />
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{money(it.unit_price)}</td>
                                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{money(total)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Devoluciones */}
                      {shortages.length > 0 && (
                        <div className="charge-row" style={{ display: "block", background: "#fff" }}>
                          <div style={{ padding: "10px 12px", color: "#4a4a4a", fontWeight: 700 }}>Devoluciones</div>
                          <div style={{ padding: "0 12px 12px" }}>
                            {shortages.map((s) => {
                              const logs = redirectMap[s.item_id]?.entries || [];

                              const assignedUnits = logs.reduce((a, e) => a + Number(e.units || 0), 0);
                              const assignedKg = logs.reduce((a, e) => a + Number(e.kg || 0), 0);
                              const remainingUnits = Math.max(0, Number(s.missing_units) - assignedUnits);
                              const remainingKg = Math.max(0, Number(s.missing_kg) - assignedKg);
                              const fullyAssigned = remainingUnits === 0 && remainingKg === 0;

                              const clientLines = logs
                                .filter((e) => e.type === "client" && (e.units || e.kg))
                                .map((e) => `Redirigió a ${e.client_name ?? "—"} ${nf3(e.kg)} KG, ${nf2(e.units)} UN`);

                              const stockKg = logs.filter((e) => e.type === "stock").reduce((a, e) => a + Number(e.kg || 0), 0);
                              const stockUn = logs.filter((e) => e.type === "stock").reduce((a, e) => a + Number(e.units || 0), 0);
                              const stockLine = stockKg > 0 || stockUn > 0 ? `Volvió a stock ${nf3(stockKg)} KG, ${nf2(stockUn)} UN` : null;

                              const rightLines = [...clientLines, ...(stockLine ? [stockLine] : [])];

                              return (
                                <div
                                  key={s.item_id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    border: "1px solid #eef2f7",
                                    borderRadius: 10,
                                    padding: "10px 12px",
                                    margin: "8px 0",
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 700 }}>{s.product_name}</div>
                                    <div style={{ fontSize: 12, color: "#7a8aa0", marginTop: 2 }}>
                                      Faltan: {nf2(remainingUnits)} UN · {nf3(remainingKg)} KG (Recibido {nf2(s.received_units)} UN · {nf3(s.received_kg)} KG de {nf2(s.expected_units)} UN · {nf3(s.expected_kg)} KG)
                                    </div>

                                    {clientLines.length > 0 && (
                                      <div style={{ marginTop: 6 }}>
                                        {clientLines.map((line, i) => (
                                          <div key={i} className="charge-devol-line">{line}</div>
                                        ))}
                                      </div>
                                    )}
                                    {stockLine && <div className="charge-devol-line">{stockLine}</div>}
                                  </div>

                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                                    {rightLines.length > 0 && (
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#2f4b66",
                                          background: "#f0f6ff",
                                          border: "1px solid #d6e6ff",
                                          padding: "6px 8px",
                                          borderRadius: 8,
                                          maxWidth: 260,
                                          textAlign: "right",
                                        }}
                                      >
                                        {rightLines.map((ln, i) => (
                                          <div key={i}>{ln}</div>
                                        ))}
                                      </div>
                                    )}

                                    <button className="charge-btn" disabled={fullyAssigned} onClick={() => openPopup(rm, s)}>
                                      {fullyAssigned ? "Redirigido" : "Redirigir"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {/* Footer global */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
          <button className="charge-btn charge-btn-secondary" onClick={() => window.location.reload()}>
            Cancelar cambios
          </button>

          <button
            className="charge-btn charge-btn-primary"
            onClick={async () => {
              const items = Object.entries(received).map(([itemId, v]) => ({
                item_id: Number(itemId),
                units_received: Number(v?.units || 0),
                kg_received: Number(v?.kg || 0),
              }));

              const body = { production_date: prod, delivery_date: del, items };

              try {
                const r = await fetch(`${API_URL}/preinvoices/save`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const js = await r.json();
                if (js?.ok) {
                  window.location.reload();
                } else {
                  alert(js?.msg || "No se pudo guardar.");
                }
              } catch {
                alert("No se pudo guardar.");
              }
            }}
          >
            Guardar prefacturación
          </button>
        </div>

        {/* POPUP */}
        {popupOpen && popupCtx && (
          <div className="charge-popup-overlay" onClick={closePopup}>
            <div className="charge-popup" onClick={(e) => e.stopPropagation()}>
              <div className="charge-popup-header">
                <h2>REDIRIGIR SOBRANTE</h2>
                <button className="charge-popup-close" onClick={closePopup}>×</button>
              </div>

              <div className="charge-popup-body">
                <div className="charge-field">
                  <label>SELECCIONAR CORTE SOBRANTE</label>
                  <div className="charge-select charge-select--readonly">
                    {popupCtx.shortage.product_name || "-"}
                  </div>
                </div>

                <div className="charge-toggle">
                  <label className={`charge-chip ${popupTo === "client" ? "active" : ""}`}>
                    <input type="radio" name="to" checked={popupTo === "client"} onChange={() => setPopupTo("client")} />
                    Redirigir a otro cliente
                  </label>
                  <label className={`charge-chip ${popupTo === "stock" ? "active" : ""}`}>
                    <input type="radio" name="to" checked={popupTo === "stock"} onChange={() => setPopupTo("stock")} />
                    Vuelve a stock
                  </label>
                </div>

                <div className="charge-grid3">
                  <div className="charge-field">
                    <label>UNIDADES A REDIRIGIR</label>
                    <input
                      type="number"
                      className="charge-inp"
                      min={0}
                      step="1"
                      value={popupUnits}
                      onChange={(e) => setPopupUnits(String(Math.min(Math.max(0, Number(e.target.value || 0)), popupMaxUnits)))}
                      placeholder="00000"
                    />
                    <small>Máximo: {Number(popupMaxUnits || 0)} UN</small>
                  </div>

                  <div className="charge-field">
                    <label>KILOS A REDIRIGIR</label>
                    <input
                      type="number"
                      className="charge-inp"
                      min={0}
                      step="0.001"
                      value={popupKg}
                      onChange={(e) => setPopupKg(String(Math.min(Math.max(0, Number(e.target.value || 0)), popupMaxKg)))}
                      placeholder="00000"
                    />
                    <small>Máximo: {Number(popupMaxKg || 0).toFixed(3)} KG</small>
                  </div>

                  <div className="charge-field">
                    <label>CLIENTE</label>
                    <Select
                      classNamePrefix="charge-rs"
                      isDisabled={popupTo === "stock"}
                      options={clientsOptions}
                      value={popupClientOpt}
                      onChange={setPopupClientOpt}
                      placeholder="Buscar cliente…"
                      isClearable
                      isSearchable
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: 36,
                          borderRadius: 8,
                          borderColor: state.isFocused ? "#0a6baf" : "#d6dde6",
                          boxShadow: "none",
                          "&:hover": { borderColor: "#0a6baf" },
                        }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                    <small>
                      {popupTo === "stock"
                        ? "El sobrante volverá a stock general"
                        : popupClientOpt?.label || "Seleccioná un cliente"}
                    </small>
                  </div>
                </div>
              </div>

              <div className="charge-popup-footer">
                <button className="charge-btn charge-btn-primary" onClick={confirmRedirect}>
                  Confirmar redirección
                </button>
                <button className="charge-btn charge-btn-secondary" onClick={closePopup}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
