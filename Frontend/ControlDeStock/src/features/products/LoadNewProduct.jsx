import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Swal from "sweetalert2";
import '../../assets/styles/loadNewProduct.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

const LoadNewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [subproductos, setSubproductos] = useState([]);

  const [selectedSubproducto, setSelectedSubproducto] = useState(null);
  const [cantidad, setCantidad] = useState("");

  const [productData, setProductData] = useState({
    codigo: "",
    nombre: "",
    categoriaId: "",
    tipo: "externo",
    min_stock: "",
    max_stock: ""
  });


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_URL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        if (!id) return;

        const response = await fetch(`${API_URL}/product/${id}`);
        if (!response.ok) throw new Error("No se pudo cargar el producto");

        const data = await response.json();
        setProductData({
           codigo: data.id?.toString() || "",
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

    if (productData.codigo) {
      payload.id = parseInt(productData.codigo);
    }


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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubproductos = subproductos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(subproductos.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const productOptions = allProducts.map(p => ({
    value: p.id.toString(),
    label: p.product_name
  }));

  const handleAddSubproducto = () => {
    if (!selectedSubproducto || !cantidad) {
      Swal.fire("Atención", "Debes seleccionar un subproducto y la cantidad", "warning");
      return;
    }

    const existe = subproductos.some(sp => sp.subproductId === selectedSubproducto.value);
    if (existe) {
      Swal.fire("Atención", "Ese subproducto ya fue agregado.", "warning");
      return;
    }

    setSubproductos([...subproductos, { subproductId: selectedSubproducto.value, quantity: cantidad }]);
    setSelectedSubproducto(null);
    setCantidad("");
  };

  const eliminarSubproducto = (globalIndex, sub) => {
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
        if (sub.id) {
          try {
            const response = await fetch(`${API_URL}/delete-subproduct/${sub.id}`, {
              method: "DELETE"
            });

            const data = await response.json();

            if (response.ok) {
              const updated = subproductos.filter((_, i) => i !== globalIndex);
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
          const updated = subproductos.filter((_, i) => i !== globalIndex);
          setSubproductos(updated);
          Swal.fire("Eliminado", "Subproducto eliminado localmente.", "success");
        }
      }
    });
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
          <label>Código del Producto (opcional)</label>
          <input
            type="number"
            name="codigo"
            value={productData.codigo}
            onChange={handleChange}
            placeholder="Ej: 105"
          />

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

          <h3>Agregar Subproducto</h3>
          <div className="subproduct-add-container">
            <div style={{ flex: 1 }}>
              <Select
                classNamePrefix="react-select"
                value={selectedSubproducto}
                onChange={(opt) => setSelectedSubproducto(opt)}
                options={productOptions}
                placeholder="Buscar subproducto..."
                isClearable
              />
            </div>
            <input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
            <button type="button" onClick={handleAddSubproducto}>Agregar</button>
          </div>

          <h3>Subproductos Generados</h3>
          <ul className="subproduct-list">
            {currentSubproductos.map((item, index) => {
              const globalIndex = indexOfFirstItem + index;
              const producto = allProducts.find(p => p.id.toString() === item.subproductId);
              const nombreProducto = producto ? producto.product_name.toUpperCase() : "SIN NOMBRE";

              return (
                <li key={globalIndex}>
                  <span>{nombreProducto} ------- CANTIDAD {item.quantity}</span>
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => eliminarSubproducto(globalIndex, item)}
                    style={{ cursor: "pointer", marginLeft: "10px", color: "#dc3545" }}
                  />
                </li>
              );
            })}
          </ul>

          <div className="pagination-controls">
            <button type="button" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button type="button" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Siguiente</button>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
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
