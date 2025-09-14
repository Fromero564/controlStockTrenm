import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import "../../assets/styles/loadNewSeller.css";

const API_URL = import.meta.env.VITE_API_URL;

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

const LoadNewSeller = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    code: "",
    name: "",
    country: "",
    province: "",
    city: "",
    street: "",
    number: "",
    floor: "",
    office: "",
    status: true
  });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  const esArgentina = form.country === "Argentina";

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const names = Array.isArray(data) ? data.map(c => c.name.common).sort((a,b)=>a.localeCompare(b)) : [];
        setCountries(names);
      })
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/seller/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.seller) {
            setForm({
              code: data.seller.code || "",
              name: data.seller.name || "",
              country: data.seller.country || "",
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

  const handleCountryChange = (e) => {
    const value = e.target.value;
    setForm(f => ({
      ...f,
      country: value,
      province: "",
      city: ""
    }));
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
              <div className="seller-label">PAÍS</div>
              <select
                name="country"
                className="seller-input"
                value={form.country}
                onChange={handleCountryChange}
              >
                <option value="">-- Seleccione un país --</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="seller-col">
              <div className="seller-label">PROVINCIA</div>
              {esArgentina ? (
                <select
                  name="province"
                  className="seller-input"
                  value={form.province}
                  onChange={handleChange}
                >
                  <option value="">Seleccione una provincia</option>
                  {PROVINCIAS_AR.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="province"
                  className="seller-input"
                  placeholder="Provincia"
                  value={form.province}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>

          <div className="seller-row">
            <div className="seller-col">
              <div className="seller-label">LOCALIDAD</div>
              <input
                type="text"
                name="city"
                className="seller-input"
                placeholder="Localidad"
                value={form.city}
                onChange={handleChange}
                list="city-suggest"
              />
              <datalist id="city-suggest"></datalist>
            </div>
            <div className="seller-col" />
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
