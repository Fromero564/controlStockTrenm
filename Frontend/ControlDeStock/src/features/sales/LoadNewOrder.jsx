import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import '../../assets/styles/loadNewOrder.css';

const API_URL = import.meta.env.VITE_API_URL;
const PRODUCTOS_URL = `${API_URL}/all-products-availables`;
const CLIENTES_URL = `${API_URL}/allclients`;
const VENDEDORES_URL = `${API_URL}/all-sellers`;
const ORDERS_URL = `${API_URL}/all-orders`;

// Endpoints backend (coinciden con tu API)
const ORDER_BY_ID_URL = (id) => `${API_URL}/get-order-by-id/${id}`;
const ORDER_LINES_URL = (id) => `${API_URL}/get-all-products-by-order/${id}`;
const UPDATE_URL = (id) => `${API_URL}/update-order/${id}`;

const LoadNewOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // si viene id, editamos
  const isEdit = Boolean(id);

  const [cortesOptions, setCortesOptions] = useState([]);
  const [productos, setProductos] = useState([
    { corte: null, precio: "", cantidad: "", tipoMedida: "", codigo: "" }
  ]);
  const [observaciones, setObservaciones] = useState("");

  const [clientesOptions, setClientesOptions] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [vendedoresOptions, setVendedoresOptions] = useState([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);

  const [nroComprobante, setNroComprobante] = useState("1");

  const [fecha, setFecha] = useState("");
  const [sellCondition, setSellCondition] = useState("CUENTA_CORRIENTE");
  const [paymentCondition, setPaymentCondition] = useState("7_DIAS_FECHA_FACT");

  // Listas de precio
  const [listasPrecio, setListasPrecio] = useState([]);
  const [listaPrecioOptions, setListaPrecioOptions] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [verTodasLasListas, setVerTodasLasListas] = useState(false);

  // Precios de productos por lista
  const [preciosListas, setPreciosListas] = useState([]);

  // Loading inicial / edición
  const [loading, setLoading] = useState(false);
  const [cargadoPedido, setCargadoPedido] = useState(false); // evita rehidratar varias veces

  // Helpers
  const toNumber = (v) => {
    const n = parseFloat(String(v ?? "").replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  // Autonumeración solo en modo creación
  useEffect(() => {
    if (isEdit) return; // en edición usamos el id real del pedido
    fetch(ORDERS_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const lastId = Math.max(...data.map(o => o.id));
          setNroComprobante((lastId + 1).toString());
        } else {
          setNroComprobante("1");
        }
      })
      .catch(() => setNroComprobante("1"));
  }, [isEdit]);

  // Catálogo de productos (cortes)
  useEffect(() => {
    fetch(PRODUCTOS_URL)
      .then((res) => res.json())
      .then((data) => {
        setCortesOptions(
          data.map((prod) => ({
            value: prod,
            label: prod.product_name
          }))
        );
      });
  }, []);

  // Clientes
  useEffect(() => {
    fetch(CLIENTES_URL)
      .then(res => res.json())
      .then(data => {
        setClientesOptions(
          data.map(cliente => ({
            value: cliente,
            label: cliente.client_name
          }))
        );
      });
  }, []);

  // Vendedores
  useEffect(() => {
    fetch(VENDEDORES_URL)
      .then(res => res.json())
      .then(data => {
        setVendedoresOptions(
          data.ok && data.sellers
            ? data.sellers.map(vend => ({
              value: vend,
              label: vend.name
            }))
            : []
        );
      });
  }, []);

  // Listas de precio
  useEffect(() => {
    fetch(`${API_URL}/all-price-list`)
      .then(res => res.json())
      .then(data => setListasPrecio(data));
  }, []);

  // Precios por lista
  useEffect(() => {
    fetch(`${API_URL}/all-info-price-list`)
      .then(res => res.json())
      .then(data => setPreciosListas(data));
  }, []);

  // Opciones del select de listas
  useEffect(() => {
    let opciones = [];
    if (verTodasLasListas) {
      opciones = listasPrecio.map(l => ({
        value: l,
        label: l.name
      }));
    } else if (clienteSeleccionado) {
      opciones = listasPrecio
        .filter(l => l.client_id === clienteSeleccionado.value.id)
        .map(l => ({
          value: l,
          label: l.name
        }));
    }
    setListaPrecioOptions(opciones);
    // En modo edición, si ya seteamos la lista desde el pedido no la borres
    if (!isEdit) setListaSeleccionada(null);
  }, [listasPrecio, clienteSeleccionado, verTodasLasListas, isEdit]);

  // Cambiar corte ⇒ setear código, tipo medida y precio (si hay lista)
  const handleCorteChange = (selectedOption, idx) => {
    let autoPrecio = "";

    if (selectedOption && listaSeleccionada) {
      const match = preciosListas.find(
        plp =>
          String(plp.price_list_number) === String(listaSeleccionada.value.list_number) &&
          String(plp.product_id) === String(selectedOption.value.id)
      );
      if (match) {
        autoPrecio = String(match.precio_con_iva ?? "");
      }
    }

    const updated = productos.map((item, i) => {
      if (i === idx) {
        return {
          ...item,
          corte: selectedOption,
          codigo: selectedOption ? selectedOption.value.id : "",
          tipoMedida:
            selectedOption && selectedOption.value.category?.category_name === "PRINCIPAL"
              ? "UN"
              : selectedOption
                ? "KG"
                : "",
          precio: autoPrecio || item.precio // respeta precio si ya había
        };
      }
      return item;
    });
    setProductos(updated);
  };

  const handleInputChange = (idx, field, value) => {
    const updated = productos.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setProductos(updated);
  };

  const handleAddProduct = () => {
    setProductos([
      ...productos,
      { corte: null, precio: "", cantidad: "", tipoMedida: "", codigo: "" }
    ]);
  };

  const handleRemoveProduct = (idx) => {
    setProductos(productos.filter((_, i) => i !== idx));
  };

  // Cargamos datos del pedido si estamos en edición cuando ya tengamos catálogos listos
  const catalogosListos = useMemo(() => {
    return (
      cortesOptions.length > 0 &&
      clientesOptions.length > 0 &&
      vendedoresOptions.length > 0 &&
      listasPrecio.length > 0
    );
  }, [cortesOptions, clientesOptions, vendedoresOptions, listasPrecio]);

  useEffect(() => {
    const cargarPedido = async () => {
      if (!isEdit || !catalogosListos || cargadoPedido) return;

      try {
        setLoading(true);

        // 1) Header
        let header;
        const r1 = await fetch(ORDER_BY_ID_URL(id));
        if (r1.status === 409) {
          // La API bloquea ver este header si ya fue generada; fallback a /all-orders
          const data409 = await r1.json().catch(() => ({}));
          const all = await fetch(ORDERS_URL).then(r => r.json()).catch(() => []);
          header = Array.isArray(all) ? all.find(o => String(o.id) === String(id)) : null;
          if (!header) {
            await Swal.fire("Error", data409?.msg || "La orden ya fue generada y no se puede editar.", "error");
            setLoading(false);
            return;
          }
        } else if (r1.ok) {
          header = await r1.json();
        } else {
          await Swal.fire("Error", "No se encontró la orden.", "error");
          setLoading(false);
          return;
        }

        // Seteos del header
        setNroComprobante(String(header.id ?? id));
        if (header.date_order) setFecha(String(header.date_order).slice(0, 10));

        const cliente = clientesOptions.find(c => c.label === header.client_name) || null;
        setClienteSeleccionado(cliente);

        const vendedor = vendedoresOptions.find(v => v.label === header.salesman_name) || null;
        setVendedorSeleccionado(vendedor);

        setVerTodasLasListas(true);
        const lista = listasPrecio.find(l => l.name === header.price_list) || null;
        setListaSeleccionada(lista ? { value: lista, label: lista.name } : null);

        setObservaciones(header.observation_order || "");

        // 2) Líneas
        const r2 = await fetch(ORDER_LINES_URL(id));
        const lines = r2.ok ? await r2.json() : [];

        const productosMap = (lines || []).map(p => {
          const corteOpt =
            cortesOptions.find(opt => String(opt.value.id) === String(p.product_cod)) ||
            cortesOptions.find(opt => opt.label === p.product_name) ||
            null;

          return {
            corte: corteOpt,
            precio: p.precio != null ? String(p.precio) : "",
            cantidad: p.cantidad != null ? String(p.cantidad) : "",
            tipoMedida:
              corteOpt && corteOpt.value?.category?.category_name === "PRINCIPAL" ? "UN" :
              corteOpt ? "KG" : (p.tipo_medida || ""),
            codigo: corteOpt ? corteOpt.value.id : (p.product_cod || "")
          };
        });

        setProductos(productosMap.length ? productosMap : [
          { corte: null, precio: "", cantidad: "", tipoMedida: "", codigo: "" }
        ]);

        setCargadoPedido(true);
      } catch (e) {
        await Swal.fire("Error", "No se pudo cargar el pedido para edición.", "error");
      } finally {
        setLoading(false);
      }
    };

    cargarPedido();
  }, [isEdit, id, catalogosListos, cargadoPedido, cortesOptions, clientesOptions, vendedoresOptions, listasPrecio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productosFiltrados = productos.filter(prod => prod.corte);

    if (!clienteSeleccionado || !vendedorSeleccionado) {
      Swal.fire("Faltan datos", "Debe seleccionar un cliente y un vendedor.", "warning");
      return;
    }
    if (!fecha) {
      Swal.fire("Faltan datos", "Debe ingresar la fecha.", "warning");
      return;
    }
    if (!listaSeleccionada) {
      Swal.fire("Faltan datos", "Debe seleccionar una lista de precios.", "warning");
      return;
    }
    if (productosFiltrados.length === 0) {
      Swal.fire("Faltan productos", "Debe agregar al menos un producto.", "warning");
      return;
    }

    // Normalizar precio/cantidad
    const productosNormalizados = productosFiltrados.map(p => ({
      ...p,
      precio: toNumber(p.precio),
      cantidad: toNumber(p.cantidad),
    }));

    // Validar 0
    const hayCero = productosNormalizados.some(
      p => p.precio === 0 || p.cantidad === 0
    );
    if (hayCero) {
      const { isConfirmed } = await Swal.fire({
        title: "Hay productos con precio o cantidad en $0",
        text: "¿Desea continuar de todos modos?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "No, cancelar"
      });
      if (!isConfirmed) return;
    }

    const body = {
      date_order: fecha,
      client_name: clienteSeleccionado.label,
      salesman_name: vendedorSeleccionado.label,
      price_list: listaSeleccionada ? listaSeleccionada.label : "",
      sell_condition: sellCondition,
      payment_condition: paymentCondition,
      observation_order: observaciones,
      products: productosNormalizados
    };

    try {
      let response, result;

      if (isEdit) {
        response = await fetch(UPDATE_URL(id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } else {
        response = await fetch(`${API_URL}/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      }

      result = await response.json();

      if (result.ok) {
        await Swal.fire(
          "¡Éxito!",
          isEdit ? "Pedido actualizado correctamente" : "Pedido creado correctamente",
          "success"
        );
        navigate(-1);
      } else {
        Swal.fire("Error", result.msg || (isEdit ? "Error al actualizar el pedido" : "Error al crear el pedido"), "error");
      }
    } catch (error) {
      Swal.fire("Error", isEdit ? "Error de red al actualizar el pedido" : "Error de red al crear el pedido", "error");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <div className="order-container">
        <h2 className="order-title">{isEdit ? "Editar Pedido" : "Nuevo Pedido"}</h2>

        {loading ? (
          <div style={{ padding: 20 }}>Cargando datos...</div>
        ) : (
          <form className="order-form" onSubmit={handleSubmit}>
            <div className="order-form-row">
              <div className="order-form-group">
                <label>N° COMPROBANTE {isEdit ? "" : "AUTOMÁTICO"}</label>
                <input type="text" className="order-input" value={nroComprobante} disabled />
              </div>
              <div className="order-form-group">
                <label>LISTA DE PRECIO</label>
                <Select
                  classNamePrefix="react-select"
                  className="order-input"
                  options={listaPrecioOptions}
                  value={listaSeleccionada}
                  onChange={setListaSeleccionada}
                  placeholder={
                    verTodasLasListas
                      ? "Seleccionar lista"
                      : clienteSeleccionado
                        ? "Seleccionar lista del cliente"
                        : "Elegí un cliente primero"
                  }
                  isDisabled={!verTodasLasListas && !clienteSeleccionado}
                  isClearable
                  noOptionsMessage={() =>
                    verTodasLasListas
                      ? "No hay listas registradas"
                      : clienteSeleccionado
                        ? "No hay listas asociadas a este cliente"
                        : "Seleccioná un cliente primero"
                  }
                />
                <div style={{ marginTop: 6, marginLeft: 3 }}>
                  <label style={{ fontWeight: 400, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={verTodasLasListas}
                      onChange={e => setVerTodasLasListas(e.target.checked)}
                      style={{ accentColor: "#1172B8" }}
                    />
                    Ver todas las listas de precios
                  </label>
                </div>
              </div>
            </div>

            <div className="order-form-row">
              <div className="order-form-group">
                <label>FECHA DE ENTREGA</label>
                <input
                  type="date"
                  className="order-input"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </div>
              <div className="order-form-group">
                <label>CONDICIÓN DE VENTA</label>
                <select
                  className="order-input"
                  value={sellCondition}
                  onChange={e => setSellCondition(e.target.value)}
                >
                  <option value="CUENTA_CORRIENTE">CUENTA CORRIENTE</option>
                  <option value="CONTADO">CONTADO</option>
                </select>
              </div>
            </div>

            <div className="order-form-row">
              <div className="order-form-group">
                <label>CLIENTE</label>
                <Select
                  classNamePrefix="react-select"
                  className="order-input"
                  options={clientesOptions}
                  value={clienteSeleccionado}
                  onChange={setClienteSeleccionado}
                  placeholder="Seleccionar cliente"
                  isClearable
                />
              </div>
              <div className="order-form-group">
                <label>CONDICIÓN DE COBRO</label>
                <select
                  className="order-input"
                  value={paymentCondition}
                  onChange={e => setPaymentCondition(e.target.value)}
                >
                  <option value="7_DIAS_FECHA_FACT">7 DÍAS FECHA FACT</option>
                  <option value="CONTADO">CONTADO</option>
                </select>
              </div>
            </div>

            <div className="order-form-row">
              <div className="order-form-group">
                <label>VENDEDOR</label>
                <Select
                  classNamePrefix="react-select"
                  className="order-input"
                  options={vendedoresOptions}
                  value={vendedorSeleccionado}
                  onChange={setVendedorSeleccionado}
                  placeholder="Seleccionar vendedor"
                  isClearable
                />
              </div>
              <div className="order-form-group"></div>
            </div>

            <div className="products-box">
              <div className="products-title">PRODUCTOS SOLICITADOS</div>
              <div className="products-grid-header">
                <div>CODIGO</div>
                <div>CORTE</div>
                <div>PRECIO</div>
                <div>CANTIDAD</div>
                <div>TIPO DE MEDIDA</div>
                <div></div>
              </div>

              {productos.map((prod, idx) => (
                <div className="products-grid-row" key={idx}>
                  <input
                    className="products-input"
                    type="text"
                    value={prod.codigo}
                    disabled
                  />
                  <Select
                    className="products-select"
                    options={cortesOptions}
                    value={prod.corte}
                    onChange={(selected) => handleCorteChange(selected, idx)}
                    placeholder="Seleccionar"
                    isClearable
                  />
                  <input
                    className="products-input"
                    type="text"
                    inputMode="decimal"
                    value={prod.precio}
                    onChange={(e) => {
                      const valor = e.target.value.replace(",", ".");
                      handleInputChange(idx, "precio", valor);
                    }}
                    placeholder="$"
                  />
                  <input
                    className="products-input"
                    type="text"
                    inputMode="decimal"
                    value={prod.cantidad}
                    onChange={(e) => {
                      const valor = e.target.value.replace(",", ".");
                      handleInputChange(idx, "cantidad", valor);
                    }}
                  />
                  <input
                    className="products-input"
                    type="text"
                    value={prod.tipoMedida}
                    disabled
                  />
                  <button
                    className="remove-btn"
                    type="button"
                    onClick={() => handleRemoveProduct(idx)}
                    style={{
                      visibility: productos.length > 1 ? "visible" : "hidden"
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="add-product-btn"
                type="button"
                onClick={handleAddProduct}
              >
                +
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <label>COMENTARIOS</label>
              <textarea
                className="order-input"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Comentarios"
                rows={3}
              />
            </div>

            <div className="order-form-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                {isEdit ? "Guardar Cambios" : "Guardar Pedido"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoadNewOrder;
