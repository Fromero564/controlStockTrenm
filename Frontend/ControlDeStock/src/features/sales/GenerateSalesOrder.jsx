import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/generateSalesOrder.css";

const API_URL = import.meta.env.VITE_API_URL;

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const nice = (s) =>
  String(s ?? "—")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toNumber = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
};

const GenerateSalesOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [lines, setLines] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  const ORDER_URL = `${API_URL}/get-order-by-id/${id}`;
  const ORDER_LINES_URL = `${API_URL}/get-all-products-by-order/${id}`;
  const STOCK_URL = `${API_URL}/all-products-stock`;
  const GENERATE_URL = `${API_URL}/generate-sales-order/${id}`;

  useEffect(() => {
    let cancel = false;
    const loadAll = async () => {
      setLoading(true);
      setErr("");
      try {
        const [hRes, lRes, sRes] = await Promise.all([
          fetch(ORDER_URL),
          fetch(ORDER_LINES_URL),
          fetch(STOCK_URL),
        ]);
        if (!hRes.ok) throw new Error("order");
        if (!lRes.ok) throw new Error("lines");
        if (!sRes.ok) throw new Error("stock");

        const [hJson, lJson, sJson] = await Promise.all([
          hRes.json(),
          lRes.json(),
          sRes.json(),
        ]);
        if (!cancel) {
          setOrder(hJson || null);
          setLines(Array.isArray(lJson) ? lJson : []);
          setStock(Array.isArray(sJson) ? sJson : []);
        }
      } catch (e) {
        if (!cancel) setErr("No se pudo cargar la orden.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    loadAll();
    return () => {
      cancel = true;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const header = useMemo(
    () => ({
      numero: order?.id ?? "—",
      fecha: fmtDate(order?.date_order),
      cliente: order?.client_name ?? "—",
      vendedor: order?.salesman_name ?? "—",
      listaPrecio: order?.price_list ?? "—",
      condicionVenta: nice(order?.sell_condition),
      condicionCobro: nice(order?.payment_condition),
    }),
    [order]
  );

  const rows = useMemo(() => {
    const getStockFor = (code, name) => {
      const key = String(code ?? "");
      const byCode =
        stock.find(
          (p) =>
            String(p.product_cod ?? p.id ?? p.product_name) === key
        ) || null;
      if (byCode) return toNumber(byCode.product_quantity);

      const byName =
        stock.find(
          (p) => String(p.product_name).toLowerCase() === String(name).toLowerCase()
        ) || null;
      return byName ? toNumber(byName.product_quantity) : 0;
    };

    return lines.map((ln) => {
      const code = ln.product_cod ?? ln.product_id ?? "";
      const name = ln.product_name ?? "";
      const price = toNumber(ln.precio);
      const qty = toNumber(ln.cantidad);
      const unit = ln.tipo_medida || "";

      const stockQty = getStockFor(code, name);
      const existence = stockQty - qty;

      let statusText = "Stock suficiente";
      let tone = "ok";
      if (existence < 0) {
        statusText = `Faltan ${Math.abs(existence)} ${unit || ""}`.trim();
        tone = "bad";
      }

      return {
        id: ln.id,
        code: String(code),
        name,
        price,
        qty,
        unit,
        stockQty,
        existence,
        statusText,
        tone,
      };
    });
  }, [lines, stock]);

  const sendOrder = async () => {
    setSending(true);
    try {
      const res = await fetch(GENERATE_URL, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.msg ||
          "No se pudo generar la orden. Verificá el stock e intentá nuevamente.";
        await Swal.fire({ icon: "error", title: "Error", text: msg });
        setSending(false);
        return;
      }

      const result = await Swal.fire({
        icon: "success",
        title: "Orden de venta creada",
        confirmButtonText: "Ir a ordenes de venta",
        showCancelButton: true,
        cancelButtonText: "Ir al inicio",
        allowOutsideClick: false,
      });

      if (result.isConfirmed) {
        navigate("/list-final-orders"); 
      } else {
        navigate("/sales-panel"); 
      }
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor.",
      });
    } finally {
      setSending(false);
    }
  };

  const handleGenerateClick = async () => {
    const zeroStock = rows.filter((r) => r.stockQty <= 0);
    if (zeroStock.length) {
      const first = zeroStock[0];
      await Swal.fire({
        icon: "error",
        title: "Sin stock",
        html: `No hay stock disponible de <b>${first.name}</b>. No es posible generar la orden.`,
        confirmButtonText: "Entendido",
      });
      return;
    }

    const shortages = rows.filter((r) => r.existence < 0 && r.stockQty > 0);
    if (shortages.length) {
      const s = shortages[0];
      const faltan = Math.abs(s.existence);
      const unidad = s.unit || "unidades";
      const confirmed = await Swal.fire({
        icon: "info",
        title: "Pedido incompleto",
        html: `Faltan <b>${faltan} ${unidad}</b> de<br/><b>${s.name}</b>`,
        confirmButtonText: "Generar orden igualmente",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      });
      if (!confirmed.isConfirmed) return;
    }

    await sendOrder();
  };

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <div className="gso-wrap">
        <h1 className="gso-title">Generar Orden de Venta</h1>

        {loading && <div className="gso-status">Cargando…</div>}
        {!loading && err && <div className="gso-error">{err}</div>}

        {!loading && !err && (
          <>
            <div className="gso-info-card">
              <div className="gso-badge">Pedido cargado</div>
              <div className="gso-grid">
                <div className="gso-item">
                  <span className="gso-label">N° comprobante automático</span>
                  <span className="gso-value">{header.numero}</span>
                </div>
                <div className="gso-item">
                  <span className="gso-label">Fecha</span>
                  <span className="gso-value">{header.fecha}</span>
                </div>
                <div className="gso-item">
                  <span className="gso-label">Cliente</span>
                  <span className="gso-value">{header.cliente}</span>
                </div>
                <div className="gso-item">
                  <span className="gso-label">Vendedor</span>
                  <span className="gso-value">{header.vendedor}</span>
                </div>
                <div className="gso-item">
                  <span className="gso-label">Lista de precio</span>
                  <span className="gso-value">{header.listaPrecio}</span>
                </div>
                <div className="gso-item">
                  <span className="gso-label">Condición de venta</span>
                  <span className="gso-value">{header.condicionVenta}</span>
                </div>
                <div className="gso-item">
                  <span className="gso-label">Condición de cobro</span>
                  <span className="gso-value">{header.condicionCobro}</span>
                </div>
              </div>
            </div>

            <div className="gso-products">
              <div className="gso-products-title">Productos solicitados</div>
              <div className="gso-table">
                <div className="gso-thead">
                  <div>Código</div>
                  <div>Corte</div>
                  <div>Precio</div>
                  <div>Cantidad</div>
                  <div>Tipo</div>
                  <div className="gso-center">Cantidad en stock</div>
                  <div>Disponibilidad</div>
                </div>

                {rows.length === 0 ? (
                  <div className="gso-empty">Sin productos en esta orden</div>
                ) : (
                  rows.map((r) => (
                    <div className="gso-row" key={r.id}>
                      <div>{r.code}</div>
                      <div className="gso-ellipsis" title={r.name}>{r.name}</div>
                      <div>${r.price.toLocaleString("es-AR")}</div>
                      <div>{r.qty}</div>
                      <div>{r.unit}</div>
                      <div className="gso-center">
                        <span className={`gso-badge ${r.existence < 0 ? "warn" : "ok"}`}>
                          {r.stockQty}
                        </span>
                      </div>
                      <div>
                        <span className={`gso-chip ${r.tone}`}>{r.statusText}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="gso-actions">
                <button className="gso-btn" onClick={() => navigate(-1)}>Volver</button>
                <button
                  className="gso-btn primary"
                  onClick={handleGenerateClick}
                  disabled={sending}
                >
                  {sending ? "Generando..." : "Generar Orden de Venta"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateSalesOrder;
