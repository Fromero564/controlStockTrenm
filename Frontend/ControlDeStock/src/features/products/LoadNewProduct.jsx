import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Swal from "sweetalert2";
import '../../assets/styles/loadNewProduct.css';

const LoadNewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [subproductos, setSubproductos] = useState([{ subproductId: "", quantity: "" }]);

  const [productData, setProductData] = useState({
    nombre: "",
    categoriaId: "",
    tipo: "externo",
    min_stock: "",
    max_stock: ""
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Traer todos los productos disponibles
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/all-products-availables`);
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Error al traer todos los productos:", error);
      }
    };
    fetchAllProducts();
  }, [API_URL]);

  // Traer todas las categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/all-product-categories`);
        const data = await response.json();
        setCategoriasDisponibles(data);
      } catch (error) {
        console.error("Error al traer categorías:", error);
      }
    };
    fetchCategorias();
  }, [API_URL]);

  // Si hay un ID, cargar el producto existente para editar
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        if (!id) return;

        const response = await fetch(`${API_URL}/product/${id}`);
        if (!response.ok) throw new Error("No se pudo cargar el producto");

        const data = await response.json();
        setProductData({
          nombre: data.product_name,
          categoriaId: data.category_id?.toString() || "",
          tipo: data.product_general_category,
          min_stock: data.min_stock?.toString() || "",
          max_stock: data.max_stock?.toString() || ""
        });

        if (data.subproducts && data.subproducts.length > 0) {
          const mapped = data.subproducts.map(sp => ({
             id: sp.id?.toString() || "",
            subproductId: sp.subproduct_id?.toString() || "",
            quantity: sp.quantity?.toString() || ""
          }));
          setSubproductos(mapped);
        } else {
          setSubproductos([{ subproductId: "", quantity: "" }]);
        }

      } catch (error) {
        console.error("Error al cargar producto para editar:", error);
      }
    };

    fetchProducto();
  }, [id, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!productData.nombre || !productData.categoriaId || !productData.tipo || productData.min_stock === "" || productData.max_stock === "") {
      Swal.fire("Atención", "Todos los campos son obligatorios.", "warning");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      product_name: productData.nombre,
      category_id: parseInt(productData.categoriaId),
      product_general_category: productData.tipo,
      min_stock: parseInt(productData.min_stock),
      max_stock: parseInt(productData.max_stock),
      subproducts: subproductos.filter(sp => sp.subproductId && sp.quantity)
    };

    try {
      const url = id
        ? `${API_URL}/product-update/${id}`
        : `${API_URL}/product-load-with-subproducts`;

      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Swal.fire("Éxito", `Producto ${id ? "actualizado" : "creado"} correctamente.`, "success");
        navigate("/all-products-availables");
      } else {
        const err = await response.json();
        Swal.fire("Error", err.message || "Error al guardar el producto.", "error");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire("Error en la conexión", "", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>
      <div className="product-form-container">
        <h2>{id ? "Editar Producto" : "Cargar Nuevo Producto"}</h2>

        <form onSubmit={handleSubmit}>
          <label>Nombre del Producto</label>
          <input type="text" name="nombre" value={productData.nombre} onChange={handleChange} />

          <label>Categoría</label>
          <select name="categoriaId" value={productData.categoriaId} onChange={handleChange}>
            <option value="">Seleccionar categoría</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>

          <label>Stock Mínimo</label>
          <input type="number" name="min_stock" value={productData.min_stock} onChange={handleChange} />

          <label>Stock Máximo</label>
          <input type="number" name="max_stock" value={productData.max_stock} onChange={handleChange} />

          <fieldset className="radio-group">
            <legend>Tipo de Producto</legend>
            <label>
              <input type="radio" name="tipo" value="externo" checked={productData.tipo === "externo"} onChange={handleChange} /> Externo
            </label>
            <label>
              <input type="radio" name="tipo" value="propio" checked={productData.tipo === "propio"} onChange={handleChange} /> Propio
            </label>
            <label>
              <input type="radio" name="tipo" value="ambos" checked={productData.tipo === "ambos"} onChange={handleChange} /> Ambos
            </label>
          </fieldset>

          <h3>Subproductos Generados</h3>
          {subproductos.map((item, index) => (
            <div key={index} className="subproduct-row">
              <select
                value={item.subproductId}
                onChange={(e) => {
                  const updated = [...subproductos];
                  updated[index].subproductId = e.target.value;
                  setSubproductos(updated);
                }}
              >
                <option value="">Seleccionar producto</option>
                {allProducts.map((prod) => (
                  <option key={prod.id} value={prod.id}>{prod.product_name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Cantidad"
                value={item.quantity}
                onChange={(e) => {
                  const updated = [...subproductos];
                  updated[index].quantity = e.target.value;
                  setSubproductos(updated);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  Swal.fire({
                    title: "¿Estás seguro?",
                    text: "Este subproducto se eliminará permanentemente.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar"
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      const subId = item.id; // Asegurate de traer el id en el GET de subproductos

                      if (subId) {
                        try {
                          const response = await fetch(`${API_URL}/delete-subproduct/${subId}`, {
                            method: "DELETE"
                          });

                          const data = await response.json();

                          if (response.ok) {
                            const updated = subproductos.filter((_, i) => i !== index);
                            setSubproductos(updated);
                            Swal.fire("Eliminado", "Subproducto eliminado correctamente.", "success");
                          } else {
                            Swal.fire("Error", data.message || "Error al eliminar subproducto.", "error");
                          }
                        } catch (error) {
                          console.error("Error al eliminar subproducto:", error);
                          Swal.fire("Error", "Error en la conexión.", "error");
                        }
                      } else {
                        
                        const updated = subproductos.filter((_, i) => i !== index);
                        setSubproductos(updated);
                        Swal.fire("Eliminado", "Subproducto eliminado localmente.", "success");
                      }
                    }
                  });
                }}
              >X</button>


            </div>
          ))}

          <div style={{ marginBottom: "1.5rem" }}>
            <button
              type="button"
              className="btn-add-subproduct"
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => setSubproductos([...subproductos, { subproductId: "", quantity: "" }])}
            >
              + Agregar subproducto
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer"
              }}
            >
              {isSubmitting ? "Guardando..." : id ? "Actualizar" : "Cargar"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/all-products-availables")}
              style={{
                backgroundColor: "#ccc",
                color: "#333",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadNewProduct;
