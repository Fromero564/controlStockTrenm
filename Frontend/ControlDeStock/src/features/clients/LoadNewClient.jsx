import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import "../../assets/styles/loadNewClient.css";
import Navbar from "../../components/Navbar.jsx";

const SELLERS_API = "http://localhost:3000/all-sellers";

const LoadNewClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [countries, setCountries] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [sellerOptions, setSellerOptions] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    id,
    nombreCliente: "",
    identidad: "cuit",
    numeroIdentidad: "",
    ivaCondicion: "iva Responsable Inscripto",
    emailCliente: "",
    telefonoCliente: "",
    domicilioCliente: "",
    paisCliente: "",
    provinciaCliente: "",
    localidadCliente: "",
    estadoCliente: true,
    sellerId: null,
  });

  const esEditing = useMemo(() => Boolean(id), [id]);
  const esArgentina = formData.paisCliente === "Argentina";

  useEffect(() => {
    const fetchCliente = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_URL}/client/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          id: data.id,
          nombreCliente: data.client_name || "",
          identidad: data.client_type_id || "cuit",
          numeroIdentidad: data.client_id_number ?? "",
          ivaCondicion: data.client_iva_condition || "iva Responsable Inscripto",
          emailCliente: data.client_email || "",
          telefonoCliente: data.client_phone || "",
          domicilioCliente: data.client_adress || "",
          paisCliente: data.client_country || "",
          provinciaCliente: data.client_province || "",
          localidadCliente: data.client_location || "",
          estadoCliente: data.client_state ?? true,
          sellerId: data.seller_id ?? null,
        }));
      } catch {}
    };
    fetchCliente();
  }, [id, API_URL]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
        if (!res.ok) return;
        const data = await res.json();
        const names = data.map((c) => c.name.common).sort((a, b) => a.localeCompare(b));
        setCountries(names);
      } catch {}
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!countries.length || !formData.paisCliente) return;
    const match = countries.find(
      (c) => c.toLowerCase() === String(formData.paisCliente).toLowerCase()
    );
    if (match && match !== formData.paisCliente) {
      setFormData((p) => ({ ...p, paisCliente: match }));
    }
  }, [countries, formData.paisCliente]);

  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const res = await fetch("https://apis.datos.gob.ar/georef/api/provincias");
        if (!res.ok) return;
        const data = await res.json();
        const list = data.provincias.map((p) => p.nombre).sort((a, b) => a.localeCompare(b));
        setProvincias(list);
      } catch {}
    };
    fetchProvincias();
  }, []);

  useEffect(() => {
    if (!esArgentina) {
      setLocalidades([]);
      return;
    }
    const fetchLocalidades = async () => {
      setLocalidades([]);
      if (!formData.provinciaCliente) return;
      try {
        const res = await fetch(
          `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(
            formData.provinciaCliente
          )}&max=1000`
        );
        if (!res.ok) return;
        const data = await res.json();
        const list = data.localidades.map((l) => l.nombre).sort((a, b) => a.localeCompare(b));
        setLocalidades(list);
      } catch {}
    };
    fetchLocalidades();
  }, [formData.provinciaCliente, esArgentina]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch(SELLERS_API);
        if (!res.ok) return;
        const data = await res.json();
        const opts = (data?.sellers || []).map((s) => ({
          value: s.id,
          label: `${s.code} - ${s.name}`,
        }));
        setSellerOptions(opts);
      } catch {}
    };
    fetchSellers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "paisCliente") {
      setFormData({
        ...formData,
        paisCliente: value,
        provinciaCliente: "",
        localidadCliente: "",
      });
      if (value !== "Argentina") setLocalidades([]);
      return;
    }
    if (name === "provinciaCliente") {
      setFormData({
        ...formData,
        provinciaCliente: value,
        localidadCliente: "",
      });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSellerChange = (option) => {
    setFormData((p) => ({ ...p, sellerId: option ? option.value : null }));
  };

  const handleEstadoChange = (e) => {
    setFormData((prev) => ({ ...prev, estadoCliente: JSON.parse(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      { field: "nombreCliente", label: "Nombre" },
      { field: "numeroIdentidad", label: "Número de Identificación" },
      { field: "emailCliente", label: "Email" },
      { field: "telefonoCliente", label: "Teléfono" },
      { field: "domicilioCliente", label: "Domicilio" },
      { field: "paisCliente", label: "País" },
      { field: "provinciaCliente", label: "Provincia" },
      { field: "localidadCliente", label: "Localidad" },
    ];
    for (const { field, label } of required) {
      const v = formData[field];
      if (!v || (typeof v === "string" && v.trim() === "")) {
        Swal.fire({
          icon: "warning",
          title: "Campo obligatorio",
          text: `Por favor completá el campo: ${label}`,
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }
    }

    const url = esEditing ? `${API_URL}/client-edit/${id}` : `${API_URL}/client-load`;
    const method = esEditing ? "PUT" : "POST";

    const payload = esEditing
      ? { ...formData, estadoCliente: formData.estadoCliente === true }
      : { ...formData, client_state: formData.estadoCliente === true };

    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        Swal.fire({
          icon: "success",
          title: esEditing ? "Cliente actualizado" : "Cliente creado",
          text: esEditing
            ? "Los datos del cliente fueron guardados correctamente."
            : "El cliente fue agregado correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
        navigate("/client-list");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al guardar los datos del cliente.",
          timer: 2200,
          showConfirmButton: false,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor.",
        timer: 2200,
        showConfirmButton: false,
      });
    }
  };

  const selectedSeller = sellerOptions.find((o) => o.value === formData.sellerId) || null;

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <h1 className="title-cliente">{id ? "EDITAR CLIENTE" : "NUEVO CLIENTE"}</h1>
      <form className="client-form-load" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group-client">
            <label htmlFor="nombreCliente">Nombre</label>
            <input type="text" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} />
          </div>
          <div className="form-group-client">
            <label htmlFor="identidad">Tipo de identificación</label>
            <select name="identidad" value={formData.identidad} onChange={handleChange}>
              <option value="cuit">CUIT</option>
              <option value="cuil">CUIL</option>
              <option value="dni">DNI</option>
            </select>
          </div>
          <div className="form-group-client">
            <label htmlFor="numeroIdentidad">Número de Identificación</label>
            <input type="number" name="numeroIdentidad" value={formData.numeroIdentidad} onChange={handleChange} />
          </div>
          <div className="form-group-client">
            <label htmlFor="ivaCondicion">Condición IVA</label>
            <select name="ivaCondicion" value={formData.ivaCondicion} onChange={handleChange}>
              <option value="iva Responsable Inscripto">IVA Responsable Inscripto</option>
              <option value="iva Sujeto Exento">IVA Sujeto Exento</option>
              <option value="consumidor Final">Consumidor Final</option>
              <option value="responsable Monotributo">Responsable Monotributo</option>
              <option value="sujeto No Categorizado">Sujeto No Categorizado</option>
              <option value="proveedor Del Exterior">Proveedor del Exterior</option>
              <option value="cliente Del Exterior">Cliente del Exterior</option>
              <option value="iva Liberado">IVA Liberado - LEY N19640</option>
              <option value="monotributo Social">Monotributo Social</option>
              <option value="iva No Alcanzado">IVA No Alcanzado</option>
            </select>
          </div>
          <div className="form-group-client">
            <label htmlFor="emailCliente">Email</label>
            <input type="email" name="emailCliente" value={formData.emailCliente} onChange={handleChange} />
          </div>
          <div className="form-group-client">
            <label htmlFor="telefonoCliente">Teléfono</label>
            <input type="text" name="telefonoCliente" value={formData.telefonoCliente} onChange={handleChange} />
          </div>
          <div className="form-group-client">
            <label htmlFor="domicilioCliente">Domicilio</label>
            <input type="text" name="domicilioCliente" value={formData.domicilioCliente} onChange={handleChange} />
          </div>
          <div className="form-group-client">
            <label htmlFor="paisCliente">País</label>
            <select name="paisCliente" value={formData.paisCliente} onChange={handleChange}>
              <option value="">-- Seleccione un país --</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group-client">
            <label htmlFor="provinciaCliente">Provincia</label>
            {esArgentina ? (
              <select name="provinciaCliente" value={formData.provinciaCliente} onChange={handleChange}>
                <option value="">Seleccione una provincia</option>
                {provincias.map((provincia) => (
                  <option key={provincia} value={provincia}>
                    {provincia}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="provinciaCliente"
                value={formData.provinciaCliente}
                onChange={handleChange}
                placeholder="Ingrese la provincia"
              />
            )}
          </div>
          <div className="form-group-client">
            <label htmlFor="localidadCliente">Localidad</label>
            {esArgentina ? (
              <select name="localidadCliente" value={formData.localidadCliente} onChange={handleChange}>
                <option value="">Seleccione una localidad</option>
                {localidades.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="localidadCliente"
                value={formData.localidadCliente}
                onChange={handleChange}
                placeholder="Ingrese la localidad"
              />
            )}
          </div>

          <div className="form-group-client">
            <label>Vendedor</label>
            <Select
              options={sellerOptions}
              value={selectedSeller}
              onChange={handleSellerChange}
              isClearable
              placeholder="Seleccione un vendedor"
            />
          </div>
        </div>

        <div className="form-group-fullwidth">
          <label className="label-title">Activo</label>
          <div className="radio-toggle">
            <label className="radio-option">
              <input
                type="radio"
                name="estadoCliente"
                value="true"
                checked={formData.estadoCliente === true}
                onChange={handleEstadoChange}
              />
              <span className="custom-radio"></span>
              <span className="radio-label">Sí</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="estadoCliente"
                value="false"
                checked={formData.estadoCliente === false}
                onChange={handleEstadoChange}
              />
              <span className="custom-radio"></span>
              <span className="radio-label">No</span>
            </label>
          </div>
        </div>

        <div className="buttons">
          <button type="submit">{id ? "Guardar Cambios" : "Agregar Cliente"}</button>
          <button type="button" onClick={() => navigate("/sales-panel")}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default LoadNewClient;
