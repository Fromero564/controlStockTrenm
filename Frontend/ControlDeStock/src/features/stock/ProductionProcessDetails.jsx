import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

// Ajustes de comparación
const WEIGHT_TOLERANCE_KG = 0.5;     // tolerancia absoluta
const WEIGHT_TOLERANCE_PCT = 0.01;   // o 1% del peso esperado

// Colores de estados
const COLORS = {
  matchBg: "#edfbea",
  mismatchBg: "#fff8e1",
  missingBg: "#ffecec",
  extraBg: "#e9f2ff",
};

const badgeStyle = (bg) => ({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 12,
  background: bg,
});

const cell = { textAlign: "left", padding: "10px 12px" };

const ProductionProcessDetails = () => {
  const { processNumber } = useParams();
  const navigate = useNavigate();

  // ---- estados base ----
  const [processes, setProcesses] = useState([]);         // filas reales del proceso (salida)
  const [bills, setBills] = useState([]);                 // bill_ids asociados
  const [expectedDetails, setExpectedDetails] = useState([]); // detalles esperados (entrada) ETIQUETADOS con bill_id
  const [loading, setLoading] = useState(true);

  // ---- NUEVO: subproducción guardada para este proceso ----
  const [subproductionRows, setSubproductionRows] = useState([]);
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

  // ---- filtro por comprobante ----
  const [selectedBill, setSelectedBill] = useState("ALL");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // 1) Productos reales del proceso
        const res = await fetch(`${API_URL}/all-process-products`);
        const data = await res.json();
        const filtered = data.filter(
          (p) => p.process_number.toString() === processNumber
        );
        setProcesses(filtered);

        // 2) Bill IDs asociados al proceso
        const resBills = await fetch(`${API_URL}/all-process-number`);
        const billsData = await resBills.json();
        const bill_ids = billsData
          .filter((row) => row.process_number.toString() === processNumber)
          .map((row) => row.bill_id);
        setBills(bill_ids);

        // 3) Detalles esperados desde remitos (ETIQUETADOS con bill_id)
        let allExpected = [];
        for (const bill_id of bill_ids) {
          const resDetails = await fetch(
            `${API_URL}/bill-details-readonly/${bill_id}`
          );
          const details = await resDetails.json();
          const tagged = (Array.isArray(details) ? details : []).map((d) => ({
            ...d,
            bill_id,
          }));
          allExpected = allExpected.concat(tagged);
        }
        setExpectedDetails(allExpected);

        // 4) NUEVO: Subproducción persistida para este proceso
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
      } catch (err) {
        setProcesses([]);
        setBills([]);
        setExpectedDetails([]);
        setSubproductionRows([]);
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

  // Agrupar lo esperado por tipo (usa weight como peso neto esperado)
  const expectedByType = useMemo(() => {
    return filteredExpected.reduce((acc, det) => {
      if (!acc[det.type]) acc[det.type] = { quantity: 0, totalWeight: 0 };
      acc[det.type].quantity += Number(det.quantity);
      acc[det.type].totalWeight += Number(det.weight || 0);
      return acc;
    }, {});
  }, [filteredExpected]);

  // ---- salida real por tipo (no se filtra por bill) ----
  const realByType = useMemo(() => {
    return processes.reduce((acc, proc) => {
      if (!acc[proc.type])
        acc[proc.type] = { quantity: 0, totalWeight: 0, netWeight: 0 };
      acc[proc.type].quantity += Number(proc.quantity);
      acc[proc.type].totalWeight += Number(proc.gross_weight || 0);
      acc[proc.type].netWeight += Number(proc.net_weight || 0);
      return acc;
    }, {});
  }, [processes]);

  // Conjunto de todos los tipos para pintar estados (entrada filtrada + salida)
  const allTypes = useMemo(
    () =>
      Array.from(
        new Set([
          ...Object.keys(expectedByType),
          ...Object.keys(realByType),
        ])
      ),
    [expectedByType, realByType]
  );

  const statusForType = (type) => {
    const exp = expectedByType[type];
    const real = realByType[type];
    if (exp && !real) {
      return { code: "missing", label: "No salió", bg: COLORS.missingBg };
    }
    if (!exp && real) {
      return { code: "extra", label: "Extra no esperado", bg: COLORS.extraBg };
    }
    if (exp && real) {
      const qtyMatch = Number(exp.quantity) === Number(real.quantity);
      const diff = Math.abs((real.netWeight || 0) - (exp.totalWeight || 0));
      const tol = Math.max(
        WEIGHT_TOLERANCE_KG,
        (exp.totalWeight || 0) * WEIGHT_TOLERANCE_PCT
      );
      const weightMatch = diff <= tol;

      if (qtyMatch && weightMatch) {
        return { code: "match", label: "Coincide", bg: COLORS.matchBg };
      }
      return {
        code: "mismatch",
        label: "Hay diferencia",
        bg: COLORS.mismatchBg,
        deltas: {
          qty: Number(real.quantity) - Number(exp.quantity),
          net: Number(real.netWeight || 0) - Number(exp.totalWeight || 0),
        },
      };
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

      {/* 🔶 NUEVO: recuadro de Ingreso por subproducción */}
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
            <table style={tableBase}>
              <thead>
                <tr style={{ background: "#e9f3ff" }}>
                  <th style={cell}>Tipo</th>
                  <th style={cell}>Cantidad</th>
                  <th style={cell}>Peso neto</th>
                  <th style={cell}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(expectedByType).map(([type, info], idx) => {
                  const status = statusForType(type);
                  return (
                    <tr
                      key={type}
                      style={{
                        background:
                          status.code === "match"
                            ? COLORS.matchBg
                            : status.code === "mismatch"
                            ? COLORS.mismatchBg
                            : status.code === "missing"
                            ? COLORS.missingBg
                            : idx % 2
                            ? "#fff"
                            : "#f9fbff",
                      }}
                    >
                      <td style={cell}>{type}</td>
                      <td style={cell}>{info.quantity}</td>
                      <td style={cell}>{info.totalWeight} kg</td>
                      <td style={cell}>
                        {status.code === "match" && (
                          <span style={badgeStyle(COLORS.matchBg)}>✔️ Coincide</span>
                        )}
                        {status.code === "mismatch" && (
                          <span style={badgeStyle(COLORS.mismatchBg)}>
                            ⚠️ Diferencia
                          </span>
                        )}
                        {status.code === "missing" && (
                          <span style={badgeStyle(COLORS.missingBg)}>✖️ No salió</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Panel: Resultado (REAL, no se filtra por bill) */}
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

          {Object.keys(realByType).length === 0 ? (
            <p style={{ margin: "12px 0 0" }}>
              No hay registros reales para este proceso.
            </p>
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
                {Object.entries(realByType).map(([type, info], idx) => {
                  const status = statusForType(type);
                  return (
                    <tr
                      key={type}
                      style={{
                        background:
                          status.code === "match"
                            ? COLORS.matchBg
                            : status.code === "mismatch"
                            ? COLORS.mismatchBg
                            : status.code === "extra"
                            ? COLORS.extraBg
                            : idx % 2
                            ? "#fff"
                            : "#f7fff5",
                      }}
                    >
                      <td style={cell}>{type}</td>
                      <td style={cell}>{info.quantity}</td>
                      <td style={cell}>{info.totalWeight} kg</td>
                      <td style={cell}>{info.netWeight} kg</td>
                      <td style={cell}>
                        {status.code === "match" && (
                          <span style={badgeStyle(COLORS.matchBg)}>✔️ Coincide</span>
                        )}
                        {status.code === "mismatch" && (
                          <span style={badgeStyle(COLORS.mismatchBg)}>
                            ⚠️ Diferencia
                          </span>
                        )}
                        {status.code === "extra" && (
                          <span style={badgeStyle(COLORS.extraBg)}>
                            ⓘ Extra no esperado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Mostrar faltantes también del lado derecho */}
                {allTypes
                  .filter((t) => expectedByType[t] && !realByType[t])
                  .map((t) => (
                    <tr key={`ghost-${t}`} style={{ background: COLORS.missingBg }}>
                      <td style={cell}>{t}</td>
                      <td style={cell}>—</td>
                      <td style={cell}>—</td>
                      <td style={cell}>—</td>
                      <td style={cell}>
                        <span style={badgeStyle(COLORS.missingBg)}>✖️ No salió</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ padding: "0 40px 40px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={badgeStyle(COLORS.matchBg)}>✔️ Coincide</span>
          <span style={badgeStyle(COLORS.mismatchBg)}>⚠️ Hay diferencia</span>
          <span style={badgeStyle(COLORS.missingBg)}>✖️ No salió (faltante)</span>
          <span style={badgeStyle(COLORS.extraBg)}>ⓘ Extra no esperado</span>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          La coincidencia considera cantidad igual y peso neto dentro de una
          tolerancia de {WEIGHT_TOLERANCE_KG} kg o {WEIGHT_TOLERANCE_PCT * 100}% del peso esperado (lo que sea mayor).
        </p>
      </div>
    </div>
  );
};

export default ProductionProcessDetails;
