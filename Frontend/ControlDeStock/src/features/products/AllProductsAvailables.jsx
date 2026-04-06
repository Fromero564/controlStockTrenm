import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/allProductsAvailables.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const AllProductsAvailables = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/product-name`);
        const data = await res.json();
        setProductos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [API_URL]);

  const productosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return productos;

    return productos.filter((prod) => {
      const codigo = String(prod.id || "").toLowerCase();
      const nombre = String(prod.product_name || "").toLowerCase();
      return codigo.includes(q) || nombre.includes(q);
    });
  }, [productos, search]);

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
        <button
          className="boton-volver"
          onClick={() => navigate("/product-configuration")}
        >
          ⬅ Volver
        </button>
      </div>

      <div className="products-container">
        <div className="products-header">
          <h1 className="products-title-style">Listado de productos</h1>
          <button
            className="btn-nuevo"
            onClick={() => navigate("/product-load")}
          >
            Agregar producto +
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "18px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            style={{
              width: "320px",
              maxWidth: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #c9d7e1",
              fontSize: "15px",
              outline: "none",
            }}
          />

          {search.trim() && (
            <button
              type="button"
              className="btn-nuevo"
              style={{
                padding: "10px 16px",
                fontSize: "14px",
              }}
              onClick={() => setSearch("")}
            >
              Limpiar
            </button>
          )}
        </div>

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
              {productosFiltrados.map((prod) => (
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

              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" className="products-empty-message">
                    {search.trim()
                      ? "No se encontraron productos con esa búsqueda."
                      : "No hay productos cargados."}
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