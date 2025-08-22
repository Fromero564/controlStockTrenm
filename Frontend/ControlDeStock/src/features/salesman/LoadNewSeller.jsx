import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/loadNewSeller.css";

const API_URL = import.meta.env.VITE_API_URL;

const LoadNewSeller = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Si viene id, estamos editando

    const [form, setForm] = useState({
        code: "",
        name: "",
        province: "",
        city: "",
        street: "",
        number: "",
        floor: "",
        office: "",
    });

    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [loading, setLoading] = useState(true);

    // Si es nuevo, calcula el siguiente código; si es edición, carga el vendedor
    useEffect(() => {
        if (id) {
            // Traer datos del vendedor para editar
            fetch(`${API_URL}/seller/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.ok && data.seller) {
                        setForm({
                            code: data.seller.code || "",
                            name: data.seller.name || "",
                            province: data.seller.province || "",
                            city: data.seller.city || "",
                            street: data.seller.street || "",
                            number: data.seller.number || "",
                            floor: data.seller.floor || "",
                            office: data.seller.office || "",
                        });
                    }
                })
                .finally(() => setLoading(false));
        } else {
            // Es nuevo: calcula el siguiente código
            fetch(`${API_URL}/all-sellers`)
                .then(res => res.json())
                .then(data => {
                    if (data.ok && data.sellers && data.sellers.length > 0) {
                        const lastId = Math.max(...data.sellers.map(s => s.id));
                        setForm(f => ({ ...f, code: (lastId + 1).toString() }));
                    } else {
                        setForm(f => ({ ...f, code: "1" }));
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    // Provincias y localidades igual que antes
    useEffect(() => {
        fetch("https://apis.datos.gob.ar/georef/api/provincias")
            .then(res => res.json())
            .then(data => {
                const provinciasOrdenadas = data.provincias
                    .map(p => p.nombre)
                    .sort((a, b) => a.localeCompare(b));
                setProvincias(provinciasOrdenadas);
            });
    }, []);

    useEffect(() => {
        if (!form.province) {
            setLocalidades([]);
            return;
        }
        setLocalidades([]);
        fetch(
            `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(form.province)}&max=1000`
        )
            .then(res => res.json())
            .then(data => {
                const localidadesOrdenadas = data.localidades
                    .map(loc => loc.nombre)
                    .sort((a, b) => a.localeCompare(b));
                setLocalidades(localidadesOrdenadas);
            });
    }, [form.province]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
            ...(e.target.name === "province" ? { city: "" } : {})
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (id) {
                // EDITAR: PUT o PATCH
                response = await fetch(`${API_URL}/update-seller/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            } else {
                // NUEVO: POST
                response = await fetch(`${API_URL}/create-salesman`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            }

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: id ? "Vendedor editado" : "Vendedor creado",
                    text: id
                        ? "Los datos del vendedor fueron actualizados correctamente."
                        : "El vendedor fue agregado correctamente.",
                    timer: 1800,
                    showConfirmButton: false,
                });
                setTimeout(() => {
                    navigate("/seller-list");
                }, 1300);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: id
                        ? "No se pudo editar el vendedor."
                        : "No se pudo crear el vendedor.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error de red",
                text: "No se pudo conectar con el servidor.",
            });
        }
    };

    return (
        <div className="seller-bg">
            <Navbar />
            
            <div className="seller-modal">
                <h2 className="seller-title">
                    {id ? "EDITAR VENDEDOR" : "NUEVO VENDEDOR"}
                </h2>
                <div className="seller-code">
                    <span>CÓDIGO: </span>
                    <b>{form.code}</b>
                </div>
                <form onSubmit={handleSubmit} className="seller-form">
                    <div className="seller-label">NOMBRE</div>
                    <input
                        type="text"
                        name="name"
                        className="seller-input"
                        placeholder="Nombre"
                        value={form.name}
                        onChange={handleChange}
                    />
                    <div className="seller-row">
                        <div className="seller-col">
                            <div className="seller-label">PROVINCIA</div>
                            <select
                                name="province"
                                className="seller-select"
                                value={form.province}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione una provincia</option>
                                {provincias.map((prov) => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>
                        <div className="seller-col">
                            <div className="seller-label">LOCALIDAD</div>
                            <select
                                name="city"
                                className="seller-select"
                                value={form.city}
                                onChange={handleChange}
                                disabled={!form.province}
                            >
                                <option value="">Seleccione una localidad</option>
                                {localidades.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="seller-label" style={{ marginTop: "20px" }}>DOMICILIO</div>
                    <div className="seller-row">
                        <div className="seller-col">
                            <div className="seller-sub-label">CALLE</div>
                            <input
                                type="text"
                                name="street"
                                className="seller-input"
                                placeholder="Calle"
                                value={form.street}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="seller-col">
                            <div className="seller-sub-label">NÚMERO</div>
                            <input
                                type="text"
                                name="number"
                                className="seller-input"
                                placeholder="Número"
                                value={form.number}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="seller-row">
                        <div className="seller-col">
                            <div className="seller-sub-label">PISO</div>
                            <input
                                type="text"
                                name="floor"
                                className="seller-input"
                                placeholder="Piso"
                                value={form.floor}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="seller-col">
                            <div className="seller-sub-label">OFICINA</div>
                            <input
                                type="text"
                                name="office"
                                className="seller-input"
                                placeholder="Oficina"
                                value={form.office}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="seller-btn-row">
                        <button type="submit" className="seller-btn seller-btn-primary">
                            {id ? "Guardar Cambios" : "Agregar vendedor"}
                        </button>
                        <button
                            type="button"
                            className="seller-btn seller-btn-outline"
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoadNewSeller;
