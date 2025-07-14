import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Swal from "sweetalert2";
import '../../assets/styles/loadNewWarehouse.css';

const LoadWarehouse = () => {
  const [warehouseName, setWarehouseName] = useState("");
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const isEditMode = !!id;

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    const fetchWarehouse = async () => {
      try {
        const res = await fetch(`${API_URL}/warehouse/${id}`);
        if (!res.ok) throw new Error("Error al obtener el depósito");
        const data = await res.json();
        setWarehouseName(data.Warehouse_name || "");
      } catch (err) {
        console.error("Error al cargar depósito:", err);
        Swal.fire("Error", "No se pudo cargar el depósito.", "error");
        navigate("/warehouses-list");
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouse();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = warehouseName.trim();

    if (trimmedName === "") {
      return Swal.fire("Error", "El nombre del depósito no puede estar vacío.", "warning");
    }

    const formattedName = trimmedName.toUpperCase();

    try {
      const res = await fetch(`${API_URL}/${isEditMode ? `warehouse-edit/${id}` : "warehouse-load"}`, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ warehouse_name: formattedName }),
      });

      if (res.ok) {
        await Swal.fire("Éxito", `Depósito ${isEditMode ? "actualizado" : "cargado"} correctamente.`, "success");
        navigate("/warehouses-list");
      } else {
        const error = await res.json();
        Swal.fire("Error", error?.mensaje || "Ocurrió un error.", "error");
      }

    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire("Error en la conexión", "Verificá tu red o backend.", "error");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <Navbar />
      <div className="warehouse-form-container">
        <h2>{isEditMode ? "Editar Depósito" : "Cargar Nuevo Depósito"}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="nombre">Nombre del Depósito</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={warehouseName}
            onChange={(e) => setWarehouseName(e.target.value)}
            required
          />
          <div className="warehouse-form-buttons">
            <button type="submit" className="warehouse-btn-primary">
              {isEditMode ? "Actualizar" : "Cargar"}
            </button>
            <button
              type="button"
              className="warehouse-btn-secondary"
              onClick={() => navigate("/warehouses-list")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadWarehouse;
