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

  const [despostarTipo, setDespostarTipo] = useState("");
  const [despostarCantidad, setDespostarCantidad] = useState("");
  const [piezasDespostar, setPiezasDespostar] = useState([]);

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
  }, []);

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
  }, []);

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

  const agregarCorte = () => {
    if (!formData.tipo || formData.cantidad === "" || formData.pesoBruto === "" || formData.tara === "") {
      Swal.fire("Atención", "Complete todos los campos antes de agregar.", "warning");
      return;
    }

    const pesoNeto = +(formData.pesoBruto - formData.tara).toFixed(2);
    const promedio = formData.cantidad > 0 ? +(pesoNeto / formData.cantidad).toFixed(2) : 0;

    const nuevoCorte = {
      ...formData,
      pesoNeto,
      promedio,
    };

    setCortesAgregados([...cortesAgregados, nuevoCorte]);

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

  const agregarPiezaDespostar = async () => {
    if (!despostarTipo || despostarCantidad === "" || despostarCantidad <= 0) {
      Swal.fire("Error", "Complete el tipo y cantidad válidos para agregar.", "warning");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/all-products-stock`);
      const data = await response.json();
      const producto = data.find((p) => p.product_name === despostarTipo);

      if (!producto) {
        Swal.fire("Error", `El producto "${despostarTipo}" no se encuentra en stock.`, "error");
        return;
      }

      if (producto.product_quantity < parseInt(despostarCantidad)) {
        Swal.fire(
          "Stock insuficiente",
          `Solo hay ${producto.product_quantity} unidades de "${despostarTipo}".`,
          "error"
        );
        return;
      }

      const nuevaPieza = {
        tipo: despostarTipo,
        cantidad: parseInt(despostarCantidad, 10),
      };

      setPiezasDespostar([...piezasDespostar, nuevaPieza]);
      setDespostarTipo("");
      setDespostarCantidad("");
    } catch (error) {
      console.error("Error al verificar stock:", error);
      Swal.fire("Error", "No se pudo verificar el stock.", "error");
    }
  };

  const eliminarPiezaDespostar = (index) => {
    setPiezasDespostar(piezasDespostar.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    if (cortesAgregados.length === 0 && piezasDespostar.length === 0) {
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

        if (
          !type ||
          isNaN(quantity) || quantity <= 0 ||
          isNaN(gross_weight) || gross_weight <= 0 ||
          isNaN(tares) || tares < 0 ||
          isNaN(net_weight) || net_weight <= 0 ||
          isNaN(average) || average <= 0
        ) {
          throw new Error(`Datos inválidos en el corte: ${type || "sin tipo"}`);
        }

        const payload = { type, quantity, gross_weight, tares, net_weight, average };

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

      // Descontar stock
      for (const pieza of piezasDespostar) {
        const res = await fetch(`${API_URL}/update-product-stock`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_name: pieza.tipo,
            subtract_quantity: pieza.cantidad,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Error al descontar stock: ${errorData.message}`);
        }
      }

      Swal.fire("Éxito", "Cortes guardados y stock actualizado correctamente.", "success");
      setCortesAgregados([]);
      setPiezasDespostar([]);
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
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <div className="pp-main-container">
        <section className="pp-despostar-section">
          <h2>Piezas a Despostar</h2>
          <div className="pp-form-group">
            <div>
              <label>TIPO</label>
              <select value={despostarTipo} onChange={(e) => setDespostarTipo(e.target.value)}>
                <option value="">Seleccionar</option>
                {cortes
                  .filter((corte) => corte.categoria === "DESPOSTE")
                  .map((corte) => (
                    <option key={corte.id} value={corte.nombre}>
                      {corte.nombre}
                    </option>
                  ))}

              </select>
            </div>
            <div>
              <label>CANTIDAD</label>
              <input
                type="number"
                min="1"
                value={despostarCantidad}
                onChange={(e) => setDespostarCantidad(e.target.value)}
              />
            </div>
            <div className="pp-boton-agregar-wrapper">
              <button type="button" className="pp-btn-agregar" onClick={agregarPiezaDespostar}>
                +
              </button>
            </div>
          </div>

          <div className="pp-piezas-despostar-lista">
            {piezasDespostar.length === 0 && <p>No hay piezas agregadas.</p>}
            {piezasDespostar.map((pieza, index) => (
              <div key={index} className="pp-pieza-despostar-item">
                <div>
                  <strong>{pieza.tipo}</strong> — {pieza.cantidad} unidades
                </div>
                <button type="button" className="pp-btn-eliminar" onClick={() => eliminarPiezaDespostar(index)}>
                  X
                </button>
              </div>
            ))}
          </div>
        </section>

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
