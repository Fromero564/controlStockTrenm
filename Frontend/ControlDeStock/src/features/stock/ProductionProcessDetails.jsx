import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

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
        const res = await fetch(`${API_URL}/all-process-products`);
        const data = await res.json();
        const filtered = data.filter(
          (p) => p.process_number.toString() === processNumber
        );
        setProcesses(filtered);

        const resBills = await fetch(`${API_URL}/all-process-number`);
        const billsData = await resBills.json();
        const bill_ids = billsData
          .filter((row) => row.process_number.toString() === processNumber)
          .map((row) => row.bill_id);
        setBills(bill_ids);

        // Traer detalles principales
        let allExpected = [];
        for (const bill_id of bill_ids) {
          const resDetails = await fetch(`${API_URL}/bill-details-readonly/${bill_id}`);
          const details = await resDetails.json();
          allExpected = allExpected.concat(Array.isArray(details) ? details : []);
        }
        setExpectedDetails(allExpected);

        // Traer subproductos esperados por cada corte principal
        // Agrupar por tipo y sumar cantidades
        const group = {};
        allExpected.forEach(det => {
          if (!group[det.type]) group[det.type] = 0;
          group[det.type] += Number(det.quantity);
        });
        let subResults = [];
        for (const type of Object.keys(group)) {
          const cantidad = group[type];
          // Consultá subproductos para cada tipo
          const resSubs = await fetch(`${API_URL}/subproducts-by-name/${encodeURIComponent(type)}`);
          const subs = await resSubs.json();
          // Multiplicá por cantidad
          subs.forEach(sub => {
            subResults.push({
              nombre: sub.nombre,
              cantidadTotal: sub.cantidadPorUnidad * cantidad,
              cantidadPorUnidad: sub.cantidadPorUnidad,
              productoOrigen: type
            });
          });
        }
        // Agrupá subproductos por nombre
        const subsAgrupados = {};
        subResults.forEach(sub => {
          if (!subsAgrupados[sub.nombre]) subsAgrupados[sub.nombre] = { cantidadTotal: 0, cantidadPorUnidad: sub.cantidadPorUnidad, origenes: [] };
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

  // Agrupar lo esperado por tipo, usando weight como peso neto
  const expectedByType = expectedDetails.reduce((acc, det) => {
    if (!acc[det.type]) acc[det.type] = { quantity: 0, totalWeight: 0 };
    acc[det.type].quantity += Number(det.quantity);
    acc[det.type].totalWeight += Number(det.weight || 0);  // Cambiado aquí
    return acc;
  }, {});

  // Agrupar lo REAL por tipo
  const realByType = processes.reduce((acc, proc) => {
    if (!acc[proc.type]) acc[proc.type] = { quantity: 0, totalWeight: 0, netWeight: 0 };
    acc[proc.type].quantity += Number(proc.quantity);
    acc[proc.type].totalWeight += Number(proc.gross_weight || 0);
    acc[proc.type].netWeight += Number(proc.net_weight || 0);
    return acc;
  }, {});

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
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <h2>Detalles del proceso #{processNumber}</h2>
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        {/* Esperado */}
        <div style={{ flex: 1, minWidth: 320, background: "#f5faff", border: "1px solid #aad2f5", borderRadius: 12, padding: 16 }}>
          <h3 style={{ borderBottom: "1px solid #aad2f5" }}>Esperado por remito</h3>
          {Object.keys(expectedByType).length === 0 ? (
            <p>No hay información esperada asociada a este proceso.</p>
          ) : (
            <table style={{ width: "100%", marginTop: 10 }}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Peso neto</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(expectedByType).map(([type, info]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>{info.quantity}</td>
                    <td>{info.totalWeight} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Subproductos esperados */}
          {Object.keys(expectedSubs).length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h4>Subproductos esperados</h4>
              <table style={{ width: "100%", marginTop: 6 }}>
                <thead>
                  <tr>
                    <th>Subproducto</th>
                    <th>Cantidad total</th>
                    <th>Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expectedSubs).map(([nombre, data]) => (
                    <tr key={nombre}>
                      <td>{nombre}</td>
                      <td>{data.cantidadTotal} unidades</td>
                      <td>{data.origenes.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
        {/* Real */}
        <div style={{ flex: 1, minWidth: 320, background: "#f7fff5", border: "1px solid #b2e7c2", borderRadius: 12, padding: 16 }}>
          <h3 style={{ borderBottom: "1px solid #b2e7c2" }}>Obtenido por remito</h3>
          {Object.keys(realByType).length === 0 ? (
            <p>No hay registros reales para este proceso.</p>
          ) : (
            <table style={{ width: "100%", marginTop: 10 }}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Peso bruto</th>
                  <th>Peso neto</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(realByType).map(([type, info]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>{info.quantity}</td>
                    <td>{info.totalWeight} kg</td>
                    <td>{info.netWeight} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionProcessDetails;
