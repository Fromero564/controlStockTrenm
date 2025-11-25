import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import "../assets/styles/availableStockOrder.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

const API_URL = import.meta.env.VITE_API_URL;
const STOCK_URL = `${API_URL}/all-products-stock`;
const ORDERS_URL = `${API_URL}/all-products-orders`;
const ORDERS_HEADERS_URL = `${API_URL}/all-orders`;
const ORDER_PRODUCT_UPDATE_URL = `${API_URL}/update-order-product`;

const AvailableStockOrders = () => {
  const navigate = useNavigate();

  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderHeaders, setOrderHeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState({ code: "", name: "" });
  const [modalRows, setModalRows] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [sRes, oRes, hRes] = await Promise.all([
          fetch(STOCK_URL),
          fetch(ORDERS_URL),
          fetch(ORDERS_HEADERS_URL),
        ]);

        const [sJson, oJson, hJson] = await Promise.all([
          sRes.json(),
          oRes.json(),
          hRes.json(),
        ]);

        const headersAll = Array.isArray(hJson) ? hJson : [];
        // Solo pedidos NO chequeados
        const headersUnchecked = headersAll.filter((h) => h?.order_check === false);

        const uncheckedIds = new Set(headersUnchecked.map((h) => h.id));

        const orderLinesAll = Array.isArray(oJson) ? oJson : [];
        const orderLinesUnchecked = orderLinesAll.filter((l) =>
          uncheckedIds.has(l.order_id)
        );

        setStock(Array.isArray(sJson) ? sJson : []);
        setOrderHeaders(headersUnchecked);
        setOrders(orderLinesUnchecked);
      } catch (error) {
        console.error("Error cargando disponibilidad:", error);
        setStock([]);
        setOrders([]);
        setOrderHeaders([]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const toNumber = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isNaN(n) ? 0 : n;
  };

  // Agrego demanda en KG y en UN por producto
  const ordersAgg = useMemo(() => {
    const map = new Map();

    for (const line of orders) {
      const key = String(line.product_cod ?? line.product_id ?? line.product_name);
      const prev = map.get(key) || { demandKG: 0, demandUN: 0, count: 0 };

      const qty = toNumber(line.cantidad);
      const unit = String(line.tipo_medida || "").toUpperCase();

      const next = {
        demandKG: prev.demandKG,
        demandUN: prev.demandUN,
        count: prev.count + 1,
      };

      if (unit === "KG") {
        next.demandKG += qty;
      } else {
        // cualquier cosa que no sea KG la tomamos como unidad
        next.demandUN += qty;
      }

      map.set(key, next);
    }

    return map;
  }, [orders]);

  const rows = useMemo(() => {
    const list = stock.map((p) => {
      const code = String(p.product_cod ?? p.id ?? p.product_name);
      const agg = ordersAgg.get(code) || { demandKG: 0, demandUN: 0, count: 0 };

      const productName = p.product_name;

      // unidad base del producto (UN o KG) viene desde products_available.unit_measure
      const baseUnit = String(p.unit_type || p.unit_measure || "UN").toUpperCase();
      const unit = baseUnit === "KG" ? "KG" : "UN";

      // STOCK:
      // - si unidad es KG → usamos product_total_weight
      // - si unidad es UN → usamos product_quantity
      const stockQty =
        unit === "KG"
          ? toNumber(p.product_total_weight)
          : toNumber(p.product_quantity);

      // DEMANDA:
      // - si unidad es KG → usamos demanda en KG
      // - si unidad es UN → usamos demanda en UN
      const demand =
        unit === "KG" ? toNumber(agg.demandKG) : toNumber(agg.demandUN);

      const existence = stockQty - demand;

      let statusText = "Stock suficiente";
      let statusTone = "ok";

      if (demand > 0) {
        if (existence >= 0) {
          statusText = `Disponible ${existence}`;
          statusTone = "ok";
        } else {
          statusText = `Faltan ${Math.abs(existence)}`;
          statusTone = "bad";
        }
      }

      return {
        code,
        productName,
        demand,
        stockQty,
        existence,
        unit,
        statusText,
        statusTone,
        requestsCount: agg.count,
      };
    });

    return list.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [stock, ordersAgg]);

  const openModal = (row) => {
    const lines = orders
      .filter(
        (l) => String(l.product_cod ?? l.product_id ?? l.product_name) === row.code
      )
      .map((l) => {
        const head = orderHeaders.find((h) => String(h.id) === String(l.order_id));
        return {
          client: head?.client_name || "Cliente desconocido",
          orderId: l.order_id,
          qty: toNumber(l.cantidad),
          lineId: l.id,
        };
      })
      .sort((a, b) =>
        a.client === b.client ? a.orderId - b.orderId : a.client.localeCompare(b.client)
      );

    setModalProduct({ code: row.code, name: row.productName });
    setModalRows(lines);
    setShowModal(true);
  };

  const patchQty = async (lineId, cantidad) => {
    const res = await fetch(`${ORDER_PRODUCT_UPDATE_URL}/${lineId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad }),
    });
    if (!res.ok) throw new Error("update-failed");
  };

  const adjustClientQty = async (entry, delta) => {
    const newQty = Math.max(0, toNumber(entry.qty) + delta);
    if (newQty === entry.qty) return;

    const prevOrders = orders;
    const prevModal = modalRows;

    setOrders((prev) =>
      prev.map((l) => (l.id === entry.lineId ? { ...l, cantidad: String(newQty) } : l))
    );
    setModalRows((prev) =>
      prev.map((e) => (e.lineId === entry.lineId ? { ...e, qty: newQty } : e))
    );

    try {
      await patchQty(entry.lineId, newQty);
    } catch (error) {
      console.error("Error actualizando cantidad:", error);
      setOrders(prevOrders);
      setModalRows(prevModal);
      alert("No se pudo actualizar la cantidad en el servidor.");
    }
  };

  return (
    <>
      <Navbar />
      <style>{`
        .oa-tabs{display:flex;gap:24px;border-bottom:2px solid #e0e6ed;margin:10px 20px 18px 20px;padding-bottom:6px}
        .oa-tab{background:none;border:0;padding:4px 0;font-size:15px;font-weight:700;color:#5c6e81;cursor:pointer;position:relative}
        .oa-tab.active{color:#1172b8}
        .oa-tab.active::after{content:"";position:absolute;bottom:-8px;left:0;width:100%;height:3px;background:#1172b8;border-radius:2px}
        .av-modal-back{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:50}
        .av-modal{background:#fff;border:1px solid #e6edf5;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.15);width:min(560px,92vw);padding:16px}
        .av-modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
        .av-modal-title{font-weight:800;color:#1d2a3b}
        .av-close{border:1px solid #e6edf5;background:#fff;border-radius:10px;height:32px;width:32px;cursor:pointer}
        .av-modal-list{display:grid;gap:8px;margin-top:8px}
        .av-modal-item{display:grid;grid-template-columns:1fr auto;align-items:center;border:1px solid #eef3f8;border-radius:10px;padding:10px 12px;background:#fbfdff}
        .av-controls{display:flex;align-items:center;gap:10px}
        .av-qty{min-width:36px;text-align:center;border-radius:999px;background:#e9f9f2;border:1px solid #c7f0dd;color:#137a4c;font-weight:700;padding:4px 10px}
        .av-round{width:28px;height:28px;border-radius:999px;border:1px solid #e0e6ed;background:#fff;display:grid;place-items:center;cursor:pointer}
        .av-round:hover{background:#f5f9fc}
      `}</style>

      <div className="oa-tabs">
        <button className="oa-tab" onClick={() => navigate(-1)}>
          Pedidos
        </button>
        <button className="oa-tab active">Disponibilidad</button>
      </div>

      <div className="av-wrapper">
        <div className="av-header">
          <h2 className="av-title">Disponibilidad</h2>
        </div>

        <div className="av-card">
          {loading ? (
            <div className="av-loading">Cargando...</div>
          ) : (
            <div className="av-table">
              <div className="av-head">
                <div>PRODUCTO</div>
                <div className="av-center">DEMANDA PENDIENTE</div>
                <div className="av-center">CANTIDAD EN STOCK</div>
                <div>EXISTENCIA</div>
                <div className="av-center">TIPO</div>
                <div className="av-center">CLIENTES DEMANDAN</div>
              </div>

              {rows.length === 0 ? (
                <div className="av-empty">Sin registros</div>
              ) : (
                rows.map((r) => (
                  <div className="av-row" key={r.code}>
                    <div className="av-product">{r.productName}</div>
                    <div className="av-center">
                      <span className={`av-badge ${r.demand > r.stockQty ? "warn" : ""}`}>
                        {r.demand}
                      </span>
                    </div>
                    <div className="av-center">
                      <span className="av-badge ok">{r.stockQty}</span>
                    </div>
                    <div>
                      <span className={`av-chip ${r.statusTone}`}>{r.statusText}</span>
                    </div>
                    <div className="av-center">{r.unit}</div>
                    <div className="av-center">
                      <button className="av-eye" onClick={() => openModal(r)}>
                        <span className="av-eye-count">{r.requestsCount}</span>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="av-modal-back" onClick={() => setShowModal(false)}>
          <div className="av-modal" onClick={(e) => e.stopPropagation()}>
            <div className="av-modal-head">
              <div className="av-modal-title">{modalProduct.name}</div>
              <button className="av-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {modalRows.length === 0 ? (
              <div className="av-empty">Sin pedidos para este producto</div>
            ) : (
              <div className="av-modal-list">
                {modalRows.map((r) => (
                  <div className="av-modal-item" key={r.lineId}>
                    <div>
                      {r.client} — Comp. {r.orderId}
                    </div>
                    <div className="av-controls">
                      <button
                        className="av-round"
                        type="button"
                        onClick={() => adjustClientQty(r, -1)}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <div className="av-qty">{r.qty}</div>
                      <button
                        className="av-round"
                        type="button"
                        onClick={() => adjustClientQty(r, +1)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableStockOrders;

