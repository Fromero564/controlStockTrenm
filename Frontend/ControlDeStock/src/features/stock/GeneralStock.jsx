// src/features/stock/GeneralStock.jsx
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

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
  const navigate= useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [category, setCategory] = useState("Todos");
  const [alertFilter, setAlertFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  // Panel / Ajuste manual (sin tocar tu CSS: estilos inline)
  const [open, setOpen] = useState(false);
  const [rowSel, setRowSel] = useState(null);
  const [form, setForm] = useState({
    subtract_quantity: 0,
    min_stock: 0,
    max_stock: 0,
    product_total_weight: "",
  });
  const [touchWeight, setTouchWeight] = useState(false);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/all-products-stock`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filtered = useMemo(() => {
    let list = [...rows];

    if (category && category !== "Todos") {
      list = list.filter(
        (r) =>
          (r.product_general_category ||
            r.category_name ||
            r.product_category) === category
      );
    }

    if (alertFilter && alertFilter !== "Todos") {
      list = list.filter((r) => {
        const qty = Number(r.product_quantity || 0);
        const min = Number(r.min_stock || 0);
        const max = Number(r.max_stock || 0);
        if (alertFilter === "Bajo" && qty <= min) return true;  // rojo
        if (alertFilter === "Alto" && max && qty >= max) return true; // verde
        return false;
      });
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          String(r.product_name || "").toLowerCase().includes(q) ||
          String(r.product_cod || r.product_id || "")
            .toLowerCase()
            .includes(q)
      );
    }

    return list;
  }, [rows, category, alertFilter, search]);

  const openAdjust = (row) => {
    setRowSel(row);
    setForm({
      subtract_quantity: 0,
      min_stock: Number(row.min_stock || 0),
      max_stock: Number(row.max_stock || 0),
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

    const payload = {
      subtract_quantity: Number(form.subtract_quantity || 0) || 0,
      min_stock: Number(form.min_stock),
      max_stock: Number(form.max_stock),
    };
    if (touchWeight)
      payload.product_total_weight = Number(form.product_total_weight || 0);

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
        <button className="boton-volver" onClick={() => navigate("/operator-panel")}>⬅ Volver</button>
      </div>
      <div className="stock-container">
     

        <h1 className="stock-title">Stock</h1>

        {/* Filtros (mantengo tus clases; solo estilos inline para compactar y centrar) */}
        <div
          className="filters"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            maxWidth: 1000,
            margin: "10px auto 16px",
          }}
        >
          <div>
            <label style={{ fontSize: 14 }}>
              Categoría:
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  marginLeft: 8,
                  padding: "4px 8px",
                  fontSize: 14,
                  minWidth: 160,
                }}
              >
                <option>Todos</option>
                {/* podés poblar dinámicamente si querés */}
                <option>PRINCIPAL</option>
              </select>
            </label>
          </div>

          <div>
            <label style={{ fontSize: 14 }}>
              Alerta de stock:
              <select
                value={alertFilter}
                onChange={(e) => setAlertFilter(e.target.value)}
                style={{
                  marginLeft: 8,
                  padding: "4px 8px",
                  fontSize: 14,
                  minWidth: 160,
                }}
              >
                <option>Todos</option>
                <option>Bajo</option>
                <option>Alto</option>
              </select>
            </label>
          </div>

          <div style={{ flex: "0 0 auto" }}>
            <label style={{ fontSize: 14 }}>
              Buscar producto:
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre del producto"
                style={{
                  marginLeft: 8,
                  padding: "6px 10px",
                  borderRadius: 5,
                  border: "1px solid #dce6f0",
                  width: 220,
                }}
              />
            </label>
          </div>

          <button
            className="clear-button"
            onClick={clearFilters}
            style={{ padding: "6px 10px", fontSize: 14 }}
          >
            Limpiar filtros
          </button>
        </div>

        {/* Tabla (tus clases) */}
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
                <th style={{ width: 120 }}>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="loading">
                    Cargando…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="loading">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const qty = Number(r.product_quantity || 0);
                  const min = Number(r.min_stock || 0);
                  const max = Number(r.max_stock || 0);

                  // 🟥 por debajo del mínimo | 🟩 por encima del máximo
                  const badgeClass =
                    qty <= min ? "low-stock" : max && qty >= max ? "high-stock" : "";

                  // fallback de color suave por si low/high no existen en tu CSS
                  const qtyCellStyle =
                    badgeClass === "low-stock"
                      ? { background: "#ffeaea", color: "#b00020", fontWeight: 600 }
                      : badgeClass === "high-stock"
                      ? { background: "#eaffea", color: "#0a7a0a", fontWeight: 600 }
                      : null;

                  return (
                    <tr key={`${r.id || r.product_cod || r.product_name}`}>
                      <td>{r.product_cod || r.product_id || "-"}</td>
                      <td>{r.product_name}</td>
                      <td className={badgeClass} style={qtyCellStyle} title={`Min: ${min || 0} • Max: ${max || 0}`}>
                        {fmtInt(qty)}
                      </td>
                      <td>{fmtDec(r.product_total_weight)}</td>
                      <td>{fmtInt(min)}</td>
                      <td>{fmtInt(max)}</td>
                      <td>
                        {r.product_general_category ||
                          r.category_name ||
                          r.product_category ||
                          "-"}
                      </td>
                      <td>
                        <button className="clear-button" onClick={() => openAdjust(r)}>
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

      {/* Panel lateral: solo estilos inline para no tocar tu CSS */}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 380,
              maxWidth: "92vw",
              background: "#fff",
              height: "100%",
              padding: 18,
              boxShadow: "-8px 0 26px rgba(0,0,0,.15)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Ajustes manuales</h3>
              <button className="clear-button" onClick={closeAdjust}>✕</button>
            </div>

            <div>
              <div style={{ fontWeight: 700 }}>{rowSel?.product_name}</div>
              <div style={{ color: "#6b7d90", fontSize: 13, marginTop: 4 }}>
                Cód: <b>{rowSel?.product_cod || rowSel?.product_id || "-"}</b> ·{" "}
                Cant: <b>{fmtInt(rowSel?.product_quantity)}</b> · Kg:{" "}
                <b>{fmtDec(rowSel?.product_total_weight)}</b>
              </div>
            </div>

            <form
              onSubmit={submitAdjust}
              style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}
            >
              <label style={{ display: "block" }}>
                Restar unidades (egreso puntual)
                <input
                  type="number"
                  min="0"
                  value={form.subtract_quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subtract_quantity: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #dce6f0",
                    borderRadius: 8,
                    marginTop: 6,
                  }}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label>
                  Stock mínimo
                  <input
                    type="number"
                    min="0"
                    value={form.min_stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, min_stock: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #dce6f0",
                      borderRadius: 8,
                      marginTop: 6,
                    }}
                  />
                </label>
                <label>
                  Stock máximo
                  <input
                    type="number"
                    min="0"
                    value={form.max_stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, max_stock: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #dce6f0",
                      borderRadius: 8,
                      marginTop: 6,
                    }}
                  />
                </label>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={touchWeight}
                  onChange={(e) => setTouchWeight(e.target.checked)}
                />
                También corregir KG total
              </label>

              <label style={{ opacity: touchWeight ? 1 : 0.6 }}>
                KG total (corrección)
                <input
                  type="number"
                  step="0.01"
                  disabled={!touchWeight}
                  value={form.product_total_weight}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      product_total_weight: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #dce6f0",
                    borderRadius: 8,
                    marginTop: 6,
                    background: touchWeight ? "#fff" : "#f4f6f9",
                  }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button type="button" className="clear-button" onClick={closeAdjust}>
                  Cancelar
                </button>
                <button type="submit" className="clear-button" style={{ backgroundColor: "#1677ff", color: "#fff", borderColor: "#1677ff" }}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
