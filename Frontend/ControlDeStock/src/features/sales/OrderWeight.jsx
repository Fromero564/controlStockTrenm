// src/views/orders/OrderWeight.jsx
import { useEffect, useMemo, useState, useRef, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/orderWeight.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// Helpers
const isCaponLike = (name = "") => {
  const s = (name || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return s.includes("capon") || s.includes("capo") || s.includes("media res capon");
};
const fmt = (v) => (v === 0 || v ? String(v) : "—");
const n2 = (v) => Number(v || 0).toFixed(2);
const toDigits = (str) => String(str ?? "").replace(/[^\d]/g, "");
const toNumberOr = (str, fb = 0) => {
  const n = Number(str);
  return Number.isFinite(n) ? n : fb;
};

export default function OrderWeight() {
  const { id } = useParams(); // ID de la orden
  const navigate = useNavigate();

  // Encabezado
  const [header, setHeader] = useState(null);
  const [loadingHeader, setLoadingHeader] = useState(false);

  // Líneas (productos de la orden)
  const [lines, setLines] = useState([]);
  const [loadingLines, setLoadingLines] = useState(false);

  // Detalle por línea: { [lineId]: Array<{ cant, garron, tara, bruto }> }
  const [draft, setDraft] = useState({});
  // Empaque por línea
  const [pkgByLine, setPkgByLine] = useState({}); // { [lineId]: string }
  // Visibilidad de detalle por línea
  const [open, setOpen] = useState({});
  // “Agregar filas”
  const [addQtyMap, setAddQtyMap] = useState({}); // { [lineId]: string }

  // Taras disponibles
  const [tares, setTares] = useState([]);
  // Comentarios
  const [comment, setComment] = useState("");

  // refs para auto-scroll al abrir el detalle
  const subRefs = useRef({});
  // guard para NO autoagregar dos veces
  const autoAddedRef = useRef({}); // { [lineId]: boolean }

  // -------- CARGA SOLO PARA PESAR ----------
  useEffect(() => {
    const load = async () => {
      setLoadingHeader(true);
      setLoadingLines(true);
      try {
        const [hRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/orders/${id}/header`),
          fetch(`${API_BASE}/sell-order-products/${id}`),
        ]);

        if (!hRes.ok) throw new Error(`Header HTTP ${hRes.status}`);
        if (!pRes.ok) throw new Error(`Productos HTTP ${pRes.status}`);

        const hData = await hRes.json();
        const pData = await pRes.json();
        if (!hData?.ok) throw new Error(hData?.msg || "Header inválido");
        if (!pData?.ok) throw new Error(pData?.msg || "Productos inválidos");

        setHeader(hData.header || null);
        setComment(hData.header?.observation_order || "");

        const rows = pData.products || [];
        setLines(rows);

        // Inicializaciones
        const initOpen = {};
        const initDraft = {};
        const initAddQty = {};
        const initPkg = {};
        rows.forEach((ln) => {
          initOpen[ln.id] = false;
          initDraft[ln.id] = [];
          initAddQty[ln.id] = "0";
          initPkg[ln.id] = "";
        });
        setOpen(initOpen);
        setDraft(initDraft);
        setAddQtyMap(initAddQty);
        setPkgByLine(initPkg);
        autoAddedRef.current = {};
      } catch (e) {
        console.error(e);
        Swal.fire("Error", e.message || "No se pudieron cargar los datos.", "error");
      } finally {
        setLoadingHeader(false);
        setLoadingLines(false);
      }
    };
    load();
  }, [id]);

  // Taras
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

  // Cálculos por línea
  const computedByLine = useMemo(() => {
    const group = {};
    lines.forEach((ln) => {
      const solicitada = Number(ln.product_quantity || 0);
      const detalles = draft[ln.id] || [];

      // piezas pesadas = suma de "cant" válidos (>0)
      const piezasPesadas = detalles.reduce((acc, d) => {
        const n = Number(d.cant);
        return acc + (Number.isFinite(n) && n > 0 ? n : 0);
      }, 0);

      let netoTotal = 0;
      let taraTotal = 0;
      let brutoTotal = 0;

      const addPct = isCaponLike(ln.product_name) ? 0.02 : 0;

      detalles.forEach((d) => {
        const bruto = Number(d.bruto);
        const tara = Number(d.tara);
        const bOK = Number.isFinite(bruto) ? bruto : 0;
        const tOK = Number.isFinite(tara) ? tara : 0;
        brutoTotal += bOK;
        taraTotal += tOK;
        const neto = Math.max(0, bOK - tOK);
        const netoAdj = neto * (1 + addPct);
        netoTotal += netoAdj;
      });

      const pendiente = Math.max(0, solicitada - piezasPesadas);
      const promedio = piezasPesadas > 0 ? netoTotal / piezasPesadas : 0;

      group[ln.id] = {
        solicitada,
        piezasPesadas,
        pendiente,
        taraTotal,
        brutoTotal,
        netoTotal, // ya viene ajustado si corresponde
        promedio,
        addPct,
      };
    });
    return group;
  }, [lines, draft]);

  // -------- Handlers --------
  const addDetail = (lineId, count = 1) => {
    setDraft((old) => {
      const current = old[lineId] || [];
      const line = lines.find((l) => l.id === lineId);
      const solicitada = Number(line?.product_quantity || 0);

      // piezas ya cargadas (sumando "cant" válidos)
      const piezasActuales = current.reduce((acc, it) => {
        const n = Number(it.cant);
        return acc + (Number.isFinite(n) && n > 0 ? n : 0);
      }, 0);
      const pendiente = Math.max(0, solicitada - piezasActuales);
      if (pendiente <= 0) return old;

      const toAdd = Math.min(Math.max(1, Number(count || 1)), pendiente);

      // Filas nuevas con cant = "" (para completar)
      const extra = Array.from({ length: toAdd }, () => ({
        cant: "",
        garron: "",
        tara: 0,
        bruto: "",
      }));

      return { ...old, [lineId]: [...current, ...extra] };
    });
  };

  const removeDetail = (lineId, index) => {
    setDraft((old) => {
      const current = [...(old[lineId] || [])];
      current.splice(index, 1);
      return { ...old, [lineId]: current };
    });
  };

  const setField = (lineId, index, field, value) => {
    setDraft((old) => {
      const arr = [...(old[lineId] || [])];
      arr[index] = { ...(arr[index] || {}), [field]: value };
      return { ...old, [lineId]: arr };
    });
  };

  // CANT.: permite vacío. Si hay valor, lo clamp a [1, pendiente disponible]
  const setCantSafe = (lineId, index, raw) => {
    const str = toDigits(raw);
    if (str === "") {
      setDraft((old) => {
        const arr = [...(old[lineId] || [])];
        arr[index] = { ...(arr[index] || {}), cant: "" };
        return { ...old, [lineId]: arr };
      });
      return;
    }

    const line = lines.find((l) => l.id === lineId);
    const solicitada = Number(line?.product_quantity || 0);

    setDraft((old) => {
      const arr = [...(old[lineId] || [])];
      const others = arr.reduce((acc, it, i) => {
        if (i === index) return acc;
        const n = Number(it.cant);
        return acc + (Number.isFinite(n) && n > 0 ? n : 0);
      }, 0);
      const maxForThis = Math.max(0, solicitada - others);
      const val = Math.min(Math.max(Number(str), 1), Math.max(1, maxForThis));
      arr[index] = { ...(arr[index] || {}), cant: String(val) };
      return { ...old, [lineId]: arr };
    });
  };

  // Abrir/cerrar: al abrir, autoagrega 1 fila si no hay y hace scroll al detalle
  const toggleOpen = (lineId) => {
    setOpen((o) => {
      const willOpen = !o[lineId];
      const next = { ...o, [lineId]: willOpen };
      if (willOpen) {
        if (!autoAddedRef.current[lineId]) {
          const hasRows = (draft[lineId] || []).length > 0;
          if (!hasRows) addDetail(lineId, 1); // auto agrega 1
          autoAddedRef.current[lineId] = true;
        }
        setTimeout(() => {
          const el = subRefs.current[lineId];
          if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 0);
      }
      return next;
    });
  };

  const onClickAddRows = (ln) => {
    const raw = addQtyMap[ln.id] ?? "0";
    const typed = toNumberOr(toDigits(raw), 0);
    if (!typed || typed <= 0) {
      Swal.fire("Cantidad inválida", "Ingresá un número mayor a 0.", "warning");
      return;
    }
    addDetail(ln.id, typed); // addDetail ya limita por pendiente
    setAddQtyMap((m) => ({ ...m, [ln.id]: "0" })); // vuelve a 0
  };

  const saveWeighing = async () => {
    const items = lines.map((ln) => {
      const detalles = draft[ln.id] || [];
      const details = detalles.map((d, i) => ({
        sub_item: i + 1,
        units_count: toNumberOr(d.cant, 0), // si está vacío, 0
        lot_number: toNumberOr(d.garron, 0),
        tare_weight: toNumberOr(d.tara, 0),
        gross_weight: toNumberOr(d.bruto, 0),
      }));

      return {
        line_id: ln.id,
        product_id: ln.product_id,
        product_name: ln.product_name,
        unit_price: Number(ln.product_price || 0),
        qty_requested: Number(ln.product_quantity || 0),
        packaging_type: String(pkgByLine[ln.id] || "").trim(), // empaque por línea
        is_capon_like: isCaponLike(ln.product_name),
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
      if (!res.ok || !data?.ok)
        throw new Error(data?.msg || "No se pudo guardar el pesaje");

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
      const res = await fetch(`${API_BASE}/orders/${id}/weight-check`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.msg || "No se pudo finalizar");

      await Swal.fire(
        "Listo",
        "Se guardó el pesaje y la orden fue marcada como PESADA.",
        "success"
      );
      navigate(-1);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo finalizar", "error");
    }
  };

  // ---------- Render ----------
  return (
    <div className="ow">
      <Navbar />
      <div className="ow-topbar">
        <button className="ow-btn-back" onClick={() => navigate("/sales-panel")}>
          ⬅ Volver
        </button>
      </div>

      <div className="ow-headerCard">
        <h2 className="ow-pageTitle">DETALLE ORDEN DE VENTA</h2>
        {!header || loadingHeader ? (
          <p className="ow-muted">
            {loadingHeader ? "Cargando encabezado…" : "Sin datos de encabezado."}
          </p>
        ) : (
          <div className="ow-infoGrid">
            <div>
              <div className="ow-k">N° COMPROBANTE AUTOMÁTICO</div>
              <div className="ow-v">{header.id}</div>
            </div>
            <div>
              <div className="ow-k">FECHA</div>
              <div className="ow-v">{fmt(header.date_order)}</div>
            </div>
            <div>
              <div className="ow-k">CLIENTE</div>
              <div className="ow-v">{fmt(header.client_name)}</div>
            </div>
            <div>
              <div className="ow-k">VENDEDOR</div>
              <div className="ow-v">{fmt(header.salesman_name)}</div>
            </div>
            <div>
              <div className="ow-k">LISTA DE PRECIO</div>
              <div className="ow-v">{fmt(header.price_list)}</div>
            </div>
            <div>
              <div className="ow-k">CONDICIÓN DE VENTA</div>
              <div className="ow-v">{fmt(header.sell_condition)}</div>
            </div>
            <div>
              <div className="ow-k">CONDICIÓN DE COBRO</div>
              <div className="ow-v">{fmt(header.payment_condition)}</div>
            </div>
            <div>
              <div className="ow-k">COMPROBANTE</div>
              <div className="ow-v">{header.id}</div>
            </div>
          </div>
        )}
      </div>

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
                  <th>EMPAQUE</th>
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
                    solicitada: Number(ln.product_quantity || 0),
                    piezasPesadas: 0,
                    pendiente: 0,
                    taraTotal: 0,
                    brutoTotal: 0,
                    netoTotal: 0,
                    promedio: 0,
                    addPct: 0,
                  };

                  const addQty = addQtyMap[ln.id] ?? "0";

                  return (
                    <Fragment key={ln.id}>
                      <tr>
                        <td className="ow-code">{ln.product_id ?? "-"}</td>
                        <td className="ow-cut">{ln.product_name}</td>

                        {/* Empaque por línea */}
                        <td style={{ minWidth: 180 }}>
                          <div className="ow-pillInput ow-w-empaque">
                            <input
                              type="text"
                              placeholder="Tipo de empaque"
                              value={pkgByLine[ln.id] ?? ""}
                              onChange={(e) =>
                                setPkgByLine((m) => ({ ...m, [ln.id]: e.target.value }))
                              }
                            />
                          </div>
                        </td>

                        <td className="ow-money">${n2(ln.product_price)}</td>
                        <td className="ow-number">{comp.solicitada}</td>

                        <td>
                          <button
                            type="button"
                            className="ow-chipButton"
                            onClick={() => toggleOpen(ln.id)}
                            title="Abrir detalle"
                          >
                            {comp.piezasPesadas}
                          </button>
                        </td>

                        <td className="ow-number">{n2(comp.taraTotal)}</td>
                        <td className="ow-number">{n2(comp.brutoTotal)}</td>

                        <td className="ow-number">
                          {n2(comp.netoTotal)}
                          {comp.addPct > 0 && <span className="ow-extra"> (+2%)</span>}
                        </td>

                        <td className="ow-number">{n2(comp.promedio)}</td>

                        {/* PENDIENTE */}
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              backgroundColor: comp.pendiente > 0 ? "#fff3cd" : "#d4edda",
                              color: comp.pendiente > 0 ? "#856404" : "#155724",
                              borderRadius: "10px",
                              fontWeight: "bold",
                              minWidth: "36px",
                              textAlign: "center",
                              border: "1px solid rgba(0,0,0,0.08)",
                            }}
                          >
                            {comp.pendiente}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="ow-btn-sm"
                            onClick={() => toggleOpen(ln.id)}
                          >
                            {open[ln.id] ? "Ocultar" : "Cargar +"}
                          </button>
                        </td>
                      </tr>

                      {open[ln.id] && (
                        <tr className="ow-subrow">
                          <td colSpan={12} style={{ overflow: "visible", paddingTop: 6 }}>
                            <div
                              ref={(el) => (subRefs.current[ln.id] = el)}
                              style={{ overflow: "visible" }}
                            >
                              {/* Barra “Agregar filas” */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "10px 12px",
                                  margin: "2px 0 12px",
                                  background: "#f8fafc",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: 12,
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                                }}
                              >
                                <span className="ow-muted" style={{ fontWeight: 600 }}>
                                  Agregar filas
                                </span>

                                <div className="ow-pillInput" style={{ width: 120 }}>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={addQty}
                                    onChange={(e) => {
                                      const v = toDigits(e.target.value);
                                      setAddQtyMap((m) => ({ ...m, [ln.id]: v }));
                                    }}
                                    style={{ textAlign: "center", fontWeight: 600 }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  className="ow-btn-xs"
                                  onClick={() => onClickAddRows(ln)}
                                  disabled={computedByLine[ln.id]?.pendiente === 0}
                                  title={
                                    computedByLine[ln.id]?.pendiente === 0
                                      ? "No hay pendiente"
                                      : `Agregar hasta ${computedByLine[ln.id]?.pendiente}`
                                  }
                                  style={{ minWidth: 92 }}
                                >
                                  Agregar
                                </button>

                                <span className="ow-muted" style={{ fontWeight: 600 }}>
                                  Pendiente: {computedByLine[ln.id]?.pendiente ?? 0}
                                </span>
                              </div>

                              {/* Subtabla (inputs habilitados) */}
                              <table className="ow-subtable">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>CANT.</th>
                                    <th>GARRÓN / LOTE</th>
                                    <th>TARA</th>
                                    <th>ADICIONAL</th>
                                    <th>PESO BRUTO</th>
                                    <th>PESO NETO</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(draft[ln.id] || []).map((d, idx) => {
                                    const addPct = isCaponLike(ln.product_name) ? 0.02 : 0;
                                    const neto = Math.max(
                                      0,
                                      toNumberOr(d.bruto, 0) - toNumberOr(d.tara, 0)
                                    );
                                    const netoAdj = neto * (1 + addPct);

                                    return (
                                      <tr key={`${ln.id}-${idx + 1}`}>
                                        <td className="center">{idx + 1}</td>

                                        <td>
                                          <div className="ow-pillInput ow-w-cant">
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              placeholder="—"
                                              value={d.cant === 0 ? "" : String(d.cant ?? "")}
                                              onChange={(e) => setCantSafe(ln.id, idx, e.target.value)}
                                              style={{ textAlign: "center" }}
                                            />
                                          </div>
                                        </td>

                                        <td>
                                          <div className="ow-pillInput ow-w-garron">
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              placeholder="0"
                                              value={String(d.garron ?? "")}
                                              onChange={(e) =>
                                                setField(ln.id, idx, "garron", toDigits(e.target.value))
                                              }
                                              style={{ textAlign: "center" }}
                                            />
                                          </div>
                                        </td>

                                        <td>
                                          <div className="ow-pillSelect ow-w-tara">
                                            <select
                                              value={toNumberOr(d.tara, 0)}
                                              onChange={(e) =>
                                                setField(ln.id, idx, "tara", Number(e.target.value))
                                              }
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

                                        <td className="center" style={{ fontWeight: 600 }}>
                                          {addPct > 0 ? "2 %" : "0 %"}
                                        </td>

                                        <td>
                                          <div className="ow-pillInput ow-w-bruto">
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              placeholder="0"
                                              value={String(d.bruto ?? "")}
                                              onChange={(e) =>
                                                setField(
                                                  ln.id,
                                                  idx,
                                                  "bruto",
                                                  e.target.value.replace(/[^\d.]/g, "")
                                                )
                                              }
                                              style={{ textAlign: "center" }}
                                            />
                                          </div>
                                        </td>

                                        <td className="ow-number">{n2(netoAdj)}</td>

                                        <td className="center">
                                          <button
                                            type="button"
                                            onClick={() => removeDetail(ln.id, idx)}
                                            title="Eliminar fila"
                                            style={{
                                              background: "none",
                                              border: "none",
                                              cursor: "pointer",
                                              fontSize: "16px",
                                              color: "red",
                                            }}
                                          >
                                            <FontAwesomeIcon icon={faTrash} />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Comentarios */}
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

            {/* Acciones */}
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
