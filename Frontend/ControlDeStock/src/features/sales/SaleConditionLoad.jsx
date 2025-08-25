import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Swal from "sweetalert2";
import "../../assets/styles/conditionLoad.css";

const API_URL = import.meta.env.VITE_API_URL;

const SaleConditionLoad = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);


  const toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });


  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/sale-conditions/${id}`);
        if (!res.ok) throw new Error("No encontrada");
        const data = await res.json();
        setName(data?.condition?.condition_name || "");
      } catch (e) {
        Swal.fire("Error", "No se pudo cargar la condición.", "error");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const condition_name = name.trim();
    if (!condition_name) {
      Swal.fire("Faltan datos", "El nombre es obligatorio.", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        isEdit ? `${API_URL}/sale-conditions/${id}` : `${API_URL}/sale-conditions`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ condition_name }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        Swal.fire("Error", data?.msg || "Ocurrió un error en el servidor.", "error");
        return;
      }

      await Swal.fire(
        "¡Listo!",
        isEdit ? "Condición actualizada correctamente." : "Condición creada correctamente.",
        "success"
      );
      navigate("/list-sell-condition");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo completar la operación.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;

    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar esta condición de venta?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!isConfirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/sale-conditions/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        Swal.fire("Error", data?.msg || "No se pudo eliminar.", "error");
        return;
      }

      await Swal.fire("Eliminado", "La condición se eliminó correctamente.", "success");
      navigate("/all-sale-conditions");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo eliminar la condición.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>

      <div className="cond-form-container">
        <h1 className="cond-form-title">
          {isEdit ? "EDITAR CONDICIÓN" : "NUEVA CONDICIÓN"}
        </h1>

        <form className="cond-form" onSubmit={handleSubmit}>
          <label htmlFor="condition_name" className="cond-label">
            NOMBRE
          </label>
          <input
            id="condition_name"
            name="condition_name"
            type="text"
            className="cond-input"
            placeholder="Ej: CUENTA CORRIENTE"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <div className="cond-form-buttons">
            {isEdit && (
              <button
                type="button"
                className="cond-btn-secondary"
                onClick={handleDelete}
                disabled={loading}
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              className="cond-btn-secondary"
              onClick={() => navigate("/list-sell-condition")}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="cond-btn-primary" disabled={loading}>
              {isEdit ? "Guardar cambios" : "Agregar condición"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SaleConditionLoad;
