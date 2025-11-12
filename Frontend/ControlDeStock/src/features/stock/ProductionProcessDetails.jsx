import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

// Tolerancias
const WEIGHT_TOLERANCE_KG = 0.5;     // tolerancia absoluta
const WEIGHT_TOLERANCE_PCT = 0.01;   // o 1% del peso esperado

// Colores de estados
const COLORS = {
  okBg: "#edfbea",
  warnBg: "#fff8e1",
  missBg: "#ffecec",
};

const badgeStyle = (bg) => ({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 12,
  background: bg,
});

const cell = { textAlign: "left", padding: "10px 12px" };

// normaliza unidad
const normUnit = (u) => {
  const v = String(u || "").trim().toLowerCase();
  if (!v) return "unidad";
  if (["u", "u.", "unid", "unidad", "unidades"].includes(v)) return "unidad";
  if (["kg", "kilo", "kilos"].includes(v)) return "kg";
  return v;
};

const ProductionProcessDetails = () => {
  const { processNumber } = useParams();
  const navigate = useNavigate();

  const [processes, setProcesses] = useState([]);         // salida real por fila
  const [bills, setBills] = useState([]);                 // bill_ids asociados
  const [expectedDetails, setExpectedDetails] = useState([]); // ingreso esperado (por bill)
  const [loading, setLoading] = useState(true);

  // subproducción guardada (opcional, solo para mostrar)
  const [subproductionRows, setSubproductionRows] = useState([]);

  // 🔹 mapa de subproductos esperados derivados del ingreso
  //  { [tipoSalida]: { unit:"unidad"|"kg", quantity: n, totalWeight: n, perUnit: n } }
  const [expectedOutputs, setExpectedOutputs] = useState({});

  const subproductionGrouped = useMemo(() => {
    const acc = {};
    (subproductionRows || []).forEach((r) => {
      const name = String(r.cut_name || r.nombre || r.type || "").trim();
      const qty = Number(r.quantity ?? r.cantidad ?? 0);
      if (!name || !qty) return;
      acc[name] = (acc[name] || 0) + qty;
    });
    return acc;
  }, [subproductionRows]);

  // filtro de bill
  const [selectedBill, setSelectedBill] = useState("ALL");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // 1) Productos reales del proceso
        const res = await fetch(`${API_URL}/all-process-products`);
        const data = await res.json();
        const filtered = (Array.isArray(data) ? data : []).filter(
          (p) => String(p.process_number) === String(processNumber)
        );
        setProcesses(filtered);

        // 2) Bill IDs asociados al proceso
        const resBills = await fetch(`${API_URL}/all-process-number`);
        const billsData = await resBills.json();
        const bill_ids = (Array.isArray(billsData) ? billsData : [])
          .filter((row) => String(row.process_number) === String(processNumber))
          .map((row) => row.bill_id);
        setBills(bill_ids);

        // 3) Detalles esperados (por cada bill)
        let allExpected = [];
        for (const bill_id of bill_ids) {
          const r = await fetch(`${API_URL}/bill-details-readonly/${bill_id}`);
          const details = await r.json();
          const tagged = (Array.isArray(details) ? details : []).map((d) => ({
            ...d,
            bill_id,
          }));
          allExpected = allExpected.concat(tagged);
        }
        setExpectedDetails(allExpected);

        // 4) Subproducción del proceso (opcional, solo display)
        try {
          const resSub = await fetch(
            `${API_URL}/productionprocess-subproduction?process_number=${processNumber}`
          );
          if (resSub.ok) {
            const rows = await resSub.json();
            setSubproductionRows(Array.isArray(rows) ? rows : []);
          } else {
            setSubproductionRows([]);
          }
        } catch {
          setSubproductionRows([]);
        }

        // 5) 🔹 Calcular subproductos esperados desde el ingreso
        const outAcc = {};
        for (const det of allExpected) {
          const inType = String(det.type || "").trim();
          const inQty = Number(det.quantity || 0);
          if (!inType || !inQty) continue;
          try {
            const r = await fetch(`${API_URL}/subproducts-by-name/${encodeURIComponent(inType)}`);
            if (!r.ok) continue;
            const subs = await r.json();
            (Array.isArray(subs) ? subs : []).forEach((s) => {
              const name = String(s.nombre || "").trim();
              if (!name) return;
              const unit = normUnit(s.unit || "unidad");
              const perUnit = Number(s.cantidadPorUnidad || 0);
              if (!outAcc[name]) outAcc[name] = { unit, quantity: 0, totalWeight: 0, perUnit };
              outAcc[name].unit = unit;
              outAcc[name].perUnit = perUnit;

              if (unit === "kg") {
                outAcc[name].totalWeight += perUnit * inQty;
              } else {
                outAcc[name].quantity += perUnit * inQty;
              }
            });
          } catch {
            /* ignore */
          }
        }
        setExpectedOutputs(outAcc);
      } catch {
        setProcesses([]);
        setBills([]);
        setExpectedDetails([]);
        setSubproductionRows([]);
        setExpectedOutputs({});
      }
      setLoading(false);
    };
    fetchDetails();
  }, [processNumber]);

  // ---- helpers de cálculo (solo ENTRADA) ----
  const filteredExpected = useMemo(() => {
    if (selectedBill === "ALL") return expectedDetails;
    return expectedDetails.filter((d) => String(d.bill_id) === String(selectedBill));
  }, [expectedDetails, selectedBill]);

  // Agrupar lo esperado por tipo (usa weight como “Peso” esperado)
  const expectedByType = useMemo(() => {
    return filteredExpected.reduce((acc, det) => {
      const key = String(det.type || "").trim();
      if (!key) return acc;
      if (!acc[key]) acc[key] = { quantity: 0, totalWeight: 0 };
      acc[key].quantity += Number(det.quantity || 0);
      acc[key].totalWeight += Number(det.weight || 0); // unificado (manual/romaneo)
      return acc;
    }, {});
  }, [filteredExpected]);

  // ---- salida real por tipo (no se filtra por bill) ----
  const realByType = useMemo(() => {
    return (processes || []).reduce((acc, proc) => {
      const key = String(proc.type || "").trim();
      if (!key) return acc;
      if (!acc[key]) acc[key] = { quantity: 0, totalWeight: 0, netWeight: 0 };
      acc[key].quantity += Number(proc.quantity || 0);
      acc[key].totalWeight += Number(proc.gross_weight || 0);
      acc[key].netWeight += Number(proc.net_weight || 0);
      return acc;
    }, {});
  }, [processes]);

  // Conjunto de tipos a renderizar en el panel derecho
  const allTypes = useMemo(() => {
    return Array.from(
      new Set([
        ...Object.keys(expectedByType),
        ...Object.keys(realByType),
        ...Object.keys(expectedOutputs),
      ])
    );
  }, [expectedByType, realByType, expectedOutputs]);

  // ▶️ Comparativa y mensajes (ingreso directo o subproducto esperado)
  const statusForType = (type) => {
    const expIn = expectedByType[type];     // expectativa si el mismo tipo es parte del ingreso
    const expOut = expectedOutputs[type];   // expectativa si es subproducto de algún ingreso
    const real = realByType[type];

    if ((expIn || expOut) && !real) {
      return { code: "missing", label: "No se procesó este producto", bg: COLORS.missBg };
    }

    if (!expIn && !expOut && real) {
      return { code: "none", label: "", bg: "transparent" };
    }

    if (real && (expIn || expOut)) {
      if (expIn) {
        const qtyDiff = Number(real.quantity) - Number(expIn.quantity);
        const weightDiff = Number(real.netWeight || 0) - Number(expIn.totalWeight || 0);
        const tol = Math.max(WEIGHT_TOLERANCE_KG, (expIn.totalWeight || 0) * WEIGHT_TOLERANCE_PCT);
        const weightOk = Math.abs(weightDiff) <= tol;
        const qtyOk = qtyDiff === 0;

        if (qtyOk && weightOk) {
          return { code: "ok", label: "Cantidad/Peso esperado", bg: COLORS.okBg };
        }
        const parts = [];
        if (!qtyOk) {
          if (qtyDiff > 0) parts.push(`${qtyDiff} unid. de más`);
          if (qtyDiff < 0) parts.push(`faltan ${Math.abs(qtyDiff)} unid.`);
        }
        if (!weightOk) {
          if (weightDiff > 0) parts.push("peso mayor al esperado");
          if (weightDiff < 0) parts.push("peso menor al esperado");
        }
        return { code: "warn", label: parts.join(" • ") || "Diferencias detectadas", bg: COLORS.warnBg };
      }

      if (expOut) {
        const unit = normUnit(expOut.unit);
        if (unit === "kg") {
          const expectedKg = Number(expOut.totalWeight || 0);
          const realKg = Number(real.netWeight || 0);
          const tol = Math.max(WEIGHT_TOLERANCE_KG, expectedKg * WEIGHT_TOLERANCE_PCT);
          const weightOk = Math.abs(realKg - expectedKg) <= tol;
          if (weightOk) {
            return { code: "ok", label: "Cantidad/Peso esperado", bg: COLORS.okBg };
          }
          return { code: "warn", label: realKg > expectedKg ? "peso mayor al esperado" : "peso menor al esperado", bg: COLORS.warnBg };
        } else {
          const expectedQty = Number(expOut.quantity || 0);
          const realQty = Number(real.quantity || 0);
          if (realQty === expectedQty) {
            return { code: "ok", label: "Cantidad/Peso esperado", bg: COLORS.okBg };
          }
          return {
            code: "warn",
            label: realQty > expectedQty ? `${realQty - expectedQty} unid. de más` : `faltan ${expectedQty - realQty} unid.`,
            bg: COLORS.warnBg
          };
        }
      }
    }

    return { code: "none", label: "", bg: "transparent" };
  };

  // Estilo de tabla común
  const tableBase = {
    width: "100%",
    marginTop: 10,
    borderCollapse: "separate",
    borderSpacing: 0,
  };

  if (loading)
    return (
      <div>
        <Navbar />
        <div style={{ margin: "20px" }}>
          <button className="boton-volver" onClick={() => navigate(-1)}>
            ⬅ Volver
          </button>
        </div>
        <h3>Cargando...</h3>
      </div>
    );

  return (
    <div>
      <Navbar />

      {/* Barra superior con botón volver */}
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>

      <h2 style={{ margin: "0 40px 18px" }}>
        Detalles del proceso #{processNumber}
      </h2>

      {/* Ingreso por subproducción (si existe) */}
      {Object.keys(subproductionGrouped).length > 0 && (
        <div
          style={{
            margin: "0 40px 18px",
            padding: "14px 16px",
            border: "1px solid #ffda9e",
            background: "#fff7e6",
            borderRadius: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8, color: "#8a5a00" }}>
            Ingreso por subproducción
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {Object.entries(subproductionGrouped).map(([name, qty]) => (
              <li key={name} style={{ marginBottom: 4 }}>
                <span
                  style={{
                    background: "#ffe6bf",
                    borderRadius: 8,
                    padding: "2px 8px",
                    marginRight: 6,
                    color: "#8a5a00",
                    fontWeight: 600,
                    display: "inline-block",
                    minWidth: 10,
                  }}
                >
                  {name}
                </span>
                <b style={{ color: "#333" }}>{qty}</b> unidad{qty > 1 ? "es" : ""}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 6, fontSize: 12, color: "#8a5a00" }}>
            * Estos cortes ingresaron sin remito y se registraron como subproducción del proceso.
          </div>
        </div>
      )}

      {/* Filtro por comprobante */}
      {bills.length > 0 && (
        <div
          style={{
            margin: "0 40px 24px",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label htmlFor="billFilter" style={{ fontWeight: 600 }}>
            Filtrar ingreso por comprobante:
          </label>
          <select
            id="billFilter"
            value={selectedBill}
            onChange={(e) => setSelectedBill(e.target.value)}
            style={{
              minWidth: 260,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #bcd7f7",
              background: "#f7fbff",
              outline: "none",
            }}
          >
            <option value="ALL">Todos los comprobantes</option>
            {bills.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Contenedor de tarjetas */}
      <div
        style={{
          display: "flex",
          gap: "50px",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "0 40px 30px",
        }}
      >
        {/* Panel: Ingreso (ESPERADO, filtrado por bill) */}
        <div
          style={{
            flex: 1,
            minWidth: 360,
            background: "#f5faff",
            border: "1px solid #aad2f5",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <h3
            style={{
              borderBottom: "1px solid #aad2f5",
              paddingBottom: 8,
              marginTop: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span>Ingreso al proceso productivo</span>
            {selectedBill !== "ALL" && (
              <span style={{ fontSize: 12, color: "#337ab7" }}>
                Mostrando comprobante: <b>{selectedBill}</b>
              </span>
            )}
          </h3>

          {Object.keys(expectedByType).length === 0 ? (
            <p style={{ margin: "12px 0 0" }}>
              No hay información esperada asociada a este filtro.
            </p>
          ) : (
            <>
              <table style={tableBase}>
                <thead>
                  <tr style={{ background: "#e9f3ff" }}>
                    <th style={cell}>Tipo</th>
                    <th style={cell}>Cantidad</th>
                    <th style={cell}>Peso</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expectedByType).map(([type, info], idx) => (
                    <tr key={type} style={{ background: idx % 2 ? "#fff" : "#f9fbff" }}>
                      <td style={cell}>{type}</td>
                      <td style={cell}>{info.quantity}</td>
                      <td style={cell}>{info.totalWeight} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 🔹 SUBPRODUCTOS ESPERADOS (TOTALES) — sin “por pieza” */}
              {Object.keys(expectedOutputs).length > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 14px",
                    border: "1px solid #bfe6c5",
                    background: "#f6fffb",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#167e50", marginBottom: 8 }}>
                    ▪ Subproductos esperados (totales):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {Object.entries(expectedOutputs)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([name, info]) => (
                        <li key={name} style={{ marginBottom: 4 }}>
                          <b>{name}</b>
                          {" — "}
                          {info.unit === "kg"
                            ? `${Number(info.totalWeight || 0)} kg`
                            : `${Number(info.quantity || 0)} unid.`}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Panel: Resultado (REAL) con estado segun ingreso/subproducto esperado */}
        <div
          style={{
            flex: 1,
            minWidth: 360,
            background: "#f7fff5",
            border: "1px solid #b2e7c2",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <h3
            style={{
              borderBottom: "1px solid #b2e7c2",
              paddingBottom: 8,
              marginTop: 0,
            }}
          >
            Resultado obtenido del proceso productivo
          </h3>

          {allTypes.length === 0 ? (
            <p style={{ margin: "12px 0 0" }}>No hay registros para este proceso.</p>
          ) : (
            <table style={tableBase}>
              <thead>
                <tr style={{ background: "#edfbea" }}>
                  <th style={cell}>Tipo</th>
                  <th style={cell}>Cantidad</th>
                  <th style={cell}>Peso bruto</th>
                  <th style={cell}>Peso neto</th>
                  <th style={cell}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {allTypes.map((type, idx) => {
                  const info = realByType[type];
                  const status = statusForType(type);
                  return (
                    <tr
                      key={type}
                      style={{
                        background:
                          status.code === "ok"
                            ? COLORS.okBg
                            : status.code === "warn"
                            ? COLORS.warnBg
                            : status.code === "missing"
                            ? COLORS.missBg
                            : idx % 2
                            ? "#fff"
                            : "#f7fff5",
                      }}
                    >
                      <td style={cell}>{type}</td>
                      <td style={cell}>{info ? info.quantity : "—"}</td>
                      <td style={cell}>{info ? `${info.totalWeight} kg` : "—"}</td>
                      <td style={cell}>{info ? `${info.netWeight} kg` : "—"}</td>
                      <td style={cell}>
                        {status.label ? (
                          <span style={badgeStyle(status.bg)}>{status.label}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ padding: "0 40px 40px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={badgeStyle(COLORS.okBg)}>✔️ Cantidad/Peso esperado</span>
          <span style={badgeStyle(COLORS.warnBg)}>⚠️ Menos/Cantidad de más • Peso mayor/menor</span>
          <span style={badgeStyle(COLORS.missBg)}>✖️ No se procesó este producto</span>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          La coincidencia por peso considera una tolerancia de {WEIGHT_TOLERANCE_KG} kg o {WEIGHT_TOLERANCE_PCT * 100}% del peso esperado (lo que sea mayor).
        </p>
      </div>
    </div>
  );
};

export default ProductionProcessDetails;
