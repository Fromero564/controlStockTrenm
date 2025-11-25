import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/loadNewProvider.css";

// Provincias argentinas en JSON (incluye Ciudad Autónoma de Buenos Aires)
const provinciasArgentina = [
  "Buenos Aires",
  "Ciudad Autónoma de Buenos Aires",
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
  "Tierra del Fuego",
  "Tucumán",
];

// Lista oficial de países (193 miembros ONU + 2 observadores)
const countriesList = [
  "Afganistán",
  "Albania",
  "Alemania",
  "Andorra",
  "Angola",
  "Antigua y Barbuda",
  "Arabia Saudita",
  "Argelia",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaiyán",
  "Bahamas",
  "Bangladés",
  "Barbados",
  "Baréin",
  "Bélgica",
  "Belice",
  "Benín",
  "Bielorrusia",
  "Birmania (Myanmar)",
  "Bolivia",
  "Bosnia y Herzegovina",
  "Botsuana",
  "Brasil",
  "Brunéi",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Camboya",
  "Camerún",
  "Canadá",
  "Catar",
  "Chad",
  "Chile",
  "China",
  "Chipre",
  "Colombia",
  "Comoras",
  "Congo (República del Congo)",
  "Corea del Norte",
  "Corea del Sur",
  "Costa de Marfil",
  "Costa Rica",
  "Croacia",
  "Cuba",
  "Dinamarca",
  "Dominica",
  "Ecuador",
  "Egipto",
  "El Salvador",
  "Emiratos Árabes Unidos",
  "Eritrea",
  "Eslovaquia",
  "Eslovenia",
  "España",
  "Estados Unidos",
  "Estonia",
  "Esuatini",
  "Etiopía",
  "Filipinas",
  "Finlandia",
  "Fiyi",
  "Francia",
  "Gabón",
  "Gambia",
  "Georgia",
  "Ghana",
  "Granada",
  "Grecia",
  "Guatemala",
  "Guyana",
  "Guinea",
  "Guinea-Bisáu",
  "Guinea Ecuatorial",
  "Haití",
  "Honduras",
  "Hungría",
  "India",
  "Indonesia",
  "Irak",
  "Irán",
  "Irlanda",
  "Islandia",
  "Islas Marshall",
  "Islas Salomón",
  "Israel",
  "Italia",
  "Jamaica",
  "Japón",
  "Jordania",
  "Kazajistán",
  "Kenia",
  "Kirguistán",
  "Kiribati",
  "Kuwait",
  "Laos",
  "Lesoto",
  "Letonia",
  "Líbano",
  "Liberia",
  "Libia",
  "Liechtenstein",
  "Lituania",
  "Luxemburgo",
  "Macedonia del Norte",
  "Madagascar",
  "Malasia",
  "Malaui",
  "Maldivas",
  "Malí",
  "Malta",
  "Marruecos",
  "Mauricio",
  "Mauritania",
  "México",
  "Micronesia",
  "Moldavia",
  "Mónaco",
  "Mongolia",
  "Montenegro",
  "Mozambique",
  "Namibia",
  "Nauru",
  "Nepal",
  "Nicaragua",
  "Níger",
  "Nigeria",
  "Noruega",
  "Nueva Zelanda",
  "Omán",
  "Países Bajos",
  "Pakistán",
  "Palaos",
  "Panamá",
  "Papúa Nueva Guinea",
  "Paraguay",
  "Perú",
  "Polonia",
  "Portugal",
  "Reino Unido",
  "República Centroafricana",
  "República Checa",
  "República Democrática del Congo",
  "República Dominicana",
  "Ruanda",
  "Rumanía",
  "Rusia",
  "Samoa",
  "San Cristóbal y Nieves",
  "San Marino",
  "San Vicente y las Granadinas",
  "Santa Lucía",
  "Santa Sede",
  "Santo Tomé y Príncipe",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leona",
  "Singapur",
  "Siria",
  "Somalia",
  "Sri Lanka",
  "Sudáfrica",
  "Sudán",
  "Sudán del Sur",
  "Suecia",
  "Suiza",
  "Surinam",
  "Tailandia",
  "Tanzania",
  "Tayikistán",
  "Timor Oriental",
  "Togo",
  "Tonga",
  "Trinidad y Tobago",
  "Túnez",
  "Turkmenistán",
  "Turquía",
  "Tuvalu",
  "Ucrania",
  "Uganda",
  "Uruguay",
  "Uzbekistán",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Yibuti",
  "Zambia",
  "Zimbabue",
  "Estado de Palestina",
];

const LoadNewProvider = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    id,
    nombreProveedor: "",
    identidad: "cuit",
    numeroIdentidad: "",
    ivaCondicion: "iva Responsable Inscripto",
    emailProveedor: "",
    telefonoProveedor: "",
    domicilioProveedor: "",
    paisProveedor: "",
    provinciaProveedor: "",
    localidadProveedor: "",
    estadoProveedor: true, // true = activo
  });

  const esArgentina = formData.paisProveedor === "Argentina";

  // Cargar proveedor si existe (modo edición)
  useEffect(() => {
    const fetchProveedor = async () => {
      if (id) {
        try {
          const res = await fetch(`${API_URL}/provider/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              id: data.id,
              nombreProveedor: data.provider_name || "",
              identidad: data.provider_type_id || "",
              numeroIdentidad: data.provider_id_number || "",
              ivaCondicion: data.provider_iva_condition || "",
              emailProveedor: data.provider_email || "",
              telefonoProveedor: data.provider_phone || "",
              domicilioProveedor: data.provider_adress || "",
              paisProveedor: data.provider_country || "",
              provinciaProveedor: data.provider_province || "",
              localidadProveedor: data.provider_location || "",
              estadoProveedor: data.provider_state ?? true,
            });
          }
        } catch (error) {
          console.error("Error al buscar proveedor:", error);
        }
      }
    };

    fetchProveedor();
  }, [id, API_URL]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "paisProveedor") {
      setFormData((prev) => ({
        ...prev,
        paisProveedor: value,
        provinciaProveedor: "",
        localidadProveedor: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const values = Object.values(formData);
    if (values.some((value) => typeof value === "string" && value.trim() === "")) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completá todos los campos obligatorios.",
      });
      return;
    }

    try {
      const url = id
        ? `${API_URL}/provider-edit/${id}`
        : `${API_URL}/provider-load`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error al guardar",
          text: errorData?.mensaje || "No se pudieron guardar los datos.",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: id ? "Proveedor actualizado" : "Proveedor creado",
        text: "Los datos se guardaron correctamente",
        confirmButtonText: "Aceptar",
      }).then(() => {
        navigate("/operator-panel");
      });
    } catch (error) {
      console.error("Error en la solicitud:", error);
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

      <h2 className="title-proveedor">
        {id ? "EDITAR PROVEEDOR" : "NUEVO PROVEEDOR"}
      </h2>

      <form className="provider-form-load" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group-provider">
            <label htmlFor="nombreProveedor">Nombre</label>
            <input
              type="text"
              name="nombreProveedor"
              id="nombreProveedor"
              value={formData.nombreProveedor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-provider">
            <label htmlFor="ivaCondicion">Condición IVA</label>
            <select
              name="ivaCondicion"
              id="ivaCondicion"
              value={formData.ivaCondicion}
              onChange={handleChange}
              required
            >
              <option value="iva Responsable Inscripto">
                IVA Responsable Inscripto
              </option>
              <option value="iva Sujeto Exento">IVA Sujeto Exento</option>
              <option value="consumidor Final">Consumidor Final</option>
              <option value="responsable Monotributo">
                Responsable Monotributo
              </option>
              <option value="sujeto No Categorizado">
                Sujeto No Categorizado
              </option>
              <option value="proveedor Del Exterior">
                Proveedor del Exterior
              </option>
              <option value="cliente Del Exterior">Cliente del Exterior</option>
              <option value="iva Liberado">IVA Liberado - LEY N19640</option>
              <option value="monotributo Social">Monotributo Social</option>
              <option value="iva No Alcanzado">IVA No Alcanzado</option>
            </select>
          </div>

          <div className="form-group-provider">
            <label htmlFor="identidad">Tipo de identificación</label>
            <select
              name="identidad"
              id="identidad"
              value={formData.identidad}
              onChange={handleChange}
              required
            >
              <option value="cuit">CUIT</option>
              <option value="cuil">CUIL</option>
              <option value="dni">DNI</option>
              <option value="otro">OTRO</option>
            </select>
          </div>

          <div className="form-group-provider">
            <label htmlFor="numeroIdentidad">Número de Identificación</label>
            <input
              type="text"
              name="numeroIdentidad"
              id="numeroIdentidad"
              value={formData.numeroIdentidad}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-provider">
            <label htmlFor="emailProveedor">Email</label>
            <input
              type="email"
              name="emailProveedor"
              id="emailProveedor"
              value={formData.emailProveedor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-provider">
            <label htmlFor="telefonoProveedor">Teléfono</label>
            <input
              type="text"
              name="telefonoProveedor"
              id="telefonoProveedor"
              value={formData.telefonoProveedor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-provider">
            <label htmlFor="domicilioProveedor">Domicilio</label>
            <input
              type="text"
              name="domicilioProveedor"
              id="domicilioProveedor"
              value={formData.domicilioProveedor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-provider">
            <label htmlFor="paisProveedor">País</label>
            <select
              name="paisProveedor"
              id="paisProveedor"
              value={formData.paisProveedor}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un país</option>
              {countriesList.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-provider">
            <label htmlFor="provinciaProveedor">Provincia</label>
            {esArgentina ? (
              <select
                name="provinciaProveedor"
                id="provinciaProveedor"
                value={formData.provinciaProveedor}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una provincia</option>
                {provinciasArgentina.map((provincia) => (
                  <option key={provincia} value={provincia}>
                    {provincia}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="provinciaProveedor"
                id="provinciaProveedor"
                value={formData.provinciaProveedor}
                onChange={handleChange}
                placeholder="Ingrese la provincia"
                required
              />
            )}
          </div>

          <div className="form-group-provider">
            <label htmlFor="localidadProveedor">Localidad</label>
            <input
              type="text"
              name="localidadProveedor"
              id="localidadProveedor"
              value={formData.localidadProveedor}
              onChange={handleChange}
              placeholder="Ingrese la localidad"
              required
            />
          </div>

          {/* ESTADO - toggle bonito */}
          <div className="form-group-provider estado-group">
            <label>Estado</label>
            <div className="estado-inner">
              <label className="switch">
                <input
                  type="checkbox"
                  id="estadoProveedor"
                  name="estadoProveedor"
                  checked={formData.estadoProveedor}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
              </label>

              <span
                className={
                  formData.estadoProveedor
                    ? "estado-label activo"
                    : "estado-label inactivo"
                }
              >
                {formData.estadoProveedor ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          <div className="buttons">
            <button type="submit">
              {id ? "Guardar Cambios" : "Agregar Proveedor"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/provider-list")}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoadNewProvider;
