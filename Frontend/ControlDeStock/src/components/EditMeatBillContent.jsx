import { useEffect, useState } from "react";
import Modal from "react-modal";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "../assets/styles/modalEditMeatBillContent.css";

const EditMeatBillModal = ({ isOpen, onClose, id, onUpdate }) => {
  const [formState, setFormState] = useState({
    proveedor: "",
    pesoTotal: "",
    romaneo: "",
    cabezas: "",
    cantidad: "",
  });
  const [tipoIngreso, setTipoIngreso] = useState("romaneo");
  const [providers, setProviders] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [nuevoCorte, setNuevoCorte] = useState({
    tipo: "",
    cantidad: "",
    cabezas: "",
  });
  const [cortesAgregados, setCortesAgregados] = useState([]);
  const [errorProductoDuplicado, setErrorProductoDuplicado] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (id && isOpen) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${API_URL}/chargeUpdateBillDetails/${id}`
          );
          const data = await response.json();

          setFormState({
            proveedor: data.proveedor || "",
            pesoTotal: data.peso_total || "",
            romaneo: data.romaneo || "",
            cabezas: data.cabezas || "",
            cantidad: data.cantidad || "",
          });
          setCortesAgregados(data.detalles || []);
          setTipoIngreso(data.tipo_ingreso || "romaneo");
        } catch (error) {
          console.error("Error al cargar datos:", error);
        }
      };

      fetchData();
    }

    const fetchProviders = async () => {
      const res = await fetch(`${API_URL}/allProviders`);
      const data = await res.json();
      setProviders(data);
    };

    const fetchProductos = async () => {
      const res = await fetch(`${API_URL}/product-primary-name`);
      const data = await res.json();
      const opcionesFormateadas = data.map((p) => ({
        label: p.nombre,
        value: p.nombre,
      }));
      setOpciones(opcionesFormateadas);
    };

    fetchProviders();
    fetchProductos();
  }, [id, isOpen]);

  const handleRadioChange = (e) => {
    setTipoIngreso(e.target.value);
  };

  const handleCorteChange = (e) => {
    setNuevoCorte({
      ...nuevoCorte,
      [e.target.name]: e.target.value,
    });
  };

  const agregarCorte = () => {
    if (cortesAgregados.find((c) => c.tipo === nuevoCorte.tipo)) {
      setErrorProductoDuplicado(true);
      return;
    }
    setErrorProductoDuplicado(false);
    setCortesAgregados([...cortesAgregados, nuevoCorte]);
    setNuevoCorte({ tipo: "", cantidad: "", cabezas: "" });
  };

  const eliminarCorte = (index) => {
    const nuevos = [...cortesAgregados];
    nuevos.splice(index, 1);
    setCortesAgregados(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const totalCantidad = cortesAgregados.reduce(
        (sum, corte) => sum + Number(corte.cantidad),
        0
      );
      const totalCabezas = cortesAgregados.reduce(
        (sum, corte) => sum + Number(corte.cabezas),
        0
      );

      const payload = {
        ...formState,
        tipoIngreso,
        cortes: cortesAgregados,
        cantidad: totalCantidad,
        cabezas: totalCabezas,
      };

      const response = await fetch(`${API_URL}/update-provider-bill/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          tipoIngreso,
          cortes: cortesAgregados,
          cantidad: totalCantidad,
          cabezas: totalCabezas,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error en la respuesta:", errorData);
        alert(
          "Error al actualizar: " + (errorData.message || "Error desconocido")
        );
        return;
      }

      onUpdate(payload);
      onClose();
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Error de conexión o inesperado");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="custom-modal"
      overlayClassName="modal-overlay"
    >
      <div className="new-register-container">
        <form onSubmit={handleSubmit} className="form-container-provider">
          <h2 className="form-title">
            {id ? "Editar Registro" : "Nuevo Registro"}
          </h2>

          <div className="title-remit-div">
            <label className="label-provider-form">TIPO DE INGRESO</label>
            <label className="label-provider-form">N° COMPROBANTE: {id}</label>
          </div>

          <div className="provider-remit-romaneo">
            <label className="label-provider-form">
              PROVEEDOR:
              <select
                name="proveedor"
                className="input"
                value={formState.proveedor}
                onChange={(e) =>
                  setFormState({ ...formState, proveedor: e.target.value })
                }
              >
                <option value="">Seleccionar proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.provider_name}>
                    {provider.provider_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="label-provider-form">
              Nº COMPROBANTE ROMANEO:
              <input
                type="number"
                name="romaneo"
                className="input"
                value={formState.romaneo}
                onChange={(e) =>
                  setFormState({ ...formState, romaneo: e.target.value })
                }
              />
            </label>
          </div>

          <div className="cortes-section">
            <div className="corte-card">
              <div className="input-group">
                <label>TIPO</label>
                {errorProductoDuplicado && (
                  <p style={{ color: "red", marginBottom: "5px" }}>
                    Este producto ya fue agregado.
                  </p>
                )}
                <Select
                  options={opciones}
                  onChange={(selected) =>
                    setNuevoCorte({
                      ...nuevoCorte,
                      tipo: selected?.value || "",
                    })
                  }
                  value={
                    opciones.find((o) => o.value === nuevoCorte.tipo) || null
                  }
                  placeholder={"Producto"}
                  isClearable
                />
              </div>

              <div className="input-group">
                <label>CANTIDAD</label>
                <input
                  type="number"
                  name="cantidad"
                  value={nuevoCorte.cantidad}
                  onChange={handleCorteChange}
                  min="0"
                />
              </div>

              <div className="input-group">
                <label>CABEZAS</label>
                <input
                  type="number"
                  name="cabezas"
                  value={nuevoCorte.cabezas}
                  onChange={handleCorteChange}
                  min="0"
                />
              </div>

              <button type="button" onClick={agregarCorte} className="btn-add">
                +
              </button>
            </div>

            {cortesAgregados.map((corte, index) => (
              <div key={index} className="corte-card">
                <div className="input-group">
                  <label>TIPO</label>
                  <input type="text" value={corte.tipo} readOnly />
                </div>
                <div className="input-group">
                  <label>CANTIDAD</label>
                  <input type="number" value={corte.cantidad} readOnly />
                </div>
                <div className="input-group">
                  <label>CABEZAS</label>
                  <input type="number" value={corte.cabezas} readOnly />
                </div>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => eliminarCorte(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <label className="label-provider-form">
            PESO DECLARADO EN ROMANEO (KG):
            <input
              type="number"
              name="pesoTotal"
              step="0.01"
              className="input"
              min="0"
              value={formState.pesoTotal}
              onChange={(e) =>
                setFormState({ ...formState, pesoTotal: e.target.value })
              }
            />
          </label>

          <div className="button-container">
            <button type="submit" className="button-primary">
              {tipoIngreso === "romaneo"
                ? "Guardar y continuar a pesaje"
                : "Guardar carga manual"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditMeatBillModal;
