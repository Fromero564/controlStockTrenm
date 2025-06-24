import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import '../../assets/styles/loadNewProduct.css';

const LoadNewProduct = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        const formData = {
            nombre: e.target.productName.value.trim(),
            categoria: e.target.selectCategory.value,
        };

        if (!formData.nombre) {
            alert("Por favor ingresá un nombre de producto.");
            setIsSubmitting(false);
            return;
        }

        try {
            
            const response = await fetch(`${API_URL}/product-load`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccessMessage("✅ Producto cargado correctamente.");
                e.target.reset();
            } else {
                console.error("Error al enviar los datos");
                alert("❌ Error al cargar el producto.");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert("❌ Error en la conexión.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (

        <div>
            <Navbar />
            <div className="product-form-container">

                <form onSubmit={handleSubmit}>
                    <label htmlFor="productName">Nombre del Producto</label>
                    <input type="text" name="productName" id="productName" />

                    <label htmlFor="selectCategory">Categoría</label>
                    <select name="selectCategory" id="selectCategory">
                        <option value="primario">Primario</option>
                        <option value="principal">Principal</option>
                        <option value="subproducto">Subproducto</option>
                    </select>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Cargando..." : "Cargar"}
                    </button>

                    <button type="button" onClick={() => navigate("/all-products-availables")}>
                        Cancelar
                    </button>
                </form>

                {successMessage && (
                    <p className="success-message">{successMessage}</p>
                )}
            </div>
        </div>
    );
};

export default LoadNewProduct;
