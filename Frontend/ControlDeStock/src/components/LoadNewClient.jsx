import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './styles/LoadNewClient.css';
import Navbar from "./Navbar";

const LoadNewClient = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
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
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEstadoChange = (e) => {
        
        setFormData((prev) => ({
            ...prev,
            estadoCliente: JSON.parse(e.target.value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombreCliente) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        const payload = {
            ...formData,
            client_state: formData.estadoCliente === true,
        };
        delete payload.estadoCliente;

        try {
            const response = await fetch("http://localhost:3000/client-load", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                console.log("Datos enviados correctamente");
                setFormData({
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
                });
            } else {
                console.error("Error al enviar los datos");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <h2>NUEVO CLIENTE</h2>
            <form className="client-form-load" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group-client">
                        <label htmlFor="nombreCliente">Nombre</label>
                        <input type="text" name="nombreCliente" id="nombreCliente" value={formData.nombreCliente} onChange={handleChange} />
                    </div>

                    <div className="form-group-client">
                        <label htmlFor="identidad">Tipo de identificación</label>
                        <select name="identidad" id="identidad" value={formData.identidad} onChange={handleChange}>
                            <option value="cuit">CUIT</option>
                            <option value="cuil">CUIL</option>
                            <option value="dni">DNI</option>
                            <option value="otro">OTRO</option>
                        </select>
                    </div>

                    <div className="form-group-client">
                        <label htmlFor="numeroIdentidad">Número de Identificación</label>
                        <input type="number" name="numeroIdentidad" id="numeroIdentidad" value={formData.numeroIdentidad} onChange={handleChange} />
                    </div>

                    <div className="form-group-client">
                        <label htmlFor="ivaCondicion">Condición IVA</label>
                        <select name="ivaCondicion" id="ivaCondicion" value={formData.ivaCondicion} onChange={handleChange}>
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
                        <input type="email" name="emailCliente" id="emailCliente" value={formData.emailCliente} onChange={handleChange} />
                    </div>

                    <div className="form-group-client">
                        <label htmlFor="telefonoCliente">Teléfono</label>
                        <input type="text" name="telefonoCliente" id="telefonoCliente" value={formData.telefonoCliente} onChange={handleChange} />
                    </div>

                    <div className="form-group-client">
                        <label htmlFor="domicilioCliente">Domicilio</label>
                        <input type="text" name="domicilioCliente" id="domicilioCliente" value={formData.domicilioCliente} onChange={handleChange} />
                    </div>

                    <div className="form-group-client">
                        <label htmlFor="paisCliente">País</label>
                        <input type="text" name="paisCliente" id="paisCliente" value={formData.paisCliente} onChange={handleChange} />
                    </div>

                    <div className="form-group-client">
                        <label htmlFor="provinciaCliente">Provincia</label>
                        <input type="text" name="provinciaCliente" id="provinciaCliente" value={formData.provinciaCliente} onChange={handleChange} />
                    </div>

                    <div className="form-group-client">
                        <label htmlFor="localidadCliente">Localidad</label>
                        <input type="text" name="localidadCliente" id="localidadCliente" value={formData.localidadCliente} onChange={handleChange} />
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
                    <button type="submit">Agregar Cliente</button>
                    <button type="button" onClick={() => navigate("/dashboard")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default LoadNewClient;
