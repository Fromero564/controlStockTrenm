import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar.jsx";
import '../../assets/styles/loadNewProvider.css';

const LoadNewProvider = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [countries, setCountries] = useState([]);
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
    });

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
                        });
                    } else {
                        console.error("No se pudo cargar el proveedor.");
                    }
                } catch (error) {
                    console.error("Error al buscar proveedor:", error);
                }
            }
        };

        fetchProveedor();
    }, [id]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
                if (res.ok) {
                    const data = await res.json();
                    const countryNames = data
                        .map(c => c.name.common)
                        .sort((a, b) => a.localeCompare(b));
                    setCountries(countryNames);
                }
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };

        fetchCountries();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación: todos los campos son obligatorios
        const values = Object.values(formData);
      if (values.some(value => typeof value === "string" && value.trim() === "")) {
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

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: id ? 'Proveedor actualizado' : 'Proveedor creado',
                    text: 'Los datos se guardaron correctamente',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    navigate("/operator-panel");
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error al guardar",
                    text: "No se pudieron guardar los datos.",
                });
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <h2 className="title-proveedor">{id ? "EDITAR PROVEEDOR" : "NUEVO PROVEEDOR"}</h2>
            <form className="provider-form-load" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group-provider">
                        <label htmlFor="nombreProveedor">Nombre</label>
                        <input type="text" name="nombreProveedor" id="nombreProveedor" value={formData.nombreProveedor} onChange={handleChange} required />
                    </div>

                    <div className="form-group-provider">
                        <label htmlFor="ivaCondicion">Condición IVA</label>
                        <select name="ivaCondicion" id="ivaCondicion" value={formData.ivaCondicion} onChange={handleChange} required>
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

                    <div className="form-group-provider">
                        <label htmlFor="identidad">Tipo de identificación</label>
                        <select name="identidad" id="identidad" value={formData.identidad} onChange={handleChange} required>
                            <option value="cuit">CUIT</option>
                            <option value="cuil">CUIL</option>
                            <option value="dni">DNI</option>
                            <option value="otro">OTRO</option>
                        </select>
                    </div>

                    <div className="form-group-provider">
                        <label htmlFor="numeroIdentidad">Número de Identificación</label>
                        <input type="text" name="numeroIdentidad" id="numeroIdentidad" value={formData.numeroIdentidad} onChange={handleChange} required />
                    </div>

                    <div className="form-group-provider">
                        <label htmlFor="emailProveedor">Email</label>
                        <input type="email" name="emailProveedor" id="emailProveedor" value={formData.emailProveedor} onChange={handleChange} required />
                    </div>

                    <div className="form-group-provider">
                        <label htmlFor="telefonoProveedor">Teléfono</label>
                        <input type="text" name="telefonoProveedor" id="telefonoProveedor" value={formData.telefonoProveedor} onChange={handleChange} required />
                    </div>

                    <div className="form-group-provider">
                        <label htmlFor="domicilioProveedor">Domicilio</label>
                        <input type="text" name="domicilioProveedor" id="domicilioProveedor" value={formData.domicilioProveedor} onChange={handleChange} required />
                    </div>

                    <div className="form-group-provider">
                        <label htmlFor="paisProveedor">País</label>
                        <select name="paisProveedor" id="paisProveedor" value={formData.paisProveedor} onChange={handleChange} required>
                            <option value="">Seleccione un país</option>
                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-provider">
                        <label htmlFor="provinciaProveedor">Provincia</label>
                        <input type="text" name="provinciaProveedor" id="provinciaProveedor" value={formData.provinciaProveedor} onChange={handleChange} required />
                    </div>

                    <div className="form-group-provider">
                        <label htmlFor="localidadProveedor">Localidad</label>
                        <input type="text" name="localidadProveedor" id="localidadProveedor" value={formData.localidadProveedor} onChange={handleChange} required />
                    </div>

                    <div className="buttons">
                        <button type="submit">{id ? "Guardar Cambios" : "Agregar Proveedor"}</button>
                        <button type="button" onClick={() => navigate("/provider-list")}>Cancelar</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default LoadNewProvider;
