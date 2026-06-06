import { useEffect, useMemo, useState } from "react";
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
  const [cortesCamara, setCortesCamara] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const r = await fetch(`${API_URL}/chargeUpdateBillDetails/${id}`);
        const data = await r.json();
        setRemito(data);

        try {
          const camaraRes = await fetch(`${API_URL}/cuts-sent-to-camara/${id}`);
          if (camaraRes.ok) {
            const camaraData = await camaraRes.json();
            setCortesCamara(camaraData.cortes || []);
          } else {
            setCortesCamara([]);
          }
        } catch (error) {
          console.error("Error al obtener cortes enviados a cámara:", error);
          setCortesCamara([]);
        }

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

  const toNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return isNaN(value) ? 0 : value;

    const str = String(value).trim().replace(/\s/g, "");

    if (!str) return 0;

    const hasComma = str.includes(",");
    const hasDot = str.includes(".");

    // Caso: 1.234,56  -> miles con punto y decimal con coma
    if (hasComma && hasDot) {
      const normalized = str.replace(/\./g, "").replace(",", ".");
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Caso: 1298,50 -> decimal con coma
    if (hasComma) {
      const normalized = str.replace(",", ".");
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Caso: 1298.50 -> decimal con punto
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatNumber = (value, decimals = 2) => {
    const num = Number(value || 0);
    return num.toLocaleString("es-AR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const totalDeclarado = useMemo(() => {
    return (remito?.detalles || []).reduce((acc, c) => {
      const peso =
        c.pesoRomaneo ?? c.peso ?? c.peso_romaneo ?? c.peso_declarado ?? 0;
      return acc + toNumber(peso);
    }, 0);
  }, [remito]);

  const totalCongeladosDeclarados = useMemo(() => {
    return (remito?.congelados || []).reduce((acc, c) => {
      const peso =
        c.pesoRomaneo ?? c.peso ?? c.weight ?? c.peso_declarado ?? 0;
      return acc + toNumber(peso);
    }, 0);
  }, [remito]);

  const totalManual = useMemo(() => {
    return cortesStock.reduce(
      (acc, it) => {
        acc.cantidad += toNumber(it.products_quantity);
        acc.cabezas += toNumber(it.product_head);
        acc.pesoRomaneo += toNumber(it.provider_weight);
        acc.pesoBruto += toNumber(it.gross_weight);
        acc.tara += toNumber(it.tare);
        acc.pesaje += toNumber(it.net_weight);
        return acc;
      },
      {
        cantidad: 0,
        cabezas: 0,
        pesoRomaneo: 0,
        pesoBruto: 0,
        tara: 0,
        pesaje: 0,
      }
    );
  }, [cortesStock]);

  const totalOtrosManual = useMemo(() => {
    return otrosProductos.reduce(
      (acc, p) => {
        acc.cantidad += toNumber(p.product_quantity);
        acc.neto += toNumber(p.product_net_weight);
        acc.bruto += toNumber(p.product_gross_weight);
        return acc;
      },
      {
        cantidad: 0,
        neto: 0,
        bruto: 0,
      }
    );
  }, [otrosProductos]);

  const totalCamara = useMemo(() => {
    return cortesCamara.reduce(
      (acc, corte) => {
        acc.cantidad += toNumber(
          corte.quantity ?? corte.products_quantity ?? corte.product_quantity
        );
        acc.cabezas += toNumber(corte.head ?? corte.product_head);
        acc.pesoEtiqueta += toNumber(corte.provider_weight);
        acc.pesoBruto += toNumber(corte.gross_weight);
        acc.tara += toNumber(corte.tare_weight ?? corte.tare);
        acc.pesoNeto += toNumber(
          corte.net_weight ?? corte.weight ?? corte.romaneo_weight
        );
        return acc;
      },
      {
        cantidad: 0,
        cabezas: 0,
        pesoEtiqueta: 0,
        pesoBruto: 0,
        tara: 0,
        pesoNeto: 0,
      }
    );
  }, [cortesCamara]);

  const totalGeneralRecibido = useMemo(() => {
    return totalManual.pesaje + totalOtrosManual.neto;
  }, [totalManual, totalOtrosManual]);

  const totalGeneralDeclarado = useMemo(() => {
    return totalDeclarado + totalCongeladosDeclarados;
  }, [totalDeclarado, totalCongeladosDeclarados]);

  const totalStyle = {
    fontWeight: "700",
    background: "#f3f7fb",
  };

  const summaryCardStyle = {
    marginTop: "18px",
    padding: "14px 16px",
    border: "1px solid #d9e3ee",
    borderRadius: "10px",
    background: "#fafcff",
  };

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
                    <th className="mlv-num">
                      {esManual ? "N° de Tropa" : "N° Romaneo / Código"}
                    </th>
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
                      ? c.numero_tropa ?? c.identification_product ?? "—"
                      : c.identification_product ?? c.numero_tropa ?? "—";

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

                  {(remito.detalles || []).length > 0 && (
                    <tr style={totalStyle}>
                      <td>TOTALES</td>
                      <td className="mlv-num">
                        {formatNumber(
                          (remito.detalles || []).reduce(
                            (acc, c) => acc + toNumber(c.cantidad),
                            0
                          ),
                          0
                        )}
                      </td>
                      <td className="mlv-num">{formatNumber(totalDeclarado)}</td>
                      <td className="mlv-num">
                        {formatNumber(
                          (remito.detalles || []).reduce(
                            (acc, c) => acc + toNumber(c.cabezas),
                            0
                          ),
                          0
                        )}
                      </td>
                      <td className="mlv-num">—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {(remito.congelados || []).length > 0 && (
              <>
                <h3 className="mlv-subtitle">
                  Otros productos / congelados declarados
                </h3>
                <div className="mlv-tablewrap">
                  <table className="mlv-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th className="mlv-num">Cantidad</th>
                        <th className="mlv-num">Peso (Kg)</th>
                        <th className="mlv-num">N° Romaneo / Código</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remito.congelados.map((c) => {
                        const pesoCongelado =
                          c.pesoRomaneo ??
                          c.peso ??
                          c.weight ??
                          c.peso_declarado ??
                          "—";

                        return (
                          <tr key={c.id}>
                            <td>{c.tipo}</td>
                            <td className="mlv-num">{c.cantidad}</td>
                            <td className="mlv-num">{pesoCongelado}</td>
                            <td className="mlv-num">
                              {c.identification_product ?? "—"}
                            </td>
                          </tr>
                        );
                      })}

                      <tr style={totalStyle}>
                        <td>TOTALES</td>
                        <td className="mlv-num">
                          {formatNumber(
                            remito.congelados.reduce(
                              (acc, c) => acc + toNumber(c.cantidad),
                              0
                            ),
                            0
                          )}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalCongeladosDeclarados)}
                        </td>
                        <td className="mlv-num">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

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

                      <tr style={totalStyle}>
                        <td colSpan="2">TOTALES</td>
                        <td className="mlv-num">
                          {formatNumber(totalManual.cantidad, 0)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalManual.cabezas, 0)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalManual.pesoRomaneo)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalManual.pesoBruto)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalManual.tara)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalManual.pesaje)}
                        </td>
                        <td className="mlv-num">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    padding: "10px 14px",
                    border: "2px solid #e53935",
                    color: "#e53935",
                    fontWeight: "700",
                    borderRadius: "8px",
                    width: "fit-content",
                    marginLeft: "auto",
                  }}
                >
                  Total de kilos cargados manualmente:{" "}
                  {formatNumber(totalManual.pesaje)} kg
                </div>
              </>
            )}

            {otrosProductos.length > 0 && (
              <>
                <h3 className="mlv-subtitle">
                  Otros Productos Congelados (Manual)
                </h3>
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
                          <td className="mlv-num">
                            {p.product_portion || "-"}
                          </td>
                          <td className="mlv-num">{p.decrease}%</td>
                        </tr>
                      ))}

                      <tr style={totalStyle}>
                        <td>TOTALES</td>
                        <td className="mlv-num">
                          {formatNumber(totalOtrosManual.cantidad, 0)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalOtrosManual.neto)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalOtrosManual.bruto)}
                        </td>
                        <td className="mlv-num">—</td>
                        <td className="mlv-num">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {cortesCamara.length > 0 && (
              <>
                <h3 className="mlv-subtitle">Cortes enviados a cámara</h3>
                <div className="mlv-tablewrap">
                  <table className="mlv-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th className="mlv-num">Cantidad</th>
                        <th className="mlv-num">Cabezas</th>
                        <th className="mlv-num">Peso etiqueta</th>
                        <th className="mlv-num">Peso bruto</th>
                        <th className="mlv-num">Tara</th>
                        <th className="mlv-num">Peso neto</th>
                        <th className="mlv-num">Garrón</th>
                        <th className="mlv-num">Código único</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cortesCamara.map((corte) => (
                        <tr key={corte.id}>
                          <td>{corte.product_name || corte.products_name || "-"}</td>
                          <td className="mlv-num">
                            {corte.quantity ??
                              corte.products_quantity ??
                              corte.product_quantity ??
                              "-"}
                          </td>
                          <td className="mlv-num">
                            {corte.head ?? corte.product_head ?? "-"}
                          </td>
                          <td className="mlv-num">
                            {corte.provider_weight ?? "-"}
                          </td>
                          <td className="mlv-num">
                            {corte.gross_weight ?? "-"}
                          </td>
                          <td className="mlv-num">
                            {corte.tare_weight ?? corte.tare ?? "-"}
                          </td>
                          <td className="mlv-num">
                            {corte.net_weight ??
                              corte.weight ??
                              corte.romaneo_weight ??
                              "-"}
                          </td>
                          <td className="mlv-num">
                            {corte.garron ?? corte.products_garron ?? "-"}
                          </td>
                          <td className="mlv-num">
                            {corte.unique_code ?? "-"}
                          </td>
                        </tr>
                      ))}

                      <tr style={totalStyle}>
                        <td>TOTALES</td>
                        <td className="mlv-num">
                          {formatNumber(totalCamara.cantidad, 0)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalCamara.cabezas, 0)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalCamara.pesoEtiqueta)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalCamara.pesoBruto)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalCamara.tara)}
                        </td>
                        <td className="mlv-num">
                          {formatNumber(totalCamara.pesoNeto)}
                        </td>
                        <td className="mlv-num">—</td>
                        <td className="mlv-num">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    padding: "10px 14px",
                    border: "2px solid #e53935",
                    color: "#e53935",
                    fontWeight: "700",
                    borderRadius: "8px",
                    width: "fit-content",
                    marginLeft: "auto",
                  }}
                >
                  Total de kilos enviados a cámara:{" "}
                  {formatNumber(totalCamara.pesoNeto)} kg
                </div>
              </>
            )}

            <div style={summaryCardStyle}>
              <h3
                className="mlv-subtitle"
                style={{ marginTop: 0, marginBottom: "10px" }}
              >
                Resumen general de kilos
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "12px",
                }}
              >
                <div>
                  <strong>Total declarado:</strong>{" "}
                  {formatNumber(totalGeneralDeclarado)} kg
                </div>

                <div>
                  <strong>Total recibido:</strong>{" "}
                  {formatNumber(totalGeneralRecibido)} kg
                </div>

                <div>
                  <strong>Total enviado a cámara:</strong>{" "}
                  {formatNumber(totalCamara.pesoNeto)} kg
                </div>
              </div>
            </div>

            <h3 className="mlv-subtitle">Observación</h3>
            <div className="mlv-observation">
              {observacion ? observacion : "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeatLoadView;