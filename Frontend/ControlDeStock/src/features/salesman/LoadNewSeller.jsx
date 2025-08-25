import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/loadNewSeller.css";

const API_URL = import.meta.env.VITE_API_URL;

const LoadNewSeller = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        code: "",
        name: "",
        province: "",
        city: "",
        street: "",
        number: "",
        floor: "",
        office: "",
        status: true
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
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
                            status: data.seller.status === 1 || data.seller.status === true
                        });
                    }
                })
                .finally(() => setLoading(false));
        } else {
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

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (id) {
                response = await fetch(`${API_URL}/update-seller/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            } else {
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
                            <input
                                type="text"
                                name="province"
                                className="seller-input"
                                placeholder="Provincia"
                                value={form.province}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="seller-col">
                            <div className="seller-label">LOCALIDAD</div>
                            <input
                                type="text"
                                name="city"
                                className="seller-input"
                                placeholder="Localidad"
                                value={form.city}
                                onChange={handleChange}
                            />
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
                    <div className="seller-label" style={{ marginTop: "20px" }}>ESTADO</div>
                    <div className="seller-row">
                        <label>
                            <input
                                type="radio"
                                name="status"
                                value="true"
                                checked={form.status === true}
                                onChange={() => setForm({ ...form, status: true })}
                            />
                            Activo
                        </label>
                        <label style={{ marginLeft: "15px" }}>
                            <input
                                type="radio"
                                name="status"
                                value="false"
                                checked={form.status === false}
                                onChange={() => setForm({ ...form, status: false })}
                            />
                            Inactivo
                        </label>
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
