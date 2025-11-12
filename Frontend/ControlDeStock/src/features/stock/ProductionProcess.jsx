import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ← agregado: usamos processNumber o id
import Select from "react-select";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/productionprocess.css";

const LS_KEYS = {
  CORTES: "cortesAgregados",
  SIN_REMITO: "productosSinRemito",
  COMPROBANTES: "comprobantesAgregados",
};

const safeParse = (str, fallback) => {
  try {
    const val = JSON.parse(str);
    if (Array.isArray(val)) return val;
    return fallback;
  } catch {
    return fallback;
  }
};

const ProductionProcess = () => {
  const navigate = useNavigate();
  const { processNumber, id } = useParams();             // ← leemos ambos
  const processParam = processNumber ?? id;               // ← unificamos
  const isEdit = !!processParam;                          // ← modo edición si viene param
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

  const [subproductosEsperados, setSubproductosEsperados] = useState([]);
  const [cargandoSubproductos, setCargandoSubproductos] = useState(false);

  const [mostrarSinRemito, setMostrarSinRemito] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productoSinRemito, setProductoSinRemito] = useState(null);
  const [cantidadSinRemito, setCantidadSinRemito] = useState("");
  const [productosSinRemito, setProductosSinRemito] = useState([]);

  const [cortesAgregados, setCortesAgregados] = useState([]);

  // ---------- PERSISTENCIA: Cargar desde localStorage al montar ----------
  useEffect(() => {
    if (isEdit) return; // en edición, no pisamos con LS
    const cortesGuardados = safeParse(localStorage.getItem(LS_KEYS.CORTES), []);
    const productosGuardados = safeParse(localStorage.getItem(LS_KEYS.SIN_REMITO), []);
    const comprobantesGuardados = safeParse(localStorage.getItem(LS_KEYS.COMPROBANTES), []);
    if (cortesGuardados.length) setCortesAgregados(cortesGuardados);
    if (productosGuardados.length) setProductosSinRemito(productosGuardados);
    if (comprobantesGuardados.length) setComprobantesAgregados(comprobantesGuardados);
  }, [isEdit]);

  // ---------- PERSISTENCIA: Guardar en localStorage cuando cambian ----------
  useEffect(() => {
    if (isEdit) return;
    localStorage.setItem(LS_KEYS.CORTES, JSON.stringify(cortesAgregados));
  }, [cortesAgregados, isEdit]);

  useEffect(() => {
    if (isEdit) return;
    localStorage.setItem(LS_KEYS.SIN_REMITO, JSON.stringify(productosSinRemito));
  }, [productosSinRemito, isEdit]);

  useEffect(() => {
    if (isEdit) return;
    localStorage.setItem(LS_KEYS.COMPROBANTES, JSON.stringify(comprobantesAgregados));
  }, [comprobantesAgregados, isEdit]);

  // Seguridad
  useEffect(() => {
    if (!Array.isArray(productosSinRemito)) setProductosSinRemito([]);
  }, []);

  // Productos disponibles (para selects)
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
      } catch { }
    };
    fetchProductos();
  }, [API_URL]);

  // Taras
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
      } catch { }
    };
    fetchTares();
  }, [API_URL]);

  // Comprobantes disponibles (sin proceso) con piezas agrupadas
  useEffect(() => {
    const fetchComprobantesSinProcesoConTipo = async () => {
      try {
        const res = await fetch(`${API_URL}/allproducts`);
        const data = await res.json();
        const sinProceso = data.filter((p) => !p.production_process);
        const sinProcesoConTipo = await Promise.all(
          sinProceso.map(async (comp) => {
            try {
              const resDetalle = await fetch(`${API_URL}/bill-details-readonly/${comp.id}`);
              const detalleData = await resDetalle.json();
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
      } catch { }
    };
    fetchComprobantesSinProcesoConTipo();
  }, [API_URL]);

  const labelUnidad = (u) => {
    if (!u) return "unid.";
    const v = String(u).toLowerCase();
    if (["unidad", "unid", "u", "u."].includes(v)) return "unid.";
    return v;
  };

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
        unit: sub.unit || "unidad",
      }));
    } catch {
      return [];
    }
  };

  // ---------- PRECARGA PARA EDICIÓN ----------
  useEffect(() => {
    if (!isEdit) return;
    const precargar = async () => {
      try {
        // Cortes guardados para el processParam
        const resProc = await fetch(`${API_URL}/all-process-products`);
        const all = await resProc.json();
        const rows = (Array.isArray(all) ? all : []).filter(
          (r) => String(r.process_number) === String(processParam)
        );
        const mapeados = rows.map((r) => ({
          tipo: r.type || "",
          promedio: Number(r.average || 0),
          cantidad: Number(r.quantity || 0),
          pesoBruto: Number(r.gross_weight || 0),
          tara: Number(r.tares || 0),
          pesoNeto: Number(r.net_weight || Number(r.gross_weight || 0) - Number(r.tares || 0)),
        }));
        setCortesAgregados(mapeados);

        // Subproducción del proceso
        try {
          const resSub = await fetch(
            `${API_URL}/productionprocess-subproduction?process_number=${processParam}`
          );
          if (resSub.ok) {
            const subRows = await resSub.json();
            const mapped = (Array.isArray(subRows) ? subRows : []).map((s) => ({
              producto: s.cut_name,
              cantidad: Number(s.quantity || 0),
              subproductos: [],
            }));
            setProductosSinRemito(mapped);
          }
        } catch { }

        // Bills asociados al proceso → para volver a mostrar sus piezas
        try {
          const resPN = await fetch(`${API_URL}/all-process-number`);
          const list = await resPN.json();
          const billIds = (Array.isArray(list) ? list : [])
            .filter((x) => String(x.process_number) === String(processParam))
            .map((x) => x.bill_id);

          const agregados = await Promise.all(
            billIds.map(async (bid) => {
              try {
                const d = await fetch(`${API_URL}/bill-details/${bid}`);
                const detalles = await d.json();
                const resInfo = await fetch(`${API_URL}/allproducts`);
                const allProd = await resInfo.json();
                const remito = allProd.find((p) => p.id === Number(bid));
                let subs = [];
                for (const det of detalles) {
                  const sps = await fetchSubproductos(det.type, det.quantity);
                  subs = subs.concat(sps);
                }
                return { id: bid, remito, detalles, subproductos: subs };
              } catch {
                return { id: bid, remito: null, detalles: [], subproductos: [] };
              }
            })
          );
          setComprobantesAgregados(agregados);
        } catch { }
      } catch (e) {
        console.error("Precarga edición error:", e);
        Swal.fire("Error", "No se pudo cargar el proceso para edición.", "error");
      }
    };
    precargar();
  }, [isEdit, processParam, API_URL]);

  const handleAgregarComprobante = async (idSel) => {
    if (!idSel) {
      Swal.fire("Atención", "Debe ingresar un ID o seleccionar un comprobante.", "warning");
      return;
    }
    if (comprobantesAgregados.some((c) => c.id === idSel)) {
      Swal.fire("Atención", "Este comprobante ya fue agregado.", "warning");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/bill-details/${idSel}`);
      const detalles = await response.json();
      if (!detalles || detalles.length === 0) {
        Swal.fire("Error", "No se encontró detalle para ese comprobante.", "error");
        return;
      }
      const resInfo = await fetch(`${API_URL}/allproducts`);
      const allProducts = await resInfo.json();
      const remito = allProducts.find((p) => p.id === Number(idSel));
      let subproductosTotales = [];
      for (const detalle of detalles) {
        const subs = await fetchSubproductos(detalle.type, detalle.quantity);
        subproductosTotales = subproductosTotales.concat(subs);
      }
      setComprobantesAgregados((prev) => [
        ...prev,
        { id: idSel, remito, detalles, subproductos: subproductosTotales },
      ]);
      setComprobanteSeleccionado("");
      setSubproductosEsperados([]);
    } catch {
      Swal.fire("Error", "No se pudo agregar el comprobante.", "error");
    }
  };

  const eliminarComprobante = (idDel) => {
    setComprobantesAgregados((prev) => prev.filter((c) => c.id !== idDel));
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

  // Suma de CORTES DE ENTRADA = Remitos + subproducción de cortes principales
  const cortesEntradaConSubproduccion = () => {
    const base = cortesTotales();
    (productosSinRemito || []).forEach((p) => {
      const nombre = (p?.producto || "").trim();
      const cant = Number(p?.cantidad || 0);
      if (!nombre || !cant) return;
      base[nombre] = (base[nombre] || 0) + cant;
    });
    return base;
  };

  const subproductosTotales = () => {
    const acumulado = {};
    comprobantesAgregados.forEach(({ subproductos }) => {
      subproductos.forEach(({ nombre, cantidadTotal, cantidadPorUnidad, unit }) => {
        if (!acumulado[nombre]) {
          acumulado[nombre] = { cantidadTotal: 0, cantidadPorUnidad, unit: unit || "unidad" };
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
        if (!acc[s.nombre]) acc[s.nombre] = { cantidadTotal: 0, cantidadPorUnidad: s.cantidadPorUnidad, unit: s.unit || "unidad" };
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
      subproductosCombinados[nombre] = { cantidadTotal: 0, cantidadPorUnidad: data.cantidadPorUnidad, unit: data.unit || "unidad" };
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
    const tipoActual = (formData.tipo || "").trim();
    const key = tipoActual.toLowerCase();
    const aAgregar = Number(formData.cantidad);
    const subEsperada = subproductosCombinados[tipoActual]?.cantidadTotal || 0;
    const delRemito = comprobantesAgregados
      .flatMap((c) => c.detalles || [])
      .filter((d) => (d.type || "").trim().toLowerCase() === key)
      .reduce((acc, d) => acc + Number(d.quantity || 0), 0);
    const permitido = subEsperada + delRemito;
    if (permitido === 0) {
      Swal.fire(
        "Error",
        `El corte "${tipoActual}" no está en los subproductos esperados ni en los remitos.`,
        "error"
      );
      return;
    }
    const yaAgregado = (cortesAgregados || [])
      .filter((c) => (c.tipo || "").trim().toLowerCase() === key)
      .reduce((acc, c) => acc + Number(c.cantidad || 0), 0);
    if (yaAgregado + aAgregar > permitido) {
      const restante = permitido - yaAgregado;
      Swal.fire("Atención", `Solo puede agregar ${restante} unidades más de "${tipoActual}".`, "warning");
      return;
    }
    const pesoNeto = +(Number(formData.pesoBruto) - Number(formData.tara)).toFixed(2);
    const promedio = aAgregar > 0 ? +(pesoNeto / aAgregar).toFixed(2) : 0;
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

  const getPermitidoPorTipo = (tipo) => {
    const key = (tipo || "").trim().toLowerCase();
    const match = Object.keys(subproductosCombinados || {}).find(
      (n) => n.trim().toLowerCase() === key
    );
    const subEsperada = match ? (subproductosCombinados[match]?.cantidadTotal || 0) : 0;
    const delRemito = (comprobantesAgregados || [])
      .flatMap((c) => c.detalles || [])
      .filter((d) => (d.type || "").trim().toLowerCase() === key)
      .reduce((acc, d) => acc + Number(d.quantity || 0), 0);
    return Number(subEsperada) + Number(delRemito);
  };

  const handleGuardar = async () => {
    if (cortesAgregados.length === 0 && productosSinRemito.length === 0) {
      Swal.fire("Aviso", "No hay datos para guardar.", "info");
      return;
    }

    const agregadoPorTipo = (cortesAgregados || []).reduce((acc, c) => {
      const t = (c.tipo || "").trim();
      acc[t] = (acc[t] || 0) + Number(c.cantidad || 0);
      return acc;
    }, {});

    const violaciones = [];
    for (const [tipo, cantAgregada] of Object.entries(agregadoPorTipo)) {
      const permitido = getPermitidoPorTipo(tipo);
      if (cantAgregada > permitido) {
        violaciones.push({
          tipo,
          agregado: cantAgregada,
          permitido,
          exceso: cantAgregada - permitido,
        });
      }
    }

    if (violaciones.length) {
      const detalle = violaciones
        .map(
          (v) =>
            `• ${v.tipo}: agregado ${v.agregado}, permitido ${v.permitido} (exceso ${v.exceso})`
        )
        .join("\n");
      Swal.fire(
        "No se puede guardar",
        `Hay cortes que superan lo permitido por los comprobantes/subproducción actual:\n\n${detalle}`,
        "error"
      );
      return;
    }

    try {
      let bill_ids = comprobantesAgregados.map((comp) => Number(comp.id));
      if (bill_ids.length === 0 && productosSinRemito.length > 0) {
        bill_ids = [0];
      }

      const cortesPayload = cortesAgregados.map((corte) => ({
        type: corte.tipo?.trim(),
        average: Number(corte.promedio),
        quantity: Number(corte.cantidad),
        gross_weight: Number(corte.pesoBruto),
        tares: Number(corte.tara),
        net_weight: Number((corte.pesoBruto - corte.tara).toFixed(2)),
      }));

      const subproduction = (Array.isArray(productosSinRemito) ? productosSinRemito : [])
        .map((p) => ({
          cut_name: (p.producto || "").trim(),
          quantity: Number(p.cantidad || 0),
        }))
        .filter((r) => r.cut_name && r.quantity > 0);

      if (isEdit) {
        const putRes = await fetch(`${API_URL}/process/${processParam}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cortes: cortesPayload, bill_ids, subproduction }),
        });

        if (!putRes.ok) {
          const txt = await putRes.text().catch(() => "");
          console.warn("PUT edición falló:", txt);
          Swal.fire(
            "Atención",
            "No se pudo actualizar el proceso (PUT). Si tu backend aún no tiene esta ruta, avisame y lo agregamos.",
            "warning"
          );
          return;
        }

        Swal.fire("Éxito", "Proceso actualizado correctamente.", "success");
      } else {
        const response = await fetch(`${API_URL}/uploadProcessMeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cortes: cortesPayload, bill_ids, subproduction }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al guardar el proceso productivo.");
        }

        Swal.fire("Éxito", "Datos guardados correctamente.", "success");
      }

      setCortesAgregados([]);
      setProductosSinRemito([]);
      setComprobantesAgregados([]);
      localStorage.removeItem(LS_KEYS.CORTES);
      localStorage.removeItem(LS_KEYS.SIN_REMITO);
      localStorage.removeItem(LS_KEYS.COMPROBANTES);

      navigate("/operator-panel");
    } catch (err) {
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
        {/* ---------------- SECCIÓN COMPROBANTES ---------------- */}
        <section className="pp-despostar-section">
          <h2>{isEdit ? `Editar proceso #${processParam}` : "Buscar y Agregar Comprobante"}</h2>
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
                {comprobantesAgregados.map(({ id: idComp, remito, detalles }) => {
                  const piezasAgrupadas = detalles.reduce((acc, { type, quantity }) => {
                    const key = type.trim();
                    acc[key] = (acc[key] || 0) + Number(quantity);
                    return acc;
                  }, {});
                  return (
                    <div
                      key={idComp}
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
                        onClick={() => eliminarComprobante(idComp)}
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
                        <span style={{ fontWeight: 400, color: "#777", marginLeft: 10 }}>ID: {idComp}</span>
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
                {Object.entries(cortesEntradaConSubproduccion()).length ? (
                  <ul>
                    {Object.entries(cortesEntradaConSubproduccion()).map(([tipo, cantidad]) => (
                      <li key={tipo}>
                        <span className="pp-tag-corte">{tipo}</span> — {cantidad} unidades
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: "#666" }}>Sin piezas cargadas.</div>
                )}
              </div>

              <div className="pp-totales-box">
                <div style={{ marginBottom: 8 }}>🟩 <b>Subproductos totales sumados:</b></div>
                <ul>
                  {Object.entries(subproductosCombinados).map(([nombre, { cantidadTotal, cantidadPorUnidad, unit }]) => (
                    <li key={nombre}>
                      <span className="pp-tag-corte">{nombre}</span>
                      {" — "}
                      {cantidadTotal} {labelUnidad(unit)}
                      <span style={{ fontSize: "0.95em", color: "#444", marginLeft: 4 }}>
                        ({cantidadPorUnidad} {labelUnidad(unit)} por pieza)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* ---------------- SECCIÓN SUBPRODUCCIÓN ---------------- */}
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
                    className="no-spin"
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
                          {prod.subproductosAgrupados.map(([nombre, { cantidadTotal, cantidadPorUnidad, unit }], i) => (
                            <li key={i}>
                              <span className="subproducto-label">{nombre}</span>
                              <span className="subproducto-meta">
                                {cantidadTotal} {labelUnidad(unit)} ({cantidadPorUnidad} x {labelUnidad(unit)})
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

        {/* ---------------- SECCIÓN PROCESO PRODUCTIVO ---------------- */}
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
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    min="0"
                    required
                    className="no-spin"
                  />
                </div>
                <div>
                  <label>PESO BRUTO</label>
                  <input
                    type="number"
                    name="pesoBruto"
                    value={formData.pesoBruto}
                    onChange={handleChange}
                    min="0"
                    required
                    className="no-spin"
                  />
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
                  <input
                    type="number"
                    value={(formData.pesoBruto - formData.tara).toFixed(2)}
                    disabled
                    className="no-spin"
                  />
                </div>
                <div>
                  <label>PROMEDIO</label>
                  <input type="text" value={calcularPromedio()} disabled />
                </div>
                <div className="pp-boton-agregar-wrapper">
                  <button className="pp-btn-agregar" onClick={agregarCorte}>
                    Agregar
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
                    <div>{Number(corte.promedio).toFixed(2)}</div>
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
                {cortesAgregados
                  .reduce((acc, item) => acc + (item.pesoBruto - item.tara), 0)
                  .toFixed(2)}{" "}
                kg
              </div>

              <button className="pp-btn-guardar" onClick={handleGuardar}>
                {isEdit ? "Guardar cambios" : "Guardar y terminar carga"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductionProcess;
