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
    const [productData, setProductData] = useState({
        nombre: "",
        categoria: "",
        tipo: "externo"
    });

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`${API_URL}/product/${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setProductData({
                            nombre: data.product_name || "",
                            categoria: data.product_category || "",
                            tipo: data.product_type || "externo"
                        });
                    } else {
                        Swal.fire("Error", "No se pudo cargar el producto.", "error");
                        navigate("/all-products-availables");
                    }
                } catch (error) {
                    console.error("Error al traer el producto:", error);
                    Swal.fire("Error de conexión", "", "error");
                    navigate("/all-products-availables");
                }
            };
            fetchProduct();
        }
    }, [id, API_URL, navigate]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await fetch(`${API_URL}/all-product-categories`);
                if (response.ok) {
                    const data = await response.json();
                    setCategoriasDisponibles(data);

                    // Setear la primera categoría automáticamente si está vacío
                    if (data.length > 0 && !productData.categoria) {
                        setProductData(prev => ({
                            ...prev,
                            categoria: data[0].category_name
                        }));
                    }
                } else {
                    console.error("No se pudieron cargar las categorías.");
                }
            } catch (error) {
                console.error("Error al traer categorías:", error);
            }
        };

        fetchCategorias();
    }, [API_URL, productData.categoria]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Validación de campos obligatorios
        if (!productData.nombre.trim() || !productData.categoria.trim() || !productData.tipo.trim()) {
            Swal.fire("Atención", "Todos los campos son obligatorios.", "warning");
            setIsSubmitting(false);
            return;
        }

        const confirmResult = await Swal.fire({
            title: id ? "¿Actualizar producto?" : "¿Cargar nuevo producto?",
            text: id ? "Vas a actualizar este producto." : "Vas a guardar un nuevo producto.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: id ? "Actualizar" : "Cargar",
            cancelButtonText: "Cancelar"
        });

        if (!confirmResult.isConfirmed) {
            setIsSubmitting(false);
            return;
        }

        try {
            const method = id ? "PUT" : "POST";
            const url = id ? `${API_URL}/product-update/${id}` : `${API_URL}/product-load`;

            const payload = {
                product_name: productData.nombre,
                product_category: productData.categoria,
                product_general_category: productData.tipo
            };

            console.log("Payload enviado:", payload);

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await Swal.fire({
                    icon: "success",
                    title: id ? "Producto actualizado" : "Producto cargado",
                    text: id ? "Se actualizó correctamente." : "Se guardó correctamente.",
                    confirmButtonText: "Aceptar"
                });
                navigate("/all-products-availables");
            } else {
                const err = await response.json();
                Swal.fire("Error", err.mensaje || "Error al guardar el producto.", "error");
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
            <div className="product-form-container">
                <h2>{id ? "Editar Producto" : "Cargar Nuevo Producto"}</h2>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="nombre">Nombre del Producto</label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={productData.nombre}
                        onChange={handleChange}
                    />

                    <label htmlFor="categoria">Categoría</label>
                    <select
                        name="categoria"
                        id="categoria"
                        value={productData.categoria}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Seleccionar categoría</option>
                        {categoriasDisponibles.map((cat) => (
                            <option key={cat.id} value={cat.category_name}>
                                {cat.category_name}
                            </option>
                        ))}
                    </select>

                    <fieldset className="radio-group">
                        <legend>Tipo de Producto</legend>
                        <label>
                            <input
                                type="radio"
                                name="tipo"
                                value="externo"
                                checked={productData.tipo === "externo"}
                                onChange={handleChange}
                            />
                            Externo
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="tipo"
                                value="propio"
                                checked={productData.tipo === "propio"}
                                onChange={handleChange}
                            />
                            Propio
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="tipo"
                                value="ambos"
                                checked={productData.tipo === "ambos"}
                                onChange={handleChange}
                            />
                            Ambos
                        </label>
                    </fieldset>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : id ? "Actualizar" : "Cargar"}
                    </button>

                    <button type="button" onClick={() => navigate("/all-products-availables")}>
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoadNewProduct;
