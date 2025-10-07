import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "../../assets/styles/allCategoriesList.css";
// 👇 importo el css de alltares para reutilizar el estilo del botón
import "../../assets/styles/alltares.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AllCategoriesList = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_URL}/all-product-categories`);
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const eliminarCategoria = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!resultado.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/deleteCategory/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.mensaje || "No se pudo eliminar la categoría");
      }

      setCategorias((prev) => prev.filter((cat) => cat.id !== id));

      await Swal.fire(
        "Eliminado",
        data?.mensaje || "Categoría eliminada correctamente.",
        "success"
      );
    } catch (err) {
      console.error("Error al eliminar categoría:", err);
      Swal.fire(
        "Error",
        err.message || "Ocurrió un error al eliminar la categoría.",
        "error"
      );
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button
          className="boton-volver"
          onClick={() => navigate("/product-configuration")}
        >
          ⬅ Volver
        </button>
      </div>

      {/* Botón con el MISMO estilo que en Alltares */}
      <div style={{ marginLeft: "20px", marginBottom: "12px" }}>
        <button
          className="new-button"
          onClick={() => navigate("/category-load")}
        >
          Cargar categorías <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <div className="categories-container">
        <h1 className="categories-title">Categorías de Productos</h1>

        {loading ? (
          <p className="categories-loading">Cargando...</p>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.category_name}</td>
                  <td>
                    <div className="categories-actions">
                      <button
                        className="categories-btn-icon categories-btn-edit"
                        onClick={() => navigate(`/category-load/${cat.id}`)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className="categories-btn-icon categories-btn-delete"
                        onClick={() => eliminarCategoria(cat.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan="3" className="categories-empty-message">
                    No hay categorías cargadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllCategoriesList;
