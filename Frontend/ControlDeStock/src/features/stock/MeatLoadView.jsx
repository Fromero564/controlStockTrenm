import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../assets/styles/meatLoadView.css";

const API_URL = import.meta.env.VITE_API_URL;

const MeatLoadView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [remito, setRemito] = useState(null);
  const [observacion, setObservacion] = useState(null);
  const [cortesStock, setCortesStock] = useState([]);
  const [otrosProductos, setOtrosProductos] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Header + detalles (DECLARADO EN REMITO)
        const r = await fetch(`${API_URL}/chargeUpdateBillDetails/${id}`);
        const data = await r.json();
        setRemito(data);

        // Si el ingreso fue manual, traemos las filas cargadas manualmente
        if (data?.tipo_ingreso === "manual") {
          const [sRes, oRes] = await Promise.all([
            fetch(`${API_URL}/allProductsStock`),
            fetch(`${API_URL}/all-products-fresh-others`),
          ]);
          const [stockData, otrosData] = await Promise.all([
            sRes.json(),
            oRes.json(),
          ]);

          const idBill = parseInt(data.internal_number);
          setCortesStock(
            (stockData || []).filter(
              (it) => parseInt(it.id_bill_suppliers) === idBill
            )
          );
          setOtrosProductos(
            (otrosData || []).filter(
              (it) => parseInt(it.id_bill_suppliers) === idBill
            )
          );
        }

        // Observación
        const obsRes = await fetch(`${API_URL}/allObservations`);
        const obsData = await obsRes.json();
        const obs = (obsData || []).find(
          (o) => parseInt(o.id) === parseInt(data.internal_number)
        );
        setObservacion(obs?.observation || null);
      } catch (e) {
        console.error("Error cargando vista:", e);
      }
    };

    if (id) fetchAll();
  }, [id]);

  const esManual = remito?.tipo_ingreso === "manual";

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>

      {!remito ? (
        <div style={{ padding: 20 }}>Cargando datos del comprobante...</div>
      ) : (
        <div className="mlv-wrap">
          <h1 className="mlv-title">Comprobante #{remito.internal_number}</h1>

          <div className="mlv-card">
            <div className="mlv-grid">
              <div className="mlv-item">
                <div className="mlv-label">Proveedor</div>
                <div className="mlv-value">{remito.proveedor}</div>
              </div>
              <div className="mlv-item">
                <div className="mlv-label">Peso total (Kg)</div>
                <div className="mlv-value">{remito.peso_total}</div>
              </div>
              <div className="mlv-item">
                <div className="mlv-label">Romaneo</div>
                <div className="mlv-value">{remito.romaneo}</div>
              </div>
              <div className="mlv-item">
                <div className="mlv-label">Tipo de ingreso</div>
                <div className="mlv-value">{remito.tipo_ingreso}</div>
              </div>
            </div>

            <h3 className="mlv-subtitle">Detalle de Cortes declarados</h3>
            <div className="mlv-tablewrap">
              <table className="mlv-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th className="mlv-num">Cantidad</th>
                    <th className="mlv-num">Peso declarado (Kg)</th>
                    <th className="mlv-num">Cabezas</th>
                    <th className="mlv-num">{esManual ? "N° de Tropa" : "N° Romaneo / Código"}</th>
                  </tr>
                </thead>
                <tbody>
                  {(remito.detalles || []).map((c) => {
                    const pesoDeclarado =
                      c.pesoRomaneo ??
                      c.peso ??
                      c.peso_romaneo ??
                      c.peso_declarado ??
                      "—";
                    const identificador = esManual
                      ? (c.numero_tropa ?? c.identification_product ?? "—")
                      : (c.identification_product ?? c.numero_tropa ?? "—");
                    return (
                      <tr key={c.id}>
                        <td>{c.tipo}</td>
                        <td className="mlv-num">{c.cantidad}</td>
                        <td className="mlv-num">{pesoDeclarado}</td>
                        <td className="mlv-num">{c.cabezas}</td>
                        <td className="mlv-num">{identificador}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {esManual && cortesStock.length > 0 && (
              <>
                <h3 className="mlv-subtitle">Cortes Ingresados Manualmente</h3>
                <div className="mlv-tablewrap">
                  <table className="mlv-table">
                    <thead>
                      <tr>
                        <th>Garrón</th>
                        <th>Nombre</th>
                        <th className="mlv-num">Cantidad</th>
                        <th className="mlv-num">Cabezas</th>
                        <th className="mlv-num">Peso Romaneo (Kg)</th>
                        <th className="mlv-num">Peso Bruto (Kg)</th>
                        <th className="mlv-num">Tara (Kg)</th>
                        <th className="mlv-num">Pesaje (Kg)</th>
                        <th className="mlv-num">Merma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cortesStock.map((it) => (
                        <tr key={it.id}>
                          <td>{it.products_garron}</td>
                          <td>{it.products_name}</td>
                          <td className="mlv-num">{it.products_quantity}</td>
                          <td className="mlv-num">{it.product_head}</td>
                          <td className="mlv-num">{it.provider_weight}</td>
                          <td className="mlv-num">{it.gross_weight}</td>
                          <td className="mlv-num">{it.tare}</td>
                          <td className="mlv-num">{it.net_weight}</td>
                          <td className="mlv-num">{it.decrease}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {otrosProductos.length > 0 && (
              <>
                <h3 className="mlv-subtitle">Otros Productos Congelados (Manual)</h3>
                <div className="mlv-tablewrap">
                  <table className="mlv-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th className="mlv-num">Cantidad</th>
                        <th className="mlv-num">Peso Neto</th>
                        <th className="mlv-num">Peso Bruto</th>
                        <th className="mlv-num">Porciones</th>
                        <th className="mlv-num">Merma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otrosProductos.map((p) => (
                        <tr key={p.id}>
                          <td>{p.product_name}</td>
                          <td className="mlv-num">{p.product_quantity}</td>
                          <td className="mlv-num">{p.product_net_weight}</td>
                          <td className="mlv-num">{p.product_gross_weight}</td>
                          <td className="mlv-num">{p.product_portion || "-"}</td>
                          <td className="mlv-num">{p.decrease}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <h3 className="mlv-subtitle">Observación</h3>
            <div className="mlv-observation">{observacion ? observacion : "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeatLoadView;
