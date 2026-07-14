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

  const [activeSheet, setActiveSheet] = useState("stock");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraRows, setCameraRows] = useState([]);
  const [cameraSearch, setCameraSearch] = useState("");

  const [category, setCategory] = useState("Todos");
  const [alertFilter, setAlertFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(["Todos"]);

  const [open, setOpen] = useState(false);
  const [rowSel, setRowSel] = useState(null);
  const [form, setForm] = useState({
    final_quantity: "",
    product_total_weight: "",
  });
  const [touchWeight, setTouchWeight] = useState(false);

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
          ? j2.map((c) => (c?.category_name || "").trim()).filter(Boolean)
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

  const fetchCamara = async () => {
    setCameraLoading(true);
    try {
      const res = await fetch(`${API_URL}/camara-cuts-for-subproduction?include_used=1`);
      const data = await res.json();
      setCameraRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener productos de cámara:", error);
      setCameraRows([]);
    } finally {
      setCameraLoading(false);
    }
  };

  const eliminarDeCamara = async (row) => {
    if (!row?.available) {
      alert("Este producto ya fue usado o ya no está disponible en cámara.");
      return;
    }

    const confirmado = window.confirm(
      `¿Eliminar "${row.product_name}" de cámara?

El producto seguirá visible como "Usado / no disponible".`
    );

    if (!confirmado) return;

    try {
      const res = await fetch(
        `${API_URL}/camara-cut/${encodeURIComponent(row.source)}/${encodeURIComponent(row.id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok || !data?.ok) {
        alert(
          data?.message ||
            `No se pudo eliminar de cámara. Código HTTP: ${res.status}`
        );
        return;
      }

      alert(data.message || "Producto eliminado de cámara correctamente.");
      await Promise.all([fetchCamara(), fetchStock()]);
    } catch (error) {
      console.error("Error al eliminar de cámara:", error);
      alert(`Error al eliminar de cámara: ${error?.message || "Error desconocido"}`);
    }
  };

  useEffect(() => {
    fetchStock();
    fetchCamara();
  }, []);

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
        const kg = Number(r.product_total_weight || 0);
        const min = Number(r.min_stock || 0);
        const max = Number(r.max_stock || 0);
        const usesKg = String(r.unit_type || "").toUpperCase() === "KG";
        const controlValue = usesKg ? kg : qty;

        if (alertFilter === "Bajo" && controlValue <= min) return true;
        if (alertFilter === "Alto" && max && controlValue >= max) return true;
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

  const cameraFiltered = useMemo(() => {
    const q = cameraSearch.trim().toLowerCase();

    const base = cameraRows.filter((r) => {
      if (activeSheet === "camara-manual") return r.source === "manual";
      if (activeSheet === "camara-romaneo") return r.source === "romaneo";
      return true;
    });

    if (!q) return base;

    return base.filter(
      (r) =>
        String(r.product_name || "").toLowerCase().includes(q) ||
        String(r.unique_code || "").toLowerCase().includes(q) ||
        String(r.bill_supplier_id || "").toLowerCase().includes(q)
    );
  }, [cameraRows, cameraSearch, activeSheet]);

  const manualRows = useMemo(
    () => cameraRows.filter((r) => r.source === "manual"),
    [cameraRows]
  );

  const romaneoRows = useMemo(
    () => cameraRows.filter((r) => r.source === "romaneo"),
    [cameraRows]
  );

  const cameraStats = useMemo(() => {
    const sum = (arr, field) =>
      arr.reduce((acc, item) => acc + Number(item[field] || 0), 0);

    return {
      manual: {
        count: manualRows.length,
        quantity: sum(manualRows, "quantity"),
        weight: sum(manualRows, "weight"),
      },
      romaneo: {
        count: romaneoRows.length,
        quantity: sum(romaneoRows, "quantity"),
        weight: sum(romaneoRows, "weight"),
      },
    };
  }, [manualRows, romaneoRows]);

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
      alert(
        `El total final (${targetQty}) no puede superar el actual (${currentQty}).`
      );
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

  const renderStockTable = () => {
    return (
      <>
        <div className="filters">
          <label className="field">
            <span>Categoría:</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
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
                  const kg = Number(r.product_total_weight || 0);
                  const min = Number(r.min_stock || 0);
                  const max = Number(r.max_stock || 0);
                  const usesKg = String(r.unit_type || "").toUpperCase() === "KG";
                  const controlValue = usesKg ? kg : qty;

                  const badgeClass =
                    controlValue <= min
                      ? "low-stock"
                      : max && controlValue >= max
                      ? "high-stock"
                      : "";

                  const unavailableQty = Number(r.unavailable_camera_quantity || 0);
                  const unavailableKg = Number(r.unavailable_camera_weight || 0);
                  const hasUnavailableCamera = Boolean(
                    r.has_unavailable_camera_stock || unavailableQty > 0 || unavailableKg > 0
                  );

                  return (
                    <tr key={`${r.id || r.product_cod || r.product_name}`}>
                      <td>{r.product_cod || r.product_id || "-"}</td>
                      <td>
                        <div>{r.product_name}</div>
                        {hasUnavailableCamera && (
                          <div
                            style={{
                              display: "inline-block",
                              marginTop: 6,
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: "#fff3cd",
                              color: "#856404",
                              border: "1px solid #ffe69c",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                            title={`En cámara: ${fmtInt(unavailableQty)} unidades / ${fmtDec(unavailableKg)} kg`}
                          >
                            NO DISPONIBLE EN CÁMARA · {fmtInt(unavailableQty)} UN · {fmtDec(unavailableKg)} KG
                          </div>
                        )}
                      </td>
                      <td className={!usesKg ? badgeClass : ""}>{fmtInt(qty)}</td>
                      <td className={usesKg ? badgeClass : ""}>{fmtDec(kg)}</td>
                      <td>{fmtInt(min)}</td>
                      <td>{fmtInt(max)}</td>
                      <td>
                        {r.product_general_category ||
                          r.category_name ||
                          r.product_category ||
                          "-"}
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
      </>
    );
  };

  const renderCamaraTable = (title, stats) => {
    return (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div className="stock-card-like">
            <div className="stock-card-title">Tabla</div>
            <div className="stock-card-value">{title}</div>
          </div>
          <div className="stock-card-like">
            <div className="stock-card-title">Registros</div>
            <div className="stock-card-value">{fmtInt(stats.count)}</div>
          </div>
          <div className="stock-card-like">
            <div className="stock-card-title">Cantidad total</div>
            <div className="stock-card-value">{fmtInt(stats.quantity)}</div>
          </div>
          <div className="stock-card-like">
            <div className="stock-card-title">Peso total</div>
            <div className="stock-card-value">{fmtDec(stats.weight)} kg</div>
          </div>
        </div>

        <div className="filters" style={{ marginBottom: 16 }}>
          <label className="field field-search" style={{ maxWidth: 420 }}>
            <span>Buscar en cámara:</span>
            <input
              value={cameraSearch}
              onChange={(e) => setCameraSearch(e.target.value)}
              placeholder="Producto, código único o comprobante"
            />
          </label>

          <div className="filters-right">
            <button className="btn btn-outline" onClick={() => setCameraSearch("")}>
              Limpiar búsqueda
            </button>
            <button className="btn btn-primary" onClick={fetchCamara}>
              Actualizar cámara
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="stock-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>COMPROBANTE</th>
                <th>PRODUCTO</th>
                <th>CANTIDAD</th>
                <th>PESO</th>
                <th>CÓDIGO ÚNICO</th>
                <th>ESTADO</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {cameraLoading ? (
                <tr>
                  <td colSpan={8} className="loading">
                    Cargando productos de cámara…
                  </td>
                </tr>
              ) : cameraFiltered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="loading">
                    No hay registros en esta tabla.
                  </td>
                </tr>
              ) : (
                cameraFiltered.map((row) => (
                  <tr
                    key={`${row.source}-${row.id}`}
                    style={!row.available ? { opacity: 0.72, background: "#f7f7f7" } : undefined}
                  >
                    <td>{row.id}</td>
                    <td>{row.bill_supplier_id}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          alignItems: "flex-start",
                        }}
                      >
                        <span>{row.product_name}</span>

                        {!row.available && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 9px",
                              borderRadius: 999,
                              background: "#ffe5e5",
                              color: "#b42318",
                              border: "1px solid #f5c2c7",
                              fontSize: 11,
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            YA UTILIZADO / NO DISPONIBLE
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{fmtInt(row.quantity)}</td>
                    <td>{fmtDec(row.weight)} kg</td>
                    <td>{row.unique_code || "-"}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          background: row.available ? "#e8f7ee" : "#fff1f3",
                          color: row.available ? "#067647" : "#c01048",
                          border: row.available
                            ? "1px solid #b7ebc6"
                            : "1px solid #f8c7d4",
                        }}
                      >
                        {row.available ? "Disponible" : "Usado / no disponible"}
                      </span>
                    </td>
                    <td>
                      {row.available ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => eliminarDeCamara(row)}
                        >
                          Eliminar de cámara
                        </button>
                      ) : (
                        <span style={{ color: "#888", fontWeight: 700, fontSize: 13 }}>
                          Sin acciones
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </>
    );
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <h1 className="stock-title" style={{ marginBottom: 0 }}>
            Stock y Cámara
          </h1>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-outline" onClick={fetchStock}>
              Actualizar stock
            </button>
            <button className="btn btn-outline" onClick={fetchCamara}>
              Actualizar cámara
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 18,
            borderBottom: "1px solid #d9e2ec",
            paddingBottom: 10,
          }}
        >
          <button
            type="button"
            className={`btn ${activeSheet === "stock" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveSheet("stock")}
          >
            Stock general ({fmtInt(rows.length)})
          </button>

          <button
            type="button"
            className={`btn ${activeSheet === "camara-manual" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveSheet("camara-manual")}
          >
            Cámara manual ({fmtInt(cameraStats.manual.count)})
          </button>

          <button
            type="button"
            className={`btn ${activeSheet === "camara-romaneo" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveSheet("camara-romaneo")}
          >
            Cámara romaneo ({fmtInt(cameraStats.romaneo.count)})
          </button>
        </div>

        {activeSheet === "stock" && renderStockTable()}

        {activeSheet === "camara-manual" &&
          renderCamaraTable("Cámara manual", cameraStats.manual)}

        {activeSheet === "camara-romaneo" &&
          renderCamaraTable("Cámara romaneo", cameraStats.romaneo)}
      </div>

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
              width: 420,
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
              <button className="btn btn-outline" onClick={closeAdjust}>
                ✕
              </button>
            </div>

            <div className="drawer-product">
              <div className="name">{rowSel?.product_name}</div>
              <div className="meta">
                Cód: <b>{rowSel?.product_cod || rowSel?.product_id || "-"}</b> ·
                Cant: <b>{fmtInt(rowSel?.product_quantity)}</b> · Kg:{" "}
                <b>{fmtDec(rowSel?.product_total_weight)}</b>
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, final_quantity: e.target.value }))
                  }
                />
                <small>
                  Ingresá el <b>total final</b> que querés ver en stock. Solo permite disminuir.
                </small>
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
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      product_total_weight: e.target.value,
                    }))
                  }
                />
                <small>
                  Ingresá el <b>total final</b> de kilos para el producto.
                </small>
              </label>

              <div className="drawer-actions">
                <button type="button" className="btn btn-outline" onClick={closeAdjust}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .stock-card-like {
          background: #f8fbff;
          border: 1px solid #d9e7f5;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .stock-card-title {
          font-size: 12px;
          color: #5b6b7a;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .stock-card-value {
          font-size: 20px;
          font-weight: 700;
          color: #17324d;
        }
      `}</style>
    </div>
  );
}