import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Swal from "sweetalert2";
import "../../assets/styles/paymentConditionLoad.css";

const API_URL = import.meta.env.VITE_API_URL;

const PaymentConditionLoad = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/payment-conditions/${id}`);
        if (!res.ok) throw new Error("No encontrada");
        const data = await res.json();
        setName(data?.paymentCondition?.payment_condition || "");
      } catch (e) {
        Swal.fire("Error", "No se pudo cargar la condición de cobro.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payment_condition = name.trim();
    if (!payment_condition) {
      Swal.fire("Faltan datos", "El nombre es obligatorio.", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        isEdit ? `${API_URL}/payment-conditions/${id}` : `${API_URL}/payment-conditions`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_condition }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        Swal.fire("Error", data?.msg || "No se pudo guardar.", "error");
        return;
      }
      await Swal.fire(
        "¡Listo!",
        isEdit ? "Condición de cobro actualizada." : "Condición de cobro creada.",
        "success"
      );
      navigate("/list-payment-condition");
    } catch {
      Swal.fire("Error", "No se pudo completar la operación.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar condición de cobro?",
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
      const res = await fetch(`${API_URL}/payment-conditions/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        Swal.fire("Error", data?.msg || "No se pudo eliminar.", "error");
        return;
      }
      await Swal.fire("Eliminada", "Se eliminó correctamente.", "success");
      navigate("/all-payment-conditions");
    } catch {
      Swal.fire("Error", "No se pudo eliminar.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate('/sale-configuration')}>⬅ Volver</button>
      </div>

      <div className="pc-form-container">
        <h1 className="pc-form-title">{isEdit ? "EDITAR CONDICIÓN DE COBRO" : "NUEVA CONDICIÓN DE COBRO"}</h1>

        <form className="pc-form" onSubmit={handleSubmit}>
          <label htmlFor="payment_condition" className="pc-label">NOMBRE</label>
          <input
            id="payment_condition"
            name="payment_condition"
            type="text"
            className="pc-input"

            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <div className="pc-form-buttons">
            {isEdit && (
              <button type="button" className="pc-btn-secondary" onClick={handleDelete} disabled={loading}>
                Eliminar
              </button>
            )}
            <button type="button" className="pc-btn-secondary" onClick={() => navigate("/list-payment-condition")}>
              Cancelar
            </button>
            <button type="submit" className="pc-btn-primary" disabled={loading}>
              {isEdit ? "Guardar cambios" : "Agregar condición"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PaymentConditionLoad;
