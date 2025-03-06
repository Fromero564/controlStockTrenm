import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoadNewProvider = () => {
    const Navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombreProveedor: "",
        codigoProveedor: "",
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombreProveedor || !formData.codigoProveedor) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/provider-load", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log("Datos enviados correctamente");
                setFormData({  
                    nombreProveedor: "",
                    codigoProveedor: "",
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
            } else {
                console.error("Error al enviar los datos");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="nombreProveedor">Nombre</label>
                <input type="text" name="nombreProveedor" id="nombreProveedor" value={formData.nombreProveedor} onChange={handleChange} />

                <label htmlFor="codigoProveedor">Código</label>
                <input type="text" name="codigoProveedor" id="codigoProveedor" value={formData.codigoProveedor} onChange={handleChange} />

                <label htmlFor="identidad">Tipo de identificación</label>
                <select name="identidad" id="identidad" value={formData.identidad} onChange={handleChange}>
                    <option value="cuit">CUIT</option>
                    <option value="cuil">CUIL</option>
                    <option value="dni">DNI</option>
                    <option value="otro">OTRO</option>
                </select>

                <label htmlFor="numeroIdentidad">Número de Identificación</label>
                <input type="number" name="numeroIdentidad" id="numeroIdentidad" value={formData.numeroIdentidad} onChange={handleChange} />

                <label htmlFor="ivaCondicion">Condición IVA</label>
                <select name="ivaCondicion" id="ivaCondicion" value={formData.ivaCondicion} onChange={handleChange}>
                    <option value="iva Responsable Inscripto">IVA Responsable Inscripto</option>
                    <option value="iva Sujeto Exento">IVA Sujeto Exento</option>
                    <option value="consumidor Final">Consumidor Final</option>
                    <option value="responsable Monotributo">Responsable Monotributo</option>
                    <option value="sujeto No Categorizado">Sujeto No Categorizado</option>
                    <option value="proveedor Del Exterior">Proveedor del Exterior</option>
                    <option value="cliente Del Exterior">Cliente del Exterior</option>
                    <option value="iva Liberado">IVA Liberado-LEY N19640</option>
                    <option value="monotributo Social">Monotributo Social</option>
                    <option value="iva No Alcanzado">IVA No Alcanzado</option>
                </select>

                <label htmlFor="emailProveedor">Email</label>
                <input type="email" name="emailProveedor" id="emailProveedor" value={formData.emailProveedor} onChange={handleChange} />

                <label htmlFor="telefonoProveedor">Teléfono</label>
                <input type="text" name="telefonoProveedor" id="telefonoProveedor" value={formData.telefonoProveedor} onChange={handleChange} />

                <label htmlFor="domicilioProveedor">Domicilio</label>
                <input type="text" name="domicilioProveedor" id="domicilioProveedor" value={formData.domicilioProveedor} onChange={handleChange} />

                <label htmlFor="paisProveedor">País</label>
                <input type="text" name="paisProveedor" id="paisProveedor" value={formData.paisProveedor} onChange={handleChange} />

                <label htmlFor="provinciaProveedor">Provincia</label>
                <input type="text" name="provinciaProveedor" id="provinciaProveedor" value={formData.provinciaProveedor} onChange={handleChange} />

                <label htmlFor="localidadProveedor">Localidad</label>
                <input type="text" name="localidadProveedor" id="localidadProveedor" value={formData.localidadProveedor} onChange={handleChange} />

                <button type="submit">Cargar</button>
                <button type="button" onClick={() => Navigate("/administrative-panel")}>Volver Panel Administrativo</button>
            </form>
        </div>
    );
};

export default LoadNewProvider;
