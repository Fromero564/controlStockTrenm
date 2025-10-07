import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/generalStock.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const fmtInt = (n) =>
  new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );
const fmtDec = (n) =>
  new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

export default function GeneralStock() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  // filtros
  const [category, setCategory] = useState("Todos");
  const [alertFilter, setAlertFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  // categorías
  const [categories, setCategories] = useState(["Todos"]);

  // panel / ajuste
  const [open, setOpen] = useState(false);
  const [rowSel, setRowSel] = useState(null);
  const [form, setForm] = useState({
    final_quantity: "",
    product_total_weight: "",
  });
  const [touchWeight, setTouchWeight] = useState(false);

  // ---------- Fetch stock ----------
  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/all-products-stock`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setRows(list);

      const fromRows = Array.from(
        new Set(
          list
            .map(
              (r) =>
                r.product_general_category ||
                r.category_name ||
                r.product_category
            )
            .filter(Boolean)
        )
      );

      try {
        const r2 = await fetch(`${API_URL}/all-product-categories`);
        const j2 = await r2.json();
        const fromApi = Array.isArray(j2)
          ? j2
              .map((c) => (c?.category_name || "").trim())
              .filter(Boolean)
          : [];
        const merged = Array.from(new Set(["Todos", ...fromApi, ...fromRows]));
        setCategories(
          merged.sort((a, b) => (a === "Todos" ? -1 : a.localeCompare(b)))
        );
      } catch {
        setCategories(
          Array.from(new Set(["Todos", ...fromRows])).sort((a, b) =>
            a === "Todos" ? -1 : a.localeCompare(b)
          )
        );
      }
    } catch {
      setRows([]);
      setCategories(["Todos"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // ---------- Filtro ----------
  const filtered = useMemo(() => {
    let list = [...rows];

    if (category !== "Todos") {
      list = list.filter((r) => {
        const cat =
          r.product_general_category || r.category_name || r.product_category;
        return (cat || "") === category;
      });
    }

    if (alertFilter !== "Todos") {
      list = list.filter((r) => {
        const qty = Number(r.product_quantity || 0);
        const min = Number(r.min_stock || 0);
        const max = Number(r.max_stock || 0);
        if (alertFilter === "Bajo" && qty <= min) return true;
        if (alertFilter === "Alto" && max && qty >= max) return true;
        return false;
      });
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          String(r.product_name || "").toLowerCase().includes(q) ||
          String(r.product_cod || r.product_id || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [rows, category, alertFilter, search]);

  // ---------- Ajuste manual ----------
  const openAdjust = (row) => {
    setRowSel(row);
    setForm({
      final_quantity: Number(row.product_quantity || 0),
      product_total_weight: Number(row.product_total_weight || 0),
    });
    setTouchWeight(false);
    setOpen(true);
  };

  const closeAdjust = () => {
    setOpen(false);
    setRowSel(null);
  };

  const submitAdjust = async (e) => {
    e.preventDefault();
    if (!rowSel) return;

    const idForApi = rowSel.id || rowSel.product_cod || rowSel.product_name;
    const currentQty = Number(rowSel.product_quantity || 0);
    const targetQty = Number(form.final_quantity);

    if (Number.isNaN(targetQty) || targetQty < 0) {
      alert("Ingresá un total de unidades válido (entero ≥ 0).");
      return;
    }
    if (targetQty > currentQty) {
      alert(`El total final (${targetQty}) no puede superar el actual (${currentQty}).`);
      return;
    }

    const subtract = Math.max(0, currentQty - targetQty);
    const payload = { subtract_quantity: subtract };

    if (touchWeight) {
      const kgFinal = Number(form.product_total_weight);
      if (Number.isNaN(kgFinal) || kgFinal < 0) {
        alert("Ingresá un total de KG válido (≥ 0).");
        return;
      }
      payload.product_total_weight = kgFinal;
    }

    const r = await fetch(
      `${API_URL}/stock/manual/${encodeURIComponent(idForApi)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const j = await r.json();
    if (!r.ok || !j?.ok) {
      alert(j?.msg || "No se pudo aplicar el ajuste.");
      return;
    }
    closeAdjust();
    fetchStock();
  };

  const clearFilters = () => {
    setCategory("Todos");
    setAlertFilter("Todos");
    setSearch("");
  };

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="btn btn-outline" onClick={() => navigate("/operator-panel")}>
          ⬅ Volver
        </button>
      </div>

      <div className="stock-container">
        <h1 className="stock-title">Stock</h1>

        {/* filtros */}
        <div className="filters">
          <label className="field">
            <span>Categoría:</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Alerta de stock:</span>
            <select value={alertFilter} onChange={(e) => setAlertFilter(e.target.value)}>
              <option>Todos</option>
              <option>Bajo</option>
              <option>Alto</option>
            </select>
          </label>

          <label className="field field-search">
            <span>Buscar producto:</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre del producto"
            />
          </label>

          <div className="filters-right">
            <button className="btn btn-outline" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* tabla */}
        <div className="table-wrapper">
          <table className="stock-table">
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>PRODUCTO</th>
                <th>CANTIDAD</th>
                <th>KG TOTAL</th>
                <th>STOCK MÍNIMO</th>
                <th>STOCK MÁXIMO</th>
                <th>CATEGORÍA</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="loading">Cargando…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="loading">Sin resultados</td></tr>
              ) : (
                filtered.map((r) => {
                  const qty = Number(r.product_quantity || 0);
                  const min = Number(r.min_stock || 0);
                  const max = Number(r.max_stock || 0);
                  const badgeClass =
                    qty <= min ? "low-stock" : max && qty >= max ? "high-stock" : "";

                  return (
                    <tr key={`${r.id || r.product_cod || r.product_name}`}>
                      <td>{r.product_cod || r.product_id || "-"}</td>
                      <td>{r.product_name}</td>
                      <td className={badgeClass}>{fmtInt(qty)}</td>
                      <td>{fmtDec(r.product_total_weight)}</td>
                      <td>{fmtInt(min)}</td>
                      <td>{fmtInt(max)}</td>
                      <td>
                        {r.product_general_category ||
                          r.category_name ||
                          r.product_category || "-"}
                      </td>
                      <td>
                        <button className="btn btn-primary" onClick={() => openAdjust(r)}>
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* pop-up ajuste */}
      {open && (
        <div
          onClick={closeAdjust}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.25)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
        >
          <div
            className="adjust-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,                // un poco más ancho
              maxWidth: "92vw",
              background: "#fff",
              height: "100%",
              padding: 20,
              boxShadow: "-8px 0 26px rgba(0,0,0,.15)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div className="drawer-header">
              <h3>Ajustes manuales</h3>
              <button className="btn btn-outline" onClick={closeAdjust}>✕</button>
            </div>

            <div className="drawer-product">
              <div className="name">{rowSel?.product_name}</div>
              <div className="meta">
                Cód: <b>{rowSel?.product_cod || rowSel?.product_id || "-"}</b> ·
                Cant: <b>{fmtInt(rowSel?.product_quantity)}</b> · Kg: <b>{fmtDec(rowSel?.product_total_weight)}</b>
              </div>
            </div>

            <form className="drawer-form" onSubmit={submitAdjust}>
              <label className="frm-field">
                <span>Unidades totales (corrección)</span>
                <input
                  className="input-lg"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max={Number(rowSel?.product_quantity || 0)}
                  step="1"
                  value={form.final_quantity}
                  onChange={(e) => setForm((f) => ({ ...f, final_quantity: e.target.value }))}
                />
                <small>Ingresá el <b>total final</b> que querés ver en stock. (Solo permite disminuir)</small>
              </label>

              <label className="frm-check">
                <input
                  type="checkbox"
                  checked={touchWeight}
                  onChange={(e) => setTouchWeight(e.target.checked)}
                />
                También corregir KG total
              </label>

              <label className={`frm-field ${!touchWeight ? "is-disabled" : ""}`}>
                <span>KG totales (corrección)</span>
                <input
                  className="input-lg"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  disabled={!touchWeight}
                  value={form.product_total_weight}
                  onChange={(e) => setForm((f) => ({ ...f, product_total_weight: e.target.value }))}
                />
                <small>Ingresá el <b>total final</b> de kilos para el producto.</small>
              </label>

              <div className="drawer-actions">
                <button type="button" className="btn btn-outline" onClick={closeAdjust}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
