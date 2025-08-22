import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/loadNewOrder.css";

const API_URL = import.meta.env.VITE_API_URL;
const PRODUCTOS_URL = `${API_URL}/all-products-availables`;
const CLIENTES_URL = `${API_URL}/allclients`;
const VENDEDORES_URL = `${API_URL}/all-sellers`;
const ORDERS_URL = `${API_URL}/all-orders`;

const ORDER_BY_ID_URL = (id) => `${API_URL}/get-order-by-id/${id}`;
const ORDER_LINES_URL = (id) => `${API_URL}/get-all-products-by-order/${id}`;
const UPDATE_URL = (id) => `${API_URL}/update-order/${id}`;

// catálogos necesarios
const PAYMENT_CONDITIONS_URL = `${API_URL}/payment-conditions`;
const SALE_CONDITIONS_URL = `${API_URL}/sale-conditions`;

const LoadNewOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [cortesOptions, setCortesOptions] = useState([]);
  const [productos, setProductos] = useState([
    { corte: null, precio: "", cantidad: "", tipoMedida: "", codigo: "" },
  ]);

  const [observaciones, setObservaciones] = useState("");
  const [clientesOptions, setClientesOptions] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [vendedoresOptions, setVendedoresOptions] = useState([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);

  const [nroComprobante, setNroComprobante] = useState("1");
  const [fecha, setFecha] = useState("");

  // condición de venta (fetch + preselección)
  const [saleConditionOptions, setSaleConditionOptions] = useState([]);
  const [saleCondition, setSaleCondition] = useState(null);

  // condición de cobro/pago (fetch + preselección)
  const [paymentConditionOptions, setPaymentConditionOptions] = useState([]);
  const [paymentCondition, setPaymentCondition] = useState(null);

  // Listas de precio
  const [listasPrecio, setListasPrecio] = useState([]);
  const [listaPrecioOptions, setListaPrecioOptions] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [verTodasLasListas, setVerTodasLasListas] = useState(false);

  // Precios de productos por lista
  const [preciosListas, setPreciosListas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [cargadoPedido, setCargadoPedido] = useState(false);

  const toNumber = (v) => {
    const n = parseFloat(String(v ?? "").replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  // autonumeración
  useEffect(() => {
    if (isEdit) return;
    fetch(ORDERS_URL)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const lastId = Math.max(...data.map((o) => o.id));
          setNroComprobante(String(lastId + 1));
        } else setNroComprobante("1");
      })
      .catch(() => setNroComprobante("1"));
  }, [isEdit]);

  // productos
  useEffect(() => {
    fetch(PRODUCTOS_URL)
      .then((r) => r.json())
      .then((data) =>
        setCortesOptions(data.map((p) => ({ value: p, label: p.product_name })))
      );
  }, []);

  // clientes activos
  useEffect(() => {
    fetch(CLIENTES_URL)
      .then((r) => r.json())
      .then((data) => {
        const activos = (Array.isArray(data) ? data : []).filter(
          (c) => c?.client_state === true
        );
        setClientesOptions(
          activos.map((c) => ({ value: c, label: c.client_name }))
        );
      });
  }, []);

  // vendedores
  useEffect(() => {
    fetch(VENDEDORES_URL)
      .then((r) => r.json())
      .then((data) =>
        setVendedoresOptions(
          data.ok && data.sellers
            ? data.sellers.map((v) => ({ value: v, label: v.name }))
            : []
        )
      );
  }, []);

  // catálogos: condiciones
  useEffect(() => {
    fetch(PAYMENT_CONDITIONS_URL)
      .then((r) => r.json())
      .then((list) => {
        const arr = Array.isArray(list) ? list : list.paymentConditions || [];
        setPaymentConditionOptions(
          arr.map((c) => ({
            value: c.payment_condition,
            label: c.payment_condition,
          }))
        );
      });
  }, []);

  useEffect(() => {
    fetch(SALE_CONDITIONS_URL)
      .then((r) => r.json())
      .then((list) => {
        const arr = Array.isArray(list) ? list : list.conditions || [];
        setSaleConditionOptions(
          arr.map((s) => ({ value: s.condition_name, label: s.condition_name }))
        );
      });
  }, []);

  // listas precio + info
  useEffect(() => {
    fetch(`${API_URL}/all-price-list`).then((r) =>
      r.json().then(setListasPrecio)
    );
  }, []);
  useEffect(() => {
    fetch(`${API_URL}/all-info-price-list`).then((r) =>
      r.json().then(setPreciosListas)
    );
  }, []);

  // opciones lista según cliente o "todas"
  useEffect(() => {
    let opts = [];
    if (verTodasLasListas) {
      opts = listasPrecio.map((l) => ({ value: l, label: l.name }));
    } else if (clienteSeleccionado) {
      opts = listasPrecio
        .filter((l) => l.client_id === clienteSeleccionado.value.id)
        .map((l) => ({ value: l, label: l.name }));
    }
    setListaPrecioOptions(opts);
    if (!isEdit) setListaSeleccionada(null);
  }, [listasPrecio, clienteSeleccionado, verTodasLasListas, isEdit]);

  // al elegir cliente → preseleccionar condiciones si las tiene
  useEffect(() => {
    if (!clienteSeleccionado) {
      setSaleCondition(null);
      setPaymentCondition(null);
      return;
    }
    const cli = clienteSeleccionado.value;

    if (cli?.client_sale_condition && saleConditionOptions.length) {
      const match = saleConditionOptions.find(
        (o) => o.label === cli.client_sale_condition
      );
      setSaleCondition(match || null);
    }
    if (cli?.client_payment_condition && paymentConditionOptions.length) {
      const match = paymentConditionOptions.find(
        (o) => o.label === cli.client_payment_condition
      );
      setPaymentCondition(match || null);
    }
  }, [clienteSeleccionado, saleConditionOptions, paymentConditionOptions]);

  // cambios de corte
  const handleCorteChange = (selected, idx) => {
    let autoPrecio = "";
    if (selected && listaSeleccionada) {
      const match = preciosListas.find(
        (plp) =>
          String(plp.price_list_number) ===
            String(listaSeleccionada.value.list_number) &&
          String(plp.product_id) === String(selected.value.id)
      );
      if (match) autoPrecio = String(match.precio_con_iva ?? "");
    }
    setProductos((prev) =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              corte: selected,
              codigo: selected ? selected.value.id : "",
              tipoMedida:
                selected &&
                selected.value.category?.category_name === "PRINCIPAL"
                  ? "UN"
                  : selected
                  ? "KG"
                  : "",
              precio: autoPrecio || it.precio,
            }
          : it
      )
    );
  };

  const handleInputChange = (idx, field, value) => {
    setProductos((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };
  const handleAddProduct = () =>
    setProductos((p) => [
      ...p,
      { corte: null, precio: "", cantidad: "", tipoMedida: "", codigo: "" },
    ]);
  const handleRemoveProduct = (idx) =>
    setProductos((p) => p.filter((_, i) => i !== idx));

  // cargar pedido en edición
  const catalogosListos = useMemo(
    () =>
      cortesOptions.length &&
      clientesOptions.length &&
      vendedoresOptions.length &&
      listasPrecio.length &&
      saleConditionOptions.length &&
      paymentConditionOptions.length,
    [
      cortesOptions,
      clientesOptions,
      vendedoresOptions,
      listasPrecio,
      saleConditionOptions,
      paymentConditionOptions,
    ]
  );

  useEffect(() => {
    const cargar = async () => {
      if (!isEdit || !catalogosListos || cargadoPedido) return;
      try {
        setLoading(true);

        // header
        const r = await fetch(ORDER_BY_ID_URL(id));
        if (!r.ok) {
          Swal.fire("Error", "No se encontró la orden.", "error");
          setLoading(false);
          return;
        }
        const header = await r.json();

        setNroComprobante(String(header.id ?? id));
        if (header.date_order) setFecha(String(header.date_order).slice(0, 10));

        const cli =
          clientesOptions.find((c) => c.label === header.client_name) || null;
        setClienteSeleccionado(cli);

        const vend =
          vendedoresOptions.find((v) => v.label === header.salesman_name) ||
          null;
        setVendedorSeleccionado(vend);

        setVerTodasLasListas(true);
        const lp = listasPrecio.find((l) => l.name === header.price_list);
        setListaSeleccionada(lp ? { value: lp, label: lp.name } : null);

        setObservaciones(header.observation_order || "");

        // preselecciones desde el pedido
        const sc = saleConditionOptions.find(
          (o) => o.label === header.sell_condition
        );
        setSaleCondition(sc || null);

        const pc = paymentConditionOptions.find(
          (o) => o.label === header.payment_condition
        );
        setPaymentCondition(pc || null);

        // líneas
        const r2 = await fetch(ORDER_LINES_URL(id));
        const lines = r2.ok ? await r2.json() : [];
        const map = (lines || []).map((p) => {
          const corteOpt =
            cortesOptions.find(
              (opt) => String(opt.value.id) === String(p.product_cod)
            ) ||
            cortesOptions.find((opt) => opt.label === p.product_name) ||
            null;

          return {
            corte: corteOpt,
            precio: p.precio != null ? String(p.precio) : "",
            cantidad: p.cantidad != null ? String(p.cantidad) : "",
            tipoMedida:
              corteOpt &&
              corteOpt.value?.category?.category_name === "PRINCIPAL"
                ? "UN"
                : corteOpt
                ? "KG"
                : p.tipo_medida || "",
            codigo: corteOpt ? corteOpt.value.id : p.product_cod || "",
          };
        });
        setProductos(map.length ? map : productos);
        setCargadoPedido(true);
      } catch {
        Swal.fire("Error", "No se pudo cargar el pedido.", "error");
      } finally {
        setLoading(false);
      }
    };
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, catalogosListos, cargadoPedido]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productosFiltrados = productos.filter((p) => p.corte);

    if (!clienteSeleccionado || !vendedorSeleccionado) {
      Swal.fire("Faltan datos", "Elegí cliente y vendedor.", "warning");
      return;
    }
    if (!fecha) {
      Swal.fire("Faltan datos", "Ingresá la fecha.", "warning");
      return;
    }
    if (!listaSeleccionada) {
      Swal.fire("Faltan datos", "Seleccioná una lista de precios.", "warning");
      return;
    }
    if (!saleCondition) {
      Swal.fire("Faltan datos", "Seleccioná la condición de venta.", "warning");
      return;
    }
    if (!paymentCondition) {
      Swal.fire("Faltan datos", "Seleccioná la condición de cobro.", "warning");
      return;
    }
    if (productosFiltrados.length === 0) {
      Swal.fire("Faltan productos", "Agregá al menos un producto.", "warning");
      return;
    }

    const productosNormalizados = productosFiltrados.map((p) => ({
      ...p,
      precio: toNumber(p.precio),
      cantidad: toNumber(p.cantidad),
    }));

    const hayCero = productosNormalizados.some(
      (p) => p.precio === 0 || p.cantidad === 0
    );
    if (hayCero) {
      const { isConfirmed } = await Swal.fire({
        title: "Hay productos con precio o cantidad en $0",
        text: "¿Deseás continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No",
      });
      if (!isConfirmed) return;
    }

    const body = {
      date_order: fecha,
      client_name: clienteSeleccionado.label,
      salesman_name: vendedorSeleccionado.label,
      price_list: listaSeleccionada ? listaSeleccionada.label : "",
      sell_condition: saleCondition?.label || "",
      payment_condition: paymentCondition?.label || "",
      observation_order: observaciones,
      products: productosNormalizados,
    };

    try {
      const res = await fetch(isEdit ? UPDATE_URL(id) : `${API_URL}/create-order`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.ok) {
        await Swal.fire(
          "¡Éxito!",
          isEdit ? "Pedido actualizado" : "Pedido creado",
          "success"
        );
        navigate(-1);
      } else {
        Swal.fire(
          "Error",
          result.msg || (isEdit ? "No se pudo actualizar" : "No se pudo crear"),
          "error"
        );
      }
    } catch {
      Swal.fire(
        "Error",
        isEdit ? "Error de red al actualizar" : "Error de red al crear",
        "error"
      );
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
                <label>N° COMPROBANTE AUTOMÁTICO</label>
                <input type="text" className="order-input" value={nroComprobante} disabled />
              </div>

              <div className="order-form-group">
                <label>LISTA DE PRECIO</label>
                <Select
                  className="order-rs"
                  classNamePrefix="rs"
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
                />
                <div style={{ marginTop: 6, marginLeft: 3 }}>
                  <label style={{ fontWeight: 400, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={verTodasLasListas}
                      onChange={(e) => setVerTodasLasListas(e.target.checked)}
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
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>

              <div className="order-form-group">
                <label>CONDICIÓN DE VENTA</label>
                <Select
                  className="order-rs"
                  classNamePrefix="rs"
                  options={saleConditionOptions}
                  value={saleCondition}
                  onChange={setSaleCondition}
                  placeholder="Seleccionar condición de venta"
                  isClearable
                />
              </div>
            </div>

            <div className="order-form-row">
              <div className="order-form-group">
                <label>CLIENTE</label>
                <Select
                  className="order-rs"
                  classNamePrefix="rs"
                  options={clientesOptions}
                  value={clienteSeleccionado}
                  onChange={setClienteSeleccionado}
                  placeholder="Seleccionar cliente"
                  isClearable
                />
              </div>

              <div className="order-form-group">
                <label>CONDICIÓN DE COBRO</label>
                <Select
                  className="order-rs"
                  classNamePrefix="rs"
                  options={paymentConditionOptions}
                  value={paymentCondition}
                  onChange={setPaymentCondition}
                  placeholder="Seleccionar condición de cobro"
                  isClearable
                />
              </div>
            </div>

            <div className="order-form-row">
              <div className="order-form-group">
                <label>VENDEDOR</label>
                <Select
                  className="order-rs"
                  classNamePrefix="rs"
                  options={vendedoresOptions}
                  value={vendedorSeleccionado}
                  onChange={setVendedorSeleccionado}
                  placeholder="Seleccionar vendedor"
                  isClearable
                />
              </div>
              <div className="order-form-group" />{/* columna vacía para mantener la grilla */}
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
                  <input className="products-input" type="text" value={prod.codigo} disabled />
                  <Select
                    className="products-rs"
                    classNamePrefix="rs"
                    options={cortesOptions}
                    value={prod.corte}
                    onChange={(sel) => handleCorteChange(sel, idx)}
                    placeholder="Seleccionar"
                    isClearable
                  />
                  <input
                    className="products-input"
                    type="text"
                    inputMode="decimal"
                    value={prod.precio}
                    onChange={(e) =>
                      handleInputChange(idx, "precio", e.target.value.replace(",", "."))
                    }
                    placeholder="$"
                  />
                  <input
                    className="products-input"
                    type="text"
                    inputMode="decimal"
                    value={prod.cantidad}
                    onChange={(e) =>
                      handleInputChange(idx, "cantidad", e.target.value.replace(",", "."))
                    }
                  />
                  <input className="products-input" type="text" value={prod.tipoMedida} disabled />
                  <div className="row-actions">
                    {idx === productos.length - 1 && (
                      <button className="add-inline-btn" type="button" onClick={handleAddProduct} title="Agregar fila">
                        +
                      </button>
                    )}
                    <button
                      className="remove-btn"
                      type="button"
                      onClick={() => handleRemoveProduct(idx)}
                      style={{ visibility: productos.length > 1 ? "visible" : "hidden" }}
                      title="Eliminar fila"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
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
              <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
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
