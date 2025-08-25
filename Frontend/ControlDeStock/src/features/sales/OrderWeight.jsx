import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/orderWeight.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const taraOptions = [
  { value: 0, label: "0" },
  { value: 0.5, label: "0.5" },
  { value: 1, label: "1" },
  { value: 1.5, label: "1.5" },
  { value: 2, label: "2" },
  { value: 2.5, label: "2.5" },
  { value: 3, label: "3" },
];

const fmt = (v) => (v ? String(v) : "—");

const OrderWeight = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [header, setHeader] = useState(null);
  const [rows, setRows] = useState([]);
  const [loadingHeader, setLoadingHeader] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [comment, setComment] = useState("");

  // subfilas: key = `${prod.id}-${n}`
  const [draft, setDraft] = useState({});

  const loadHeader = async () => {
    setLoadingHeader(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/header`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.msg || "Error al traer encabezado");
      setHeader(data.header);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo obtener el encabezado de la orden.", "error");
    } finally {
      setLoadingHeader(false);
    }
  };

  const loadRows = async () => {
    setLoadingRows(true);
    try {
      const res = await fetch(`${API_BASE}/sell-order-products/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.msg || "Error al cargar productos");
      setRows(data.products || []);

      const initial = {};
      (data.products || []).forEach((prod) => {
        const qty = Number(prod.product_quantity || 0);
        for (let i = 1; i <= qty; i++) {
          const key = `${prod.id}-${i}`;
          initial[key] = { garron: 0, pesoBruto: 0, tara: 0 };
        }
      });
      setDraft(initial);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los productos de la orden.", "error");
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    loadHeader();
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setField = (rowKey, field, value) => {
    setDraft((old) => ({ ...old, [rowKey]: { ...(old[rowKey] || {}), [field]: value } }));
  };

  // NETO = BRUTO - TARA
  const calc = useMemo(() => {
    const byId = {};
    Object.keys(draft).forEach((key) => {
      const d = draft[key] || {};
      const bruto = Number(d.pesoBruto) || 0;
      const tara = Number(d.tara) || 0;
      const neto = Math.max(0, bruto - tara);
      byId[key] = { neto };
    });
    return byId;
  }, [draft]);

  const finalize = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Finalizar y guardar",
      text: "¿Marcar la orden como PESADA?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, finalizar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    try {
      // si querés enviar el comentario, acá podrías hacer un fetch extra a tu API
      // await fetch(`${API_BASE}/orders/${id}/comment`, { method: "PUT", body: JSON.stringify({ comment }) })

      const res = await fetch(`${API_BASE}/orders/${id}/weight-check`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.msg || "No se pudo finalizar");

      await Swal.fire("Listo", "La orden fue marcada como PESADA.", "success");
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

      {/* Encabezado */}
      <div className="ow-headerCard">
        <h2 className="ow-pageTitle">DETALLE ORDEN DE VENTA</h2>

        {loadingHeader ? (
          <p className="ow-muted">Cargando encabezado…</p>
        ) : !header ? (
          <p className="ow-muted">Sin datos de encabezado.</p>
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

      {/* Detalle */}
      <div className="ow-card">
        {loadingRows ? (
          <p className="ow-muted">Cargando productos…</p>
        ) : rows.length === 0 ? (
          <p className="ow-muted">No hay productos generados para esta orden.</p>
        ) : (
          <>
            <table className="ow-table">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>CORTE</th>
                  <th>PRECIO</th>
                  <th>SUB-ITEM</th>
                  <th>GARRÓN / LOTE</th>
                  <th>PESO TARA</th>
                  <th>PESO BRUTO</th>
                  <th>PESO NETO</th>
                </tr>
              </thead>
              <tbody>
                {rows.flatMap((prod) =>
                  Array.from({ length: Number(prod.product_quantity || 0) }, (_, i) => {
                    const key = `${prod.id}-${i + 1}`;
                    const d = draft[key] || {};
                    const c = calc[key] || { neto: 0 };
                    return (
                      <tr key={key}>
                        <td className="ow-code">{prod.product_id ?? "-"}</td>
                        <td className="ow-cut">{prod.product_name}</td>
                        <td className="ow-money">${Number(prod.product_price || 0).toFixed(2)}</td>
                        <td className="center">{i + 1}</td>

                        <td>
                          <div className="ow-pillInput">
                            <input
                              type="number"
                              min="0"
                              value={d.garron ?? 0}
                              onChange={(e) => setField(key, "garron", Number(e.target.value))}
                            />
                          </div>
                        </td>

                        <td>
                          <div className="ow-pillSelect">
                            <select
                              value={d.tara ?? 0}
                              onChange={(e) => setField(key, "tara", Number(e.target.value))}
                            >
                              {taraOptions.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td>
                          <div className="ow-pillInput">
                            <input
                              type="number"
                              min="0"
                              value={d.pesoBruto ?? 0}
                              onChange={(e) => setField(key, "pesoBruto", Number(e.target.value))}
                            />
                          </div>
                        </td>

                        <td className="ow-number">{c.neto.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
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
};

export default OrderWeight;
