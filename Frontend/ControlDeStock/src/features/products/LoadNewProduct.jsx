import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Swal from "sweetalert2";
import "../../assets/styles/loadNewProduct.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

const LoadNewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [defaultCategoryId, setDefaultCategoryId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [subproductos, setSubproductos] = useState([]);

  const [selectedSubproducto, setSelectedSubproducto] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("kg");

  const [productData, setProductData] = useState({
    codigo: "",
    nombre: "",
    categoriaId: "",
    tipo: "externo",
    min_stock: "",
    max_stock: "",
    alicuota: "",
    unit_measure: "UN",
  });

  const [errors, setErrors] = useState({
    nombre: false,
    alicuota: false,
    min_stock: false,
    max_stock: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_URL = import.meta.env.VITE_API_URL;

  const formatQuantity = (q, unit) => {
    const n = Number(q);
    if (Number.isNaN(n)) return q;
    if (unit === "kg") return n.toFixed(2);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  };

  const normalizeAlicuota = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const s = String(val).trim().replace(",", ".");
    const n = Number(s);
    if (!Number.isFinite(n)) return "";
    const fixed = Number(n.toFixed(2));
    if (Number.isInteger(fixed)) return String(fixed);
    return String(parseFloat(fixed.toString()));
  };

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/all-products-availables`);
        const data = await res.json();
        setAllProducts(data);
      } catch (err) {
        console.error("Error al traer todos los productos:", err);
      }
    };
    fetchAllProducts();
  }, [API_URL]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_URL}/all-product-categories`);
        const data = await res.json();
        setCategoriasDisponibles(data);

        const norm = (s) =>
          (s || "")
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .trim();

        const defCat = data.find((c) => {
          const n = norm(c.category_name);
          return n === "SIN CATEGORIA" || n.includes("SIN CATEG");
        });
        if (defCat) setDefaultCategoryId(defCat.id);
      } catch (err) {
        console.error("Error al traer categorías:", err);
      }
    };
    fetchCategorias();
  }, [API_URL]);

  useEffect(() => {
    const fetchProducto = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_URL}/product/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el producto");
        const data = await res.json();

        setProductData({
          codigo: data.id?.toString() || "",
          nombre: data.product_name || "",
          categoriaId: data.category_id?.toString() || "",
          tipo: data.product_general_category || "externo",
          min_stock: data.min_stock?.toString() || "",
          max_stock: data.max_stock?.toString() || "",
          alicuota: normalizeAlicuota(data.alicuota),
          unit_measure: (data.unit_measure || "UN").toUpperCase(),
        });

        if (Array.isArray(data.subproducts) && data.subproducts.length > 0) {
          const mapped = data.subproducts
            .filter((sp) => sp && sp.subproduct_id && sp.quantity != null)
            .map((sp) => ({
              id: sp.id?.toString() || "",
              subproductId: sp.subproduct_id?.toString() || "",
              quantity: Number(sp.quantity),
              unit: sp.unit || "kg",
            }));
          setSubproductos(mapped);
        } else {
          setSubproductos([]);
        }
      } catch (err) {
        console.error("Error al cargar producto para editar:", err);
      }
    };
    fetchProducto();
  }, [id, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validateRequired = () => {
    const missing = [];
    const nextErrors = {
      nombre: false,
      alicuota: false,
      min_stock: false,
      max_stock: false,
    };

    if (!productData.nombre?.trim()) {
      missing.push("Nombre del producto");
      nextErrors.nombre = true;
    }
    if (
      productData.alicuota === "" ||
      productData.alicuota === null ||
      productData.alicuota === undefined
    ) {
      missing.push("Alícuota");
      nextErrors.alicuota = true;
    }

    const minRaw = productData.min_stock === "" ? "0" : productData.min_stock;
    const maxRaw = productData.max_stock === "" ? "0" : productData.max_stock;

    const minVal = Number(minRaw);
    const maxVal = Number(maxRaw);

    const numericIssues = [];

    if (Number.isNaN(minVal) || minVal < 0 || !Number.isInteger(minVal)) {
      numericIssues.push("El stock mínimo debe ser un entero ≥ 0");
      nextErrors.min_stock = true;
    }
    if (Number.isNaN(maxVal) || maxVal < 0 || !Number.isInteger(maxVal)) {
      numericIssues.push("El stock máximo debe ser un entero ≥ 0");
      nextErrors.max_stock = true;
    }
    if (!Number.isNaN(minVal) && !Number.isNaN(maxVal) && minVal > maxVal) {
      numericIssues.push("El stock mínimo no puede ser mayor que el stock máximo");
      nextErrors.min_stock = true;
      nextErrors.max_stock = true;
    }

    setErrors(nextErrors);

    return { missing, numericIssues };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const { missing, numericIssues } = validateRequired();

    if (missing.length || numericIssues.length) {
      const listHtml = `
        ${
          missing.length
            ? `<p><b>Campos obligatorios sin completar:</b></p><ul>${missing
                .map((m) => `<li>${m}</li>`)
                .join("")}</ul>`
            : ""
        }
        ${
          numericIssues.length
            ? `<p style="margin-top:8px"><b>Revisá estos valores:</b></p><ul>${numericIssues
                .map((m) => `<li>${m}</li>`)
                .join("")}</ul>`
            : ""
        }
      `;
      await Swal.fire({
        icon: "warning",
        title: "Revisá el formulario",
        html: listHtml,
        confirmButtonText: "Entendido",
      });
      setTimeout(() => {
        const el = document.querySelector(".input-error");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);

      setIsSubmitting(false);
      return;
    }

    let categoryIdToSend = null;
    if (productData.categoriaId) {
      categoryIdToSend = parseInt(productData.categoriaId, 10);
    } else {
      const { isConfirmed } = await Swal.fire({
        icon: "info",
        title: "Producto sin categoría",
        text: defaultCategoryId
          ? 'Se guardará asignando la categoría "Sin categoría". ¿Deseás continuar?'
          : "Se guardará sin categoría (NULL). ¿Deseás continuar?",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Cancelar",
      });
      if (!isConfirmed) {
        setIsSubmitting(false);
        return;
      }
      categoryIdToSend = defaultCategoryId ? parseInt(defaultCategoryId, 10) : null;
    }

    const subproductosValidos = Array.isArray(subproductos)
      ? subproductos
          .filter(
            (sp) =>
              sp &&
              typeof sp.subproductId === "string" &&
              sp.subproductId.trim() !== "" &&
              sp.quantity != null &&
              !Number.isNaN(Number(sp.quantity)) &&
              Number(sp.quantity) > 0
          )
          .map((sp) => ({
            ...sp,
            quantity: Number(sp.quantity),
          }))
      : [];

    const payload = {
      product_name: productData.nombre.trim(),
      category_id: categoryIdToSend,
      product_general_category: productData.tipo,
      min_stock:
        productData.min_stock === "" ? 0 : parseInt(productData.min_stock, 10),
      max_stock:
        productData.max_stock === "" ? 0 : parseInt(productData.max_stock, 10),
      alicuota:
        productData.alicuota !== "" ? parseFloat(productData.alicuota) : null,
      unit_measure: (productData.unit_measure || "UN").toUpperCase(),
      subproducts: subproductosValidos,
    };

    if (productData.codigo) payload.id = parseInt(productData.codigo, 10);

    try {
      const url = id
        ? `${API_URL}/product-update/${id}`
        : `${API_URL}/product-load-with-subproducts`;
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await Swal.fire(
          "Éxito",
          `Producto ${id ? "actualizado" : "creado"} correctamente.`,
          "success"
        );
        navigate("/all-products-availables");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.message || "Error al guardar el producto.", "error");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
      Swal.fire("Error en la conexión", "", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubproductos = subproductos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(subproductos.length / itemsPerPage) || 1;

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const productOptions = allProducts
    .filter((p) => !subproductos.some((sp) => sp.subproductId === p.id.toString()))
    .map((p) => ({
      value: p.id.toString(),
      label: p.product_name,
    }));

  const handleAddSubproducto = () => {
    if (
      !selectedSubproducto ||
      !selectedSubproducto.value ||
      cantidad === "" ||
      Number.isNaN(Number(cantidad)) ||
      Number(cantidad) <= 0
    ) {
      Swal.fire(
        "Atención",
        "Debes seleccionar un subproducto, una cantidad válida y una unidad",
        "warning"
      );
      return;
    }

    const existe = subproductos.some(
      (sp) => sp.subproductId === selectedSubproducto.value
    );
    if (existe) {
      Swal.fire("Atención", "Ese subproducto ya fue agregado.", "warning");
      return;
    }

    setSubproductos((prev) => [
      ...prev,
      { subproductId: selectedSubproducto.value, quantity: Number(cantidad), unit: unidad },
    ]);
    setSelectedSubproducto(null);
    setCantidad("");
    setUnidad("kg");
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
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      if (sub.id) {
        try {
          const res = await fetch(`${API_URL}/delete-subproduct/${sub.id}`, {
            method: "DELETE",
          });
          const data = await res.json();

          if (res.ok) {
            const updated = subproductos.filter((_, i) => i !== globalIndex);
            setSubproductos(updated);
            Swal.fire("Eliminado", "Subproducto eliminado correctamente.", "success");
          } else {
            Swal.fire(
              "Error",
              data.message || "Error al eliminar subproducto.",
              "error"
            );
          }
        } catch (err) {
          console.error("Error al eliminar subproducto:", err);
          Swal.fire("Error", "Error en la conexión.", "error");
        }
      } else {
        const updated = subproductos.filter((_, i) => i !== globalIndex);
        setSubproductos(updated);
        Swal.fire("Eliminado", "Subproducto eliminado localmente.", "success");
      }
    });
  };

  return (
    <div>
      <Navbar />

      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .input-error { border: 2px solid #dc3545 !important; outline: none; }
        .input-error:focus { box-shadow: 0 0 0 3px rgba(220,53,69,.25); }
        .label-error { color: #dc3545; }
        .required-asterisk { color: #dc3545; margin-left: 4px; }
      `}</style>

      <div style={{ margin: "20px" }}>
        <button
          className="boton-volver"
          onClick={() => navigate("/product-configuration")}
        >
          ⬅ Volver
        </button>
      </div>

      <div className="product-form-container">
        <h2>{id ? "Editar Producto" : "Cargar Nuevo Producto"}</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="product-form-fields">
            <div className="form-group">
              <label>Código del Producto (opcional)</label>
              <input
                type="number"
                name="codigo"
                value={productData.codigo}
                onChange={handleChange}
                placeholder="Ej: 105"
              />
            </div>

            <div className="form-group name-row">
              <label className={errors.nombre ? "label-error" : undefined}>
                Nombre del Producto
                <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={productData.nombre}
                onChange={handleChange}
                className={errors.nombre ? "input-error" : undefined}
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select
                name="categoriaId"
                value={productData.categoriaId}
                onChange={handleChange}
              >
                <option value="">Sin categoría</option>
                {categoriasDisponibles.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className={errors.min_stock ? "label-error" : undefined}>
                Stock Mínimo<span className="required-asterisk">*</span>
              </label>
              <input
                type="number"
                name="min_stock"
                value={productData.min_stock}
                onChange={handleChange}
                className={errors.min_stock ? "input-error" : undefined}
                inputMode="numeric"
              />
            </div>

            <div className="form-group">
              <label className={errors.max_stock ? "label-error" : undefined}>
                Stock Máximo<span className="required-asterisk">*</span>
              </label>
              <input
                type="number"
                name="max_stock"
                value={productData.max_stock}
                onChange={handleChange}
                className={errors.max_stock ? "input-error" : undefined}
                inputMode="numeric"
              />
            </div>

            <div className="form-group">
              <label className={errors.alicuota ? "label-error" : undefined}>
                Alícuota (%)<span className="required-asterisk">*</span>
              </label>
              <select
                name="alicuota"
                value={productData.alicuota}
                onChange={handleChange}
                className={errors.alicuota ? "input-error" : undefined}
              >
                <option value="">Seleccioná una alícuota</option>
                <option value="10.5">ALICUOTA REDUCIDA 10,5%</option>
                <option value="21">ALICUOTA NORMAL 21%</option>
                <option value="27">ALICUOTA 27%</option>
                <option value="0">EXENTO</option>
                <option value="0">NO GRAVADO</option>
              </select>
            </div>

            <div className="form-group">
              <label>Unidad de venta</label>
              <select
                name="unit_measure"
                value={productData.unit_measure}
                onChange={handleChange}
              >
                <option value="UN">UNIDAD</option>
                <option value="KG">KG</option>
              </select>
            </div>

            <div className="form-group span-2">
              <fieldset className="radio-group">
                <legend>Tipo de Producto</legend>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="externo"
                    checked={productData.tipo === "externo"}
                    onChange={handleChange}
                  />{" "}
                  Externo
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="propio"
                    checked={productData.tipo === "propio"}
                    onChange={handleChange}
                  />{" "}
                  Propio
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="ambos"
                    checked={productData.tipo === "ambos"}
                    onChange={handleChange}
                  />{" "}
                  Ambos
                </label>
              </fieldset>
            </div>
          </div>

          <div className="product-form-subproducts">
            <h3>Agregar Subproducto</h3>
            <div className="subproduct-add-container">
              <div className="subproduct-search">
                <Select
                  classNamePrefix="react-select"
                  value={selectedSubproducto}
                  onChange={(opt) => {
                    setSelectedSubproducto(opt);
                    if (opt) {
                      const prod = allProducts.find(
                        (p) => p.id.toString() === opt.value
                      );
                      if (prod && prod.unit_measure) {
                        const base = String(prod.unit_measure).toUpperCase();
                        setUnidad(base === "KG" ? "kg" : "unidad");
                      } else {
                        setUnidad("kg");
                      }
                    } else {
                      setUnidad("kg");
                    }
                  }}
                  options={productOptions}
                  placeholder="Buscar subproducto..."
                  isClearable
                />
              </div>

              {/* 👇 Bloqueado cuando hay un subproducto seleccionado */}
              <select
                className="subproduct-unit"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                disabled={!!selectedSubproducto}
              >
                <option value="kg">KG</option>
                <option value="unidad">UNIDAD</option>
              </select>

              <input
                type="number"
                placeholder={unidad === "kg" ? "Peso" : "Cantidad"}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="subproduct-qty"
                inputMode="decimal"
              />

              <button type="button" onClick={handleAddSubproducto}>
                Agregar
              </button>
            </div>

            {subproductos.length > 0 && (
              <>
                <h3>Subproductos Generados</h3>
                <ul className="subproduct-list">
                  {currentSubproductos.map((item, index) => {
                    const globalIndex = indexOfFirstItem + index;
                    const producto = allProducts.find(
                      (p) => p.id.toString() === item.subproductId
                    );
                    const nombreProducto = producto
                      ? producto.product_name.toUpperCase()
                      : "SIN NOMBRE";

                    return (
                      <li key={globalIndex}>
                        <span className="subproduct-name">{nombreProducto}</span>
                        <span className="subproduct-qty">
                          {formatQuantity(item.quantity, item.unit)} {item.unit}
                        </span>
                        <FontAwesomeIcon
                          icon={faTrash}
                          onClick={() => eliminarSubproducto(globalIndex, item)}
                          style={{
                            cursor: "pointer",
                            marginLeft: "10px",
                            color: "#dc3545",
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>

                <div className="pagination-controls">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : id ? "Actualizar" : "Cargar"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/all-products-availables")}
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

