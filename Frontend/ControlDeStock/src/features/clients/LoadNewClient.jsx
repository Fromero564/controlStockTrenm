import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import "../../assets/styles/loadNewClient.css";
import Navbar from "../../components/Navbar.jsx";

const PROVINCIAS_AR = [
  "Ciudad Autónoma de Buenos Aires",
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
  "Tucumán",
];

const LoadNewClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;
  const SELLERS_API = `${API_URL}/all-sellers`;
  const PAYMENT_CONDITIONS_API = `${API_URL}/payment-conditions`;
  const SALE_CONDITIONS_API = `${API_URL}/sale-conditions`;

  const [countries, setCountries] = useState([]);
  const [sellerOptions, setSellerOptions] = useState([]);
  const [paymentConditionOptions, setPaymentConditionOptions] = useState([]);
  const [saleConditionOptions, setSaleConditionOptions] = useState([]);

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

    paymentConditionId: null,
    saleConditionId: null,

    paymentConditionName: "",
    saleConditionName: "",
  });

  const esEditing = useMemo(() => Boolean(id), [id]);
  const esArgentina = formData.paisCliente === "Argentina";

  // Cargar cliente si estamos editando
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/client/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setFormData(prev => ({
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
          sellerId: data.client_seller ?? null,
          paymentConditionId: null,
          saleConditionId: null,
          paymentConditionName: data.client_payment_condition || "",
          saleConditionName: data.client_sale_condition || "",
        }));
      } catch {}
    })();
  }, [id, API_URL]);

  // Países (puede quedarse con la API de restcountries)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
        if (!res.ok) return;
        const data = await res.json();
        const names = data.map(c => c.name.common).sort((a, b) => a.localeCompare(b));
        setCountries(names);
      } catch {}
    })();
  }, []);

  // Normalizar país si viene tipeado distinto
  useEffect(() => {
    if (!countries.length || !formData.paisCliente) return;
    const match = countries.find(
      c => c.toLowerCase() === String(formData.paisCliente).toLowerCase()
    );
    if (match && match !== formData.paisCliente) {
      setFormData(p => ({ ...p, paisCliente: match }));
    }
  }, [countries, formData.paisCliente]);

  // Vendedores (solo activos)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(SELLERS_API);
        if (!res.ok) return;
        const data = await res.json();

        const activos = (data?.sellers || []).filter(s => s.status === true);
        const opts = activos.map(s => ({
          value: s.id,
          label: `${s.code} - ${s.name}`,
        }));
        setSellerOptions(opts);
      } catch {}
    })();
  }, []);

  // Condiciones de pago
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(PAYMENT_CONDITIONS_API);
        const d = await r.json();
        const list = Array.isArray(d) ? d : (d.paymentConditions ?? []);
        setPaymentConditionOptions(list.map(c => ({ value: c.id, label: c.payment_condition })));
      } catch {}
    })();
  }, []);

  // Condiciones de venta
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(SALE_CONDITIONS_API);
        const d = await r.json();
        const list = Array.isArray(d) ? d : (d.conditions ?? []);
        setSaleConditionOptions(list.map(s => ({ value: s.id, label: s.condition_name })));
      } catch {}
    })();
  }, []);

  // Vincular IDs si estamos editando (cuando llegan las opciones)
  useEffect(() => {
    setFormData(p => {
      const pcId =
        p.paymentConditionId ??
        (p.paymentConditionName
          ? (paymentConditionOptions.find(o => o.label === p.paymentConditionName)?.value ?? null)
          : null);

      const scId =
        p.saleConditionId ??
        (p.saleConditionName
          ? (saleConditionOptions.find(o => o.label === p.saleConditionName)?.value ?? null)
          : null);

      if (pcId === p.paymentConditionId && scId === p.saleConditionId) return p;
      return { ...p, paymentConditionId: pcId, saleConditionId: scId };
    });
  }, [paymentConditionOptions, saleConditionOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "paisCliente") {
      setFormData({ ...formData, paisCliente: value, provinciaCliente: "", localidadCliente: "" });
      return;
    }
    if (name === "provinciaCliente") {
      setFormData({ ...formData, provinciaCliente: value, localidadCliente: "" });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSellerChange = (option) => {
    setFormData(p => ({ ...p, sellerId: option ? option.value : null }));
  };
  const handlePaymentConditionChange = (option) => {
    setFormData(p => ({ ...p, paymentConditionId: option ? option.value : null }));
  };
  const handleSaleConditionChange = (option) => {
    setFormData(p => ({ ...p, saleConditionId: option ? option.value : null }));
  };
  const handleEstadoChange = (e) => {
    setFormData(prev => ({ ...prev, estadoCliente: JSON.parse(e.target.value) }));
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
          text: `Completá: ${label}`,
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
    }

    const url = esEditing ? `${API_URL}/client-edit/${id}` : `${API_URL}/client-load`;
    const method = esEditing ? "PUT" : "POST";

    const payload = esEditing
      ? {
          ...formData,
          estadoCliente: formData.estadoCliente === true,
          payment_condition_id: formData.paymentConditionId,
          sale_condition_id: formData.saleConditionId,
        }
      : {
          ...formData,
          client_state: formData.estadoCliente === true,
          payment_condition_id: formData.paymentConditionId,
          sale_condition_id: formData.saleConditionId,
        };

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
          timer: 1600,
          showConfirmButton: false,
        });
        navigate("/client-list");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo guardar.",
          timer: 2200,
          showConfirmButton: false
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor.",
        timer: 2200,
        showConfirmButton: false
      });
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>

      <h1 className="title-cliente">{id ? "EDITAR CLIENTE" : "NUEVO CLIENTE"}</h1>

      <form className="client-form-load" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group-client">
            <label>Nombre</label>
            <input
              type="text"
              name="nombreCliente"
              value={formData.nombreCliente}
              onChange={handleChange}
            />
          </div>

          <div className="form-group-client">
            <label>Tipo de identificación</label>
            <select name="identidad" value={formData.identidad} onChange={handleChange}>
              <option value="cuit">CUIT</option>
              <option value="cuil">CUIL</option>
              <option value="dni">DNI</option>
            </select>
          </div>

          <div className="form-group-client">
            <label>Número de Identificación</label>
            <input
              type="number"
              name="numeroIdentidad"
              value={formData.numeroIdentidad}
              onChange={handleChange}
            />
          </div>

          <div className="form-group-client">
            <label>Condición IVA</label>
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
            <label>Email</label>
            <input
              type="email"
              name="emailCliente"
              value={formData.emailCliente}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group-client">
            <label>Teléfono</label>
            <input
              type="text"
              name="telefonoCliente"
              value={formData.telefonoCliente}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className="form-group-client">
            <label>Domicilio</label>
            <input
              type="text"
              name="domicilioCliente"
              value={formData.domicilioCliente}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>

          <div className="form-group-client">
            <label>País</label>
            <select name="paisCliente" value={formData.paisCliente} onChange={handleChange}>
              <option value="">-- Seleccione un país --</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="form-group-client">
            <label>Provincia</label>
            {esArgentina ? (
              <select
                name="provinciaCliente"
                value={formData.provinciaCliente}
                onChange={handleChange}
              >
                <option value="">Seleccione una provincia</option>
                {PROVINCIAS_AR.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="provinciaCliente"
                value={formData.provinciaCliente}
                onChange={handleChange}
                placeholder="Ingrese la provincia/estado"
                autoComplete="address-level1"
              />
            )}
          </div>

          <div className="form-group-client">
            <label>Localidad</label>
            {/* Autocompletar del navegador / libre */}
            <input
              type="text"
              name="localidadCliente"
              value={formData.localidadCliente}
              onChange={handleChange}
              placeholder="Ingrese la localidad"
              autoComplete="address-level2"
              list="localidad-sugerencias"
            />
            {/* Datalist vacío por defecto (podés llenarlo si querés agregar sugerencias propias) */}
            <datalist id="localidad-sugerencias"></datalist>
          </div>

          <div className="form-group-client">
            <label>Vendedor</label>
            <Select
              options={sellerOptions}
              value={sellerOptions.find(o => o.value === formData.sellerId) || null}
              onChange={handleSellerChange}
              isClearable
              placeholder="Seleccione un vendedor"
            />
          </div>

          <div className="form-group-client">
            <label>Condición de pago</label>
            <Select
              options={paymentConditionOptions}
              value={paymentConditionOptions.find(o => o.value === formData.paymentConditionId) || null}
              onChange={handlePaymentConditionChange}
              isClearable
              placeholder="Seleccionar condición"
            />
          </div>

          <div className="form-group-client">
            <label>Condición de venta</label>
            <Select
              options={saleConditionOptions}
              value={saleConditionOptions.find(o => o.value === formData.saleConditionId) || null}
              onChange={handleSaleConditionChange}
              isClearable
              placeholder="Seleccionar condición de venta"
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
