import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Swal from "sweetalert2";
import '../../assets/styles/loadNewCategory.css';

const LoadNewCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = categoryName.trim();

    if (trimmedName === "") {
      return Swal.fire("Error", "El nombre de la categoría no puede estar vacío.", "warning");
    }

    const formattedName = trimmedName.toUpperCase();
    console.log("Enviando categoría:", formattedName); // Debug opcional

    try {
      const response = await fetch(`${API_URL}/uploadCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category_name: formattedName }),
      });

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Categoría cargada",
          text: "Se guardó correctamente.",
          confirmButtonText: "Aceptar"
        });
        navigate("/all-products-availables");
      } else {
        const errorData = await response.json();
        console.error("Error al guardar categoría:", errorData);
        Swal.fire("Error", errorData?.error || "Error al guardar la categoría.", "error");
      }

    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire("Error en la conexión", "Verificá tu red o backend.", "error");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="category-form-container">
        <h2>Cargar Nueva Categoría</h2>
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
            <button type="submit" className="category-btn-primary">Cargar</button>
            <button
              type="button"
              className="category-btn-secondary"
              onClick={() => setCategoryName("")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadNewCategory;
