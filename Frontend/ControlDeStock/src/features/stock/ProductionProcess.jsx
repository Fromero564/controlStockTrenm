import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/productionprocess.css";

const ProductionProcess = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [cortes, setCortes] = useState([]);
  const [tares, setTares] = useState([]);
  const [cortesAgregados, setCortesAgregados] = useState([]);
  const [taraSeleccionadaId, setTaraSeleccionadaId] = useState("");
  const [formData, setFormData] = useState({
    tipo: "",
    promedio: 0,
    cantidad: 0,
    pesoBruto: 0,
    tara: 0,
    pesoNeto: 0,
  });

  const [subproductosEsperados, setSubproductosEsperados] = useState([]);
  const [cargandoSubproductos, setCargandoSubproductos] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState("");
  const [detallesComprobante, setDetallesComprobante] = useState([]);

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

const handleBuscarComprobante = async () => {
  if (!comprobanteSeleccionado) {
    Swal.fire("Atención", "Ingrese un ID de comprobante válido.", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/bill-details/${comprobanteSeleccionado}`);
    const data = await response.json();

   
    if (data?.message) {
      await Swal.fire("Atención", data.message, "info");
      window.location.reload(); // 🔁 Recargar la página
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      await Swal.fire("Error", "No se encontró ningún detalle para ese comprobante.", "error");
      window.location.reload(); 
      return;
    }

    setDetallesComprobante(data);

    setCargandoSubproductos(true);
    const subproductosTodos = [];

    for (const detalle of data) {
      const subproductos = await fetchSubproductos(detalle.type, detalle.quantity);
      subproductosTodos.push(...subproductos);
    }

    setSubproductosEsperados(subproductosTodos);
  } catch (error) {
    console.error("Error al obtener detalles del comprobante:", error);
    await Swal.fire("Error", "No se pudo obtener el comprobante.", "error");
    window.location.reload(); // 🔁 En caso de error técnico también
  } finally {
    setCargandoSubproductos(false);
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

  const agregarCorte = async () => {
    if (!formData.tipo || formData.cantidad === "" || formData.pesoBruto === "" || formData.tara === 0) {
      Swal.fire("Atención", "Complete todos los campos antes de agregar.", "warning");
      return;
    }

    const tipoActual = formData.tipo.trim();
    const cantidadAgregar = Number(formData.cantidad);

    const subEsperado = subproductosEsperados.find((s) => s.nombre.trim() === tipoActual);
    const detalleRemito = detallesComprobante.find((d) => d.type.trim() === tipoActual);

    let cantidadPermitida = 0;
    if (subEsperado) {
      cantidadPermitida = Number(subEsperado.cantidadTotal);
    } else if (detalleRemito) {
      cantidadPermitida = Number(detalleRemito.quantity);
    } else {
      Swal.fire("Error", `El corte "${tipoActual}" no está en los subproductos esperados ni en el remito.`, "error");
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

  const handleGuardar = async () => {
    if (cortesAgregados.length === 0) {
      Swal.fire("Aviso", "No hay datos para guardar.", "info");
      return;
    }

    try {
      for (const corte of cortesAgregados) {
        const type = corte.tipo?.trim();
        const quantity = Number(corte.cantidad);
        const gross_weight = Number(corte.pesoBruto);
        const tares = Number(corte.tara);
        const net_weight = Number((gross_weight - tares).toFixed(2));
        const average = Number((net_weight / quantity).toFixed(2));

        if (!type || quantity <= 0 || gross_weight <= 0 || tares < 0 || net_weight <= 0 || average <= 0) {
          throw new Error(`Datos inválidos en el corte: ${type || "sin tipo"}`);
        }

        const payload = { type, quantity, gross_weight, tares, net_weight, average,bill_id: comprobanteSeleccionado };

        const response = await fetch(`${API_URL}/uploadProcessMeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al guardar corte.");
        }
      }

      Swal.fire("Éxito", "Cortes guardados correctamente.", "success");
      setCortesAgregados([]);
      navigate("/operator-panel");
    } catch (err) {
      console.error("Error al guardar:", err);
      Swal.fire("Error", err.message || "Ocurrió un error al guardar.", "error");
    }
  };
  return (
    <>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>
      <div className="pp-main-container">

        <section className="pp-despostar-section">
          <h2>Buscar Comprobante</h2>
          <div className="pp-form-group">
            <div>
              <label>N° Comprobante</label>
              <input
                type="text"
                value={comprobanteSeleccionado}
                onChange={(e) => setComprobanteSeleccionado(e.target.value)}
                placeholder="Ingrese ID"
              />
            </div>
            <div className="pp-boton-agregar-wrapper">
              <button type="button" className="pp-btn-agregar" onClick={handleBuscarComprobante}>
                Buscar
              </button>
            </div>
          </div>
          <div className="pp-piezas-despostar-lista">
            {detallesComprobante.length === 0 && <p>No hay cortes para este comprobante.</p>}
            {detallesComprobante.map((detalle) => (
              <div key={detalle.id} className="pp-pieza-despostar-item">
                <strong>{detalle.type}</strong> — {detalle.quantity} unidades
              </div>
            ))}
          </div>
        </section>

        <section className="subproductos-section">
          <h3>Subproductos Esperados</h3>
          {cargandoSubproductos && <p style={{ color: "blue" }}>Cargando subproductos...</p>}
          {subproductosEsperados.length === 0 ? (
            <p>No hay subproductos esperados.</p>
          ) : (
            <ul className="subproductos-list">
              {subproductosEsperados.map((sub, idx) => (
                <li key={idx}>
                  <span className="subproducto-label">{sub.nombre} — {sub.cantidadTotal} unidades</span>
                  <span className="subproducto-meta">
                    de {sub.productoOrigen}, {sub.cantidadPorUnidad} x unidad
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>


        {/* Sección Formulario */}
        <section className="pp-cortes-section">
          <h1>Proceso Productivo</h1>
          <div className="pp-content-wrapper">
            <div className="pp-formulario-corte">
              <div className="pp-form-group">
                <div>
                  <label>TIPO</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                    <option value="">Seleccionar</option>
                    {cortes.map((corte) => (
                      <option key={corte.id} value={corte.nombre}>
                        {corte.nombre}
                      </option>
                    ))}
                  </select>
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
                  <button className="pp-btn-agregar" onClick={agregarCorte}>+</button>
                </div>
              </div>

              <div className="pp-cortes-tabla">
                <div className="pp-corte-encabezado">
                  <div><strong>TIPO</strong></div>
                  <div><strong>CANTIDAD</strong></div>
                  <div><strong>PESO BRUTO</strong></div>
                  <div><strong>TARA</strong></div>
                  <div><strong>PESO NETO</strong></div>
                  <div><strong>PROMEDIO</strong></div>
                  <div><strong>ACCIONES</strong></div>
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
                      <button className="pp-btn-eliminar" onClick={() => eliminarCorte(index)}>X</button>
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
