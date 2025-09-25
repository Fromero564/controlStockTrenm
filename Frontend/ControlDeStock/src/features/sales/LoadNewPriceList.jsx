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
  return +(sinIva * (1 + ali / 100)).toFixed(2);
}
function calcularPrecioSinIVA(precioConIVA, alicuota) {
  const conIva = parseFloat(precioConIVA);
  const ali = parseFloat(alicuota);
  if (isNaN(conIva) || isNaN(ali)) return 0;
  return +(conIva / (1 + ali / 100)).toFixed(2);
}

export default function LoadNewPriceList() {
  const location = useLocation();
  const navigate = useNavigate();
  const editing = location.state?.mode === "edit";
  const listNumber = location.state?.listNumber;
  const preload = location.state?.payload || null;

  const [nombreLista, setNombreLista] = useState("");
  const [clientesOptions, setClientesOptions] = useState([]);
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [precios, setPrecios] = useState({});
  const [checkedProducts, setCheckedProducts] = useState({});
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");

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

  useEffect(() => {
    const loadProductos = async () => {
      const r = await fetch(PRODUCTOS_URL, { credentials: "include" });
      const data = await r.json();
      setProductos(data);
      const preciosIniciales = {};
      const checksIniciales = {};
      data.forEach((p) => {
        const unidadDefault = p?.category?.category_name === "PRINCIPAL" ? "UN" : "KG";
        preciosIniciales[p.id] = { costo: 0, sinIva: 0, conIva: 0, alicuota: Number(p?.alicuota ?? 0), unidad: unidadDefault };
        checksIniciales[p.id] = true;
      });
      setPrecios(preciosIniciales);
      setCheckedProducts(checksIniciales);
      if (editing) {
        if (preload?.products?.length) {
          applyExisting(preload);
        } else if (listNumber) {
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
        preciosEdit[id] = {
          costo: Number(p.costo ?? 0),
          sinIva: Number(p.precio_sin_iva ?? 0),
          conIva: Number(p.precio_con_iva ?? 0),
          alicuota: 0,
          unidad: p.unidad_venta || "KG",
        };
        checksEdit[id] = true;
      });
      setPrecios((prev) => ({ ...prev, ...preciosEdit }));
      setCheckedProducts((prev) => ({ ...prev, ...checksEdit }));
    };
    loadProductos();
  }, [editing, listNumber, preload]);

  const handleCheck = (id) => setCheckedProducts((prev) => ({ ...prev, [id]: !prev[id] }));

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
      } else if (field === "alicuota") {
        alicuota = value;
        if (!isNaN(Number(sinIva)) && Number(sinIva) > 0) conIva = calcularPrecioConIVA(sinIva, alicuota);
        else if (!isNaN(Number(conIva)) && Number(conIva) > 0) sinIva = calcularPrecioSinIVA(conIva, alicuota);
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
  const productosPagina = productosFiltrados.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);

  const handlePaginaChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPaginas) setPagina(newPage);
  };

  const buildPayloadProducts = () =>
    productos
      .filter((p) => checkedProducts[p.id])
      .map((p) => ({
        id: p.id,
        name: p.product_name,
        unidad_venta: precios[p.id]?.unidad || (p.category?.category_name === "PRINCIPAL" ? "UN" : "KG"),
        costo: parseFloat(precios[p.id]?.costo) || 0,
        precio_sin_iva: parseFloat(precios[p.id]?.sinIva) || 0,
        precio_con_iva: parseFloat(precios[p.id]?.conIva) || 0,
      }));

  const handleEnviar = async () => {
    if (!nombreLista.trim()) {
      Swal.fire("Error", "Debe ingresar un nombre de lista", "error");
      return;
    }
    const clientsIds = clientesSeleccionados.map((c) => c.value);
    const productosSeleccionados = buildPayloadProducts();
    if (productosSeleccionados.length === 0) {
      Swal.fire("Error", "Debe seleccionar al menos un producto", "error");
      return;
    }
    const hayCero = productosSeleccionados.some(
      (p) => p.costo === 0 || p.precio_sin_iva === 0 || p.precio_con_iva === 0
    );
    if (hayCero) {
      const { isConfirmed } = await Swal.fire({
        title: "Hay productos con valores en $0",
        text: "¿Desea continuar de todos modos?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "No, cancelar",
      });
      if (!isConfirmed) return;
    }
    try {
      if (editing) {
        const response = await fetch(`${API_URL}/update-price-list/${listNumber}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: nombreLista, clients: clientsIds, products: productosSeleccionados }),
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
        body: JSON.stringify({ name: nombreLista, clients: clientsIds, products: productosSeleccionados }),
      });
      const data = await response.json();
      if (data.ok) {
        await Swal.fire("¡Éxito!", "¡Lista creada correctamente!", "success");
        navigate(-1);
      } else {
        Swal.fire("Error", data.msg || "Error al crear la lista", "error");
      }
    } catch {
      Swal.fire("Error", "Error al enviar los datos", "error");
    }
  };

  return (
    <div className="price-list-bg">
      <Navbar />
      <div className="price-list-container">
        <button className="price-list-volver-btn" onClick={() => navigate(-1)}>⬅ Volver</button>
        <h2 className="price-list-title">{editing ? "MODIFICACIÓN DE LISTA DE PRECIO" : "NUEVA DE LISTA DE PRECIO"}</h2>

        <div className="price-list-form-row">
          <div className="price-list-form-group">
            <label className="price-list-label">NOMBRE LISTA</label>
            <input
              type="text"
              value={nombreLista}
              onChange={(e) => setNombreLista(e.target.value)}
              placeholder="Nombre"
              className="price-list-input"
            />
          </div>

          <div className="price-list-form-group" style={{ flex: 2 }}>
            <label className="price-list-label">ASOCIAR CLIENTE/S</label>
            <Select
              isMulti
              value={clientesSeleccionados}
              onChange={setClientesSeleccionados}
              options={clientesOptions}
              classNamePrefix="react-select"
              placeholder="Agregar"
              className="price-list-select"
            />
          </div>
        </div>

        <div className="price-list-buscar-row">
          <label className="price-list-label">BUSCAR</label>
          <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
            <input
              className="price-list-buscar-input"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
            <button className="price-list-buscar-btn" tabIndex={-1} disabled>Buscar</button>
          </div>
        </div>

        <div className="price-list-table-container">
          <table className="price-list-table">
            <thead className="price-list-table-head">
              <tr>
                <th className="price-list-th">ACCIÓN</th>
                <th className="price-list-th" style={{ textAlign: "left" }}>PRODUCTO</th>
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
                  <tr key={prod.id} className={idx % 2 === 0 ? "price-list-tr-par" : "price-list-tr-impar"}>
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
                        value={p.unidad || (prod?.category?.category_name === "PRINCIPAL" ? "UN" : "KG")}
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
                        value={p.alicuota ?? 0}
                        onChange={(e) => handlePrecioChange(prod.id, "alicuota", e.target.value)}
                        className="price-list-price-input"
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

          <div className="price-list-pagination">
            <button className="price-list-pagination-btn" onClick={() => handlePaginaChange(pagina - 1)} disabled={pagina === 1}>Anterior</button>
            <span className="price-list-pagination-info">Página {pagina} de {totalPaginas}</span>
            <button className="price-list-pagination-btn" onClick={() => handlePaginaChange(pagina + 1)} disabled={pagina === totalPaginas}>Siguiente</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 28 }}>
          <button
            className="price-list-pagination-btn"
            style={{ background: "#fff", border: "1.5px solid #1172B8", color: "#1172B8" }}
            onClick={() => navigate(-1)}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="price-list-pagination-btn"
            style={{ background: "#1172B8", color: "#fff", border: "none" }}
            onClick={handleEnviar}
            type="button"
          >
            {editing ? "Guardar cambios" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
