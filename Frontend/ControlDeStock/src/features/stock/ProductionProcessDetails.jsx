import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const [processes, setProcesses] = useState([]);
  const [bills, setBills] = useState([]);
  const [expectedDetails, setExpectedDetails] = useState([]);
  const [expectedSubs, setExpectedSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Productos reales del proceso (panel derecho)
        const res = await fetch(`${API_URL}/all-process-products`);
        const data = await res.json();
        const filtered = data.filter(
          (p) => p.process_number.toString() === processNumber
        );
        setProcesses(filtered);

        // Bill IDs asociados al proceso
        const resBills = await fetch(`${API_URL}/all-process-number`);
        const billsData = await resBills.json();
        const bill_ids = billsData
          .filter((row) => row.process_number.toString() === processNumber)
          .map((row) => row.bill_id);
        setBills(bill_ids);

        // Detalles esperados desde remito
        let allExpected = [];
        for (const bill_id of bill_ids) {
          const resDetails = await fetch(
            `${API_URL}/bill-details-readonly/${bill_id}`
          );
          const details = await resDetails.json();
          allExpected = allExpected.concat(Array.isArray(details) ? details : []);
        }
        setExpectedDetails(allExpected);

        // Subproductos esperados/proyectados
        const group = {};
        allExpected.forEach((det) => {
          if (!group[det.type]) group[det.type] = 0;
          group[det.type] += Number(det.quantity);
        });

        let subResults = [];
        for (const type of Object.keys(group)) {
          const cantidad = group[type];
          const resSubs = await fetch(
            `${API_URL}/subproducts-by-name/${encodeURIComponent(type)}`
          );
          const subs = await resSubs.json();
          subs.forEach((sub) => {
            subResults.push({
              nombre: sub.nombre,
              cantidadTotal: sub.cantidadPorUnidad * cantidad,
              cantidadPorUnidad: sub.cantidadPorUnidad,
              productoOrigen: type,
            });
          });
        }

        const subsAgrupados = {};
        subResults.forEach((sub) => {
          if (!subsAgrupados[sub.nombre])
            subsAgrupados[sub.nombre] = {
              cantidadTotal: 0,
              cantidadPorUnidad: sub.cantidadPorUnidad,
              origenes: [],
            };
          subsAgrupados[sub.nombre].cantidadTotal += sub.cantidadTotal;
          subsAgrupados[sub.nombre].origenes.push(sub.productoOrigen);
        });
        setExpectedSubs(subsAgrupados);
      } catch (err) {
        setProcesses([]);
        setBills([]);
        setExpectedDetails([]);
        setExpectedSubs([]);
      }
      setLoading(false);
    };
    fetchDetails();
  }, [processNumber]);

  // Agrupar lo esperado por tipo (usa weight como peso neto esperado)
  const expectedByType = expectedDetails.reduce((acc, det) => {
    if (!acc[det.type]) acc[det.type] = { quantity: 0, totalWeight: 0 };
    acc[det.type].quantity += Number(det.quantity);
    acc[det.type].totalWeight += Number(det.weight || 0);
    return acc;
  }, {});

  // Agrupar lo real por tipo
  const realByType = processes.reduce((acc, proc) => {
    if (!acc[proc.type])
      acc[proc.type] = { quantity: 0, totalWeight: 0, netWeight: 0 };
    acc[proc.type].quantity += Number(proc.quantity);
    acc[proc.type].totalWeight += Number(proc.gross_weight || 0);
    acc[proc.type].netWeight += Number(proc.net_weight || 0);
    return acc;
  }, {});

  // Conjunto de todos los tipos para ayudar a pintar estados
  const allTypes = Array.from(
    new Set([...Object.keys(expectedByType), ...Object.keys(realByType)])
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
      const tol = Math.max(WEIGHT_TOLERANCE_KG, (exp.totalWeight || 0) * WEIGHT_TOLERANCE_PCT);
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

      <h2 style={{ margin: "0 40px 30px" }}>
        Detalles del proceso #{processNumber}
      </h2>

      {/* Contenedor de tarjetas con mejores márgenes/espacio */}
      <div
        style={{
          display: "flex",
          gap: "50px",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "0 40px 30px",
        }}
      >
        {/* Panel: Ingreso */}
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
            }}
          >
            Ingreso al proceso productivo
          </h3>

          {Object.keys(expectedByType).length === 0 ? (
            <p style={{ margin: "12px 0 0" }}>
              No hay información esperada asociada a este proceso.
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

          {/* Subproductos esperados */}
          {Object.keys(expectedSubs).length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h4 style={{ margin: "0 0 8px" }}>Subproductos esperados</h4>
              <table style={tableBase}>
                <thead>
                  <tr style={{ background: "#e9f3ff" }}>
                    <th style={cell}>Subproducto</th>
                    <th style={cell}>Cantidad total</th>
                    <th style={cell}>Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expectedSubs).map(([nombre, data], idx) => (
                    <tr
                      key={nombre}
                      style={{
                        background: idx % 2 ? "#fff" : "#f9fbff",
                      }}
                    >
                      <td style={cell}>{nombre}</td>
                      <td style={cell}>{data.cantidadTotal} unidades</td>
                      <td style={cell}>{data.origenes.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel: Resultado */}
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
                {/* Filas "fantasma" para mostrar faltantes también en el panel derecho */}
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
