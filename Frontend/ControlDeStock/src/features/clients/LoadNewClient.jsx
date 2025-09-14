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

const REQUIRED_FIELDS = [
  { field: "nombreCliente", label: "Nombre" },
  { field: "numeroIdentidad", label: "Número de Identificación" },
  { field: "emailCliente", label: "Email" },
  { field: "telefonoCliente", label: "Teléfono" },
  { field: "domicilioCliente", label: "Domicilio" },
  { field: "paisCliente", label: "País" },
  { field: "provinciaCliente", label: "Provincia" },
  { field: "localidadCliente", label: "Localidad" },
  { field: "paymentConditionId", label: "Condición de pago" },
  { field: "saleConditionId", label: "Condición de venta" },
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

  // Campos faltantes para resaltar en UI
  const [missingFields, setMissingFields] = useState(new Set());

  const esEditing = useMemo(() => Boolean(id), [id]);
  const esArgentina = formData.paisCliente === "Argentina";

  // === NUEVO: código sugerido (max id + 1) ===
  const [codigoSugerido, setCodigoSugerido] = useState("");
  useEffect(() => {
    if (id) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/allClients`);
        if (!res.ok) return;
        const data = await res.json();
        let next = 1;
        if (Array.isArray(data) && data.length) {
          const maxId = data.reduce((m, c) => Math.max(m, Number(c?.id || 0)), 0);
          next = maxId + 1;
        }
        setCodigoSugerido(String(next));
      } catch {}
    })();
  }, [id, API_URL]);
  // === FIN NUEVO ===

  // Cargar cliente si estamos editando
  useEffect(() => {
    if (!id) return;
    (async () => {
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
          sellerId: data.client_seller ?? null,
          paymentConditionId: null,
          saleConditionId: null,
          paymentConditionName: data.client_payment_condition || "",
          saleConditionName: data.client_sale_condition || "",
        }));
      } catch {}
    })();
  }, [id, API_URL]);

  // Países (restcountries)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
        if (!res.ok) return;
        const data = await res.json();
        const names = data
          .map((c) => c.name.common)
          .sort((a, b) => a.localeCompare(b));
        setCountries(names);
      } catch {}
    })();
  }, []);

  // Normalizar país si viene tipeado distinto
  useEffect(() => {
    if (!countries.length || !formData.paisCliente) return;
    const match = countries.find(
      (c) => c.toLowerCase() === String(formData.paisCliente).toLowerCase()
    );
    if (match && match !== formData.paisCliente) {
      setFormData((p) => ({ ...p, paisCliente: match }));
    }
  }, [countries, formData.paisCliente]);

  // Vendedores (solo activos)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(SELLERS_API);
        if (!res.ok) return;
        const data = await res.json();

        const activos = (data?.sellers || []).filter((s) => s.status === true);
        const opts = activos.map((s) => ({
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
        const list = Array.isArray(d) ? d : d.paymentConditions ?? [];
        setPaymentConditionOptions(
          list.map((c) => ({ value: c.id, label: c.payment_condition }))
        );
      } catch {}
    })();
  }, []);

  // Condiciones de venta
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(SALE_CONDITIONS_API);
        const d = await r.json();
        const list = Array.isArray(d) ? d : d.conditions ?? [];
        setSaleConditionOptions(
          list.map((s) => ({ value: s.id, label: s.condition_name }))
        );
      } catch {}
    })();
  }, []);

  // Vincular IDs si estamos editando (cuando llegan las opciones)
  useEffect(() => {
    setFormData((p) => {
      const pcId =
        p.paymentConditionId ??
        (p.paymentConditionName
          ? paymentConditionOptions.find((o) => o.label === p.paymentConditionName)?.value ?? null
          : null);

      const scId =
        p.saleConditionId ??
        (p.saleConditionName
          ? saleConditionOptions.find((o) => o.label === p.saleConditionName)?.value ?? null
          : null);

      if (pcId === p.paymentConditionId && scId === p.saleConditionId) return p;
      return { ...p, paymentConditionId: pcId, saleConditionId: scId };
    });
  }, [paymentConditionOptions, saleConditionOptions]);

  // Helpers
  const valueIsEmpty = (v) =>
    v == null || (typeof v === "string" ? v.trim() === "" : false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "paisCliente") {
      setFormData({
        ...formData,
        paisCliente: value,
        provinciaCliente: "",
        localidadCliente: "",
      });
      setMissingFields((prev) => {
        const next = new Set(prev);
        if (!valueIsEmpty(value)) next.delete("paisCliente");
        next.delete("provinciaCliente");
        next.delete("localidadCliente");
        return next;
      });
      return;
    }
    if (name === "provinciaCliente") {
      setFormData({ ...formData, provinciaCliente: value, localidadCliente: "" });
      setMissingFields((prev) => {
        const next = new Set(prev);
        if (!valueIsEmpty(value)) next.delete("provinciaCliente");
        next.delete("localidadCliente");
        return next;
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
    setMissingFields((prev) => {
      const next = new Set(prev);
      if (!valueIsEmpty(value)) next.delete(name);
      return next;
    });
  };

  const handleSellerChange = (option) => {
    setFormData((p) => ({ ...p, sellerId: option ? option.value : null }));
  };
  const handlePaymentConditionChange = (option) => {
    setFormData((p) => ({ ...p, paymentConditionId: option ? option.value : null }));
    setMissingFields((prev) => {
      const next = new Set(prev);
      if (option && option.value != null) next.delete("paymentConditionId");
      else next.add("paymentConditionId");
      return next;
    });
  };
  const handleSaleConditionChange = (option) => {
    setFormData((p) => ({ ...p, saleConditionId: option ? option.value : null }));
    setMissingFields((prev) => {
      const next = new Set(prev);
      if (option && option.value != null) next.delete("saleConditionId");
      else next.add("saleConditionId");
      return next;
    });
  };
  const handleEstadoChange = (e) => {
    setFormData((prev) => ({ ...prev, estadoCliente: JSON.parse(e.target.value) }));
  };

  const scrollToField = (fieldName) => {
    if (["paymentConditionId", "saleConditionId"].includes(fieldName)) {
      const el = document.getElementById(`rs-${fieldName}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    const el = document.querySelector(`[name="${fieldName}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1) Detectar todos los obligatorios faltantes de una
    const faltantes = REQUIRED_FIELDS
      .filter(({ field }) => valueIsEmpty(formData[field]))
      .map(({ field, label }) => ({ field, label }));

    if (faltantes.length > 0) {
      // Resaltar inputs faltantes en UI
      setMissingFields(new Set(faltantes.map((f) => f.field)));

      // Construir lista HTML para SweetAlert
      const listHtml = `
        <ul style="text-align:left;margin:0;padding-left:1.1rem;">
          ${faltantes.map((f) => `<li>${f.label}</li>`).join("")}
        </ul>
      `;

      Swal.fire({
        icon: "warning",
        title: "Faltan campos obligatorios",
        html: `<p>Completá los siguientes campos:</p>${listHtml}`,
        confirmButtonText: "Entendido",
      });

      // Foco/scroll al primero
      const first = faltantes[0].field;
      scrollToField(first);
      return; // detener envío
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

  // Estilos para react-select alineados al diseño de vendedor
  const rsStyles = (hasError) => ({
    control: (base, state) => ({
      ...base,
      minHeight: 56,
      height: 56,
      borderRadius: 8,
      backgroundColor: "#e8e8e8",
      border: hasError ? "2px solid #e11d48" : "none",
      boxShadow: state.isFocused ? "0 0 0 2px #047bb4" : "none",
      "&:hover": { borderColor: hasError ? "#e11d48" : base.borderColor },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    placeholder: (base) => ({ ...base, color: "#b8b8b8" }),
    singleValue: (base) => ({ ...base, color: "#262626" }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: (base) => ({ ...base, borderRadius: 8, overflow: "hidden" }),
  });

  const errorStyle = (name) =>
    missingFields.has(name) ? { border: "2px solid #e11d48" } : undefined;

  return (
    <div className="client-bg">
      <Navbar />

      <div className="client-modal">
        <h2 className="client-title">{id ? "EDITAR CLIENTE" : "NUEVO CLIENTE"}</h2>

        {/* NUEVO: vista del código */}
        <div className="client-code">
          <span>CÓDIGO: </span>
          <b>{id ? String(id) : (codigoSugerido || "—")}</b>
        </div>

        <form className="client-form" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="client-label">NOMBRE</div>
          <input
            type="text"
            name="nombreCliente"
            className="client-input"
            placeholder="Nombre"
            value={formData.nombreCliente}
            onChange={handleChange}
            style={errorStyle("nombreCliente")}
          />

          {/* Identificación */}
          <div className="client-row">
            <div className="client-col">
              <div className="client-label">TIPO DE IDENTIFICACIÓN</div>
              <select
                name="identidad"
                className="client-select"
                value={formData.identidad}
                onChange={handleChange}
              >
                <option value="cuit">CUIT</option>
                <option value="cuil">CUIL</option>
                <option value="dni">DNI</option>
              </select>
            </div>
            <div className="client-col">
              <div className="client-label">NÚMERO DE IDENTIFICACIÓN</div>
              <input
                type="number"
                name="numeroIdentidad"
                className="client-input"
                placeholder="Número"
                value={formData.numeroIdentidad}
                onChange={handleChange}
                style={errorStyle("numeroIdentidad")}
              />
            </div>
          </div>

          {/* IVA + Email */}
          <div className="client-row">
            <div className="client-col">
              <div className="client-label">CONDICIÓN IVA</div>
              <select
                name="ivaCondicion"
                className="client-select"
                value={formData.ivaCondicion}
                onChange={handleChange}
              >
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
            <div className="client-col">
              <div className="client-label">EMAIL</div>
              <input
                type="email"
                name="emailCliente"
                className="client-input"
                placeholder="Email"
                value={formData.emailCliente}
                onChange={handleChange}
                autoComplete="email"
                style={errorStyle("emailCliente")}
              />
            </div>
          </div>

          {/* Teléfono + Domicilio */}
          <div className="client-row">
            <div className="client-col">
              <div className="client-label">TELÉFONO</div>
              <input
                type="text"
                name="telefonoCliente"
                className="client-input"
                placeholder="Teléfono"
                value={formData.telefonoCliente}
                onChange={handleChange}
                autoComplete="tel"
                style={errorStyle("telefonoCliente")}
              />
            </div>
            <div className="client-col">
              <div className="client-label">DOMICILIO</div>
              <input
                type="text"
                name="domicilioCliente"
                className="client-input"
                placeholder="Calle, número, piso..."
                value={formData.domicilioCliente}
                onChange={handleChange}
                autoComplete="street-address"
                style={errorStyle("domicilioCliente")}
              />
            </div>
          </div>

          {/* País + Provincia */}
          <div className="client-row">
            <div className="client-col">
              <div className="client-label">PAÍS</div>
              <select
                name="paisCliente"
                className="client-select"
                value={formData.paisCliente}
                onChange={handleChange}
                style={errorStyle("paisCliente")}
              >
                <option value="">-- Seleccione un país --</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="client-col">
              <div className="client-label">PROVINCIA / ESTADO</div>
              {esArgentina ? (
                <select
                  name="provinciaCliente"
                  className="client-select"
                  value={formData.provinciaCliente}
                  onChange={handleChange}
                  style={errorStyle("provinciaCliente")}
                >
                  <option value="">Seleccione una provincia</option>
                  {PROVINCIAS_AR.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="provinciaCliente"
                  className="client-input"
                  placeholder="Provincia / estado"
                  value={formData.provinciaCliente}
                  onChange={handleChange}
                  autoComplete="address-level1"
                  style={errorStyle("provinciaCliente")}
                />
              )}
            </div>
          </div>

          {/* Localidad */}
          <div className="client-label" style={{ marginTop: "10px" }}>
            LOCALIDAD
          </div>
          <input
            type="text"
            name="localidadCliente"
            className="client-input"
            placeholder="Localidad"
            value={formData.localidadCliente}
            onChange={handleChange}
            autoComplete="address-level2"
            style={errorStyle("localidadCliente")}
            list="localidad-sugerencias"
          />
          <datalist id="localidad-sugerencias"></datalist>

          {/* Vendedor */}
          <div className="client-label" style={{ marginTop: "14px" }}>
            VENDEDOR
          </div>
          <div id="rs-sellerId">
            <Select
              className="client-rs"
              classNamePrefix="rs"
              options={sellerOptions}
              value={sellerOptions.find((o) => o.value === formData.sellerId) || null}
              onChange={handleSellerChange}
              isClearable
              placeholder="Seleccione un vendedor"
              styles={rsStyles(false)}
            />
          </div>

          {/* Condiciones */}
          <div className="client-row">
            <div className="client-col">
              <div className="client-label">CONDICIÓN DE PAGO</div>
              <div id="rs-paymentConditionId">
                <Select
                  className="client-rs"
                  classNamePrefix="rs"
                  options={paymentConditionOptions}
                  value={
                    paymentConditionOptions.find(
                      (o) => o.value === formData.paymentConditionId
                    ) || null
                  }
                  onChange={handlePaymentConditionChange}
                  isClearable
                  placeholder="Seleccionar condición"
                  styles={rsStyles(missingFields.has("paymentConditionId"))}
                />
              </div>
            </div>
            <div className="client-col">
              <div className="client-label">CONDICIÓN DE VENTA</div>
              <div id="rs-saleConditionId">
                <Select
                  className="client-rs"
                  classNamePrefix="rs"
                  options={saleConditionOptions}
                  value={
                    saleConditionOptions.find(
                      (o) => o.value === formData.saleConditionId
                    ) || null
                  }
                  onChange={handleSaleConditionChange}
                  isClearable
                  placeholder="Seleccionar condición de venta"
                  styles={rsStyles(missingFields.has("saleConditionId"))}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="client-label" style={{ marginTop: "14px" }}>
            ESTADO
          </div>
          <div className="client-row">
            <label>
              <input
                type="radio"
                name="estadoCliente"
                value="true"
                checked={formData.estadoCliente === true}
                onChange={handleEstadoChange}
              />
              Activo
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="estadoCliente"
                value="false"
                checked={formData.estadoCliente === false}
                onChange={handleEstadoChange}
              />
              Inactivo
            </label>
          </div>

          {/* Botones */}
          <div className="client-btn-row">
            <button type="submit" className="client-btn client-btn-primary">
              {id ? "Guardar Cambios" : "Agregar Cliente"}
            </button>
            <button
              type="button"
              className="client-btn client-btn-outline"
              onClick={() => navigate("/sales-panel")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadNewClient;
