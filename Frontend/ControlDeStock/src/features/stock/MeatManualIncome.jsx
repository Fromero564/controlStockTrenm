import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import EditMeatBillModal from "../../components/EditMeatBillContent.jsx";
import "../../assets/styles/meatmanualincome.css";

const MeatManualIncome = () => {
  const navigate = useNavigate();
  const SinClearIndicator = (props) => null;
  const API_URL = import.meta.env.VITE_API_URL;
  const { remitoId } = useParams();
  const [cantidad, setCantidad] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lista base de productos (ya procesados con id, nombre, categoría)
  const [productos, setProductos] = useState([]);

  const [saving, setSaving] = useState(false);
  const [cortesAgregados, setCortesAgregados] = useState([]);
  const [tares, setTares] = useState([]);
const [tabActiva, setTabActiva] = useState("detallado");
  const [paginaActual, setPaginaActual] = useState(1);
  const [taraSeleccionadaId, setTaraSeleccionadaId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [taraSeleccionadaIdCongelado, setTaraSeleccionadaIdCongelado] =
    useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [congeladosAgregados, setCongeladosAgregados] = useState([]);
  const [paginaActualCongelados, setPaginaActualCongelados] = useState(1);
  const [formCongelado, setFormCongelado] = useState({
    tipo: "",
    lote: "",
    cantidad: 0,
    pesoProveedor: 0,
    pesoBruto: 0,
    tara: 0,
    product_cod: "",
    product_category: "",
    unique_code: "",
  });

  const [formData, setFormData] = useState({
    tipo: "",
    cabeza: 0,
    cantidad: 0,
    pesoProveedor: 0,
    pesoBruto: 0,
    tara: 0,
    garron: "",
    observaciones: "",
    observacionId: null,
    mermaPorcentaje: 0,
  });

  const congeladosInvertidos = [...congeladosAgregados].reverse();
  const congeladosPorPagina = 5;
  const indiceUltimoCongelado = paginaActualCongelados * congeladosPorPagina;
  const indicePrimerCongelado = indiceUltimoCongelado - congeladosPorPagina;
  const congeladosPaginados = congeladosInvertidos.slice(
    indicePrimerCongelado,
    indiceUltimoCongelado
  );

  const handleChangeCongelado = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);
    setFormCongelado((prev) => ({
      ...prev,
      [name]: ["tipo", "lote"].includes(name)
        ? value
        : isNaN(numericValue)
        ? ""
        : Math.abs(numericValue),
    }));
  };

  const agregarCongelado = () => {
    const { tipo, lote, cantidad, pesoBruto, tara } = formCongelado;

    if (!tipo || !lote || cantidad === "" || pesoBruto === "" || tara === "") {
      alert("Complete todos los campos del congelado.");
      return;
    }

    const nuevo = {
      ...formCongelado,
            unique_code: formCongelado.unique_code || buildUniqueCode(),
      tempId: crypto.randomUUID(),
      pesoNeto: formCongelado.pesoBruto - formCongelado.tara,
      remitoId,
      product_portion: formCongelado.lote,
      product_cod: formCongelado.product_cod || "",
      product_category: formCongelado.product_category || "",
      cod: formCongelado.product_cod || "",
      categoria: formCongelado.product_category || "",
      decrease:
        formCongelado.pesoProveedor > 0
          ? ((formCongelado.pesoProveedor -
              (formCongelado.pesoBruto - formCongelado.tara)) /
              formCongelado.pesoProveedor) *
            100
          : 0,
    };

    setCongeladosAgregados((prev) => [...prev, nuevo]);

    setFormCongelado({
      tipo: "",
      lote: "",
      cantidad: 0,
      pesoProveedor: 0,
      pesoBruto: 0,
      tara: 0,
      product_cod: "",
      product_category: "",
      unique_code: "",
    });
  };

  useEffect(() => {
    const fetchCongelados = async () => {
      if (!data?.id) return;

      try {
        const response = await fetch(
          `${API_URL}/getOtherProductsFromRemito/${data.id}`
        );
        if (!response.ok) throw new Error("Error al obtener congelados.");

        const result = await response.json();
        console.log("Congelados del remito:", result.productos);

        const congeladosFormateados = result.productos.map((item) => ({
          id: item.id,
          tipo: item.product_name,
          lote: item.product_portion,
          cantidad: parseFloat(item.product_quantity) || 0,
          pesoNeto: parseFloat(item.product_net_weight) || 0,
          pesoBruto: parseFloat(item.product_gross_weight) || 0,
                    tara: parseFloat(item.product_tare ?? item.tare ?? item.tara ?? 0) || 0,
          tara_id: item.tara_id ?? null,
          unique_code: item.unique_code ?? item.uniqueCode ?? "",
          decrease: parseFloat(item.decrease) || 0,
        }));

        setCongeladosAgregados(congeladosFormateados);

        if (congeladosFormateados.length > 0) {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Error al obtener congelados:", err);
      }
    };

    fetchCongelados();
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/find-remit/${remitoId}`);
        if (!response.ok) throw new Error("Error en la solicitud");

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [remitoId]);

  useEffect(() => {
    const fetchCortesYaCargados = async () => {
      if (!data?.id) return;

      try {
        const response = await fetch(
          `${API_URL}/getProductsFromRemito/${data.id}`
        );
        if (!response.ok)
          throw new Error("No se pudieron obtener los cortes ya cargados");

        const result = await response.json();

        const mapearCorteDesdeBackend = (item) => ({
          id: item.id,
          tipo: item.products_name || "",
          cabeza: item.product_head ?? 0,
          cantidad: parseFloat(item.products_quantity) || 0,
          pesoProveedor: parseFloat(item.provider_weight) || 0,
          pesoBruto: parseFloat(item.gross_weight) || 0,
          tara: parseFloat(item.tare) || 0,
          tara_id: item.tara_id ?? null,
          garron: item.products_garron || "",
          unique_code: item.unique_code ?? item.uniqueCode ?? "",
          aCamara: !!(item.aCamara ?? item.a_camara),
        
          pesoNeto:
            (parseFloat(item.gross_weight) || 0) -
            (parseFloat(item.tare) || 0),
        });
        const cortesFormateados =
          result.cortes?.map(mapearCorteDesdeBackend) || [];
        setCortesAgregados(cortesFormateados);

        if (cortesFormateados.length > 0) {
          setIsEditing(true);
        }

        if (result.observacion) {
          setFormData((prev) => ({
            ...prev,
            observaciones: result.observacion.texto,
            observacionId: result.observacion.id,
          }));
        }
      } catch (err) {
        console.error("Error al obtener cortes ya cargados:", err);
      }
    };

    fetchCortesYaCargados();
  }, [data]);
  useEffect(() => {
    const pesoNeto = formData.pesoBruto - formData.tara;
    const mermaPorcentaje =
      formData.pesoProveedor > 0
        ? ((pesoNeto - formData.pesoProveedor) / formData.pesoProveedor) * 100
        : 0;

    setFormData((prev) => ({
      ...prev,
      mermaPorcentaje: Number(mermaPorcentaje.toFixed(2)),
    }));
  }, [formData.pesoProveedor, formData.pesoBruto, formData.tara]);

  // Normalizar categoría (sin acentos, minúsculas)
  const normalizarCategoria = (txt) =>
    (txt || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const esCongeladoOuOtro = (cat) => {
    const c = normalizarCategoria(cat);
    return c.includes("congelado") || c.includes("otro");
  };

  // Cargar productos desde API y preparar lista base
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/product-name`);
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();

        const productosProcesados = (Array.isArray(data) ? data : [])
          .filter((p) =>
            ["externo", "ambos"].includes(
              (p.product_general_category || "").toLowerCase()
            )
          )
          .map((p) => ({
            value: p.product_name,
            label: p.product_name,
            id: p.id,
            categoria: p.category?.category_name || "",
          }));

        setProductos(productosProcesados);
      } catch (err) {
        console.error("Error productos:", err);
      }
    };

    fetchProductos();
  }, [API_URL]);

  // Opciones para select de cortes (NORMALES: excluye congelados/otros)
  const opcionesProductosCortes = productos.filter(
    (p) => !esCongeladoOuOtro(p.categoria)
  );

  // Opciones para select de congelados/otros (solo esas categorías)
  const opcionesProductosCongelados = productos.filter((p) =>
    esCongeladoOuOtro(p.categoria)
  );

  useEffect(() => {
    const fetchCantidad = async () => {
      try {
        const response = await fetch(`${API_URL}/allProducts`);
        const allData = await response.json();

        console.log("Data del remito:", data);
        console.log("Productos recibidos:", allData);

        const cortesDelRemito = allData.filter(
          (item) => item.id === data?.id
        );
        console.log("Filtrados por remito:", cortesDelRemito);

        const cantidadTotal = cortesDelRemito.reduce(
          (acc, item) => acc + Number(item.quantity || 0),
          0
        );
        console.log("Cantidad total:", cantidadTotal);

        setCantidad(cantidadTotal);
      } catch (err) {
        console.error("Error al obtener cantidad:", err);
      }
    };

    if (data?.id) {
      fetchCantidad();
    }
  }, [data]);

  useEffect(() => {
    const fetchTares = async () => {
      try {
        const response = await fetch(`${API_URL}/allTares`);
        if (!response.ok) throw new Error("Error al cargar todas las taras");

        const data = await response.json();
        const tarasConIndex = data.map((item) => ({
          id: item.id,
          nombre: item.tare_name,
          peso: item.tare_weight,
        }));
        setTares(tarasConIndex);
      } catch (err) {
        console.error("Error al obtener las taras:", err);
        setError("Error al cargar las taras");
      } finally {
        setLoading(false);
      }
    };

    fetchTares();
  }, []);

  // ✅ Cuando llegan las taras, si los items vienen con el peso de tara (tare) pero sin tara_id,
  //    “calzamos” el select buscando por el peso.
  useEffect(() => {
    if (!tares || tares.length === 0) return;

    const findTaraIdByPeso = (peso) => {
      const p = Number(peso || 0);
      if (!p) return null;
      const found = tares.find((t) => Number(t.peso) === p);
      return found ? found.id : null;
    };

    setCortesAgregados((prev) =>
      prev.map((c) =>
        c.tara_id ? c : { ...c, tara_id: findTaraIdByPeso(c.tara) }
      )
    );

    setCongeladosAgregados((prev) =>
      prev.map((c) =>
        c.tara_id ? c : { ...c, tara_id: findTaraIdByPeso(c.tara) }
      )
    );
  }, [tares]);


  const abrirModalEdicion = () => {
    setModalOpen(true);
  };

  const crearObservacionNueva = async (remitoId, texto) => {
    try {
      const response = await fetch(`${API_URL}/observations-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remitoId,
          observation: texto,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear la observación");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al crear observación:", error);
      throw error;
    }
  };

  const actualizarObservacion = async (observacionId, nuevoTexto) => {
    try {
      const response = await fetch(
        `${API_URL}/observations-edit/${observacionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ observation: nuevoTexto }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar la observación");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al actualizar observación:", error);
      throw error;
    }
  };

  const handleGuardarObservacion = async () => {
    const texto = formData.observaciones?.trim() ?? "";

    try {
      if (formData.observacionId) {
        const resultado = await actualizarObservacion(
          formData.observacionId,
          texto
        );
        console.log("Observación actualizada:", resultado);
      } else {
        const resultado = await crearObservacionNueva(data.id, texto);
        console.log("Observación creada:", resultado);

        setFormData((prev) => ({
          ...prev,
          observacionId: resultado.id,
        }));
      }

      alert("Observación guardada correctamente");
    } catch (error) {
      console.error("Error al guardar la observación:", error);
      alert("Error al guardar la observación. Por favor, intente nuevamente.");
    }
  };

  const handleGuardar = async () => {
    setSaving(true);

    try {
      console.log("Guardando observación...");
      await handleGuardarObservacion();
      console.log("Observación guardada correctamente.");

      const pesoTotalCortes = cortesAgregados.reduce(
        (acc, item) => acc + (item.pesoNeto || 0),
        0
      );
      const pesoTotalCongelados = congeladosAgregados.reduce(
        (acc, item) => acc + (item.pesoNeto || 0),
        0
      );
      const pesoTotalCombinado = pesoTotalCortes + pesoTotalCongelados;

      const updatePayload = {
        cantidad_animales_cargados: totalAnimalesCargados,
        cantidad_cabezas_cargadas: totalCabezasCargadas,
        peso_total_neto_cargado: pesoTotalCombinado,
        fresh_quantity: totalQuantityCongelados,
        fresh_weight: totalWeightCongelados,
      };

      if (cortesAgregados.length > 0) {
        const payloadCortes = {
          cortes: cortesAgregados,
        };

        if (isEditing) {
          console.log("Editando cortes...");
          const response = await fetch(
            `${API_URL}/meat-income-edit/${data.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payloadCortes),
            }
          );

          if (!response.ok) {
            const err = await response.text();
            console.error("Error al editar los cortes:", err);
            throw new Error("Error al editar los cortes");
          }
          console.log("Cortes editados correctamente.");
        } else {
          console.log("Guardando cortes nuevos...");
          const response = await fetch(
            `${API_URL}/addProducts/${data.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payloadCortes),
            }
          );

          if (!response.ok) {
            const err = await response.text();
            console.error("Error al guardar cortes nuevos:", err);
            throw new Error("Error al guardar los cortes");
          }
          console.log("Cortes nuevos guardados correctamente.");
        }
      } else {
        console.log("No hay cortes para guardar.");
      }

      if (congeladosAgregados.length > 0) {
        const payloadCongelados = congeladosAgregados.map((item) => ({
          product_portion: item.product_portion || item.lote || "",
          product_name: item.tipo,
          product_quantity: item.cantidad,
          product_net_weight: item.pesoNeto,
          product_gross_weight: item.pesoBruto,
          decrease: item.decrease || 0,
          id_bill_suppliers: data.id,
          product_cod: item.cod || null,
          product_category: item.categoria || null,
          unique_code: item.unique_code || item.uniqueCode || null,
        }));

        console.log("Productos que se envian:", payloadCongelados);

        const endpoint = isEditing
          ? `${API_URL}/editOtherProductsManual/${data.id}`
          : `${API_URL}/addOtherProductsManual`;

        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ congelados: payloadCongelados }),
        });

        if (!response.ok) {
          const err = await response.text();
          console.error("Error al guardar congelados:", err);
          throw new Error("Error al guardar congelados");
        }

        console.log("Congelados guardados correctamente.");
      } else {
        console.log("No hay congelados para guardar.");
      }

      console.log("Actualizando resumen...");
      const updateResponse = await fetch(
        `${API_URL}/updateBillSupplier/${data.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateResponse.ok) {
        const err = await updateResponse.text();
        console.error("Error al actualizar el remito:", err);
        throw new Error("Error al actualizar el remito");
      }
      console.log("Resumen actualizado correctamente.");

      alert("Datos guardados correctamente.");
      setCortesAgregados([]);
      setCongeladosAgregados([]);
      navigate("/operator-panel");
    } catch (err) {
      console.error("Error al guardar los datos:", err);
      alert("Ocurrió un error al guardar los datos.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["tipo", "observaciones", "garron"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      const numericValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numericValue) ? "" : Math.abs(numericValue),
      }));
    }
  };



const getRowKey = (row) => row.id ?? row.tempId;

const calcPesoNeto = (pesoBruto, tara) =>
  (Number(pesoBruto) || 0) - (Number(tara) || 0);

const calcDecrease = (pesoProveedor, pesoNeto) =>
  Number(pesoProveedor) > 0
    ? ((Number(pesoProveedor) - Number(pesoNeto)) / Number(pesoProveedor)) * 100
    : 0;

const updateCorteField = (row, field, value) => {
  const key = getRowKey(row);

  setCortesAgregados((prev) =>
    prev.map((c) => {
      if (getRowKey(c) !== key) return c;

      const next = { ...c, [field]: value };

      if (["pesoBruto", "tara"].includes(field)) {
        next.pesoNeto = calcPesoNeto(next.pesoBruto, next.tara);
      }

      return next;
    })
  );
};

const updateCongeladoField = (row, field, value) => {
  const key = getRowKey(row);

  setCongeladosAgregados((prev) =>
    prev.map((p) => {
      if (getRowKey(p) !== key) return p;

      const next = { ...p, [field]: value };

      if (["pesoBruto", "tara"].includes(field)) {
        next.pesoNeto = calcPesoNeto(next.pesoBruto, next.tara);
      }

      if (["pesoProveedor", "pesoBruto", "tara"].includes(field)) {
        next.decrease = calcDecrease(next.pesoProveedor, next.pesoNeto);
      }

      return next;
    })
  );
};

  const agregarCorte = () => {
    if (
      !formData.tipo ||
      formData.cabeza === "" ||
      formData.cantidad === "" ||
      formData.pesoBruto === "" ||
      formData.tara === "" ||
      formData.garron === ""
    ) {
      alert("Por favor, complete todos los campos antes de agregar.");
      return;
    }

  const nuevoCorte = {
  ...formData,
  tempId: crypto.randomUUID(), // ✅ AGREGAR ESTA LINEA
  unique_code: formData.unique_code || buildUniqueCode(),
  pesoNeto: formData.pesoBruto - formData.tara,
  remitoId,
  cod: formData.product_cod || "",
  categoria: formData.product_category || "",
    aCamara: false,
};

    const nuevosCortes = [...cortesAgregados, nuevoCorte];

    setCortesAgregados(nuevosCortes);

    setFormData((prev) => ({
      ...prev,
      tipo: "",
      cabeza: 0,
      cantidad: 0,
      pesoProveedor: 0,
      pesoBruto: 0,
      tara: 0,
      garron: "",
      product_cod: "",
      product_category: "",
    }));

    setTaraSeleccionadaId("");
  };
const eliminarCorte = async (corte) => {
  const confirm = await Swal.fire({
    title: "¿Eliminar corte?",
    text: "Esta acción eliminará el corte y actualizará el stock.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  try {
    // Si ya existe en BD, borra en backend
    if (corte.id) {
      const res = await fetch(`${API_URL}/provider-item-delete/${corte.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo eliminar el corte de la base de datos.");
      }
    }

    // Siempre borra del estado local por id o tempId
    setCortesAgregados((prev) =>
      prev.filter((c) =>
        corte.id ? c.id !== corte.id : c.tempId !== corte.tempId
      )
    );

    Swal.fire("Eliminado", "Corte eliminado con éxito.", "success");
  } catch (err) {
    console.error("Error al eliminar:", err);
    Swal.fire("Error", err.message, "error");
  }
};

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR");
  };

  // --- Unique code helpers (para meat_manual_income) ---
  const pad4 = (v) => String(v ?? "").padStart(4, "0");
  const fmtYYYYMMDD = (dateLike) => {
    const d = new Date(dateLike ?? Date.now());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  };

  const getNextSeqFromCodes = (prefix, items) => {
    const extract = (code) => {
      if (!code || typeof code !== "string") return null;
      if (!code.startsWith(prefix)) return null;
      const last = code.split("-").pop();
      const n = parseInt(last, 10);
      return Number.isFinite(n) ? n : null;
    };

    const max = Math.max(
      0,
      ...(items || [])
        .map((it) => extract(it?.unique_code))
        .filter((n) => n !== null)
    );
    return max + 1;
  };

  const buildUniqueCode = () => {
    const internal = data?.internal_number ?? data?.id_bill_suppliers ?? data?.id ?? billSupplierId;
    const datePart = fmtYYYYMMDD(data?.createdAt ?? data?.updatedAt ?? Date.now());
    const prefix = `${pad4(internal)}-${datePart}-`;
    const next = getNextSeqFromCodes(prefix, [...cortesAgregados, ...congeladosAgregados]);
    return `${prefix}${String(next).padStart(3, "0")}`;
  };


  const sinFlecha = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
  };

  const totalKgNeto =
    cortesAgregados.reduce(
      (acc, item) => acc + (Number(item.pesoNeto) || 0),
      0
    ) +
    congeladosAgregados.reduce(
      (acc, item) => acc + (Number(item.pesoNeto) || 0),
      0
    );

  const pesoTotalRomaneo = data?.total_weight ?? 0;

  const diferenciaPeso = totalKgNeto - pesoTotalRomaneo;

  const porcentajeDiferencia =
    pesoTotalRomaneo > 0 ? (diferenciaPeso / pesoTotalRomaneo) * 100 : 0;

  let colorDiferencia = "blue";
  if (porcentajeDiferencia < 0) colorDiferencia = "red";
  else if (porcentajeDiferencia > 0) colorDiferencia = "green";

  const totalAnimalesCargados = cortesAgregados.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const totalCabezasCargadas = cortesAgregados.reduce(
    (acc, item) => acc + item.cabeza,
    0
  );

  const cortesAgrupados = cortesAgregados.reduce((acc, corte) => {
    const key = corte.tipo;
    if (!acc[key]) {
      acc[key] = {
        tipo: key,
        cantidad: 0,
        cabezas: 0,
        pesoNeto: 0,
        pesoProveedor: 0,
      };
    }

    acc[key].cantidad += corte.cantidad;
    acc[key].cabezas += corte.cabeza;
    acc[key].pesoNeto += corte.pesoNeto;
    acc[key].pesoProveedor += corte.pesoProveedor || 0;

    return acc;
  }, {});

  const cortesPorPagina = 5;
  const cortesInvertidos = [...cortesAgregados].reverse();
  const indiceUltimoCorte = paginaActual * cortesPorPagina;
  const indicePrimerCorte = indiceUltimoCorte - cortesPorPagina;
  const cortesPaginados = cortesInvertidos.slice(
    indicePrimerCorte,
    indiceUltimoCorte
  );

  const handleModalClose = () => {
    setModalOpen(false);
    handleActualizarDesdeMemoria();
  };

useEffect(() => {
  if (cortesAgregados.length > 0) {
    localStorage.setItem(
      "cortes_en_edicion",
      JSON.stringify(cortesAgregados)
    );
  } else {
    localStorage.removeItem("cortes_en_edicion");
  }
}, [cortesAgregados]);


const eliminarCongelado = async (producto) => {
  const confirmar = await Swal.fire({
    title: "¿Eliminar producto?",
    text: "Esta acción eliminará el producto congelado/otro.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmar.isConfirmed) return;

  try {
    if (producto.id) {
      const response = await fetch(
        `${API_URL}/other-product-delete/${producto.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "No se pudo eliminar el producto congelado.");
      }
    }

    setCongeladosAgregados((prev) =>
      prev.filter((p) =>
        producto.id ? p.id !== producto.id : p.tempId !== producto.tempId
      )
    );

    Swal.fire("Eliminado", "El producto fue eliminado correctamente.", "success");
  } catch (error) {
    console.error("Error al eliminar congelado:", error);
    Swal.fire("Error", error.message || "No se pudo eliminar el producto.", "error");
  }
};


  const totalQuantityCongelados = congeladosAgregados.reduce(
    (acc, item) => acc + Number(item.cantidad || 0),
    0
  );

  const totalWeightCongelados = congeladosAgregados.reduce(
    (acc, item) => acc + Number(item.pesoNeto || 0),
    0
  );

  const mermaCantidadCongelados =
    data?.fresh_quantity > 0
      ? ((data.fresh_quantity - totalQuantityCongelados) /
          data.fresh_quantity) *
        100
      : 0;

  const mermaPesoCongelados =
    data?.fresh_weight > 0
      ? ((data.fresh_weight - totalWeightCongelados) / data.fresh_weight) * 100
      : 0;

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No se encontró el remito</p>;

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <h1 className="title-mercaderia">Detalle Mercadería</h1>
      <div className="main-container">
        <div>
          <div>
            <div className="mercaderia-container">
              <div className="edit-icon-container">
                <FontAwesomeIcon
                  icon={faPen}
                  onClick={abrirModalEdicion}
                  className="edit-icon"
                  title="Editar"
                />
              </div>
              <div className="mercaderia-info-row">
                <div>
                  <p className="label">PROVEEDOR:</p>
                  <p>{data.supplier.toUpperCase()}</p>
                </div>
                <div>
                  <p className="label">TIPO DE INGRESO:</p>
                  <p>{data.income_state.toUpperCase()}</p>
                </div>
                <div>
                  <p className="label">HORARIO Y FECHA:</p>
                  <p>
                    {formatTime(data.createdAt)} {formatDate(data.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="label">N° COMPROBANTE ROMANEO:</p>
                  <p>{data.romaneo_number}</p>
                </div>
              </div>
              <div className="mercaderia-info-row">
                <div>
                  <p className="label">PESO TOTAL DECLARADO EN ROMANEO:</p>
                  <p>{data.total_weight} KG</p>
                </div>
                <div>
                  <p className="label">CANTIDAD CABEZAS:</p>
                  <p>{data.head_quantity}</p>
                </div>
                <div>
                  <p className="label">CANTIDAD ANIMALES:</p>
                  <p>{cantidad !== null ? cantidad : "..."}</p>
                </div>
                <div>
                  <p className="label">COMPROBANTE INTERNO:</p>
                  <p>{data.id}</p>
                </div>
              </div>
            </div>
          </div>
          <EditMeatBillModal
            isOpen={modalOpen}
            onClose={handleModalClose}
            id={data.id}
            onUpdate={(updatedData) => {
              setData((prevData) => ({
                ...prevData,
                supplier: updatedData.proveedor,
                total_weight: updatedData.pesoTotal,
                romaneo_number: updatedData.romaneo,
                head_quantity: updatedData.cabezas,
                cantidad: updatedData.cantidad,
                income_state: updatedData.tipoIngreso,
              }));
            }}
          />
        </div>

        {/* FORM CORTES NORMALES */}
        <div className="formulario-corte">
          <div className="form-group">
            <div>
              <label>TIPO</label>
              <Select
                className="custom-select"
                classNamePrefix="mi-select"
                options={opcionesProductosCortes}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    tipo: selected?.value || "",
                    product_cod: selected?.id || "",
                    product_category: selected?.categoria || "",
                  }));
                }}
                value={
                  opcionesProductosCortes.find(
                    (o) => o.value === formData.tipo
                  ) || null
                }
                placeholder=""
                isClearable
                components={{
                  ...sinFlecha,
                  ClearIndicator: SinClearIndicator,
                }}
                menuPortalTarget={document.body}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    height: "38px",
                    minHeight: "38px",
                    borderColor: state.isFocused ? "#2684FF" : "#ccc",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#2684FF",
                    },
                  }),
                  input: (base) => ({
                    ...base,
                    margin: "0px",
                    padding: 0,
                    lineHeight: "normal",
                    height: "auto",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: "38px",
                    padding: "8px 0 8px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    width: "100%",
                    textAlign: "center",
                    margin: 0,
                  }),
                  placeholder: (base) => ({
                    ...base,
                    width: "100%",
                    textAlign: "center",
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "38px",
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: 150,
                    overflowY: "auto",
                  }),
                }}
              />
            </div>

            <div>
              <label>GARRON</label>
              <input
                type="text"
                name="garron"
                value={formData.garron}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>CABEZA</label>
              <input
                type="number"
                name="cabeza"
                min="0"
                max="1"
                value={formData.cabeza}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>CANTIDAD</label>
              <input
                type="number"
                name="cantidad"
                min="0"
                max="1"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>PESO DE ETIQUETA </label>
              <input
                type="number"
                name="pesoProveedor"
                min="0"
                value={formData.pesoProveedor}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>PESO BRUTO BALANZA </label>
              <input
                type="number"
                name="pesoBruto"
                min="0"
                value={formData.pesoBruto}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>TARA</label>
              <select
                name="tara"
                value={taraSeleccionadaId}
                onChange={(e) => {
                  const selected = tares.find(
                    (t) => t.id === parseInt(e.target.value)
                  );
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
          </div>

          <button type="button" className="btn-agregar" onClick={agregarCorte}>
            Agregar pieza +
          </button>

          <div className="cortes-lista">
            {cortesPaginados.map((corte) => (
  <div key={corte.id ?? corte.tempId} className="corte-mostrado">
    <div style={{ minWidth: 180 }}>
      <Select
        className="custom-select"
        classNamePrefix="mi-select"
        options={opcionesProductosCortes}
        value={
          opcionesProductosCortes.find((o) => o.value === corte.tipo) ||
          null
        }
        onChange={(selected) => {
          updateCorteField(corte, "tipo", selected?.value || "");
          updateCorteField(corte, "product_cod", selected?.id || "");
          updateCorteField(corte, "product_category", selected?.categoria || "");
          updateCorteField(corte, "cod", selected?.id || "");
          updateCorteField(corte, "categoria", selected?.categoria || "");
        }}
        placeholder=""
        isClearable={false}
        components={{
          ...sinFlecha,
          ClearIndicator: SinClearIndicator,
        }}
        menuPortalTarget={document.body}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "32px",
            height: "32px",
          }),
          valueContainer: (base) => ({
            ...base,
            height: "32px",
            padding: "0 6px",
          }),
          indicatorsContainer: (base) => ({
            ...base,
            height: "32px",
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>

    <div>
      <input
        className="dato"
        type="text"
        value={corte.garron ?? ""}
        onChange={(e) => updateCorteField(corte, "garron", e.target.value)}      />
    </div>
    <div>
      <input
        className="dato dato-unique"
        type="text"
        value={corte.unique_code ?? ""}
        readOnly
        title="Código único"
      />
    </div>

    <div>
      <input
        className="dato"
        type="number"
        min="0"
        max="1"
        value={Number(corte.cabeza ?? 0)}
        onChange={(e) =>
          updateCorteField(
            corte,
            "cabeza",
            Math.abs(parseFloat(e.target.value || 0))
          )
        }      />
    </div>

    <div>
      <input
        className="dato"
        type="number"
        min="0"
        max="1"
        value={Number(corte.cantidad ?? 0)}
        onChange={(e) =>
          updateCorteField(
            corte,
            "cantidad",
            Math.abs(parseFloat(e.target.value || 0))
          )
        }      />
    </div>

    <div>
      <input
        className="dato"
        type="number"
        min="0"
        value={Number(corte.pesoProveedor ?? 0)}
        onChange={(e) =>
          updateCorteField(
            corte,
            "pesoProveedor",
            Math.abs(parseFloat(e.target.value || 0))
          )
        }      />
    </div>

    <div>
      <input
        className="dato"
        type="number"
        min="0"
        value={Number(corte.pesoBruto ?? 0)}
        onChange={(e) =>
          updateCorteField(
            corte,
            "pesoBruto",
            Math.abs(parseFloat(e.target.value || 0))
          )
        }      />
    </div>

    <div>
      <select
        className="dato"
        value={corte.tara_id ?? ""}
        onChange={(e) => {
          const taraId = e.target.value ? parseInt(e.target.value) : null;
          const selected = tares.find((t) => t.id === taraId);
          updateCorteField(corte, "tara_id", taraId);
          updateCorteField(corte, "tara", Number(selected?.peso || 0));
        }}      >
        <option value="">Seleccionar</option>
        {tares.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre} ({t.peso} kg)
          </option>
        ))}
      </select>
    </div>

    <p className="dato">{(Number(corte.pesoNeto) || 0).toFixed(2)} kg</p>

    <div>
<label className="camara-check__label">
        <input
          type="checkbox"
          checked={!!corte.aCamara}
          onChange={(e) => {
            const checked = e.target.checked;
            setCortesAgregados((prev) => {
              const idx = prev.indexOf(corte);
              if (idx === -1) return prev;
              const copy = [...prev];
              copy[idx] = { ...copy[idx], aCamara: checked };
              return copy;
            });
          }}
        />
        <span>A cámara</span>
      </label>

      <button type="button" onClick={() => eliminarCorte(corte)} className="btn-eliminar">
        X
      </button>
    </div>
  </div>
))}
<div className="pagination-buttons">
              <button className="btn-pagination secondary"
                onClick={() =>
                  setPaginaActual((prev) => Math.max(prev - 1, 1))
                }
                disabled={paginaActual === 1}              >
                Anterior
              </button>
              <button className="btn-pagination"
                onClick={() =>
                  setPaginaActual((prev) =>
                    prev * cortesPorPagina < cortesAgregados.length
                      ? prev + 1
                      : prev
                  )
                }
                disabled={
                  paginaActual * cortesPorPagina >=
                  cortesAgregados.length
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {/* FORM CONGELADOS / OTROS */}
        <div className="formulario-corte">
          <h2>Productos Congelados / Otros</h2>
          <div className="form-group">
            <div>
              <label>TIPO</label>
              <Select
                className="custom-select"
                classNamePrefix="mi-select"
                options={opcionesProductosCongelados}
                onChange={(selected) => {
                  setFormCongelado((prev) => ({
                    ...prev,
                    tipo: selected?.value || "",
                    product_cod: selected?.id || "",
                    product_category: selected?.categoria || "",
                  }));
                }}
                value={
                  opcionesProductosCongelados.find(
                    (o) => o.value === formCongelado.tipo
                  ) || null
                }
                placeholder=""
                isClearable
                components={{
                  ...sinFlecha,
                  ClearIndicator: SinClearIndicator,
                }}
                menuPortalTarget={document.body}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    height: "38px",
                    minHeight: "38px",
                    borderColor: state.isFocused ? "#2684FF" : "#ccc",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#2684FF",
                    },
                  }),
                  input: (base) => ({
                    ...base,
                    margin: "0px",
                    padding: 0,
                    lineHeight: "normal",
                    height: "auto",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: "38px",
                    padding: "8px 0 8px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    width: "100%",
                    textAlign: "center",
                    margin: 0,
                  }),
                  placeholder: (base) => ({
                    ...base,
                    width: "100%",
                    textAlign: "center",
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "38px",
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: 150,
                    overflowY: "auto",
                  }),
                }}
              />
            </div>

            <div>
              <label>LOTE</label>
              <input
                type="text"
                name="lote"
                value={formCongelado.lote}
                onChange={handleChangeCongelado}
              />
            </div>

            <div>
              <label>CANTIDAD</label>
              <input
                type="number"
                name="cantidad"
                value={formCongelado.cantidad}
                onChange={handleChangeCongelado}
              />
            </div>

            <div>
              <label>PESO DE ETIQUETA</label>
              <input
                type="number"
                name="pesoProveedor"
                value={formCongelado.pesoProveedor}
                onChange={handleChangeCongelado}
              />
            </div>

            <div>
              <label>PESO BRUTO</label>
              <input
                type="number"
                name="pesoBruto"
                value={formCongelado.pesoBruto}
                onChange={handleChangeCongelado}
              />
            </div>

            <div>
              <label>TARA</label>
              <select
                name="tara"
                value={taraSeleccionadaIdCongelado}
                onChange={(e) => {
                  const selected = tares.find(
                    (t) => t.id === parseInt(e.target.value)
                  );
                  setTaraSeleccionadaIdCongelado(e.target.value);
                  setFormCongelado((prev) => ({
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
          </div>

          <button className="btn-agregar" onClick={agregarCongelado}>
            Agregar congelado +
          </button>

          <div className="cortes-lista">
            {congeladosPaginados.map((item) => (
  <div key={item.id ?? item.tempId} className="corte-mostrado">
    <div style={{ minWidth: 180 }}>
      <Select
        className="custom-select"
        classNamePrefix="mi-select"
        options={opcionesProductosCongelados}
        value={
          opcionesProductosCongelados.find(
            (o) => o.value === (item.product_name || item.tipo)
          ) || null
        }
        onChange={(selected) => {
          const nombre = selected?.value || "";
          updateCongeladoField(item, "tipo", nombre);
          updateCongeladoField(item, "product_name", nombre);
          updateCongeladoField(item, "product_cod", selected?.id || "");
          updateCongeladoField(item, "product_category", selected?.categoria || "");
          updateCongeladoField(item, "cod", selected?.id || "");
          updateCongeladoField(item, "categoria", selected?.categoria || "");
        }}
        placeholder=""
        isClearable={false}
        components={{
          ...sinFlecha,
          ClearIndicator: SinClearIndicator,
        }}
        menuPortalTarget={document.body}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "32px",
            height: "32px",
          }),
          valueContainer: (base) => ({
            ...base,
            height: "32px",
            padding: "0 6px",
          }),
          indicatorsContainer: (base) => ({
            ...base,
            height: "32px",
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>

    <div>
      <input
        className="dato"
        type="text"
        value={item.product_portion || item.lote || ""}
        onChange={(e) => {
          updateCongeladoField(item, "product_portion", e.target.value);
          updateCongeladoField(item, "lote", e.target.value);
        }}      />
    </div>

    <div>
      <input
        className="dato dato-unique"
        type="text"
        value={item.unique_code ?? item.uniqueCode ?? ""}
        readOnly
        title="Código único"
      />
    </div>

    <div>
      <input
        className="dato"
        type="number"
        min="0"
        value={Number(item.product_quantity ?? item.cantidad ?? 0)}
        onChange={(e) => {
          const v = Math.abs(parseFloat(e.target.value || 0));
          updateCongeladoField(item, "product_quantity", v);
          updateCongeladoField(item, "cantidad", v);
        }}      />
    </div>

    <div>
      <input
        className="dato"
        type="number"
        min="0"
        value={Number(item.pesoProveedor ?? 0)}
        onChange={(e) =>
          updateCongeladoField(
            item,
            "pesoProveedor",
            Math.abs(parseFloat(e.target.value || 0))
          )
        }      />
    </div>

    <div>
      <input
        className="dato"
        type="number"
        min="0"
        value={Number(item.product_gross_weight ?? item.pesoBruto ?? 0)}
        onChange={(e) => {
          const v = Math.abs(parseFloat(e.target.value || 0));
          updateCongeladoField(item, "product_gross_weight", v);
          updateCongeladoField(item, "pesoBruto", v);
        }}      />
    </div>

    <div>
      <select
        className="dato"
        value={item.tara_id ?? ""}
        onChange={(e) => {
          const taraId = e.target.value ? parseInt(e.target.value) : null;
          const selected = tares.find((t) => t.id === taraId);
          updateCongeladoField(item, "tara_id", taraId);
          updateCongeladoField(item, "tara", Number(selected?.peso || 0));
        }}      >
        <option value="">Seleccionar</option>
        {tares.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre} ({t.peso} kg)
          </option>
        ))}
      </select>
    </div>

    <div>
      <p className="dato">{(Number(item.pesoNeto) || 0).toFixed(2)}</p>
    </div>

    <div>
      <p
        className="dato"
        style={{
          color:
            (item.decrease ?? 0) > 0
              ? "orange"
              : (item.decrease ?? 0) < 0
              ? "green"
              : "inherit",
        }}
      >
        {(Number(item.decrease) || 0).toFixed(2)}%
      </p>
    </div>

    <div>
<button type="button" onClick={() => eliminarCongelado(item)} className="btn-eliminar">
        X
      </button>
    </div>
  </div>
))}
<div className="pagination-buttons">
              <button className="btn-pagination secondary"
                onClick={() =>
                  setPaginaActualCongelados((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={paginaActualCongelados === 1}              >
                Anterior
              </button>
              <button className="btn-pagination"
                onClick={() =>
                  setPaginaActualCongelados((prev) =>
                    prev * congeladosPorPagina <
                    congeladosAgregados.length
                      ? prev + 1
                      : prev
                  )
                }
                disabled={
                  paginaActualCongelados * congeladosPorPagina >=
                  congeladosAgregados.length
                }
              >
                Siguiente
              </button>
            </div>
          </div>

          <div className="info-weight-observations">
            <div className="resumen-buttons"
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <button
                onClick={() => setTabActiva("detallado")}
                style={{
                  backgroundColor:
                    tabActiva === "detallado" ? "#007bff" : "#e0e0e0",
                  color:
                    tabActiva === "detallado" ? "white" : "black",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Resumen detallado por pieza
              </button>
              <button
                onClick={() => setTabActiva("agrupado")}
                style={{
                  backgroundColor:
                    tabActiva === "agrupado" ? "#007bff" : "#e0e0e0",
                  color: tabActiva === "agrupado" ? "white" : "black",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Resumen agrupado por piezas
              </button>
</div>
            {tabActiva === "detallado" && (
              <div>
                <h3>RESUMEN</h3>
                <div className="table-wrapper">
                  <table className="stock-table">
                    <thead>
                      <tr>
                        <th>TIPO</th>
                        <th>NUMERO GARRON</th>
                        <th>CÓDIGO ÚNICO</th>
                        <th>PESO ETIQUETA</th>
                        <th>CANTIDAD</th>
                        <th>CABEZAS</th>
                        <th>KG NETO</th>
                        <th>MERMA (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cortesAgregados.map((corte, index) => {
                        const merma =
                          corte.pesoProveedor && corte.pesoNeto
                            ? ((corte.pesoNeto -
                                corte.pesoProveedor) /
                                corte.pesoProveedor) *
                              100
                            : 0;

                        return (
                          <tr key={index}>
                            <td>{corte.tipo}</td>
                            <td>{corte.garron}</td>
                            <td>{corte.unique_code || "-"}</td>
                            <td>{corte.pesoProveedor}</td>
                            <td>{corte.cantidad}</td>
                            <td>{corte.cabeza}</td>
                            <td>
                              {Number(corte.pesoNeto || 0).toFixed(2)}
                            </td>
                            <td
                              style={{
                                color:
                                  Number(merma) < 0 ? "red" : "green",
                              }}
                            >
                              {Number(merma || 0) > 0 ? "+" : ""}
                              {Number(merma || 0).toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td>
                          <strong>
                            Diferencia declarado en romaneo
                          </strong>
                        </td>
                        <td></td>
                        <td></td>
                        <td
                          style={{
                            color:
                              cantidad > totalAnimalesCargados
                                ? "red"
                                : "green",
                          }}
                        >
                          {cantidad - totalAnimalesCargados}{" "}
                          <span>
                            (
                            {cantidad > 0
                              ? (
                                  ((cantidad -
                                    totalAnimalesCargados) /
                                    cantidad) *
                                  100
                                ).toFixed(0)
                              : 0}
                            %)
                          </span>
                        </td>
                        <td
                          style={{
                            color:
                              data.head_quantity >
                              totalCabezasCargadas
                                ? "red"
                                : "green",
                          }}
                        >
                          {data.head_quantity - totalCabezasCargadas}{" "}
                          <span>
                            (
                            {(
                              ((data.head_quantity -
                                totalCabezasCargadas) /
                                data.head_quantity) *
                              100
                            ).toFixed(0)}
                            %)
                          </span>
                        </td>
                        <td
                          style={{
                            color:
                              diferenciaPeso < 0 ? "red" : "green",
                          }}
                        >
                          {diferenciaPeso.toFixed(2)}{" "}
                          <span>
                            ({porcentajeDiferencia > 0 ? "+" : ""}
                            {porcentajeDiferencia.toFixed(2)}%)
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tabActiva === "agrupado" && (
              <div>
                <h3 style={{ marginTop: "2rem" }}>
                  RESUMEN AGRUPADO POR PIEZA
                </h3>
                <div className="table-wrapper">
                  <table className="stock-table">
                    <thead>
                      <tr>
                        <th>TIPO</th>
                        <th>CANTIDAD</th>
                        <th>CABEZAS</th>
                        <th>KG NETO</th>
                        <th>MERMA (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(cortesAgrupados).map(
                        (corte, index) => {
                          const merma =
                            corte.pesoProveedor > 0
                              ? ((corte.pesoNeto -
                                  corte.pesoProveedor) /
                                  corte.pesoProveedor) *
                                100
                              : 0;

                          return (
                            <tr key={index}>
                              <td>{corte.tipo}</td>
                              <td>{corte.cantidad}</td>
                              <td>{corte.cabezas}</td>
                              <td>{corte.pesoNeto.toFixed(2)}</td>
                              <td
                                style={{
                                  color:
                                    merma < 0 ? "red" : "green",
                                }}
                              >
                                {merma > 0 ? "+" : ""}
                                {merma.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <h3>RESUMEN DE CONGELADOS / OTROS</h3>
            <div className="table-wrapper">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>LOTE</th>
                    <th>CANTIDAD</th>
                    <th>KG NETO</th>
                    <th>MERMA CANTIDAD (%)</th>
                    <th>MERMA PESO (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {congeladosAgregados.map((item, index) => {
                    const mermaCantidadItem =
                      data?.fresh_quantity > 0
                        ? ((data.fresh_quantity - item.cantidad) /
                            data.fresh_quantity) *
                          100
                        : 0;

                    const mermaPesoItem =
                      data?.fresh_weight > 0
                        ? ((data.fresh_weight - item.pesoNeto) /
                            data.fresh_weight) *
                          100
                        : 0;

                    return (
                      <tr key={index}>
                        <td>{item.lote}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.pesoNeto?.toFixed(2)}</td>
                        <td
                          style={{
                            color:
                              mermaCantidadItem > 0
                                ? "red"
                                : "green",
                          }}
                        >
                          {mermaCantidadItem > 0 ? "+" : ""}
                          {mermaCantidadItem.toFixed(2)}%
                        </td>
                        <td
                          style={{
                            color:
                              mermaPesoItem > 0 ? "red" : "green",
                          }}
                        >
                          {mermaPesoItem > 0 ? "+" : ""}
                          {mermaPesoItem.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}

                  <tr>
                    <td>
                      <strong>TOTALES</strong>
                    </td>
                    <td>{totalQuantityCongelados}</td>
                    <td>{totalWeightCongelados.toFixed(2)}</td>
                    <td
                      style={{
                        color:
                          mermaCantidadCongelados > 0
                            ? "red"
                            : "green",
                      }}
                    >
                      {mermaCantidadCongelados > 0 ? "+" : ""}
                      {mermaCantidadCongelados.toFixed(2)}%
                    </td>
                    <td
                      style={{
                        color:
                          mermaPesoCongelados > 0
                            ? "red"
                            : "green",
                      }}
                    >
                      {mermaPesoCongelados > 0 ? "+" : ""}
                      {mermaPesoCongelados.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <label
              htmlFor="observaciones"
              style={{ display: "block", marginTop: "1rem" }}
            >
              OBSERVACIONES
            </label>
            <textarea
              name="observaciones"
              placeholder="Observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              style={{
                width: "100%",
                minHeight: "80px",
                marginBottom: "1rem",
              }}
            ></textarea>

            <button
              className="btn-agregar"
              onClick={handleGuardar}
              style={{
                backgroundColor: "#0077b6",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
              }}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar y terminar carga"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeatManualIncome;
