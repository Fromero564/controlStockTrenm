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
  const [saving, setSaving] = useState(false);
  const [cortes, setCortes] = useState([]);
  const [cortesAgregados, setCortesAgregados] = useState([]);
  const [tares, setTares] = useState([]);
  const [tabActiva, setTabActiva] = useState("detallado");
  const [paginaActual, setPaginaActual] = useState(1);
  const [taraSeleccionadaId, setTaraSeleccionadaId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
          garron: item.products_garron || "",
          pesoNeto:
            (parseFloat(item.gross_weight) || 0) - (parseFloat(item.tare) || 0),
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

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${API_URL}/product-name`);
        if (!response.ok) throw new Error("Error al cargar los productos");

        const data = await response.json();
        const productosConCantidad = data.map((nombre, index) => ({
          id: index + 1,
          nombre,
          cantidad: 0,
        }));
        setCortes(productosConCantidad);
      } catch (err) {
        console.error("Error al obtener los productos:", err);
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchCantidad = async () => {
      try {
        const response = await fetch(`${API_URL}/allProducts`);
        const allData = await response.json();

        console.log("Data del remito:", data);
        console.log("Productos recibidos:", allData);

        const cortesDelRemito = allData.filter((item) => item.id === data?.id);
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
  }

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
  const opcionesCortes = cortes.map((corte) => ({
    value: corte.nombre,
    label: corte.nombre,
  }));

  const handleGuardarObservacion = async () => {
    const texto = formData.observaciones?.trim() ?? "";

    try {
      if (formData.observacionId) {
        // Siempre actualizar, incluso si el texto está vacío
        const resultado = await actualizarObservacion(formData.observacionId, texto);
        console.log("Observación actualizada:", resultado);
      } else {
        // Crear nueva observación aunque el texto esté vacío
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

    if (cortesAgregados.length === 0) {
      alert("No hay cortes agregados para guardar.");
      setSaving(false);
      return;
    }

    try {
      console.log("Guardando observación...");
      await handleGuardarObservacion();
      console.log("Observación guardada correctamente.");

      const payloadCortes = {
        cortes: cortesAgregados,
      };

      const updatePayload = {
        cantidad_animales_cargados: totalAnimalesCargados,
        cantidad_cabezas_cargadas: totalCabezasCargadas,
        peso_total_neto_cargado: totalKgNeto,
      };

      if (isEditing) {
        console.log("Editando cortes...");
        const response = await fetch(`${API_URL}/meat-income-edit/${data.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadCortes),
        });

        if (!response.ok) {
          const err = await response.text();
          console.error("Error al editar los cortes:", err);
          throw new Error("Error al editar los cortes");
        }
        console.log("Cortes editados correctamente.");

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
          console.error("Error al actualizar el resumen:", err);
          throw new Error("Error al actualizar el remito");
        }
        console.log("Resumen actualizado correctamente.");

        alert("Cortes editados correctamente.");
      } else {
       
        const payload = {
          cortes: cortesAgregados,
        };
 console.log("Payload enviado a /addProducts:", payload); 
        console.log("Guardando cortes nuevos...");
        const response = await fetch(`${API_URL}/addProducts/${data.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const err = await response.text();
          console.error("Error al guardar cortes nuevos:", err);
          throw new Error("Error al guardar los cortes");
        }
        console.log("Cortes nuevos guardados correctamente.");

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
          console.error("Error al actualizar resumen:", err);
          throw new Error("Error al actualizar el remito");
        }
        console.log("Resumen actualizado correctamente.");

        alert("Cortes y datos de resumen guardados correctamente.");
      }

      setCortesAgregados([]);
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
      // estos campos son texto
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // estos campos son números
      const numericValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numericValue) ? "" : Math.abs(numericValue),
      }));
    }
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
      pesoNeto: formData.pesoBruto - formData.tara,
      remitoId,
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
    }));
    setTaraSeleccionadaId("");
  };
  const eliminarCorteBD = async (id) => {
    const response = await fetch(`${API_URL}/provider-item-delete/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("No se pudo eliminar el corte");
    }
  };

  const eliminarCorte = async (index) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el corte de la lista.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const corte = cortesAgregados[index];

      if (corte.id) {
        try {
          await eliminarCorteBD(corte.id);
        } catch (error) {
          console.error("Error al eliminar de la base de datos:", error);
          return;
        }
      }

      setCortesAgregados((prev) => prev.filter((_, i) => i !== index));

      Swal.fire("Eliminado", "El corte ha sido eliminado.", "success");
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

  const sinFlecha = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
  };

  const totalKgNeto = cortesAgregados.reduce(
    (acc, item) => acc + item.pesoNeto,
    0
  );

  const pesoTotalRomaneo = data?.total_weight ?? 0;
  const diferenciaPeso = totalKgNeto - pesoTotalRomaneo;
  const porcentajeDiferencia =
    pesoTotalRomaneo > 0 ? (diferenciaPeso / pesoTotalRomaneo) * 100 : 0;

  let colorDiferencia = "blue";
  if (porcentajeDiferencia < 0) colorDiferencia = "red";
  else if (porcentajeDiferencia > 0) colorDiferencia = "green";

  // Suma total de animales cargados (cantidad)
  const totalAnimalesCargados = cortesAgregados.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  // Suma total de cabezas cargadas
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
    setModalOpen(false)
    handleActualizarDesdeMemoria();
  };

  useEffect(() => {
    const saved = localStorage.getItem("cortes_en_edicion");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCortesAgregados(parsed);
        console.log("Datos cargados desde memoria:", parsed);
      } catch (error) {
        console.error("Error parseando cortes_en_edicion:", error);
      }
    } else {
      console.log("No hay datos guardados en memoria");
    }
  }, []);

  useEffect(() => {
    console.log("cortesAgregados actualizado:", cortesAgregados);
  }, [cortesAgregados]);


  useEffect(() => {
    if (cortesAgregados.length > 0) {
      localStorage.setItem("cortes_en_edicion", JSON.stringify(cortesAgregados));
    }

  }, [cortesAgregados]);
  useEffect(() => {
    const saved = localStorage.getItem("cortes_en_edicion");
    if (saved) {
      const mapearCorteDesdeBackend = (item) => ({
        id: item.id,
        tipo: item.products_name || "",
        cabeza: item.product_head ?? 0,
        cantidad: parseFloat(item.products_quantity) || 0,
        pesoProveedor: parseFloat(item.provider_weight) || 0,
        pesoBruto: parseFloat(item.gross_weight) || 0,
        tara: parseFloat(item.tare) || 0,
        garron: item.products_garron || "",
        pesoNeto:
          (parseFloat(item.gross_weight) || 0) - (parseFloat(item.tare) || 0),
      });
      const cortesGuardados = JSON.parse(saved);
      const cortesFormateados = cortesGuardados.map(mapearCorteDesdeBackend);
      setCortesAgregados(cortesFormateados);
    }
  }, []);


  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No se encontró el remito</p>;

  return (
    <div>
      <Navbar />
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

        <div className="formulario-corte">
          <div className="form-group">
            <div>
              <label>TIPO</label>

              <Select
                className="custom-select"
                classNamePrefix="mi-select"
                options={opcionesCortes}
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    tipo: selected?.value || "",
                  }))
                }
                value={
                  opcionesCortes.find((o) => o.value === formData.tipo) || null
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

          <button className="btn-agregar" onClick={agregarCorte}>
            Agregar pieza +
          </button>

          <div className="cortes-lista">
            {/* <div className="corte-encabezado">
        <div><strong>TIPO</strong></div>
        <div><strong>GARRON</strong></div>
        <div><strong>CABEZA</strong></div>
        <div><strong>CANTIDAD</strong></div>
        <div><strong>PESO DECLARADO PROVEEDOR</strong></div>
        <div><strong>PESO BRUTO BALANZA</strong></div>
        <div><strong>TARA</strong></div>
        <div><strong>PESO NETO</strong></div>
        <div><strong>ACCIONES</strong></div>
    </div> */}

            {cortesPaginados.map((corte, index) => (
              <div key={index + indicePrimerCorte} className="corte-mostrado">
                <div>
                  <p className="dato">{corte.tipo}</p>
                </div>
                <div>
                  <p className="dato">{corte.garron}</p>
                </div>
                <div>
                  <p className="dato">{corte.cabeza}</p>
                </div>
                <div>
                  <p className="dato">{corte.cantidad}</p>
                </div>
                <div>
                  <p className="dato">{corte.pesoProveedor}</p>
                </div>
                <div>
                  <p className="dato">{corte.pesoBruto}</p>
                </div>
                <div>
                  <p className="dato">{corte.tara}</p>
                </div>
                <p className="dato">
                  {`${(Number(corte.pesoNeto) || 0).toFixed(2)} kg`}
                </p>
                <div>
                  <button
                    onClick={() => eliminarCorte(index + indicePrimerCorte)}
                    className="btn-eliminar"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                style={{ marginRight: "1rem" }}
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setPaginaActual((prev) =>
                    prev * cortesPorPagina < cortesAgregados.length
                      ? prev + 1
                      : prev
                  )
                }
                disabled={
                  paginaActual * cortesPorPagina >= cortesAgregados.length
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
        <div className="info-weight-observations">
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <button
              onClick={() => setTabActiva("detallado")}
              style={{
                backgroundColor:
                  tabActiva === "detallado" ? "#007bff" : "#e0e0e0",
                color: tabActiva === "detallado" ? "white" : "black",
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
                          ? ((corte.pesoProveedor - corte.pesoNeto) /
                            corte.pesoProveedor) *
                          100
                          : 0;

                      return (
                        <tr key={index}>
                          <td>{corte.tipo}</td>
                          <td>{corte.cantidad}</td>
                          <td>{corte.cabeza}</td>
                          <td>{Number(corte.pesoNeto || 0).toFixed(2)}</td>
                          <td
                            style={{
                              color: Number(merma) > 0 ? "orange" : "green",
                            }}
                          >
                            {Number(merma || 0).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td>
                        <strong>Diferencia declarado en romaneo</strong>
                      </td>
                      <td
                        style={{
                          color:
                            cantidad > totalAnimalesCargados ? "red" : "green",
                        }}
                      >
                        {cantidad - totalAnimalesCargados}{" "}
                        <span>
                          (
                          {cantidad > 0
                            ? (
                              ((cantidad - totalAnimalesCargados) /
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
                            data.head_quantity > totalCabezasCargadas
                              ? "red"
                              : "green",
                        }}
                      >
                        {data.head_quantity - totalCabezasCargadas}{" "}
                        <span>
                          (
                          {(
                            ((data.head_quantity - totalCabezasCargadas) /
                              data.head_quantity) *
                            100
                          ).toFixed(0)}
                          %)
                        </span>
                      </td>
                      <td style={{ color: colorDiferencia }}>
                        {diferenciaPeso.toFixed(2)}{" "}
                        <span>
                          ({porcentajeDiferencia > 0 ? "+" : ""}
                          {porcentajeDiferencia.toFixed(2)}% )
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div>
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
                      {Object.values(cortesAgrupados).map((corte, index) => {
                        const merma =
                          corte.pesoProveedor > 0
                            ? ((corte.pesoProveedor - corte.pesoNeto) /
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
                              style={{ color: merma > 0 ? "orange" : "green" }}
                            >
                              {merma.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
            style={{ width: "100%", minHeight: "80px", marginBottom: "1rem" }}
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
  );
};

export default MeatManualIncome;
