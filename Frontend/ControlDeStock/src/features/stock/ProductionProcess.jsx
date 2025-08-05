import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/productionprocess.css";

const ProductionProcess = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [cortes, setCortes] = useState([]);
  const [tares, setTares] = useState([]);
  const [taraSeleccionadaId, setTaraSeleccionadaId] = useState("");
  const [formData, setFormData] = useState({
    tipo: "",
    promedio: 0,
    cantidad: 0,
    pesoBruto: 0,
    tara: 0,
    pesoNeto: 0,
  });

  const [comprobantesDisponibles, setComprobantesDisponibles] = useState([]);
  const [comprobantesAgregados, setComprobantesAgregados] = useState([]);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState("");
  const [infoComprobante, setInfoComprobante] = useState(null);

  const [subproductosEsperados, setSubproductosEsperados] = useState([]);
  const [cargandoSubproductos, setCargandoSubproductos] = useState(false);

  const [mostrarSinRemito, setMostrarSinRemito] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productoSinRemito, setProductoSinRemito] = useState(null);
  const [cantidadSinRemito, setCantidadSinRemito] = useState("");
  const [productosSinRemito, setProductosSinRemito] = useState([]);

  const [cortesAgregados, setCortesAgregados] = useState([]);

  useEffect(() => {
    if (!Array.isArray(productosSinRemito)) setProductosSinRemito([]);
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${API_URL}/product-name`);
        const data = await response.json();
        const productosConCantidad = data.map((producto) => ({
          id: producto.id,
          nombre: producto.product_name,
          categoria: producto.category?.category_name || "",
          cantidad: 0,
        }));
        setCortes(productosConCantidad);
        setProductosDisponibles(
          data.map((prod) => ({
            value: prod.product_name,
            label: prod.product_name,
          }))
        );
      } catch (err) {
        console.error("Error al obtener los productos:", err);
      }
    };
    fetchProductos();
  }, [API_URL]);

  useEffect(() => {
    const fetchTares = async () => {
      try {
        const response = await fetch(`${API_URL}/allTares`);
        const data = await response.json();
        const tarasConIndex = data.map((item) => ({
          id: item.id,
          nombre: item.tare_name,
          peso: item.tare_weight,
        }));
        setTares(tarasConIndex);
      } catch (err) {
        console.error("Error al obtener las taras:", err);
      }
    };
    fetchTares();
  }, [API_URL]);

  useEffect(() => {
    const fetchComprobantesSinProcesoConTipo = async () => {
      try {
        const res = await fetch(`http://localhost:3000/allproducts`);
        const data = await res.json();
        const sinProceso = data.filter((p) => !p.production_process);

        const sinProcesoConTipo = await Promise.all(
          sinProceso.map(async (comp) => {
            try {
              const resDetalle = await fetch(`${API_URL}/bill-details-readonly/${comp.id}`);
              const detalleData = await resDetalle.json();
              // Agrupamos los cortes por type (nombre) sumando quantity
              const piezasAgrupadas = Array.isArray(detalleData)
                ? detalleData.reduce((acc, d) => {
                    const tipo = d.type?.trim();
                    acc[tipo] = (acc[tipo] || 0) + Number(d.quantity || 0);
                    return acc;
                  }, {})
                : {};
              return { ...comp, piezasAgrupadas: piezasAgrupadas || {} };
            } catch {
              return { ...comp, piezasAgrupadas: {} };
            }
          })
        );
        setComprobantesDisponibles(sinProcesoConTipo);
      } catch (err) {
        console.error("Error al traer comprobantes:", err);
      }
    };
    fetchComprobantesSinProcesoConTipo();
  }, [API_URL]);

  const fetchSubproductos = async (tipoProducto, cantidad) => {
    try {
      const url = `${API_URL}/subproducts-by-name/${encodeURIComponent(tipoProducto)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return data.map((sub) => ({
        nombre: sub.nombre,
        cantidadTotal: sub.cantidadPorUnidad * cantidad,
        cantidadPorUnidad: sub.cantidadPorUnidad,
        productoOrigen: tipoProducto,
      }));
    } catch (error) {
      console.error("Error al obtener subproductos:", error);
      return [];
    }
  };

  const handleAgregarComprobante = async (id) => {
    if (!id) {
      Swal.fire("Atención", "Debe ingresar un ID o seleccionar un comprobante.", "warning");
      return;
    }
    if (comprobantesAgregados.some((c) => c.id === id)) {
      Swal.fire("Atención", "Este comprobante ya fue agregado.", "warning");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/bill-details/${id}`);
      const detalles = await response.json();
      if (!detalles || detalles.length === 0) {
        Swal.fire("Error", "No se encontró detalle para ese comprobante.", "error");
        return;
      }
      const resInfo = await fetch(`http://localhost:3000/allproducts`);
      const allProducts = await resInfo.json();
      const remito = allProducts.find((p) => p.id === Number(id));
      let subproductosTotales = [];
      for (const detalle of detalles) {
        const subs = await fetchSubproductos(detalle.type, detalle.quantity);
        subproductosTotales = subproductosTotales.concat(subs);
      }
      setComprobantesAgregados((prev) => [
        ...prev,
        { id, remito, detalles, subproductos: subproductosTotales },
      ]);
      setComprobanteSeleccionado("");
      setInfoComprobante(null);
      setSubproductosEsperados([]);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo agregar el comprobante.", "error");
    }
  };

  const eliminarComprobante = (id) => {
    setComprobantesAgregados((prev) => prev.filter((c) => c.id !== id));
  };

  const cortesTotales = () => {
    const acumulado = {};
    comprobantesAgregados.forEach(({ detalles }) => {
      detalles.forEach(({ type, quantity }) => {
        acumulado[type] = (acumulado[type] || 0) + quantity;
      });
    });
    return acumulado;
  };

  const subproductosTotales = () => {
    const acumulado = {};
    comprobantesAgregados.forEach(({ subproductos }) => {
      subproductos.forEach(({ nombre, cantidadTotal, cantidadPorUnidad }) => {
        if (!acumulado[nombre]) {
          acumulado[nombre] = { cantidadTotal: 0, cantidadPorUnidad };
        }
        acumulado[nombre].cantidadTotal += cantidadTotal;
      });
    });
    return acumulado;
  };

  const productosSinRemitoAgrupados = productosSinRemito.map((prod) => ({
    ...prod,
    subproductosAgrupados: Object.entries(
      (prod.subproductos || []).reduce((acc, s) => {
        if (!acc[s.nombre]) acc[s.nombre] = { cantidadTotal: 0, cantidadPorUnidad: s.cantidadPorUnidad };
        acc[s.nombre].cantidadTotal += s.cantidadTotal;
        return acc;
      }, {})
    ),
  }));

  const cortesAgrupados = Object.entries(cortesTotales());
  const subproductosAgrupadosComprobantes = Object.entries(subproductosTotales());
  const subproductosAgrupadosSinRemito = productosSinRemitoAgrupados.flatMap((prod) => prod.subproductosAgrupados);

  const subproductosCombinados = {};
  [...subproductosAgrupadosComprobantes, ...subproductosAgrupadosSinRemito].forEach(([nombre, data]) => {
    if (!subproductosCombinados[nombre]) {
      subproductosCombinados[nombre] = { cantidadTotal: 0, cantidadPorUnidad: data.cantidadPorUnidad };
    }
    subproductosCombinados[nombre].cantidadTotal += data.cantidadTotal;
  });

  const agregarCorte = async () => {
    if (
      !formData.tipo ||
      formData.cantidad === "" ||
      isNaN(Number(formData.cantidad)) ||
      Number(formData.cantidad) <= 0 ||
      formData.pesoBruto === "" ||
      isNaN(Number(formData.pesoBruto)) ||
      Number(formData.pesoBruto) <= 0 ||
      formData.tara === "" ||
      isNaN(Number(formData.tara)) ||
      Number(formData.tara) <= 0
    ) {
      Swal.fire("Error", "Faltan campos obligatorios o hay valores inválidos.", "error");
      return;
    }
    const tipoActual = formData.tipo.trim();
    const cantidadAgregar = Number(formData.cantidad);
    const cantidadSubEsperada = subproductosCombinados[tipoActual]?.cantidadTotal || 0;
    const cantidadDetalleRemito = comprobantesAgregados
      .flatMap(c => c.detalles)
      .filter((d) => d.type.trim() === tipoActual)
      .reduce((acc, d) => acc + Number(d.quantity), 0);
    const cantidadSubProductoSinRemito = productosSinRemito
      .flatMap((prod) => (Array.isArray(prod.subproductos) ? prod.subproductos : []).filter((sub) => sub.nombre.trim() === tipoActual))
      .reduce((total, sub) => total + sub.cantidadTotal, 0);
    let cantidadPermitida = cantidadSubEsperada + cantidadDetalleRemito + cantidadSubProductoSinRemito;
    if (cantidadPermitida === 0) {
      Swal.fire("Error", `El corte "${tipoActual}" no está en los subproductos esperados, remito ni productos sin remito.`, "error");
      return;
    }
    const cantidadYaAgregada = cortesAgregados
      .filter((c) => c.tipo.trim() === tipoActual)
      .reduce((acc, c) => acc + Number(c.cantidad), 0);
    if (cantidadYaAgregada + cantidadAgregar > cantidadPermitida) {
      const restante = cantidadPermitida - cantidadYaAgregada;
      Swal.fire("Atención", `Solo puede agregar ${restante} unidades más de "${tipoActual}".`, "warning");
      return;
    }
    const pesoNeto = +(formData.pesoBruto - formData.tara).toFixed(2);
    const promedio = formData.cantidad > 0 ? +(pesoNeto / formData.cantidad).toFixed(2) : 0;
    const nuevoCorte = { ...formData, pesoNeto, promedio };
    setCortesAgregados((prev) => [...prev, nuevoCorte]);
    setFormData({
      tipo: "",
      promedio: 0,
      cantidad: 0,
      pesoBruto: 0,
      tara: 0,
      pesoNeto: 0,
    });
    setTaraSeleccionadaId("");
  };

  const eliminarCorte = (index) => {
    setCortesAgregados(cortesAgregados.filter((_, i) => i !== index));
  };

  const handleCantidadSinRemitoChange = (e) => {
    const v = e.target.value;
    if (v === "") return setCantidadSinRemito("");
    if (/^\d+$/.test(v)) setCantidadSinRemito(v);
  };

  const handleCantidadSinRemitoBlur = () => {
    const n = parseInt(cantidadSinRemito, 10);
    setCantidadSinRemito(!n || n <= 0 ? "1" : String(n));
  };

  const handleAgregarProductoSinRemito = async () => {
    const nombre = productoSinRemito?.value;
    const nuevaCantidad = parseInt(cantidadSinRemito, 10);
    if (!nombre || !nuevaCantidad || nuevaCantidad <= 0) {
      Swal.fire("Atención", "Debe seleccionar un producto y una cantidad válida", "warning");
      return;
    }
    const current = Array.isArray(productosSinRemito) ? productosSinRemito : [];
    const idx = current.findIndex((p) => p.producto === nombre);
    if (idx !== -1) {
      const totalCantidad = current[idx].cantidad + nuevaCantidad;
      const subproductos = await fetchSubproductos(nombre, totalCantidad);
      const copia = [...current];
      copia[idx] = { producto: nombre, cantidad: totalCantidad, subproductos };
      setProductosSinRemito(copia);
    } else {
      const subproductos = await fetchSubproductos(nombre, nuevaCantidad);
      setProductosSinRemito([...current, { producto: nombre, cantidad: nuevaCantidad, subproductos }]);
    }
    setProductoSinRemito(null);
    setCantidadSinRemito("");
  };

  const eliminarProductoSinRemito = (index) => {
    setProductosSinRemito((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []));
  };

  const handleGuardar = async () => {
    if (cortesAgregados.length === 0 && productosSinRemito.length === 0) {
      Swal.fire("Aviso", "No hay datos para guardar.", "info");
      return;
    }
    try {
      let bill_ids = comprobantesAgregados.map((comp) => Number(comp.id));
      if (bill_ids.length === 0 && productosSinRemito.length > 0) {
        bill_ids = [0];
      }
      const cortes = cortesAgregados.map((corte) => ({
        type: corte.tipo?.trim(),
        average: Number(corte.promedio),
        quantity: Number(corte.cantidad),
        gross_weight: Number(corte.pesoBruto),
        tares: Number(corte.tara),
        net_weight: Number((corte.pesoBruto - corte.tara).toFixed(2)),
      }));
      const response = await fetch(`${API_URL}/uploadProcessMeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cortes, bill_ids }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar el proceso productivo.");
      }
      Swal.fire("Éxito", "Datos guardados correctamente.", "success");
      setCortesAgregados([]);
      setProductosSinRemito([]);
      setComprobantesAgregados([]);
      navigate("/operator-panel");
    } catch (err) {
      console.error("Error al guardar:", err);
      Swal.fire("Error", err.message || "Ocurrió un error al guardar.", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = parseFloat(value);
    if (name !== "tipo") newValue = isNaN(newValue) ? "" : Math.abs(newValue);
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tipo" ? value : newValue,
    }));
  };

  const calcularPromedio = () => {
    const pesoNeto = formData.pesoBruto - formData.tara;
    const cantidad = formData.cantidad;
    return cantidad > 0 ? (pesoNeto / cantidad).toFixed(2) : "0.00";
  };

  return (
    <>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <div className="pp-main-container">
        <section className="pp-despostar-section">
          <h2>Buscar y Agregar Comprobante</h2>
          <div
            className="pp-form-group"
            style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: "10px" }}
          >
            <div>
              <label>N° Comprobante</label>
              <input
                type="text"
                value={comprobanteSeleccionado}
                onChange={(e) => setComprobanteSeleccionado(e.target.value)}
                placeholder="Ingrese ID"
              />
            </div>
            <div>
              <label>O seleccionar disponible</label>
              <select
                value={comprobanteSeleccionado}
                onChange={(e) => setComprobanteSeleccionado(e.target.value)}
                style={{ height: "45px" }}
              >
                <option value="">-- Elegir comprobante --</option>
                {comprobantesDisponibles.map((comp) => {
                  const piezas = comp.piezasAgrupadas || {};
                  const piezaStr = Object.entries(piezas)
                    .map(([tipo, cant]) => `${tipo}: ${cant}`)
                    .join(" | ");
                  return (
                    <option key={comp.id} value={comp.id}>
                      {comp.supplier} — {piezaStr}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="pp-boton-agregar-wrapper">
              <button
                type="button"
                className="pp-btn-agregar"
                onClick={() => handleAgregarComprobante(comprobanteSeleccionado)}
              >
                Agregar Comprobante
              </button>
            </div>
          </div>
          {comprobantesAgregados.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Comprobantes agregados</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {comprobantesAgregados.map(({ id, remito, detalles }) => {
                  const piezasAgrupadas = detalles.reduce((acc, { type, quantity }) => {
                    const key = type.trim();
                    acc[key] = (acc[key] || 0) + Number(quantity);
                    return acc;
                  }, {});
                  return (
                    <div
                      key={id}
                      style={{
                        border: "1.5px solid #cae1fd",
                        background: "#fafdff",
                        borderRadius: 12,
                        boxShadow: "0 2px 6px #b5dafc3a",
                        padding: "16px 22px 14px 18px",
                        minWidth: 240,
                        maxWidth: 340,
                        marginBottom: 12,
                        position: "relative",
                        fontSize: 16
                      }}
                    >
                      <button
                        onClick={() => eliminarComprobante(id)}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 12,
                          border: "none",
                          background: "none",
                          color: "#cb1111",
                          fontSize: 20,
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                        title="Eliminar comprobante"
                      >
                        ×
                      </button>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ color: "#155ca4" }}>📄 {remito?.supplier || "Proveedor Desconocido"}</span>
                        <span style={{ fontWeight: 400, color: "#777", marginLeft: 10 }}>ID: {id}</span>
                      </div>
                      <div style={{ margin: "5px 0 0 2px", color: "#244b79", fontWeight: 500 }}>
                        <span>Piezas:</span>
                        <ul style={{ padding: "0 0 0 16px", margin: "2px 0 0 0" }}>
                          {Object.entries(piezasAgrupadas).map(([tipo, cantidad]) => (
                            <li key={tipo} style={{ marginBottom: 1 }}>
                              <span style={{
                                background: "#e4f2ff",
                                borderRadius: 7,
                                padding: "2px 7px",
                                marginRight: 6,
                                color: "#176eb3",
                                fontWeight: 500,
                                display: "inline-block"
                              }}>{tipo}</span>
                              <b style={{ color: "#222", fontWeight: 600 }}>{cantidad}</b> unidad{cantidad > 1 ? "es" : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pp-totales-box">
                <div style={{ marginBottom: 8 }}>🟦 <b>Cortes totales sumados:</b></div>
                <ul>
                  {cortesAgrupados.map(([tipo, cantidad]) => (
                    <li key={tipo}>
                      <span className="pp-tag-corte">{tipo}</span> — {cantidad} unidades
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pp-totales-box">
                <div style={{ marginBottom: 8 }}>🟩 <b>Subproductos totales sumados:</b></div>
                <ul>
                  {Object.entries(subproductosCombinados).map(([nombre, { cantidadTotal, cantidadPorUnidad }]) => (
                    <li key={nombre}>
                      <span className="pp-tag-corte">{nombre}</span>
                      {" — "}
                      {cantidadTotal} unidades
                      <span style={{ fontSize: "0.95em", color: "#444", marginLeft: 4 }}>
                        ({cantidadPorUnidad} x unidad)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
        <section className="pp-despostar-section">
          <h2>
            <label
              className="pp-checkbox-label"
              style={{
                fontSize: "1.25rem",
                padding: "12px 24px",
                borderRadius: "12px",
                background: "#f3f3f9",
                border: "2px solid #005ecb",
                fontWeight: "bold",
                boxShadow: "0 0 8px #9fc9fc77",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={mostrarSinRemito}
                onChange={() => setMostrarSinRemito(!mostrarSinRemito)}
                className="pp-checkbox"
                style={{ width: "24px", height: "24px", marginRight: "10px", accentColor: "#005ecb" }}
              />
              Subproducción
            </label>
          </h2>
          {mostrarSinRemito && (
            <>
              <div className="pp-inline-form">
                <div className="pp-field">
                  <label>Producto</label>
                  <Select
                    className="pp-select-react"
                    options={productosDisponibles}
                    value={productoSinRemito}
                    onChange={setProductoSinRemito}
                    placeholder="Seleccionar producto..."
                  />
                </div>
                <div className="pp-field pp-small">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadSinRemito}
                    onChange={handleCantidadSinRemitoChange}
                    onBlur={handleCantidadSinRemitoBlur}
                    inputMode="numeric"
                  />
                </div>
                <div className="pp-field pp-button">
                  <button className="pp-btn-agregar" onClick={handleAgregarProductoSinRemito}>
                    Agregar
                  </button>
                </div>
              </div>
              {Array.isArray(productosSinRemitoAgrupados) && productosSinRemitoAgrupados.length > 0 && (
                <div className="subproductos-section" style={{ marginTop: "12px" }}>
                  <h3>Subproducción agregada</h3>
                  <div className="subproductos-agrupados">
                    {productosSinRemitoAgrupados.map((prod, idx) => (
                      <div key={idx} className="subproducto-bloque">
                        <div className="pp-bloque-header">
                          <strong>🐄 {prod.producto}</strong>
                          <div className="pp-bloque-actions">
                            <span className="pp-chip-cantidad">Cantidad: {prod.cantidad}</span>
                            <button
                              className="pp-btn-eliminar"
                              onClick={() => eliminarProductoSinRemito(idx)}
                              title="Quitar producto"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <ul className="subproductos-list" style={{ marginTop: "6px" }}>
                          {prod.subproductosAgrupados.map(([nombre, { cantidadTotal, cantidadPorUnidad }], i) => (
                            <li key={i}>
                              <span className="subproducto-label">{nombre}</span>
                              <span className="subproducto-meta">
                                {cantidadTotal} unidades ({cantidadPorUnidad} x unidad)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
        <section className="pp-cortes-section">
          <h1>Proceso Productivo</h1>
          <div className="pp-content-wrapper">
            <div className="pp-formulario-corte">
              <div className="pp-form-group pp-formulario-corte-wrapper">
                <div>
                  <label>TIPO</label>
                  <Select
                    className="pp-select-react"
                    placeholder="Seleccionar corte..."
                    options={cortes.map((corte) => ({
                      value: corte.nombre,
                      label: corte.nombre,
                    }))}
                    value={formData.tipo ? { value: formData.tipo, label: formData.tipo } : null}
                    onChange={(selected) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipo: selected ? selected.value : "",
                      }));
                    }}
                    isClearable
                  />
                </div>
                <div>
                  <label>CANTIDAD</label>
                  <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} min="0" required />
                </div>
                <div>
                  <label>PESO BRUTO</label>
                  <input type="number" name="pesoBruto" value={formData.pesoBruto} onChange={handleChange} min="0" required />
                </div>
                <div>
                  <label>TARA</label>
                  <select
                    name="tara"
                    value={taraSeleccionadaId}
                    onChange={(e) => {
                      const selected = tares.find((t) => t.id === parseInt(e.target.value));
                      setTaraSeleccionadaId(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        tara: selected?.peso || 0,
                      }));
                    }}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {tares.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} ({t.peso} kg)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>PESO NETO</label>
                  <input type="number" value={(formData.pesoBruto - formData.tara).toFixed(2)} disabled />
                </div>
                <div>
                  <label>PROMEDIO</label>
                  <input type="text" value={calcularPromedio()} disabled />
                </div>
                <div className="pp-boton-agregar-wrapper">
                  <button className="pp-btn-agregar" onClick={agregarCorte}>
                    +
                  </button>
                </div>
              </div>
              <div className="pp-cortes-tabla">
                <div className="pp-corte-encabezado">
                  <div>
                    <strong>TIPO</strong>
                  </div>
                  <div>
                    <strong>CANTIDAD</strong>
                  </div>
                  <div>
                    <strong>PESO BRUTO</strong>
                  </div>
                  <div>
                    <strong>TARA</strong>
                  </div>
                  <div>
                    <strong>PESO NETO</strong>
                  </div>
                  <div>
                    <strong>PROMEDIO</strong>
                  </div>
                  <div>
                    <strong>ACCIONES</strong>
                  </div>
                </div>
                {cortesAgregados.map((corte, index) => (
                  <div key={index} className="pp-corte-mostrado">
                    <div>{corte.tipo}</div>
                    <div>{corte.cantidad}</div>
                    <div>{corte.pesoBruto}</div>
                    <div>{corte.tara}</div>
                    <div>{(corte.pesoBruto - corte.tara).toFixed(2)}</div>
                    <div>{corte.promedio.toFixed(2)}</div>
                    <div>
                      <button className="pp-btn-eliminar" onClick={() => eliminarCorte(index)}>
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pp-total-peso">
                <strong>Total Peso Neto:</strong>{" "}
                {cortesAgregados.reduce((acc, item) => acc + (item.pesoBruto - item.tara), 0).toFixed(2)} kg
              </div>
              <button className="pp-btn-guardar" onClick={handleGuardar}>
                Guardar y terminar carga
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductionProcess;
