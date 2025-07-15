import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Swal from "sweetalert2";
import '../../assets/styles/loadNewCategory.css';

const LoadCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Detecta si estamos editando
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const isEditMode = !!id;

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      try {
        const res = await fetch(`${API_URL}/product-category/${id}`);
        if (!res.ok) throw new Error("Error al obtener la categoría");
        const data = await res.json();
        setCategoryName(data.category_name || "");
      } catch (err) {
        console.error("Error al cargar categoría:", err);
        Swal.fire("Error", "No se pudo cargar la categoría.", "error");
        navigate("/product-categories-list");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = categoryName.trim();

    if (trimmedName === "") {
      return Swal.fire("Error", "El nombre de la categoría no puede estar vacío.", "warning");
    }

    const formattedName = trimmedName.toUpperCase();

    try {
      const res = await fetch(`${API_URL}/${isEditMode ? `category-product-edit/${id}` : "uploadCategory"}`, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category_name: formattedName }),
      });

      if (res.ok) {
        await Swal.fire("Éxito", `Categoría ${isEditMode ? "actualizada" : "cargada"} correctamente.`, "success");
        navigate("/product-categories-list");
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
       <div style={{ margin: "20px" }}>
                <button className="boton-volver" onClick={() => navigate(-1)}>
                    ⬅ Volver
                </button>
            </div>
      <div className="category-form-container">
        <h2>{isEditMode ? "Editar Categoría" : "Cargar Nueva Categoría"}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="nombre">Nombre de la Categoría</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <div className="category-form-buttons">
            <button type="submit" className="category-btn-primary">
              {isEditMode ? "Actualizar" : "Cargar"}
            </button>
            <button
              type="button"
              className="category-btn-secondary"
              onClick={() => navigate("/product-categories-list")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadCategory;
