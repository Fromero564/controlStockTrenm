import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/allProductsAvailables.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const AllProductsAvailables = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/product-name`);
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const eliminarProducto = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar producto?",
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
      const res = await fetch(`${API_URL}/delete-product-available/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("No se pudo eliminar el producto");

      setProductos((prev) => prev.filter((prod) => prod.id !== id));

      await Swal.fire("Eliminado", "Producto eliminado correctamente.", "success");
    } catch (err) {
      console.error("Error al eliminar:", err);
      Swal.fire("Error", "Ocurrió un error al eliminar el producto.", "error");
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
      <div className="products-container">
        <h1 className="products-title">Listado de productos</h1>

        {loading ? (
          <p className="products-loading">Cargando...</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id}>
                  <td>{prod.id}</td>
                  <td>{prod.product_name}</td>
                  <td>{prod.category?.category_name || "Sin categoría"}</td>
                  <td>
                    <div className="products-actions">
                      <button
                        className="products-btn-icon products-btn-edit"
                        onClick={() => navigate(`/product-load/${prod.id}`)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className="products-btn-icon products-btn-delete"
                        onClick={() => eliminarProducto(prod.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan="4" className="products-empty-message">
                    No hay productos cargados.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        )}
      </div>
    </>
  );
};

export default AllProductsAvailables;
