import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/loadNewPriceList.css";

const API_URL = import.meta.env.VITE_API_URL;
const PRODUCTOS_URL = `${API_URL}/all-products-availables`;
const CLIENTES_URL = `${API_URL}/allclients`;
const ITEMS_PER_PAGE = 5;

function calcularPrecioConIVA(precioSinIVA, alicuota) {
  const sinIva = parseFloat(precioSinIVA);
  const ali = parseFloat(alicuota);
  if (isNaN(sinIva) || isNaN(ali)) return 0;
  return +((sinIva * (1 + ali / 100)).toFixed(2));
}

function calcularPrecioSinIVA(precioConIVA, alicuota) {
  const conIva = parseFloat(precioConIVA);
  const ali = parseFloat(alicuota);
  if (isNaN(conIva) || isNaN(ali) || ali === 0) return conIva || 0;
  return +((conIva / (1 + ali / 100)).toFixed(2));
}

const LoadNewPriceList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preload = location.state?.payload || null; // si venimos desde editar
  const listNumber = location.state?.listNumber || null;
  const editing = Boolean(preload || listNumber);

  const [clientesOptions, setClientesOptions] = useState([]);
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [nombreLista, setNombreLista] = useState("");
  const [productos, setProductos] = useState([]);
  const [precios, setPrecios] = useState({});
  const [checkedProducts, setCheckedProducts] = useState({});
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  // Carga clientes
  useEffect(() => {
    const loadClientes = async () => {
      const r = await fetch(CLIENTES_URL, { credentials: "include" });
      const data = await r.json();
      const opts = data.map((c) => ({ value: c.id, label: c.client_name }));
      setClientesOptions(opts);

      if (editing) {
        let clients = preload?.header?.clients;
        if (!clients && listNumber) {
          const lr = await fetch(`${API_URL}/price-list/${listNumber}`, { credentials: "include" });
          const ld = await lr.json();
          clients = ld?.header?.clients || [];
        }
        if (Array.isArray(clients) && clients.length) {
          const set = new Set(clients.map(Number));
          setClientesSeleccionados(opts.filter((o) => set.has(Number(o.value))));
        }
      }
    };
    loadClientes();
  }, [editing, listNumber, preload]);

  // Carga productos
  useEffect(() => {
    const loadProductos = async () => {
      const r = await fetch(PRODUCTOS_URL, { credentials: "include" });
      const data = await r.json();
      setProductos(data);

      const preciosIniciales = {};
      const checksIniciales = {};
      data.forEach((p) => {
        const unidadDefault = p?.category?.category_name === "PRINCIPAL" ? "UN" : "KG";
        preciosIniciales[p.id] = {
          costo: 0,
          sinIva: 0,
          conIva: 0,
          alicuota: Number(p?.alicuota ?? 0),
          unidad: unidadDefault,
        };
        checksIniciales[p.id] = true;
      });
      setPrecios(preciosIniciales);
      setCheckedProducts(checksIniciales);

      if (editing) {
        if (preload?.products?.length) applyExisting(preload);
        else if (listNumber) {
          const lr = await fetch(`${API_URL}/price-list/${listNumber}`, { credentials: "include" });
          const ld = await lr.json();
          applyExisting(ld);
        }
      }
    };

    const applyExisting = (payload) => {
      if (!payload) return;
      setNombreLista(payload?.header?.name || "");
      const preciosEdit = {};
      const checksEdit = {};
      (payload.products || []).forEach((p) => {
        const id = Number(p.product_id);
        const item = {
          costo: Number(p.costo ?? 0),
          sinIva: Number(p.precio_sin_iva ?? 0),
          conIva: Number(p.precio_con_iva ?? 0),
          unidad: p.unidad_venta || "KG",
        };
        if (p.alicuota !== undefined && p.alicuota !== null) {
          item.alicuota = Number(p.alicuota);
        }
        preciosEdit[id] = item;
        checksEdit[id] = true;
      });
      setPrecios((prev) => ({ ...prev, ...preciosEdit }));
      setCheckedProducts((prev) => ({ ...prev, ...checksEdit }));
    };

    loadProductos();
  }, [editing, listNumber, preload]);

  // Handlers
  const handleCheck = (id) =>
    setCheckedProducts((prev) => ({ ...prev, [id]: !prev[id] }));

  const handlePrecioChange = (id, field, raw) => {
    const value = raw === "" ? "" : Number(raw);
    setPrecios((prev) => {
      const current = prev[id] || {};
      let { sinIva, conIva, alicuota, costo, unidad } = current;
      if (field === "costo") costo = value;
      else if (field === "sinIva") {
        sinIva = value;
        conIva = calcularPrecioConIVA(sinIva, alicuota);
      } else if (field === "conIva") {
        conIva = value;
        sinIva = calcularPrecioSinIVA(conIva, alicuota);
      }
      return { ...prev, [id]: { costo, sinIva, conIva, alicuota, unidad } };
    });
  };

  const handleUnidadChange = (id, nuevaUnidad) =>
    setPrecios((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), unidad: nuevaUnidad } }));

  const productosFiltrados = productos.filter((p) =>
    p.product_name.toLowerCase().includes(busqueda.toLowerCase())
  );
  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE) || 1;
  const productosPagina = productosFiltrados.slice(
    (pagina - 1) * ITEMS_PER_PAGE,
    pagina * ITEMS_PER_PAGE
  );

  const handlePaginaChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPaginas) setPagina(newPage);
  };

  // ⚠️ ESTE ES EL CAMBIO CLAVE: ahora enviamos product_name al backend
  const buildPayloadProducts = () =>
    productos
      .filter((p) => checkedProducts[p.id])
      .map((p) => {
        const pr = precios[p.id] || {};
        return {
          product_id: p.id,
          product_name: p.product_name, // ✅ nuevo campo
          costo: Number(pr.costo || 0),
          precio_sin_iva: Number(pr.sinIva || 0),
          precio_con_iva: Number(pr.conIva || 0),
          alicuota: Number(pr.alicuota ?? p.alicuota ?? 0),
          unidad_venta:
            pr.unidad || (p?.category?.category_name === "PRINCIPAL" ? "UN" : "KG"),
        };
      });

  const handleGuardar = async () => {
    const clientsIds = clientesSeleccionados.map((c) => c.value);
    const productosSeleccionados = buildPayloadProducts();
    if (!nombreLista.trim()) {
      Swal.fire("Falta el nombre", "Completá el nombre de la lista.", "warning");
      return;
    }
    if (productosSeleccionados.length === 0) {
      Swal.fire("Sin productos", "Seleccioná al menos un producto.", "warning");
      return;
    }

    try {
      if (editing) {
        const response = await fetch(`${API_URL}/update-price-list/${listNumber}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: nombreLista,
            clients: clientsIds,
            products: productosSeleccionados,
          }),
        });
        const data = await response.json();
        if (response.ok && data?.ok !== false) {
          await Swal.fire("¡Éxito!", "¡Lista actualizada correctamente!", "success");
          navigate(-1);
          return;
        }
        Swal.fire("Error", data?.msg || "Error al actualizar la lista", "error");
        return;
      }

      const response = await fetch(`${API_URL}/create-new-price-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: nombreLista,
          clients: clientsIds,
          products: productosSeleccionados,
        }),
      });
      const data = await response.json();
      if (response.ok && data?.ok !== false) {
        await Swal.fire("¡Éxito!", "¡Lista creada correctamente!", "success");
        navigate(-1);
        return;
      }
      Swal.fire("Error", data?.msg || "Error al crear la lista", "error");
    } catch (err) {
      Swal.fire("Error", err?.message || "Fallo la comunicación con el servidor.", "error");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="price-list-bg">
        <button
          className="boton-volver"
          style={{ margin: "20px" }}
          onClick={() => navigate("/sales-panel")}
        >
          ⬅ Volver
        </button>
        <div className="price-list-container">
          <h1 className="price-list-title">
            {editing ? "Editar Lista de Precios" : "Nueva Lista de Precios"}
          </h1>

          {/* Formulario: nombre + clientes */}
          <div className="price-list-form-row">
            <div className="price-list-form-group">
              <label className="price-list-label">Nombre de la lista</label>
              <input
                className="price-list-input"
                value={nombreLista}
                onChange={(e) => setNombreLista(e.target.value)}
                placeholder="Ej: Lista Mayorista"
              />
            </div>

            <div className="price-list-form-group">
              <label className="price-list-label">Clientes</label>
              <div className="price-list-select">
                <Select
                  isMulti
                  options={clientesOptions}
                  value={clientesSeleccionados}
                  onChange={setClientesSeleccionados}
                  classNamePrefix="rs"
                />
              </div>
            </div>
          </div>

          {/* Buscador */}
          <div className="price-list-buscar-row">
            <input
              className="price-list-buscar-input"
              type="text"
              placeholder="Buscar producto por nombre"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Tabla */}
          <div className="price-list-table-container">
            <table className="price-list-table">
              <thead className="price-list-table-head">
                <tr>
                  <th className="price-list-th">ACCIÓN</th>
                  <th className="price-list-th" style={{ textAlign: "left" }}>
                    PRODUCTO
                  </th>
                  <th className="price-list-th">UNIDAD DE VENTA</th>
                  <th className="price-list-th">COSTO</th>
                  <th className="price-list-th">PRECIO S/IVA</th>
                  <th className="price-list-th">ALICUOTA (%)</th>
                  <th className="price-list-th">PRECIO C/IVA</th>
                </tr>
              </thead>
              <tbody>
                {productosPagina.map((prod, idx) => {
                  const p = precios[prod.id] || {};
                  return (
                    <tr
                      key={prod.id}
                      className={idx % 2 === 0 ? "price-list-tr-par" : "price-list-tr-impar"}
                    >
                      <td className="price-list-td">
                        <input
                          type="checkbox"
                          className="price-list-checkbox"
                          checked={!!checkedProducts[prod.id]}
                          onChange={() => handleCheck(prod.id)}
                        />
                      </td>
                      <td className="price-list-td price-list-product-name">{prod.product_name}</td>
                      <td className="price-list-td">
                        <select
                          className="price-list-price-input"
                          value={
                            p.unidad || (prod?.category?.category_name === "PRINCIPAL" ? "UN" : "KG")
                          }
                          onChange={(e) => handleUnidadChange(prod.id, e.target.value)}
                        >
                          <option value="UN">Unidad (Pieza)</option>
                          <option value="KG">Kilogramo (kg)</option>
                        </select>
                      </td>
                      <td className="price-list-td">
                        <input
                          type="number"
                          min={0}
                          value={p.costo ?? 0}
                          onChange={(e) => handlePrecioChange(prod.id, "costo", e.target.value)}
                          className="price-list-price-input"
                        />
                      </td>
                      <td className="price-list-td">
                        <input
                          type="number"
                          min={0}
                          value={p.sinIva ?? 0}
                          onChange={(e) => handlePrecioChange(prod.id, "sinIva", e.target.value)}
                          className="price-list-price-input"
                        />
                      </td>
                      <td className="price-list-td">
                        <input
                          type="number"
                          min={0}
                          value={p.alicuota ?? prod?.alicuota ?? 0}
                          readOnly
                          disabled
                          className="price-list-price-input ali-readonly"
                          title="La alícuota se edita desde Productos"
                        />
                      </td>
                      <td className="price-list-td">
                        <input
                          type="number"
                          min={0}
                          value={p.conIva ?? 0}
                          onChange={(e) => handlePrecioChange(prod.id, "conIva", e.target.value)}
                          className="price-list-price-input"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="price-list-pagination">
            <button
              className="price-list-pagination-btn"
              onClick={() => handlePaginaChange(pagina - 1)}
              disabled={pagina === 1}
            >
              ⬅ Anterior
            </button>
            <span className="price-list-pagination-info">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              className="price-list-pagination-btn"
              onClick={() => handlePaginaChange(pagina + 1)}
              disabled={pagina === totalPaginas}
            >
              Siguiente ➡
            </button>
          </div>

          {/* CTA */}
          <div className="price-list-actions">
            <button className="btn-guardar" onClick={handleGuardar}>
              {editing ? "Guardar cambios" : "Crear lista"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadNewPriceList;
