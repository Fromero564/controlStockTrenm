import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

// Tolerancias
const WEIGHT_TOLERANCE_KG = 0.5;
const WEIGHT_TOLERANCE_PCT = 0.01;

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

  const [processes, setProcesses] = useState([]);
  const [bills, setBills] = useState([]);
  const [expectedDetails, setExpectedDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subproductionRows, setSubproductionRows] = useState([]);
  const [expectedOutputs, setExpectedOutputs] = useState({});

  const [selectedBill, setSelectedBill] = useState("ALL");

  const subproductionGrouped = useMemo(() => {
    const acc = {};

    (subproductionRows || []).forEach((r) => {
      const name = String(r.cut_name || r.nombre || r.type || "").trim();
      const qty = Number(r.quantity ?? r.cantidad ?? 0);
      const weight = Number(
        r.weight ?? r.net_weight ?? r.peso ?? r.peso_neto ?? 0
      );

      if (!name) return;

      if (!acc[name]) {
        acc[name] = {
          quantity: 0,
          totalWeight: 0,
        };
      }

      acc[name].quantity += qty;
      acc[name].totalWeight += weight;
    });

    return acc;
  }, [subproductionRows]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/all-process-products`);
        const data = await res.json();

        const filtered = (Array.isArray(data) ? data : []).filter(
          (p) => String(p.process_number) === String(processNumber)
        );

        setProcesses(filtered);

        const resBills = await fetch(`${API_URL}/all-process-number`);
        const billsData = await resBills.json();

        const bill_ids = (Array.isArray(billsData) ? billsData : [])
          .filter((row) => String(row.process_number) === String(processNumber))
          .map((row) => row.bill_id);

        setBills(bill_ids);

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

        // Los subproductos esperados se recalculan más abajo usando:
        // 1) el comprobante seleccionado, y
        // 2) la subproducción/cámara agregada al proceso.
        setExpectedOutputs({});
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

  const filteredExpected = useMemo(() => {
    if (selectedBill === "ALL") return expectedDetails;

    return expectedDetails.filter(
      (d) => String(d.bill_id) === String(selectedBill)
    );
  }, [expectedDetails, selectedBill]);

  useEffect(() => {
    const buildExpectedOutputs = async () => {
      const outAcc = {};

      const addExpectedFromProduct = async (productName, quantity, source) => {
        const inType = String(productName || "").trim();
        const inQty = Number(quantity || 0);

        if (!inType || !inQty) return;

        try {
          const r = await fetch(
            `${API_URL}/subproducts-by-name/${encodeURIComponent(inType)}`
          );

          if (!r.ok) return;

          const subs = await r.json();

          (Array.isArray(subs) ? subs : []).forEach((s) => {
            const name = String(s.nombre || "").trim();

            if (!name) return;

            const unit = normUnit(s.unit || "unidad");
            const perUnit = Number(s.cantidadPorUnidad || 0);

            if (!outAcc[name]) {
              outAcc[name] = {
                unit,
                quantity: 0,
                totalWeight: 0,
                perUnit,
                sources: [],
              };
            }

            outAcc[name].unit = unit;
            outAcc[name].perUnit = perUnit;

            if (!outAcc[name].sources.includes(source)) {
              outAcc[name].sources.push(source);
            }

            if (unit === "kg") {
              outAcc[name].totalWeight += perUnit * inQty;
            } else {
              outAcc[name].quantity += perUnit * inQty;
            }
          });
        } catch {
          // ignore
        }
      };

      for (const det of filteredExpected) {
        await addExpectedFromProduct(det.type, det.quantity, "remito");
      }

      for (const row of subproductionRows || []) {
        await addExpectedFromProduct(
          row.cut_name || row.nombre || row.type,
          row.quantity ?? row.cantidad,
          "subproducción"
        );
      }

      setExpectedOutputs(outAcc);
    };

    buildExpectedOutputs();
  }, [filteredExpected, subproductionRows]);

  const expectedByType = useMemo(() => {
    return filteredExpected.reduce((acc, det) => {
      const key = String(det.type || "").trim();

      if (!key) return acc;

      if (!acc[key]) {
        acc[key] = {
          quantity: 0,
          totalWeight: 0,
        };
      }

      acc[key].quantity += Number(det.quantity || 0);
      acc[key].totalWeight += Number(det.weight || 0);

      return acc;
    }, {});
  }, [filteredExpected]);

  const realByType = useMemo(() => {
    return (processes || []).reduce((acc, proc) => {
      const key = String(proc.type || "").trim();

      if (!key) return acc;

      if (!acc[key]) {
        acc[key] = {
          quantity: 0,
          totalWeight: 0,
          netWeight: 0,
        };
      }

      acc[key].quantity += Number(proc.quantity || 0);
      acc[key].totalWeight += Number(proc.gross_weight || 0);
      acc[key].netWeight += Number(proc.net_weight || 0);

      return acc;
    }, {});
  }, [processes]);

  const allTypes = useMemo(() => {
    return Array.from(
      new Set([
        ...Object.keys(expectedOutputs),
        ...Object.keys(realByType),
      ])
    );
  }, [expectedOutputs, realByType]);

  const getExpectedForType = (type) => {
    const expOut = expectedOutputs[type];

    let expectedQty = 0;
    let expectedKg = 0;
    const sources = [];

    if (expOut) {
      const unit = normUnit(expOut.unit);

      if (unit === "kg") {
        expectedKg += Number(expOut.totalWeight || 0);
      } else {
        expectedQty += Number(expOut.quantity || 0);
      }

      sources.push(...(expOut.sources || ["subproducto"]));
    }

    return {
      expectedQty,
      expectedKg,
      sources,
      hasExpected: sources.length > 0,
      expOut,
    };
  };

  const statusForType = (type) => {
    const real = realByType[type];

    const { expectedQty, expectedKg, sources, hasExpected } = getExpectedForType(type);

    if (!hasExpected && real) {
      return {
        code: "unexpected",
        label: "❗ Producto no esperado (no pertenece)",
        bg: COLORS.missBg,
      };
    }

    if (hasExpected && !real) {
      return {
        code: "missing",
        label: "No se procesó este producto",
        bg: COLORS.missBg,
      };
    }

    if (real && hasExpected) {
      const realQty = Number(real.quantity || 0);
      const realKg = Number(real.netWeight || 0);

      const checkQty = expectedQty > 0;
      const checkWeight = expectedKg > 0;

      const qtyDiff = realQty - expectedQty;
      const weightDiff = realKg - expectedKg;

      const tol = Math.max(
        WEIGHT_TOLERANCE_KG,
        expectedKg * WEIGHT_TOLERANCE_PCT
      );

      const qtyOk = checkQty ? qtyDiff === 0 : true;
      const weightOk = checkWeight ? Math.abs(weightDiff) <= tol : true;

      if (qtyOk && weightOk) {
        if (sources.includes("subproducción")) {
          return {
            code: "ok",
            label: "Cantidad/Peso esperado incluyendo subproducción",
            bg: COLORS.okBg,
          };
        }

        return {
          code: "ok",
          label: "Cantidad/Peso esperado",
          bg: COLORS.okBg,
        };
      }

      const parts = [];

      if (!qtyOk) {
        if (qtyDiff > 0) {
          parts.push(`${qtyDiff} unid. de más`);
        }

        if (qtyDiff < 0) {
          parts.push(`faltan ${Math.abs(qtyDiff)} unid.`);
        }
      }

      if (!weightOk) {
        if (weightDiff > 0) {
          parts.push("peso mayor al esperado");
        }

        if (weightDiff < 0) {
          parts.push("peso menor al esperado");
        }
      }

      if (sources.includes("subproducción")) {
        parts.push("comparado incluyendo subproducción");
      }

      return {
        code: "warn",
        label: parts.join(" • ") || "Diferencias detectadas",
        bg: COLORS.warnBg,
      };
    }

    return {
      code: "none",
      label: "",
      bg: "transparent",
    };
  };

  const tableBase = {
    width: "100%",
    marginTop: 10,
    borderCollapse: "separate",
    borderSpacing: 0,
  };

  if (loading) {
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
  }

  return (
    <div>
      <Navbar />

      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>

      <h2 style={{ margin: "0 40px 18px" }}>
        Detalles del proceso #{processNumber}
      </h2>

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
            {Object.entries(subproductionGrouped).map(([name, info]) => (
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

                <b style={{ color: "#333" }}>{info.quantity}</b> unidad
                {info.quantity > 1 ? "es" : ""}

                {Number(info.totalWeight || 0) > 0 && (
                  <>
                    {" "}
                    /{" "}
                    <b style={{ color: "#333" }}>
                      {Number(info.totalWeight || 0).toFixed(2)} kg
                    </b>
                  </>
                )}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 6, fontSize: 12, color: "#8a5a00" }}>
            * Estos cortes ingresaron sin remito y se registraron como
            subproducción del proceso. También se tienen en cuenta para las
            alertas de salida.
          </div>
        </div>
      )}

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

      <div
        style={{
          display: "flex",
          gap: "50px",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "0 40px 30px",
        }}
      >
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
                    <tr
                      key={type}
                      style={{ background: idx % 2 ? "#fff" : "#f9fbff" }}
                    >
                      <td style={cell}>{type}</td>
                      <td style={cell}>{info.quantity}</td>
                      <td style={cell}>{info.totalWeight} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#167e50",
                      marginBottom: 8,
                    }}
                  >
                    ▪ Subproductos esperados totales (comprobante + subproducción):
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
                          {Array.isArray(info.sources) &&
                            info.sources.includes("subproducción") && (
                              <span style={{ color: "#167e50", fontSize: 12 }}>
                                {" "}
                                (incluye subproducción)
                              </span>
                            )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

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
            <p style={{ margin: "12px 0 0" }}>
              No hay registros para este proceso.
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
                            : status.code === "missing" ||
                              status.code === "unexpected"
                            ? COLORS.missBg
                            : idx % 2
                            ? "#fff"
                            : "#f7fff5",
                      }}
                    >
                      <td style={cell}>{type}</td>
                      <td style={cell}>{info ? info.quantity : "—"}</td>
                      <td style={cell}>
                        {info ? `${info.totalWeight} kg` : "—"}
                      </td>
                      <td style={cell}>
                        {info ? `${info.netWeight} kg` : "—"}
                      </td>
                      <td style={cell}>
                        {status.label ? (
                          <span style={badgeStyle(status.bg)}>
                            {status.label}
                          </span>
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

      <div style={{ padding: "0 40px 40px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={badgeStyle(COLORS.okBg)}>
            ✔️ Cantidad/Peso esperado
          </span>

          <span style={badgeStyle(COLORS.okBg)}>
            ✔️ Incluye subproducción
          </span>

          <span style={badgeStyle(COLORS.warnBg)}>
            ⚠️ Menos/Cantidad de más • Peso mayor/menor
          </span>

          <span style={badgeStyle(COLORS.missBg)}>
            ✖️ No se procesó este producto
          </span>

          <span style={badgeStyle(COLORS.missBg)}>
            ❗ Producto no esperado
          </span>
        </div>

        <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          La coincidencia por peso considera una tolerancia de{" "}
          {WEIGHT_TOLERANCE_KG} kg o {WEIGHT_TOLERANCE_PCT * 100}% del peso
          esperado, lo que sea mayor. La subproducción también se considera como
          ingreso válido esperado para evitar alertas falsas.
        </p>
      </div>
    </div>
  );
};

export default ProductionProcessDetails;