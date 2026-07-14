import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const formatFecha = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ProductionProcess = () => {
  const navigate = useNavigate();
  const { processNumber, id } = useParams();
  const processParam = processNumber ?? id;
  const isEdit = !!processParam;
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

  const [mostrarSinRemito, setMostrarSinRemito] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productoSinRemito, setProductoSinRemito] = useState(null);
  const [cantidadSinRemito, setCantidadSinRemito] = useState("");
  const [pesoSinRemito, setPesoSinRemito] = useState("");
  const [productosSinRemito, setProductosSinRemito] = useState([]);

  const [cortesAgregados, setCortesAgregados] = useState([]);

  const [mostrarSeccionComprobantes, setMostrarSeccionComprobantes] = useState(
    isEdit
  );

  const comprobantesSectionRef = useRef(null);
  const tipoAnteriorRef = useRef("");

  useEffect(() => {
    if (isEdit) return;

    const cortesGuardados = safeParse(localStorage.getItem(LS_KEYS.CORTES), []);
    const productosGuardados = safeParse(
      localStorage.getItem(LS_KEYS.SIN_REMITO),
      []
    );
    const comprobantesGuardados = safeParse(
      localStorage.getItem(LS_KEYS.COMPROBANTES),
      []
    );

    if (cortesGuardados.length) setCortesAgregados(cortesGuardados);
    if (productosGuardados.length) setProductosSinRemito(productosGuardados);
    if (comprobantesGuardados.length) {
      setComprobantesAgregados(comprobantesGuardados);
    }
  }, [isEdit]);

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
    localStorage.setItem(
      LS_KEYS.COMPROBANTES,
      JSON.stringify(comprobantesAgregados)
    );
  }, [comprobantesAgregados, isEdit]);

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
          unidadVenta:
            producto.unit_measure ||
            producto.sale_unit ||
            producto.unit ||
            producto.unit_sale ||
            producto.sales_unit ||
            producto.saleUnit ||
            "",
        }));

        setCortes(productosConCantidad);

        const productosBase = data.map((prod) => {
          const unidadVenta =
            prod.unit_measure ||
            prod.sale_unit ||
            prod.unit ||
            prod.unit_sale ||
            prod.sales_unit ||
            prod.saleUnit ||
            "";

          return {
            value: prod.product_name,
            label: prod.product_name,
            tipoOrigen: "stock",
            product_name: prod.product_name,
            unidadVenta,
          };
        });

        let camaraOptions = [];

        try {
          const resCamara = await fetch(
            `${API_URL}/camara-cuts-for-subproduction`
          );

          if (resCamara.ok) {
            const dataCamara = await resCamara.json();
            const camaraRows = Array.isArray(dataCamara) ? dataCamara : [];

            camaraOptions = camaraRows.map((item) => {
              const uniqueCode = item.unique_code
                ? ` | Código: ${item.unique_code}`
                : "";

              const quantity = Number(item.quantity || 0);
              const weight = Number(item.weight || 0);

              return {
                value: `camara-${item.source}-${item.id}`,
                label: `${item.product_name} | CÁMARA${uniqueCode} - ${quantity} un. / ${weight.toFixed(
                  2
                )} kg`,
                tipoOrigen: "camara",
                camaraId: item.id,
                source: item.source,
                product_name: item.product_name,
                quantity,
                weight,
                unique_code: item.unique_code || null,
              };
            });
          }
        } catch (err) {
          console.error("Error al cargar productos de cámara:", err);
        }

        setProductosDisponibles([...productosBase, ...camaraOptions]);
      } catch (error) {
        console.error("Error al cargar productos:", error);
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
      } catch (error) {
        console.error("Error al cargar taras:", error);
      }
    };

    fetchTares();
  }, [API_URL]);

  useEffect(() => {
    const fetchComprobantesSinProcesoConTipo = async () => {
      try {
        const res = await fetch(`${API_URL}/allproducts`);
        const data = await res.json();
        const sinProceso = data.filter((p) => !p.production_process);

        const sinProcesoConTipo = await Promise.all(
          sinProceso.map(async (comp) => {
            try {
              const resDetalle = await fetch(
                `${API_URL}/bill-details-readonly/${comp.id}`
              );
              const detalleData = await resDetalle.json();

              const piezasAgrupadas = Array.isArray(detalleData)
                ? detalleData.reduce((acc, d) => {
                    const tipo = d.type?.trim();
                    const qty = Number(d.quantity || 0);
                    if (!tipo || qty <= 0) return acc;
                    acc[tipo] = (acc[tipo] || 0) + qty;
                    return acc;
                  }, {})
                : {};

              return { ...comp, piezasAgrupadas: piezasAgrupadas || {} };
            } catch {
              return { ...comp, piezasAgrupadas: {} };
            }
          })
        );

        setComprobantesDisponibles(
          (sinProcesoConTipo || []).filter(
            (c) => Object.keys(c.piezasAgrupadas || {}).length > 0
          )
        );
      } catch (error) {
        console.error("Error al cargar comprobantes:", error);
      }
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
      const url = `${API_URL}/subproducts-by-name/${encodeURIComponent(
        tipoProducto
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();

      return data.map((sub) => ({
        nombre: sub.nombre,
        cantidadTotal: Number(sub.cantidadPorUnidad || 0) * Number(cantidad || 0),
        cantidadPorUnidad: Number(sub.cantidadPorUnidad || 0),
        productoOrigen: tipoProducto,
        unit: sub.unit || "unidad",
      }));
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (!isEdit) return;

    const precargar = async () => {
      try {
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
          pesoNeto: Number(
            r.net_weight ||
              Number(r.gross_weight || 0) - Number(r.tares || 0)
          ),
        }));

        setCortesAgregados(mapeados);

        try {
          const resSub = await fetch(
            `${API_URL}/productionprocess-subproduction?process_number=${processParam}`
          );

          if (resSub.ok) {
            const subRows = await resSub.json();

            const mapped = (Array.isArray(subRows) ? subRows : []).map((s) => ({
              producto: s.cut_name,
              cantidad: Number(s.quantity || 0),
              weight: Number(s.weight || 0),
              subproductos: [],
              esCamara: false,
            }));

            setProductosSinRemito(mapped);
          }
        } catch {}

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

                return {
                  id: bid,
                  remito,
                  detalles,
                  subproductos: subs,
                };
              } catch {
                return {
                  id: bid,
                  remito: null,
                  detalles: [],
                  subproductos: [],
                };
              }
            })
          );

          setComprobantesAgregados(agregados);
          setMostrarSeccionComprobantes(true);
        } catch {}
      } catch (e) {
        console.error("Precarga edición error:", e);
        Swal.fire("Error", "No se pudo cargar el proceso para edición.", "error");
      }
    };

    precargar();
  }, [isEdit, processParam, API_URL]);

  useEffect(() => {
    if (comprobantesAgregados.length > 0) setMostrarSeccionComprobantes(true);
  }, [comprobantesAgregados.length]);

  const handleAgregarComprobante = async (idSel) => {
    if (!idSel) {
      Swal.fire(
        "Atención",
        "Debe ingresar un ID o seleccionar un comprobante.",
        "warning"
      );
      return;
    }

    if (comprobantesAgregados.some((c) => Number(c.id) === Number(idSel))) {
      Swal.fire("Atención", "Este comprobante ya fue agregado.", "warning");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bill-details-readonly/${idSel}`);
      const detallesRaw = await response.json();

      const detalles = Array.isArray(detallesRaw)
        ? detallesRaw
            .map((d) => ({
              ...d,
              type: String(d.type || "").trim(),
              quantity: Number(d.quantity || 0),
            }))
            .filter((d) => d.type && d.quantity > 0)
        : [];

      if (detalles.length === 0) {
        Swal.fire(
          "Atención",
          "Ese comprobante no tiene cortes disponibles.",
          "warning"
        );
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
        {
          id: Number(idSel),
          remito,
          detalles,
          subproductos: subproductosTotales,
        },
      ]);

      setComprobanteSeleccionado("");
      setSubproductosEsperados([]);
      setMostrarSeccionComprobantes(true);
    } catch {
      Swal.fire("Error", "No se pudo agregar el comprobante.", "error");
    }
  };

  const eliminarComprobante = (idDel) => {
    setComprobantesAgregados((prev) =>
      prev.filter((c) => Number(c.id) !== Number(idDel))
    );
  };

  const cortesTotales = () => {
    const acumulado = {};

    comprobantesAgregados.forEach(({ detalles }) => {
      detalles.forEach(({ type, quantity }) => {
        acumulado[type] = (acumulado[type] || 0) + Number(quantity || 0);
      });
    });

    return acumulado;
  };

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
      subproductos.forEach(
        ({ nombre, cantidadTotal, cantidadPorUnidad, unit }) => {
          if (!acumulado[nombre]) {
            acumulado[nombre] = {
              cantidadTotal: 0,
              cantidadPorUnidad,
              unit: unit || "unidad",
            };
          }

          acumulado[nombre].cantidadTotal += Number(cantidadTotal || 0);
        }
      );
    });

    return acumulado;
  };

  const productosSinRemitoAgrupados = productosSinRemito.map((prod) => ({
    ...prod,
    subproductosAgrupados: Object.entries(
      (prod.subproductos || []).reduce((acc, s) => {
        if (!acc[s.nombre]) {
          acc[s.nombre] = {
            cantidadTotal: 0,
            cantidadPorUnidad: s.cantidadPorUnidad,
            unit: s.unit || "unidad",
          };
        }

        acc[s.nombre].cantidadTotal += Number(s.cantidadTotal || 0);
        return acc;
      }, {})
    ),
  }));

  const subproductosAgrupadosComprobantes = Object.entries(subproductosTotales());

  const subproductosAgrupadosSinRemito = productosSinRemitoAgrupados.flatMap(
    (prod) => prod.subproductosAgrupados
  );

  const subproductosCombinados = {};

  [
    ...subproductosAgrupadosComprobantes,
    ...subproductosAgrupadosSinRemito,
  ].forEach(([nombre, data]) => {
    if (!subproductosCombinados[nombre]) {
      subproductosCombinados[nombre] = {
        cantidadTotal: 0,
        cantidadPorUnidad: data.cantidadPorUnidad,
        unit: data.unit || "unidad",
      };
    }

    subproductosCombinados[nombre].cantidadTotal += Number(
      data.cantidadTotal || 0
    );
  });

  const getUnidadProducto = (tipo) => {
    if (!tipo) return null;

    const producto = cortes.find(
      (item) =>
        String(item.nombre || "").trim().toLowerCase() ===
        String(tipo || "").trim().toLowerCase()
    );

    return producto?.unidadVenta || null;
  };

  const getUnidadPorTipo = (tipo) => {
    if (!tipo) return null;

    const key = Object.keys(subproductosCombinados).find(
      (k) =>
        String(k || "").trim().toLowerCase() ===
        String(tipo || "").trim().toLowerCase()
    );

    if (!key) return null;
    const data = subproductosCombinados[key];
    return data?.unit || null;
  };

  const isTipoEnKg = (tipo) => {
    if (!tipo) return false;

    const unidadProducto = getUnidadProducto(tipo);

    if (
      unidadProducto &&
      String(unidadProducto).trim().toLowerCase() === "kg"
    ) {
      return true;
    }

    const unidadSubproducto = getUnidadPorTipo(tipo);

    if (
      unidadSubproducto &&
      String(unidadSubproducto).trim().toLowerCase() === "kg"
    ) {
      return true;
    }

    return false;
  };

  const productoSinRemitoEsCamara =
    productoSinRemito?.tipoOrigen === "camara";

  const productoSinRemitoEsKg = (() => {
    if (!productoSinRemito || productoSinRemitoEsCamara) return false;

    const nombre =
      productoSinRemito.product_name ||
      productoSinRemito.value ||
      productoSinRemito.label ||
      "";

    const producto = cortes.find(
      (p) =>
        String(p.nombre || "").trim().toLowerCase() ===
        String(nombre || "").trim().toLowerCase()
    );

    return String(producto?.unidadVenta || "").trim().toLowerCase() === "kg";
  })();

  useEffect(() => {
    if (
      isTipoEnKg(formData.tipo) &&
      (formData.cantidad !== 0 || formData.promedio !== 0)
    ) {
      setFormData((prev) => ({
        ...prev,
        cantidad: 0,
        promedio: 0,
      }));
    }
  }, [formData.tipo, formData.cantidad, formData.promedio]);

  useEffect(() => {
    const tipoActual = (formData.tipo || "").trim();
    const tipoAnterior = (tipoAnteriorRef.current || "").trim();

    if (tipoActual && tipoActual !== tipoAnterior && isTipoEnKg(tipoActual)) {
      Swal.fire({
        icon: "info",
        title: "Cantidad bloqueada",
        text: "Para este producto o subproducto la cantidad se controla solo por kilos. El campo CANTIDAD queda bloqueado y se usará el peso neto.",
        confirmButtonText: "Entendido",
      });
    }

    tipoAnteriorRef.current = formData.tipo;
  }, [formData.tipo]);

  const agregarCorte = async () => {
    const tipoActual = (formData.tipo || "").trim();
    const esKg = isTipoEnKg(tipoActual);

    if (
      !tipoActual ||
      (!esKg &&
        (formData.cantidad === "" ||
          isNaN(Number(formData.cantidad)) ||
          Number(formData.cantidad) <= 0)) ||
      formData.pesoBruto === "" ||
      isNaN(Number(formData.pesoBruto)) ||
      Number(formData.pesoBruto) <= 0 ||
      formData.tara === "" ||
      isNaN(Number(formData.tara)) ||
      Number(formData.tara) <= 0
    ) {
      Swal.fire(
        "Error",
        "Faltan campos obligatorios o hay valores inválidos.",
        "error"
      );
      return;
    }

    const pesoNeto = +(
      Number(formData.pesoBruto) - Number(formData.tara)
    ).toFixed(2);

    const aAgregar = esKg ? pesoNeto : Number(formData.cantidad);

    const promedio =
      !esKg && aAgregar > 0 ? +(pesoNeto / aAgregar).toFixed(2) : 0;

    const nuevoCorte = {
      ...formData,
      cantidad: esKg ? 0 : Number(formData.cantidad),
      pesoNeto,
      promedio,
    };

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
    setCortesAgregados((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCantidadSinRemitoChange = (e) => {
    const v = e.target.value;

    if (productoSinRemitoEsCamara || productoSinRemitoEsKg) return;

    if (v === "") return setCantidadSinRemito("");
    if (/^\d+$/.test(v)) setCantidadSinRemito(v);
  };

  const handleCantidadSinRemitoBlur = () => {
    if (productoSinRemitoEsCamara || productoSinRemitoEsKg) return;

    const n = parseInt(cantidadSinRemito, 10);
    setCantidadSinRemito(!n || n <= 0 ? "1" : String(n));
  };

  const handleProductoSinRemitoChange = (selected) => {
    setProductoSinRemito(selected);

    if (!selected) {
      setCantidadSinRemito("");
      setPesoSinRemito("");
      return;
    }

    if (selected.tipoOrigen === "camara") {
      setCantidadSinRemito(String(Number(selected.quantity || 0)));
      setPesoSinRemito(String(Number(selected.weight || 0)));
      return;
    }

    const nombre = selected.product_name || selected.value || "";
    const producto = cortes.find(
      (p) =>
        String(p.nombre || "").trim().toLowerCase() ===
        String(nombre || "").trim().toLowerCase()
    );

    const esKg =
      String(producto?.unidadVenta || "").trim().toLowerCase() === "kg";

    if (esKg) {
      setCantidadSinRemito("0");
    } else {
      setCantidadSinRemito("");
    }

    setPesoSinRemito("");
  };

  const handleAgregarProductoSinRemito = async () => {
    const esCamara = productoSinRemito?.tipoOrigen === "camara";

    const nombre = esCamara
      ? productoSinRemito?.product_name
      : productoSinRemito?.value;

    const esKg = productoSinRemitoEsKg;

    const nuevaCantidad = esCamara
      ? Number(productoSinRemito?.quantity || 0)
      : esKg
      ? 0
      : parseInt(cantidadSinRemito, 10);

    const nuevoPeso = esCamara
      ? Number(productoSinRemito?.weight || 0)
      : parseFloat(pesoSinRemito || 0);

    if (!nombre) {
      Swal.fire("Atención", "Debe seleccionar un producto.", "warning");
      return;
    }

    if (esCamara && !productoSinRemito?.camaraId) {
      Swal.fire("Atención", "El producto de cámara no tiene ID válido.", "warning");
      return;
    }

    if (!esCamara && esKg && (!nuevoPeso || nuevoPeso <= 0)) {
      Swal.fire(
        "Atención",
        "Este producto se controla en KG. Debe ingresar peso.",
        "warning"
      );
      return;
    }

    if (!esCamara && !esKg && (!nuevaCantidad || nuevaCantidad <= 0) && !nuevoPeso) {
      Swal.fire("Atención", "Debe ingresar cantidad o peso.", "warning");
      return;
    }

    const current = Array.isArray(productosSinRemito) ? productosSinRemito : [];

    const subproductos = await fetchSubproductos(nombre, nuevaCantidad || 0);

    if (esCamara) {
      const yaExiste = current.some(
        (p) =>
          p.esCamara &&
          String(p.source) === String(productoSinRemito.source) &&
          Number(p.camaraId) === Number(productoSinRemito.camaraId)
      );

      if (yaExiste) {
        Swal.fire("Atención", "Ese producto de cámara ya fue agregado.", "warning");
        return;
      }

      setProductosSinRemito([
        ...current,
        {
          producto: nombre,
          cantidad: nuevaCantidad || 0,
          weight: nuevoPeso || 0,
          subproductos,
          esCamara: true,
          camaraId: productoSinRemito.camaraId,
          source: productoSinRemito.source,
          unique_code: productoSinRemito.unique_code || null,
        },
      ]);
    } else {
      const idx = current.findIndex(
        (p) => p.producto === nombre && !p.esCamara
      );

      if (idx !== -1) {
        const totalCantidad = Number(current[idx].cantidad || 0) + Number(nuevaCantidad || 0);
        const totalPeso = Number(current[idx].weight || 0) + Number(nuevoPeso || 0);

        const nuevosSubproductos = await fetchSubproductos(nombre, totalCantidad);

        const copia = [...current];
        copia[idx] = {
          ...copia[idx],
          producto: nombre,
          cantidad: totalCantidad,
          weight: totalPeso,
          subproductos: nuevosSubproductos,
          esCamara: false,
        };

        setProductosSinRemito(copia);
      } else {
        setProductosSinRemito([
          ...current,
          {
            producto: nombre,
            cantidad: nuevaCantidad || 0,
            weight: nuevoPeso || 0,
            subproductos,
            esCamara: false,
          },
        ]);
      }
    }

    setProductoSinRemito(null);
    setCantidadSinRemito("");
    setPesoSinRemito("");
  };

  const eliminarProductoSinRemito = (index) => {
    setProductosSinRemito((prev) =>
      Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []
    );
  };

  const pedirComprobantesAlFinal = async () => {
    setMostrarSeccionComprobantes(true);

    setTimeout(() => {
      comprobantesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    await Swal.fire({
      icon: "info",
      title: "Falta una entrada al proceso",
      text: "Para guardar, tenés que agregar al menos 1 comprobante, cargar subproducción o seleccionar un producto de cámara.",
      confirmButtonText: "Entendido",
    });
  };

  const handleGuardar = async () => {
    if (cortesAgregados.length === 0) {
      Swal.fire(
        "Aviso",
        "Debe agregar al menos un corte resultante del proceso productivo.",
        "info"
      );
      return;
    }

    const hayComprobantes = comprobantesAgregados.length > 0;

    const haySubproduccion =
      Array.isArray(productosSinRemito) &&
      productosSinRemito.some(
        (p) => Number(p.cantidad || 0) > 0 || Number(p.weight || 0) > 0
      );

    const hayCamaraItems =
      Array.isArray(productosSinRemito) &&
      productosSinRemito.some((p) => p.esCamara && p.camaraId && p.source);

    if (!hayComprobantes && !haySubproduccion && !hayCamaraItems) {
      await pedirComprobantesAlFinal();
      return;
    }

    try {
      const bill_ids = comprobantesAgregados.map((comp) => Number(comp.id));

      const cortesPayload = cortesAgregados.map((corte) => {
        const esKgLocal = isTipoEnKg(corte.tipo);

        const neto = Number(
          (Number(corte.pesoBruto || 0) - Number(corte.tara || 0)).toFixed(2)
        );

        return {
          type: corte.tipo?.trim(),
          average: esKgLocal ? 0 : Number(corte.promedio),
          quantity: esKgLocal ? 0 : Number(corte.cantidad),
          gross_weight: Number(corte.pesoBruto),
          tares: Number(corte.tara),
          net_weight: neto,
        };
      });

      const subproduction = (Array.isArray(productosSinRemito)
        ? productosSinRemito
        : [])
        .filter((p) => !p.esCamara)
        .map((p) => ({
          cut_name: (p.producto || "").trim(),
          quantity: Number(p.cantidad || 0),
          weight: Number(p.weight || 0),
        }))
        .filter((r) => r.cut_name && (r.quantity > 0 || r.weight > 0));

      const camara_items = (Array.isArray(productosSinRemito)
        ? productosSinRemito
        : [])
        .filter((p) => p.esCamara && p.camaraId && p.source)
        .map((p) => ({
          id: Number(p.camaraId),
          source: p.source,
          unique_code: p.unique_code || null,
        }));

      const payload = {
        cortes: cortesPayload,
        bill_ids,
        subproduction,
        camara_items,
      };

      if (isEdit) {
        const putRes = await fetch(`${API_URL}/process/${processParam}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!putRes.ok) {
          const txt = await putRes.text().catch(() => "");
          console.warn("PUT edición falló:", txt);

          Swal.fire(
            "Atención",
            "No se pudo actualizar el proceso.",
            "warning"
          );
          return;
        }

        Swal.fire("Éxito", "Proceso actualizado correctamente.", "success");
      } else {
        const response = await fetch(`${API_URL}/uploadProcessMeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Error al guardar el proceso productivo."
          );
        }

        await Swal.fire("Éxito", "Datos guardados correctamente.", "success");

        setCortesAgregados([]);
        setProductosSinRemito([]);
        setComprobantesAgregados([]);

        localStorage.removeItem(LS_KEYS.CORTES);
        localStorage.removeItem(LS_KEYS.SIN_REMITO);
        localStorage.removeItem(LS_KEYS.COMPROBANTES);

        navigate(`/production-process/details/${data.process_number}`);
        return;
      }

      setCortesAgregados([]);
      setProductosSinRemito([]);
      setComprobantesAgregados([]);

      localStorage.removeItem(LS_KEYS.CORTES);
      localStorage.removeItem(LS_KEYS.SIN_REMITO);
      localStorage.removeItem(LS_KEYS.COMPROBANTES);

      navigate(`/production-process/details/${processParam}`);
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
    const tipoActual = (formData.tipo || "").trim();
    if (isTipoEnKg(tipoActual)) return "0.00";

    const pesoNeto = Number(formData.pesoBruto || 0) - Number(formData.tara || 0);
    const cantidad = Number(formData.cantidad || 0);

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
        {(mostrarSeccionComprobantes || comprobantesAgregados.length > 0) && (
          <section className="pp-despostar-section" ref={comprobantesSectionRef}>
            <h2>
              {isEdit
                ? `Editar proceso #${processParam}`
                : "Buscar y Agregar Comprobante"}
            </h2>

            {!isEdit && (
              <div
                style={{
                  background: "#f3f7ff",
                  border: "1px solid #cfe0ff",
                  padding: "10px 12px",
                  borderRadius: 10,
                  marginBottom: 12,
                  color: "#1f3f7a",
                  fontWeight: 500,
                }}
              >
                Podés cargar despostes y subproducción primero. Al final, tenés
                que agregar al menos 1 comprobante, cargar subproducción o usar
                un producto de cámara para guardar.
              </div>
            )}

            <div
              className="pp-form-group"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "end",
                gap: "10px",
              }}
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

              <div style={{ minWidth: "360px", flex: "1" }}>
                <label>O seleccionar disponible</label>

                <Select
                  className="pp-select-react"
                  placeholder="Buscar comprobante..."
                  isClearable
                  options={comprobantesDisponibles.map((comp) => {
                    const piezas = comp.piezasAgrupadas || {};
                    const piezaStr = Object.entries(piezas)
                      .map(([tipo, cant]) => `${tipo}: ${cant}`)
                      .join(" | ");

                    return {
                      value: comp.id,
                      label: `${comp.supplier} — ${piezaStr} | 🕒 ${formatFecha(
                        comp.updatedAt
                      )}`,
                    };
                  })}
                  value={
                    comprobanteSeleccionado
                      ? comprobantesDisponibles
                          .map((comp) => {
                            const piezas = comp.piezasAgrupadas || {};
                            const piezaStr = Object.entries(piezas)
                              .map(([tipo, cant]) => `${tipo}: ${cant}`)
                              .join(" | ");

                            return {
                              value: comp.id,
                              label: `${comp.supplier} — ${piezaStr} | 🕒 ${formatFecha(
                                comp.updatedAt
                              )}`,
                            };
                          })
                          .find(
                            (opt) =>
                              String(opt.value) ===
                              String(comprobanteSeleccionado)
                          ) || null
                      : null
                  }
                  onChange={(selected) =>
                    setComprobanteSeleccionado(selected ? selected.value : "")
                  }
                />
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
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>
                  Comprobantes agregados
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                  {comprobantesAgregados.map(({ id: idComp, remito, detalles }) => {
                    const piezasAgrupadas = detalles.reduce(
                      (acc, { type, quantity }) => {
                        const key = String(type || "").trim();
                        acc[key] = (acc[key] || 0) + Number(quantity || 0);
                        return acc;
                      },
                      {}
                    );

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
                          fontSize: 16,
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
                            fontWeight: "bold",
                          }}
                          title="Eliminar comprobante"
                        >
                          ×
                        </button>

                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          <span style={{ color: "#155ca4" }}>
                            📄 {remito?.supplier || "Proveedor Desconocido"}
                          </span>

                          <span
                            style={{
                              fontWeight: 400,
                              color: "#777",
                              marginLeft: 10,
                            }}
                          >
                            ID: {idComp}
                          </span>
                        </div>

                        <div
                          style={{
                            margin: "5px 0 0 2px",
                            color: "#244b79",
                            fontWeight: 500,
                          }}
                        >
                          <span>Piezas:</span>

                          <ul
                            style={{
                              padding: "0 0 0 16px",
                              margin: "2px 0 0 0",
                            }}
                          >
                            {Object.entries(piezasAgrupadas).map(
                              ([tipo, cantidad]) => (
                                <li key={tipo} style={{ marginBottom: 1 }}>
                                  <span
                                    style={{
                                      background: "#e4f2ff",
                                      borderRadius: 7,
                                      padding: "2px 7px",
                                      marginRight: 6,
                                      color: "#176eb3",
                                      fontWeight: 500,
                                      display: "inline-block",
                                    }}
                                  >
                                    {tipo}
                                  </span>

                                  <b style={{ color: "#222", fontWeight: 600 }}>
                                    {cantidad}
                                  </b>{" "}
                                  unidad{cantidad > 1 ? "es" : ""}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pp-totales-box">
                  <div style={{ marginBottom: 8 }}>
                    🟦 <b>Cortes totales sumados:</b>
                  </div>

                  {Object.entries(cortesEntradaConSubproduccion()).length ? (
                    <ul>
                      {Object.entries(cortesEntradaConSubproduccion()).map(
                        ([tipo, cantidad]) => (
                          <li key={tipo}>
                            <span className="pp-tag-corte">{tipo}</span> —{" "}
                            {cantidad} unidades
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div style={{ color: "#666" }}>Sin piezas cargadas.</div>
                  )}
                </div>

                <div className="pp-totales-box">
                  <div style={{ marginBottom: 8 }}>
                    🟩 <b>Subproductos totales sumados:</b>
                  </div>

                  <ul>
                    {Object.entries(subproductosCombinados).map(
                      ([nombre, { cantidadTotal, cantidadPorUnidad, unit }]) => (
                        <li key={nombre}>
                          <span className="pp-tag-corte">{nombre}</span>
                          {" — "}
                          {cantidadTotal} {labelUnidad(unit)}
                          <span
                            style={{
                              fontSize: "0.95em",
                              color: "#444",
                              marginLeft: 4,
                            }}
                          >
                            ({cantidadPorUnidad} {labelUnidad(unit)} por pieza)
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            )}
          </section>
        )}

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
                style={{
                  width: "24px",
                  height: "24px",
                  marginRight: "10px",
                  accentColor: "#005ecb",
                }}
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
                    onChange={handleProductoSinRemitoChange}
                    placeholder="Seleccionar producto..."
                    isClearable
                  />
                </div>

                <div className="pp-field pp-small">
                  <label>
                    {productoSinRemitoEsCamara
                      ? "Cantidad (CÁMARA)"
                      : productoSinRemitoEsKg
                      ? "Cantidad (BLOQUEADA KG)"
                      : "Cantidad"}
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={cantidadSinRemito}
                    onChange={handleCantidadSinRemitoChange}
                    onBlur={handleCantidadSinRemitoBlur}
                    inputMode="numeric"
                    className="no-spin"
                    disabled={productoSinRemitoEsCamara || productoSinRemitoEsKg}
                    style={{
                      backgroundColor:
                        productoSinRemitoEsCamara || productoSinRemitoEsKg
                          ? "#e9ecef"
                          : "",
                      cursor:
                        productoSinRemitoEsCamara || productoSinRemitoEsKg
                          ? "not-allowed"
                          : "text",
                    }}
                  />
                </div>

                <div className="pp-field pp-small">
                  <label>
                    {productoSinRemitoEsCamara ? "Peso (CÁMARA)" : "Peso (kg)"}
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={pesoSinRemito}
                    onChange={(e) => {
                      if (productoSinRemitoEsCamara) return;
                      setPesoSinRemito(e.target.value);
                    }}
                    className="no-spin"
                    disabled={productoSinRemitoEsCamara}
                    style={{
                      backgroundColor: productoSinRemitoEsCamara ? "#e9ecef" : "",
                      cursor: productoSinRemitoEsCamara ? "not-allowed" : "text",
                    }}
                  />
                </div>

                <div className="pp-field pp-button">
                  <button
                    className="pp-btn-agregar"
                    onClick={handleAgregarProductoSinRemito}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {Array.isArray(productosSinRemitoAgrupados) &&
                productosSinRemitoAgrupados.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <div
                      style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}
                    >
                      Subproducción agregada
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                      {productosSinRemitoAgrupados.map((prod, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: "1.5px solid #cae1fd",
                            background: "#fafdff",
                            borderRadius: 12,
                            boxShadow: "0 2px 6px #b5dafc3a",
                            padding: "16px 22px 14px 18px",
                            minWidth: 240,
                            maxWidth: 420,
                            marginBottom: 12,
                            position: "relative",
                            fontSize: 16,
                          }}
                        >
                          <button
                            onClick={() => eliminarProductoSinRemito(idx)}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 12,
                              border: "none",
                              background: "none",
                              color: "#cb1111",
                              fontSize: 20,
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            title="Quitar producto"
                          >
                            ×
                          </button>

                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            <span style={{ color: "#155ca4" }}>
                              🐄 {prod.producto}
                              {prod.esCamara ? " | CÁMARA" : ""}
                            </span>
                          </div>

                          {prod.esCamara && prod.unique_code && (
                            <div
                              style={{
                                color: "#555",
                                fontSize: 14,
                                marginTop: 4,
                              }}
                            >
                              Código único: <b>{prod.unique_code}</b>
                            </div>
                          )}

                          <div
                            style={{
                              fontWeight: 400,
                              color: "#777",
                              marginTop: 4,
                            }}
                          >
                            Cantidad: {Number(prod.cantidad || 0)} | Peso:{" "}
                            {Number(prod.weight || 0).toFixed(2)} kg
                          </div>

                          <div
                            style={{
                              margin: "8px 0 0 2px",
                              color: "#244b79",
                              fontWeight: 500,
                            }}
                          >
                            <span>Piezas:</span>

                            {prod.subproductosAgrupados.length > 0 ? (
                              <ul
                                style={{
                                  padding: "0 0 0 16px",
                                  margin: "6px 0 0 0",
                                }}
                              >
                                {prod.subproductosAgrupados.map(
                                  (
                                    [
                                      nombre,
                                      { cantidadTotal, cantidadPorUnidad, unit },
                                    ],
                                    i
                                  ) => (
                                    <li key={i} style={{ marginBottom: 4 }}>
                                      <span
                                        style={{
                                          background: "#e4f2ff",
                                          borderRadius: 7,
                                          padding: "2px 7px",
                                          marginRight: 6,
                                          color: "#176eb3",
                                          fontWeight: 500,
                                          display: "inline-block",
                                        }}
                                      >
                                        {nombre}
                                      </span>

                                      <b
                                        style={{
                                          color: "#222",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {cantidadTotal} {labelUnidad(unit)}
                                      </b>

                                      <span
                                        style={{
                                          fontSize: "0.95em",
                                          color: "#444",
                                          marginLeft: 6,
                                        }}
                                      >
                                        ({cantidadPorUnidad} {labelUnidad(unit)}{" "}
                                        por pieza)
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <div style={{ color: "#777", marginTop: 4 }}>
                                Sin subproductos asociados.
                              </div>
                            )}
                          </div>
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
                    value={
                      formData.tipo
                        ? { value: formData.tipo, label: formData.tipo }
                        : null
                    }
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
                  <label>
                    {isTipoEnKg(formData.tipo)
                      ? "CANTIDAD (BLOQUEADA POR KG)"
                      : "CANTIDAD"}
                  </label>

                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    min="0"
                    required={!isTipoEnKg(formData.tipo)}
                    className="no-spin"
                    disabled={isTipoEnKg(formData.tipo)}
                    style={{
                      backgroundColor: isTipoEnKg(formData.tipo) ? "#e9ecef" : "",
                      cursor: isTipoEnKg(formData.tipo)
                        ? "not-allowed"
                        : "text",
                    }}
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

                  <Select
                    className="pp-select-react"
                    placeholder="Buscar tara..."
                    isClearable
                    options={tares.map((t) => ({
                      value: t.id,
                      label: `${t.nombre} (${t.peso} kg)`,
                      peso: t.peso,
                    }))}
                    value={
                      taraSeleccionadaId
                        ? tares
                            .map((t) => ({
                              value: t.id,
                              label: `${t.nombre} (${t.peso} kg)`,
                              peso: t.peso,
                            }))
                            .find(
                              (opt) =>
                                String(opt.value) ===
                                String(taraSeleccionadaId)
                            ) || null
                        : null
                    }
                    onChange={(selected) => {
                      setTaraSeleccionadaId(selected ? selected.value : "");

                      setFormData((prev) => ({
                        ...prev,
                        tara: selected ? Number(selected.peso || 0) : 0,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label>PESO NETO</label>

                  <input
                    type="number"
                    value={(
                      Number(formData.pesoBruto || 0) - Number(formData.tara || 0)
                    ).toFixed(2)}
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
                    <div>
                      {(
                        Number(corte.pesoBruto || 0) - Number(corte.tara || 0)
                      ).toFixed(2)}
                    </div>
                    <div>{Number(corte.promedio || 0).toFixed(2)}</div>
                    <div>
                      <button
                        className="pp-btn-eliminar"
                        onClick={() => eliminarCorte(index)}
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pp-total-peso">
                <strong>Total Peso Neto:</strong>{" "}
                {cortesAgregados
                  .reduce(
                    (acc, item) =>
                      acc + (Number(item.pesoBruto || 0) - Number(item.tara || 0)),
                    0
                  )
                  .toFixed(2)}{" "}
                kg
              </div>

              {!isEdit && comprobantesAgregados.length === 0 && (
                  <button
                    type="button"
                    className="pp-btn-agregar"
                    style={{ marginBottom: 10 }}
                    onClick={() => {
                      setMostrarSeccionComprobantes(true);

                      setTimeout(() => {
                        comprobantesSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 50);
                    }}
                  >
                    Ir a comprobantes
                  </button>
                )}

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