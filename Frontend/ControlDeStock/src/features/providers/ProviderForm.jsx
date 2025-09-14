import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import Navbar from "../../components/Navbar.jsx";
import "../../assets/styles/providerForm.css";

const ProviderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const [tipoIngreso, setTipoIngreso] = useState("romaneo");
  const [providers, setProviders] = useState([]);
  const [cortes, setCortes] = useState([]);

  const [cortesAgregados, setCortesAgregados] = useState([]);
  const [congeladosAgregados, setCongeladosAgregados] = useState([]);

  const [mostrarCongelados, setMostrarCongelados] = useState(false);
  const [errorCongeladoDuplicado, setErrorCongeladoDuplicado] = useState(false);
  const [ultimoRegistroFactura, setUltimoRegistroFactura] = useState([]);

  const [formState, setFormState] = useState({
    proveedor: "",
    romaneo: "",
  });

  // === NUEVO: numeroRomaneo en cortes (para identification_product)
  const [nuevoCorte, setNuevoCorte] = useState({
    tipo: "",
    cantidad: "",
    cabezas: "",
    pesoRomaneo: "",
    numeroRomaneo: "", // <—
  });

  // === NUEVO: codigo en congelados (para identification_product)
  const [nuevoCongelado, setNuevoCongelado] = useState({
    tipo: "",
    cantidad: "",
    unidades: "",
    codigo: "", // <—
  });

  const cortesPorPagina = 5;
  const congeladosPorPagina = 5;
  const [paginaCortes, setPaginaCortes] = useState(1);
  const [paginaCongelados, setPaginaCongelados] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/allProviders`)
      .then((res) => res.json())
      .then((data) =>
        setProviders(Array.isArray(data) ? data : data.providers || [])
      )
      .catch((err) => console.error("Error proveedores:", err));
  }, []);

  useEffect(() => {
    if (!id) {
      fetch(`${API_URL}/last-provider-bill`)
        .then((res) => res.json())
        .then((data) => setUltimoRegistroFactura(data?.id ? data.id + 1 : 1))
        .catch((err) => console.error("Error última factura:", err));
    }
  }, [id]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${API_URL}/product-name`);
        const data = await response.json();
        const productos = Array.isArray(data)
          ? data
              .filter((p) =>
                ["externo", "ambos"].includes(
                  p.product_general_category?.toLowerCase()
                )
              )
              .map((p) => ({
                id: p.id,
                nombre: p.product_name,
                // Si no tiene categoría, guardamos vacío
                categoria: p.category?.category_name || "",
              }))
          : [];
        setCortes(productos);
      } catch (e) {
        console.error("Error productos:", e);
      }
    };
    fetchProductos();
  }, []);

  const opciones = useMemo(
    () => cortes.map((c) => ({ value: c.id, label: c.nombre })),
    [cortes]
  );

  useEffect(() => {
    if (id && cortes.length > 0) {
      const fetchData = async () => {
        try {
          const res = await fetch(`${API_URL}/chargeUpdateBillDetails/${id}`);
          const data = await res.json();

          setTipoIngreso(data.tipo_ingreso);
          setUltimoRegistroFactura(data.internal_number);
          setFormState({ proveedor: data.proveedor, romaneo: data.romaneo });

          if (Array.isArray(data.detalles)) {
            const mapped = data.detalles.map((d) => {
              const prod = cortes.find(
                (p) => p.nombre === d.tipo || p.id === d.tipo
              );
              return {
                id: d.id,
                tipo: d.tipo,
                nombre: prod?.nombre || d.tipo,
                cantidad: Number(d.cantidad) || 0,
                cabezas: Number(d.cabezas) || 0,
                cod: prod?.id || "",
                // Si no hay categoria, dejamos ""
                categoria: prod?.categoria || "",
                pesoRomaneo: Number(d.pesoRomaneo ?? d.peso ?? 0),
                identification_product: Number(d.identification_product ?? 0),
                numeroRomaneo: Number(d.identification_product ?? 0),
              };
            });
            setCortesAgregados(mapped);
          }

          if (Array.isArray(data.congelados)) {
            const mapped = data.congelados.map((g) => {
              const prod = cortes.find(
                (p) => p.nombre === g.tipo || p.id === g.tipo
              );
              return {
                id: g.id,
                tipo: g.tipo,
                nombre: prod?.nombre || g.tipo,
                cantidad: Number(g.cantidad) || 0,
                unidades: Number(g.peso || g.weight) || 0,
                cod: prod?.id || "",
                categoria: prod?.categoria || "",
                identification_product: Number(g.identification_product ?? 0),
                codigo: Number(g.identification_product ?? 0),
              };
            });
            setCongeladosAgregados(mapped);
            setMostrarCongelados(true);
          }
        } catch (e) {
          console.error("Error edit data:", e);
        }
      };
      fetchData();
    }
  }, [id, cortes, API_URL]);

  const handleCorteChange = (e) => {
    const { name, value } = e.target;
    setNuevoCorte((prev) => ({ ...prev, [name]: value }));
  };

  const handleCongeladoChange = (e) => {
    const { name, value } = e.target;
    setNuevoCongelado((prev) => ({ ...prev, [name]: value }));
  };

  const agregarCorte = async () => {
    const seleccion = opciones.find((o) => o.value === nuevoCorte.tipo);
    if (!seleccion || !nuevoCorte.cantidad || !nuevoCorte.cabezas) return;

    const prodSel = cortes.find((c) => c.id === seleccion.value);
    if (!prodSel) return;

    // ⚠️ Aviso si el producto no tiene categoría, pero permitimos continuar
    if (!prodSel.categoria) {
      await Swal.fire({
        title: "Producto sin categoría",
        text: "Este producto no tiene categoría. Se guardará sin categoría.",
        icon: "info",
        confirmButtonText: "Continuar",
      });
    }

    const nuevo = {
      idTemp: Date.now(),
      tipo: seleccion.value,
      nombre: seleccion.label,
      cantidad: Number(nuevoCorte.cantidad),
      cabezas: Number(nuevoCorte.cabezas),
      cod: seleccion.value,
      // Guardamos vacío si no hay categoría
      categoria: prodSel.categoria || "",
      pesoRomaneo: Number(nuevoCorte.pesoRomaneo) || 0,
      identification_product: Number(nuevoCorte.numeroRomaneo) || 0,
      numeroRomaneo: Number(nuevoCorte.numeroRomaneo) || 0,
    };

    const next = [...cortesAgregados, nuevo];
    setCortesAgregados(next);
    setPaginaCortes(Math.ceil(next.length / cortesPorPagina));

    setNuevoCorte({
      tipo: "",
      cantidad: "",
      cabezas: "",
      pesoRomaneo: "",
      numeroRomaneo: "",
    });
  };

  const agregarCongelado = async () => {
    if (!nuevoCongelado.tipo || !nuevoCongelado.cantidad) return;

    const existe = congeladosAgregados.some(
      (it) => it.cod === nuevoCongelado.tipo
    );
    if (existe) {
      setErrorCongeladoDuplicado(true);
      return;
    }

    const prod = cortes.find((p) => p.id === nuevoCongelado.tipo);
    if (!prod) return;

    // ⚠️ Aviso si el producto no tiene categoría, pero permitimos continuar
    if (!prod.categoria) {
      await Swal.fire({
        title: "Producto sin categoría",
        text: "Este producto no tiene categoría. Se guardará sin categoría.",
        icon: "info",
        confirmButtonText: "Continuar",
      });
    }

    const item = {
      tipo: prod.nombre,
      cantidad: Number(nuevoCongelado.cantidad) || 0,
      unidades: Number(nuevoCongelado.unidades) || 0,
      cod: prod.id,
      // Guardamos vacío si no hay categoría
      categoria: prod.categoria || "",
      identification_product: Number(nuevoCongelado.codigo) || 0,
      codigo: Number(nuevoCongelado.codigo) || 0,
    };

    const next = [...congeladosAgregados, item];
    setCongeladosAgregados(next);
    setPaginaCongelados(Math.ceil(next.length / congeladosPorPagina));

    setNuevoCongelado({ tipo: "", cantidad: "", unidades: "", codigo: "" });
    setErrorCongeladoDuplicado(false);
  };

  const eliminarCorte = async (idCorte) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el corte seleccionado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    const existeEnBD = cortesAgregados.some((c) => c.id === idCorte);

    if (existeEnBD) {
      try {
        const r = await fetch(`${API_URL}/delete-bill-detail/${idCorte}`, {
          method: "DELETE",
        });
        if (!r.ok) throw new Error();
      } catch {
        Swal.fire("Error", "No se pudo eliminar en el backend", "error");
        return;
      }
    }

    const next = cortesAgregados.filter(
      (c) => (existeEnBD ? c.id !== idCorte : c.idTemp !== idCorte)
    );
    setCortesAgregados(next);
    setPaginaCortes((p) =>
      Math.min(p, Math.max(1, Math.ceil(next.length / cortesPorPagina)))
    );
    Swal.fire("Eliminado", "Corte eliminado", "success");
  };

  const eliminarCongelado = async (indexAbs) => {
    const item = congeladosAgregados[indexAbs];

    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto congelado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    const existeEnBD = !!item.id;

    if (existeEnBD) {
      try {
        const r = await fetch(`${API_URL}/delete-bill-detail/${item.id}`, {
          method: "DELETE",
        });
        if (!r.ok) throw new Error();
      } catch {
        Swal.fire("Error", "No se pudo eliminar en el backend", "error");
        return;
      }
    }

    const next = congeladosAgregados.filter((_, i) => i !== indexAbs);
    setCongeladosAgregados(next);
    setPaginaCongelados((p) =>
      Math.min(p, Math.max(1, Math.ceil(next.length / congeladosPorPagina)))
    );
    Swal.fire("Eliminado", "Producto eliminado", "success");
  };

  const totalPesoRomaneoCortes = useMemo(
    () =>
      cortesAgregados.reduce(
        (acc, it) => acc + (Number(it.pesoRomaneo) || 0),
        0
      ),
    [cortesAgregados]
  );

  const totalUnidadesCortes = useMemo(
    () =>
      cortesAgregados.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0),
    [cortesAgregados]
  );

  const totalCargasCortes = cortesAgregados.length;

  const totalUnidadesCong = useMemo(
    () =>
      congeladosAgregados.reduce(
        (acc, it) => acc + (Number(it.cantidad) || 0),
        0
      ),
    [congeladosAgregados]
  );
  const totalPesoCong = useMemo(
    () =>
      congeladosAgregados.reduce(
        (acc, it) => acc + (Number(it.unidades) || 0),
        0
      ),
    [congeladosAgregados]
  );
  const totalCargasCong = congeladosAgregados.length;

  const totalPaginasCortes = Math.max(
    1,
    Math.ceil(cortesAgregados.length / cortesPorPagina)
  );
  const totalPaginasCongelados = Math.max(
    1,
    Math.ceil(congeladosAgregados.length / congeladosPorPagina)
  );

  const cortesEnPagina = useMemo(() => {
    const start = (paginaCortes - 1) * cortesPorPagina;
    return cortesAgregados.slice(start, start + cortesPorPagina);
  }, [cortesAgregados, paginaCortes]);

  const congeladosEnPagina = useMemo(() => {
    const start = (paginaCongelados - 1) * congeladosPorPagina;
    return congeladosAgregados.slice(start, start + congeladosPorPagina);
  }, [congeladosAgregados, paginaCongelados]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      cortesAgregados.length === 0 &&
      (!mostrarCongelados || congeladosAgregados.length === 0)
    ) {
      Swal.fire(
        "Error",
        "Debe agregar al menos cortes o productos congelados",
        "error"
      );
      return;
    }
    if (!formState.proveedor?.trim()) {
      Swal.fire("Error", "Debe seleccionar un proveedor", "error");
      return;
    }
    const romaneoNumber = Number(formState.romaneo);
    if (!romaneoNumber) {
      Swal.fire("Error", "Debe ingresar un Nº de romaneo válido", "error");
      return;
    }

    const pesoTotal =
      totalPesoRomaneoCortes +
      congeladosAgregados.reduce(
        (acc, it) => acc + (Number(it.unidades) || 0),
        0
      );

    // NOTA: cada corte/congelado incluye identification_product
    const formData = {
      proveedor: formState.proveedor.trim(),
      romaneo: romaneoNumber,
      tipoIngreso,
      pesoTotal,
      cantidad: totalUnidadesCortes,
      cabezas: cortesAgregados.reduce(
        (acc, it) => acc + (Number(it.cabezas) || 0),
        0
      ),
      cortes: cortesAgregados.map(({ idTemp, ...rest }) => rest),
      congelados: mostrarCongelados ? congeladosAgregados : [],
      fresh_quantity: totalUnidadesCong,
      fresh_weight: totalPesoCong,
    };

    try {
      const res = await fetch(
        id ? `${API_URL}/update-provider-bill/${id}` : `${API_URL}/uploadProduct`,
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) {
        const t = await res.text();
        Swal.fire("Error", t || "Error al guardar", "error");
        return;
      }
      const data = await res.json();
      tipoIngreso === "romaneo"
        ? navigate("/meat-load")
        : navigate(`/meat-manual-income/${data.id}`);
    } catch (e) {
      Swal.fire("Error", "Error en la solicitud", "error");
    }
  };

  return (
    <div className="provider-form-scope">
      <Navbar />
      <div style={{ margin: "20px" }}>
        <button className="boton-volver" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>

      <div className="new-register-container">
        <form onSubmit={handleSubmit} className="form-container-provider">
          <h2 className="form-title">{id ? "Editar Registro" : "Nuevo Registro"}</h2>

          <div className="title-remit-div">
            <label className="label-provider-form">TIPO DE INGRESO</label>
            <label className="label-provider-form">N° COMPROBANTE: {ultimoRegistroFactura}</label>
          </div>

          <div className="radio-buttons">
            {["romaneo", "manual"].map((val) => (
              <div className="radius-style" key={val}>
                <input
                  type="radio"
                  name="tipoIngreso"
                  value={val}
                  checked={tipoIngreso === val}
                  onChange={() => setTipoIngreso(val)}
                />
                <label>{val.toUpperCase()}</label>
              </div>
            ))}
          </div>

          <div className="provider-remit-romaneo">
            <label className="label-provider-form">
              PROVEEDOR:
              <select
                className="input"
                value={formState.proveedor}
                onChange={(e) =>
                  setFormState({ ...formState, proveedor: e.target.value })
                }
              >
                <option value="">Seleccionar proveedor</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.provider_name}>
                    {p.provider_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="label-provider-form">
              Nº COMPROBANTE ROMANEO:
              <input
                type="number"
                className="input"
                value={formState.romaneo}
                onChange={(e) =>
                  setFormState({ ...formState, romaneo: e.target.value })
                }
              />
            </label>
          </div>

          <div className="checkbox-congelado">
            <label>
              <input
                type="checkbox"
                checked={mostrarCongelados}
                onChange={(e) => setMostrarCongelados(e.target.checked)}
              />
              Otros productos
            </label>
          </div>

          {/* CORTES */}
          <div className="cortes-section">
            <div className="corte-card">
              <div className="input-group">
                <label>TIPO</label>
                <Select
                  options={opciones}
                  value={opciones.find((o) => o.value === nuevoCorte.tipo) || null}
                  onChange={(s) =>
                    setNuevoCorte({ ...nuevoCorte, tipo: s?.value || "" })
                  }
                  placeholder="Producto"
                  isClearable
                />
              </div>
              <div className="input-group">
                <label>CANTIDAD</label>
                <input
                  type="number"
                  name="cantidad"
                  value={nuevoCorte.cantidad}
                  onChange={handleCorteChange}
                />
              </div>
              <div className="input-group">
                <label>CABEZAS</label>
                <input
                  type="number"
                  name="cabezas"
                  value={nuevoCorte.cabezas}
                  onChange={handleCorteChange}
                />
              </div>
              <div className="input-group">
                <label>PESO ROMANEO (kg)</label>
                <input
                  type="number"
                  name="pesoRomaneo"
                  value={nuevoCorte.pesoRomaneo}
                  onChange={handleCorteChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="input-group">
                <label>{tipoIngreso === "manual" ? "N° TROPA" : "Nº GARRON"}</label>
                <input
                  type="number"
                  name="numeroRomaneo"
                  value={nuevoCorte.numeroRomaneo}
                  onChange={handleCorteChange}
                  min="0"
                />
              </div>

              <button type="button" onClick={agregarCorte} className="btn-add">
                Agregar
              </button>
            </div>

            <div className="cortes-list">
              <div className="row-header">
                <span>Producto</span>
                <span>Cantidad</span>
                <span>Cabezas</span>
                <span>Peso (kg)</span>
                <span>{tipoIngreso === "manual" ? "N° Tropa" : "N° Garron"}</span>
                <span></span>
              </div>

              {cortesEnPagina.map((corte) => (
                <div className="corte-row" key={corte.id || corte.idTemp}>
                  <span className="pill">{corte.nombre}</span>
                  <span className="pill">{corte.cantidad}</span>
                  <span className="pill">{corte.cabezas}</span>
                  <span className="pill">
                    {corte.pesoRomaneo?.toFixed
                      ? corte.pesoRomaneo.toFixed(2)
                      : corte.pesoRomaneo}{" "}
                  </span>
                  <span className="pill">
                    {corte.numeroRomaneo ?? corte.identification_product ?? ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => eliminarCorte(corte.id || corte.idTemp)}
                    className="pill pill-danger"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}

              {cortesAgregados.length > cortesPorPagina && (
                <div className="pager">
                  <button
                    onClick={() =>
                      setPaginaCortes((p) => Math.max(1, p - 1))
                    }
                    disabled={paginaCortes <= 1}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {paginaCortes} de {totalPaginasCortes}
                  </span>
                  <button
                    onClick={() =>
                      setPaginaCortes((p) =>
                        Math.min(totalPaginasCortes, p + 1)
                      )
                    }
                    disabled={paginaCortes >= totalPaginasCortes}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            <div className="totales-linea">
              <b>Cantidad de unidades: {totalUnidadesCortes}</b>
              <b>Cantidad de cargas: {totalCargasCortes}</b>
              <b>Peso romaneo total: {totalPesoRomaneoCortes.toFixed(2)} kg</b>
            </div>
          </div>

          {/* CONGELADOS */}
          {mostrarCongelados && (
            <div className="cortes-section">
              <h4>OTROS PRODUCTOS</h4>

              <div className="corte-card">
                {errorCongeladoDuplicado && (
                  <p style={{ color: "red" }}>Ya existe.</p>
                )}

                <div className="input-group">
                  <label>TIPO</label>
                  <Select
                    options={opciones}
                    value={
                      opciones.find((o) => o.value === nuevoCongelado.tipo) ||
                      null
                    }
                    onChange={(s) =>
                      setNuevoCongelado({ ...nuevoCongelado, tipo: s?.value || "" })
                    }
                    placeholder="Producto"
                    isClearable
                  />
                </div>
                <div className="input-group">
                  <label>CANTIDAD</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={nuevoCongelado.cantidad}
                    onChange={handleCongeladoChange}
                  />
                </div>
                <div className="input-group">
                  <label>PESO (kg)</label>
                  <input
                    type="number"
                    name="unidades"
                    value={nuevoCongelado.unidades}
                    onChange={handleCongeladoChange}
                  />
                </div>
                {/* NUEVO: Código (identification_product) */}
                <div className="input-group">
                  <label>CÓDIGO</label>
                  <input
                    type="number"
                    name="codigo"
                    value={nuevoCongelado.codigo}
                    onChange={handleCongeladoChange}
                  />
                </div>

                <button
                  type="button"
                  onClick={agregarCongelado}
                  className="btn-add"
                >
                  Agregar
                </button>
              </div>

              <div className="cortes-list">
                <div className="row-header">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Peso (kg)</span>
                  <span>Código</span>
                  <span></span>
                </div>

                {congeladosEnPagina.map((item, i) => {
                  const indexAbs =
                    i + (paginaCongelados - 1) * congeladosPorPagina;
                  return (
                    <div className="corte-row" key={indexAbs}>
                      <span className="pill">{item.tipo}</span>
                      <span className="pill">{item.cantidad}</span>
                      <span className="pill">{item.unidades}</span>
                      <span className="pill">
                        {item.codigo ?? item.identification_product ?? ""}
                      </span>
                      <button
                        type="button"
                        className="pill pill-danger"
                        onClick={() => eliminarCongelado(indexAbs)}
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {congeladosAgregados.length > congeladosPorPagina && (
                  <div className="pager">
                    <button
                      onClick={() =>
                        setPaginaCongelados((p) => Math.max(1, p - 1))
                      }
                      disabled={paginaCongelados <= 1}
                    >
                      Anterior
                    </button>
                    <span>
                      Página {paginaCongelados} de {totalPaginasCongelados}
                    </span>
                    <button
                      onClick={() =>
                        setPaginaCongelados((p) =>
                          Math.min(totalPaginasCongelados, p + 1)
                        )
                      }
                      disabled={paginaCongelados >= totalPaginasCongelados}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>

              <div className="totales-linea">
                <b>Cantidad de unidades: {totalUnidadesCong}</b>
                <b>Cantidad de cargas: {totalCargasCong}</b>
                <b>Peso total: {totalPesoCong.toFixed(2)} kg</b>
              </div>
            </div>
          )}

          <div className="button-container">
            <button type="submit" className="button-primary">
              {tipoIngreso === "romaneo"
                ? "Cargar por romaneo"
                : "Cargar y completar carga manual"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("/operator-panel")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderForm;
