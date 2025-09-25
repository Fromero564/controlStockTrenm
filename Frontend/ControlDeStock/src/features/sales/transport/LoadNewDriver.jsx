import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../../components/Navbar";
import "../../../assets/styles/loadNewDriver.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoadNewDriver() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    driver_name: "",
    driver_surname: "",
    status: true, // true = activo, false = inactivo
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (!API_URL) {
      Swal.fire("Error", "Falta configurar VITE_API_URL", "error");
      return;
    }
    let abort = false;
    const fetchDriver = async () => {
      try {
        setFetching(true);
        const res = await fetch(`${API_URL}/drivers/${id}`);
        if (!res.ok) {
          const txt = await safeReadError(res);
          throw new Error(txt || "No se pudo obtener el chofer");
        }
        const data = await res.json();
        const d = data.driver || data;
        if (!abort)
          setForm({
            driver_name: d.driver_name || "",
            driver_surname: d.driver_surname || "",
            status: typeof d.status === "boolean" ? d.status : d.status === 1 || d.status === "1" || d.status === "true",
          });
      } catch (err) {
        Swal.fire("Error", err.message || "Error al cargar el chofer", "error");
      } finally {
        if (!abort) setFetching(false);
      }
    };
    if (id) fetchDriver();
    return () => {
      abort = true;
    };
  }, [id]);

  const isEdit = useMemo(() => Boolean(id), [id]);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    if (name === "status") {
      setForm((p) => ({ ...p, status: value === "true" }));
    } else {
      setForm((p) => ({ ...p, [name]: type === "number" ? Number(value) : value }));
    }
  };

  const validar = () => {
    const name = form.driver_name.trim();
    const surname = form.driver_surname.trim();
    if (!name && !surname) {
      Swal.fire("Atención", "Ingresá al menos el nombre o el apellido.", "warning");
      return false;
    }
    if (name.length > 255 || surname.length > 255) {
      Swal.fire("Atención", "Nombre o apellido excede 255 caracteres.", "warning");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!API_URL) {
      Swal.fire("Error", "Falta configurar VITE_API_URL", "error");
      return;
    }
    if (!validar()) return;

    try {
      setLoading(true);
      const payload = {
        driver_name: form.driver_name.trim(),
        driver_surname: form.driver_surname.trim(),
        status: !!form.status,
      };
      const url = isEdit ? `${API_URL}/drivers/${id}` : `${API_URL}/drivers`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await safeReadError(res);
        throw new Error(msg || "No se pudo guardar el chofer");
      }

      await Swal.fire("¡Listo!", isEdit ? "Chofer actualizado correctamente" : "Chofer creado correctamente", "success");
      navigate(-1);
    } catch (err) {
      Swal.fire("Error", err.message || "Ocurrió un error al guardar", "error");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    if (loading) return;
    navigate("/roadmap-options");
  };

  return (
    <div>
      <Navbar />
   
      <div className="driver-overlay">
           
        <form className="driver-card" onSubmit={onSubmit}>
          <h2 className="driver-title">{isEdit ? "EDITAR CHOFER" : "NUEVO CHOFER"}</h2>

          <div className="driver-field">
            <label>Nombre</label>
            <input
              type="text"
              name="driver_name"
              placeholder="Nombre"
              value={form.driver_name}
              onChange={onChange}
              disabled={fetching || loading}
              maxLength={255}
              autoComplete="off"
            />
          </div>

          <div className="driver-field">
            <label>Apellido</label>
            <input
              type="text"
              name="driver_surname"
              placeholder="Apellido"
              value={form.driver_surname}
              onChange={onChange}
              disabled={fetching || loading}
              maxLength={255}
              autoComplete="off"
            />
          </div>

          <div className="driver-field">
            <label>Estado</label>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="status"
                  value="true"
                  checked={form.status === true}
                  onChange={onChange}
                  disabled={fetching || loading}
                />
                Activo
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="status"
                  value="false"
                  checked={form.status === false}
                  onChange={onChange}
                  disabled={fetching || loading}
                />
                Inactivo
              </label>
            </div>
          </div>

          <div className="driver-actions">
            <button className="btn-primary" type="submit" disabled={loading || fetching}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function safeReadError(res) {
  try {
    const j = await res.json();
    return j?.message || j?.msg || j?.error || null;
  } catch {
    try {
      const t = await res.text();
      return t;
    } catch {
      return null;
    }
  }
}
