const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, fn, col, where } = require("sequelize");
const moment = require("moment");
const { stringify } = require("querystring");

const billSupplier = db.BillSupplier;
const ProductSubproduct = db.ProductSubproduct;
const meatIncome = db.MeatIncome;
const billDetail = db.BillDetail;
const tare = db.Tare;
const ProductsAvailable = db.ProductsAvailable;
const ProcessMeat = db.ProcessMeat;
const ObservationsMeatIncome = db.ObservationsMeatIncome;
const ProductStock = db.ProductStock;
const OtherProductManual = db.OtherProductManual;
const ProductCategories = db.ProductCategories


const operatorApiController = {
    getAllOtherProductsManual: async (req, res) => {
        try {
            const allOtherProducts = await OtherProductManual.findAll({});
            res.json(allOtherProducts)
        } catch (error) {
            console.error("Error al obtener los productos congelados/otros cargados de forma manual:", error);
            res.status(500).json({ error: "Error al obtener los productos congelados/otros cargados de forma manual" })
        }
    },
    getAllProductCatagories: async (req, res) => {

        try {
            const allProductsCategories = await ProductCategories.findAll({});
            res.json(allProductsCategories)
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            res.status(500).json({ error: "No se pueden cargar las categorias" })
        }
    },
    loadNewCategory: async (req, res) => {
        const { category_name } = req.body;

        // Validación: que venga un nombre
        if (!category_name || category_name.trim() === "") {
            return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
        }

        // Formateo del nombre a mayúsculas
        const formattedName = category_name.trim().toUpperCase();

        try {
            // Crear directamente sin verificar duplicado
            await ProductCategories.create({
                category_name: formattedName
            });

            res.status(201).json({ message: "Categoría creada correctamente" });

        } catch (error) {
            console.error("Error al crear categoría:", error);
            res.status(500).json({ error: "No se pudo crear la categoría" });
        }
    },
    getProductStock: async (req, res) => {
        try {
            const AllProductStock = await ProductStock.findAll({
                include: [
                    {
                        model: ProductsAvailable,
                        as: "productAvailable",
                        attributes: ["min_stock", "max_stock"],
                    },
                ],
            });


            const result = AllProductStock.map(stock => {
                return {
                    id: stock.id,
                    product_name: stock.product_name,
                    product_quantity: stock.product_quantity,
                    product_cod: stock.product_cod,
                    product_category: stock.product_category,
                    min_stock: stock.productAvailable?.min_stock || 0,
                    max_stock: stock.productAvailable?.max_stock || 0,

                };
            });

            res.json(result);
        } catch (error) {
            console.error("Error al obtener los productos", error);
            res.status(500).json({ error: "Error al obtener los productos" });
        }
    },


    loadLastBillSupplier: async (req, res) => {
        try {
            const ultimoRegistro = await billSupplier.findOne({
                order: [['id', 'DESC']],
            });

            res.json(ultimoRegistro);
        } catch (error) {
            console.error("Error al obtener el último registro:", error);
            res.status(500).json({ error: "Error al obtener el último registro" });
        }

    },
    stockAvailable: async (req, res) => {
        try {
            const billDetailProductos = await billDetail.findAll({
                attributes: ['type', 'quantity'],
                raw: true
            });

            const processMeat = await ProcessMeat.findAll({
                attributes: ['type', 'quantity'],
                raw: true
            });


            const allProducts = [...billDetailProductos, ...processMeat];


            const grouped = allProducts.reduce((acc, item) => {
                if (!acc[item.type]) {
                    acc[item.type] = 0;
                }
                acc[item.type] += item.quantity;
                return acc;
            }, {});


            const result = Object.entries(grouped).map(([type, quantity]) => ({
                type,
                quantity
            }));

            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el stock disponible' });
        }

    },
    alltares: async (req, res) => {
        try {
            const alltares = await tare.findAll({});
            res.json(alltares);
        } catch (error) {
            console.error("Error al obtener Taras:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }


    },
    tareLoad: async (req, res) => {
        const { tareName, tareWeight } = req.body;

        if (!tareName || !tareWeight) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        await tare.create({
            tare_name: tareName,
            tare_weight: tareWeight,
        })

        return res.status(201).json({ mensaje: "Todos los productos fueron cargados correctamente." });


    },
    tareLoadFind: async (req, res) => {
        try {
            const { id } = req.params;

            const taraEncontrada = await tare.findOne({
                where: { id: id },
            });



            if (!taraEncontrada) {
                return res.status(404).json({ message: "Tara no encontrada" });
            }

            return res.status(200).json(taraEncontrada);
        } catch (error) {
            console.error("Error al buscar tara:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    editTare: async (req, res) => {
        const { id } = req.params;
        const { tareName, tareWeight } = req.body;

        try {
            const [updated] = await tare.update(
                {
                    tare_name: tareName,
                    tare_weight: tareWeight,
                },
                {
                    where: { id: id }
                }
            );

            if (updated === 0) {
                return res.status(404).json({ message: "Tara no encontrada o sin cambios." });
            }

            return res.json({ message: "Tara actualizada correctamente." });
        } catch (error) {
            console.error("Error al actualizar tara:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    deleteTare: async (req, res) => {
        const { id } = req.params;

        try {
            const eliminado = await tare.destroy({
                where: { id: id }
            });

            if (eliminado === 0) {
                return res.status(404).json({ message: "Tara no encontrada." });
            }

            return res.json({ message: "Tara eliminada correctamente." });
        } catch (error) {
            console.error("Error al eliminar tara:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    uploadProducts: async (req, res) => {
        try {
            console.log("Datos recibidos en backend:", req.body);

            const {
                proveedor,
                pesoTotal,
                cabezas,
                romaneo,
                tipoIngreso,
                cantidad,
                cortes,
                congelados = []
            } = req.body;

            if (
                proveedor === undefined || proveedor === "" ||
                pesoTotal === undefined || pesoTotal === "" ||
                cabezas === undefined || cabezas === null ||
                romaneo === undefined || romaneo === ""
            ) {
                return res.status(400).json({ message: "Faltan campos obligatorios." });
            }

            if (
                tipoIngreso === "romaneo" &&
                (!Array.isArray(cortes) || cortes.length === 0) &&
                (!Array.isArray(congelados) || congelados.length === 0)
            ) {
                return res.status(400).json({ message: "Debe proporcionar al menos un corte o un congelado para ingreso con romaneo." });
            }
            if (tipoIngreso !== "romaneo" && tipoIngreso !== "manual") {
                return res.status(400).json({ message: "Tipo de ingreso inválido." });
            }

            let fresh_quantity = 0;
            let fresh_weight = 0;

            if (Array.isArray(congelados) && congelados.length > 0) {
                for (const prod of congelados) {
                    if (!prod.tipo || prod.cantidad == null || prod.unidades == null) {
                        return res.status(400).json({ message: "Cada producto congelado debe tener tipo, cantidad y unidades." });
                    }

                    fresh_quantity += Number(prod.cantidad);
                    fresh_weight += Number(prod.unidades);
                }
            }

            const nuevoRegistro = await billSupplier.create({
                supplier: proveedor,
                total_weight: pesoTotal,
                head_quantity: cabezas,
                quantity: cantidad,
                romaneo_number: romaneo,
                income_state: tipoIngreso,
                check_state: tipoIngreso === "romaneo",
                fresh_quantity,
                fresh_weight,
            });

            // Guardar cortes frescos
            if (Array.isArray(cortes) && cortes.length > 0) {
                for (const corte of cortes) {
                    const { tipo, nombre, cantidad, cabezas, cod, categoria } = corte;

                    if (!nombre || cantidad == null || cabezas == null) {
                        return res.status(400).json({ message: "Cada corte debe tener nombre, cantidad y cabezas." });
                    }

                    await billDetail.create({
                        bill_supplier_id: nuevoRegistro.id,
                        type: nombre,
                        quantity: cantidad,
                        heads: cabezas,
                        weight: corte.pesoRomaneo || 0
                    });


                    // Solo actualizar stock si es romaneo
                    if (tipoIngreso === 'romaneo') {
                        const existingProduct = await ProductStock.findOne({
                            where: { product_name: nombre }
                        });

                        if (existingProduct) {
                            await existingProduct.increment('product_quantity', { by: cantidad });
                        } else {
                            await ProductStock.create({
                                product_name: nombre,
                                product_quantity: cantidad,
                                product_cod: cod,
                                product_category: categoria
                            });
                        }
                    }
                }
            }

            // Guardar congelados
            if (Array.isArray(congelados) && congelados.length > 0) {
                for (const congelado of congelados) {
                    const nombreFinal = congelado.nombre || congelado.tipo;

                    if (!nombreFinal || congelado.cantidad == null || congelado.unidades == null) {
                        console.log("Producto congelado inválido:", congelado);
                        continue;
                    }

                    const { cantidad, unidades, cod, categoria } = congelado;

                    await billDetail.create({
                        bill_supplier_id: nuevoRegistro.id,
                        type: nombreFinal,
                        quantity: cantidad,
                        heads: 0,
                        weight: unidades
                    });

                    // Solo actualizar stock si es romaneo
                    if (tipoIngreso === 'romaneo') {
                        const existingFrozen = await ProductStock.findOne({
                            where: { product_name: nombreFinal }
                        });

                        if (existingFrozen) {
                            await existingFrozen.increment('product_quantity', { by: cantidad });
                        } else {
                            await ProductStock.create({
                                product_name: nombreFinal,
                                product_quantity: cantidad,
                                product_cod: cod,
                                product_category: categoria
                            });
                        }
                    }
                }
            }



            return res.status(201).json({
                id: nuevoRegistro.id,
                romaneo: nuevoRegistro.romaneo_number,
            });

        } catch (error) {
            console.error("Error al cargar datos:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    updateProviderBill: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                proveedor,
                pesoTotal,
                romaneo,
                cabezas,
                cantidad,
                tipoIngreso,
                cortes = [],
                congelados = [],
                fresh_quantity = 0,
                fresh_weight = 0
            } = req.body;

            if (!id) return res.status(400).json({ message: "Falta el ID del registro a actualizar." });

            if (
                proveedor === undefined || proveedor === "" ||
                pesoTotal === undefined || pesoTotal === "" ||
                romaneo === undefined || romaneo === "" ||
                cabezas === undefined || cabezas === null
            ) {
                return res.status(400).json({ message: "Faltan campos obligatorios." });
            }

            await billSupplier.update(
                {
                    supplier: proveedor,
                    total_weight: pesoTotal,
                    romaneo_number: romaneo,
                    head_quantity: cabezas,
                    quantity: cantidad,
                    fresh_quantity,
                    fresh_weight,
                    income_state: tipoIngreso,
                    check_state: tipoIngreso === "romaneo",
                },
                { where: { id } }
            );

            // === CORTES ===
            if (Array.isArray(cortes)) {
                for (const corte of cortes) {
                    const { id: corteId, tipo, cantidad, cabezas, cod, categoria } = corte;

                    if (!tipo || cantidad == null || cabezas == null) {
                        return res.status(400).json({ message: "Cada corte debe tener tipo, cantidad y cabezas." });
                    }

                    let nombreProducto = tipo;

                    if (!isNaN(tipo)) {
                        const producto = await ProductsAvailable.findByPk(tipo);
                        if (producto) {
                            nombreProducto = producto.product_name;
                        }
                    }

                    if (corteId) {
                        await billDetail.update(
                            { type: nombreProducto, quantity: cantidad, heads: cabezas, weight: 0 },
                            { where: { id: corteId, bill_supplier_id: id } }
                        );
                    } else {
                        await billDetail.create({
                            bill_supplier_id: nuevoRegistro.id,
                            type: nombre,
                            quantity: cantidad,
                            heads: cabezas,
                            weight: corte.pesoRomaneo || 0
                        });


                        // Crear o actualizar stock
                        const existing = await ProductStock.findOne({ where: { product_name: nombreProducto } });
                        if (existing) {
                            existing.product_quantity += Number(cantidad);
                            await existing.save();
                        } else {
                            await ProductStock.create({
                                product_name: nombreProducto,
                                product_quantity: cantidad,
                                product_cod: cod || `AUTO-${nombreProducto}`,
                                product_category: categoria || "desconocida"
                            });
                        }
                    }
                }
            }

            // === CONGELADOS ===
            if (Array.isArray(congelados)) {
                for (const congelado of congelados) {
                    const { id: congeladoId, tipo, cantidad, unidades, cod, categoria } = congelado;

                    if (!tipo || cantidad == null || unidades == null) {
                        return res.status(400).json({ message: "Cada producto congelado debe tener tipo, cantidad y unidades." });
                    }

                    let nombreProducto = tipo;

                    if (!isNaN(tipo)) {
                        const producto = await ProductsAvailable.findByPk(tipo);
                        if (producto) {
                            nombreProducto = producto.product_name;
                        }
                    }

                    if (congeladoId) {
                        await billDetail.update(
                            { type: nombreProducto, quantity: cantidad, weight: unidades, heads: 0 },
                            { where: { id: congeladoId, bill_supplier_id: id } }
                        );
                    } else {
                        await billDetail.create({
                            bill_supplier_id: id,
                            type: nombreProducto,
                            quantity: cantidad,
                            weight: unidades,
                            heads: 0
                        });

                        // Crear o actualizar stock
                        const existing = await ProductStock.findOne({ where: { product_name: nombreProducto } });
                        if (existing) {
                            existing.product_quantity += Number(cantidad);
                            await existing.save();
                        } else {
                            await ProductStock.create({
                                product_name: nombreProducto,
                                product_quantity: cantidad,
                                product_cod: cod || `AUTO-${nombreProducto}`,
                                product_category: categoria || "desconocida"
                            });
                        }
                    }
                }
            }

            return res.status(200).json({ message: "Registro actualizado correctamente.", id });

        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },





    viewAllObservationMeatIncome: async (req, res) => {
        try {
            let ObservacionesMeatIncome = await ObservationsMeatIncome.findAll({})
            res.json(ObservacionesMeatIncome)
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener observaciones disponibles' });
        }
    },

    updateObservationMeatIncome: async (req, res) => {
        const { id } = req.params;
        const { observation } = req.body;

        try {
            const resultado = await ObservationsMeatIncome.update(
                { observation: observation },
                { where: { id: id } }
            );

            res.status(200).json({ mensaje: "Observación actualizada correctamente", resultado });
        } catch (error) {
            console.error("Error al actualizar observación:", error);
            res.status(500).json({ mensaje: "Error al actualizar observación" });
        }
    },

    createObservation: async (req, res) => {
        try {
            const { remitoId, observation } = req.body;

            // Validación mínima
            if (!remitoId) {
                return res.status(400).json({ error: "remitoId es obligatorio" });
            }

            // Crear la observación
            const nuevaObservacion = await ObservationsMeatIncome.create({
                id: remitoId,
                observation: observation ?? "",
            });

            return res.status(201).json(nuevaObservacion);
        } catch (error) {
            console.error("Error al crear observación:", error);
            return res.status(500).json({ error: "Error interno al crear la observación" });
        }
    },

    updateProductFromRemit: async (req, res) => {
        const { id } = req.params;

        try {
            const cortes = await meatIncome.findAll({ where: { id_bill_suppliers: id } });

            const observacionData = await ObservationsMeatIncome.findOne({ where: { id: id } });

            res.json({
                cortes,
                observacion: {
                    id: observacionData?.id || null,
                    texto: observacionData?.observation || "",
                },
            });

        } catch (error) {
            console.error("Error al obtener los datos del remito:", error);
            res.status(500).json({ error: "Error al obtener los datos del remito" });
        }
    },

    updateBillSupplier: async (req, res) => {
        const { id } = req.params;
        const {
            cantidad_animales_cargados,
            cantidad_cabezas_cargadas,
            peso_total_neto_cargado,
            fresh_quantity,
            fresh_weight,
        } = req.body;

        try {
            const remito = await billSupplier.findOne({ where: { id } });

            if (!remito) {
                return res.status(404).json({ message: "Remito no encontrado" });
            }

            // Actualizar datos generales
            const updateData = {
                total_weight: peso_total_neto_cargado,
                head_quantity: cantidad_cabezas_cargadas,
                quantity: cantidad_animales_cargados,
            };
            if (fresh_quantity !== undefined) updateData.fresh_quantity = fresh_quantity;
            if (fresh_weight !== undefined) updateData.fresh_weight = fresh_weight;

            await billSupplier.update(updateData, { where: { id } });

            if (remito.income_state === "romaneo") {
                // Actualizar stock basado en billDetail
                const detalles = await billDetail.findAll({ where: { bill_supplier_id: id } });
                const cantidadesPorProducto = {};

                for (const item of detalles) {
                    const nombre = item.type;
                    const cantidad = Number(item.quantity || 0);
                    cantidadesPorProducto[nombre] = (cantidadesPorProducto[nombre] || 0) + cantidad;
                }

                for (const nombre in cantidadesPorProducto) {
                    const cantidadTotal = cantidadesPorProducto[nombre];
                    const producto = await ProductStock.findOne({ where: { product_name: nombre } });

                    if (producto) {
                        await producto.update({ product_quantity: cantidadTotal });
                    } else {
                        const productoBase = await ProductsAvailable.findOne({
                            where: { product_name: nombre },
                            include: {
                                model: ProductCategories,
                                as: "category",
                                attributes: ["category_name"]
                            }
                        });

                        if (!productoBase) continue;
                        await ProductStock.create({
                            product_name: nombre,
                            product_quantity: cantidad,
                            product_cod: productoBase.id,
                            product_category: productoBase.category.category_name
                        });
                    }
                }
            } else if (remito.income_state === "manual") {

                console.log("Ingreso manual, stock actualizado desde tablas manuales");
            }

            return res.status(200).json({ message: "Registro actualizado correctamente." });

        } catch (error) {
            console.error("Error en updateBillSupplier:", error);
            return res.status(500).json({ message: "Error interno", error: error.message || error.toString() });
        }
    },


    uploadProductsProcess: async (req, res) => {
        try {
            let {
                type,
                average,
                quantity,
                gross_weight,
                tares,
                net_weight,
                bill_id
            } = req.body;

            if (
                !type ||
                average === undefined || isNaN(average) ||
                quantity === undefined || isNaN(quantity) ||
                gross_weight === undefined || isNaN(gross_weight) ||
                tares === undefined || isNaN(tares) ||
                net_weight === undefined || isNaN(net_weight)
            ) {
                return res.status(400).json({ message: "Faltan campos obligatorios o hay valores inválidos." });
            }

            // === Normalizar `type` si es un ID numérico ===
            let baseProduct = null;

            if (!isNaN(type)) {
                baseProduct = await ProductsAvailable.findByPk(type, {
                    include: {
                        model: ProductCategories,
                        as: "category",
                        attributes: ["category_name"]
                    }
                });

                if (!baseProduct) {
                    return res.status(400).json({ message: `No se encontró ningún producto con ID ${type}` });
                }

                // Reemplazamos el ID por el nombre
                type = baseProduct.product_name;
            } else {
                // Buscar por nombre si vino como string
                baseProduct = await ProductsAvailable.findOne({
                    where: { product_name: type },
                    include: {
                        model: ProductCategories,
                        as: "category",
                        attributes: ["category_name"]
                    }
                });
            }

            if (!baseProduct) {
                return res.status(400).json({ message: `No se pudo identificar el producto "${type}" en ProductsAvailable.` });
            }


            await ProcessMeat.create({
                type,
                average,
                quantity,
                gross_weight,
                tares,
                net_weight,
                bill_id
            });
            await billSupplier.update(
                { production_process: true },
                { where: { id: bill_id } }
            );

            const existing = await ProductStock.findOne({ where: { product_name: type } });

            if (existing) {
                await existing.increment("product_quantity", { by: quantity });
            } else {
                await ProductStock.create({
                    product_name: type,
                    product_quantity: quantity,
                    product_cod: baseProduct.id,
                    product_category: baseProduct.category?.category_name || "desconocida"
                });
            }

            return res.status(201).json({ message: "Corte y stock guardados correctamente." });

        } catch (error) {
            console.error("Error al cargar datos:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },


    chargeUpdateBillDetails: async (req, res) => {
        const { id } = req.params;

        try {
            const billSupplierUpdate = await billSupplier.findOne({ where: { id } });
            const billDetailsUpdate = await billDetail.findAll({ where: { bill_supplier_id: id } });

            const formattedDetails = billDetailsUpdate.map(det => ({
                id: det.id,
                tipo: det.type,
                cantidad: det.quantity,
                cabezas: det.heads,
                peso: det.weight,
                pesoRomaneo: det.weight
            }));

            // Separar en cortes y congelados
            const cortes = formattedDetails.filter(det => det.cabezas > 0 || (det.cabezas === 0 && det.peso === 0));
            const congelados = formattedDetails.filter(det => det.cabezas === 0 && det.peso > 0);

            res.json({
                proveedor: billSupplierUpdate.supplier,
                peso_total: billSupplierUpdate.total_weight,
                romaneo: billSupplierUpdate.romaneo_number,
                internal_number: billSupplierUpdate.id,
                tipo_ingreso: billSupplierUpdate.income_state,
                detalles: cortes,
                congelados: congelados
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error al obtener datos del ingreso" });
        }
    },

    allProducts: async (req, res) => {
        try {
            const allproducts = await billSupplier.findAll({
                order: [['id', 'DESC']]
            });
            res.json(allproducts);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

    },
    addIncomeMeat: async (req, res) => {
        try {
            const Supplierid = req.params.id;
            const { cortes, observacion } = req.body;

            if (!Array.isArray(cortes) || cortes.length === 0) {
                return res.status(400).json({ mensaje: "El cuerpo de la solicitud debe contener una lista de productos." });
            }

            for (const corte of cortes) {
                const {
                    tipo,
                    garron,
                    cabeza,
                    cantidad,
                    pesoBruto,
                    tara,
                    pesoNeto,
                    pesoProveedor,
                    mermaPorcentaje,
                    cod,
                    categoria,
                } = corte;

                if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
                }

                const existente = await meatIncome.findByPk(garron);
                if (existente) {
                    return res.status(400).json({ mensaje: `El garrón ${garron} ya existe.` });
                }

                await meatIncome.create({
                    id_bill_suppliers: Supplierid,
                    products_name: tipo,
                    products_garron: garron,
                    product_head: cabeza,
                    products_quantity: cantidad,
                    provider_weight: pesoProveedor,
                    gross_weight: pesoBruto,
                    tare: tara,
                    net_weight: pesoNeto,
                    decrease: mermaPorcentaje,
                });

                const stock = await ProductStock.findOne({ where: { product_name: tipo } });

                if (stock) {
                    await stock.increment("product_quantity", { by: cantidad });
                } else {
                    if (!cod || !categoria) {
                        return res.status(400).json({ mensaje: `Faltan cod o categoría para crear el producto "${tipo}" en stock.` });
                    }

                    await ProductStock.create({
                        product_name: tipo,
                        product_quantity: cantidad,
                        product_cod: cod,
                        product_category: categoria,
                    });
                }
            }

            if (observacion) {
                await ObservationsMeatIncome.create({
                    id: Supplierid,
                    observation: observacion,
                });
            }

            return res.status(201).json({ mensaje: "Todos los productos fueron cargados correctamente." });

        } catch (error) {
            console.error("Error en la base de datos:", error);
            return res.status(500).json({ mensaje: "Error en la base de datos", error: error.message });
        }
    },

    editAddIncome: async (req, res) => {
        try {
            const Supplierid = req.params.id;
            const { cortes } = req.body;

            if (!Array.isArray(cortes) || cortes.length === 0) {
                return res.status(400).json({ mensaje: "El cuerpo de la solicitud debe contener una lista de productos." });
            }

            // 1. Buscar productos actuales del remito y restar del stock
            const anteriores = await meatIncome.findAll({ where: { id_bill_suppliers: Supplierid } });

            for (const item of anteriores) {
                const stock = await ProductStock.findOne({ where: { product_name: item.products_name } });
                if (stock) {
                    await stock.decrement("product_quantity", { by: Number(item.products_quantity) || 0 });
                }
            }

            // 2. Eliminar los cortes anteriores
            await meatIncome.destroy({ where: { id_bill_suppliers: Supplierid } });

            // 3. Insertar nuevos cortes
            for (const corte of cortes) {
                const {
                    tipo,
                    garron,
                    cabeza,
                    cantidad,
                    pesoBruto,
                    tara,
                    pesoNeto,
                    pesoProveedor,
                    cod,
                    categoria,
                } = corte;

                if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
                }

                await meatIncome.create({
                    id: garron,
                    id_bill_suppliers: Supplierid,
                    products_name: tipo,
                    products_garron: garron,
                    product_head: cabeza,
                    products_quantity: cantidad,
                    provider_weight: pesoProveedor,
                    gross_weight: pesoBruto,
                    tare: tara,
                    net_weight: pesoNeto,
                    decrease: corte.mermaPorcentaje || 0,
                });
            }

            // 4. Recalcular stock exacto desde TODAS las líneas en meatIncome
            const todosLosIngresos = await meatIncome.findAll();

            const cantidadesTotales = {};

            for (const ingreso of todosLosIngresos) {
                const nombre = ingreso.products_name;
                const cantidad = Number(ingreso.products_quantity || 0);
                if (!cantidadesTotales[nombre]) {
                    cantidadesTotales[nombre] = 0;
                }
                cantidadesTotales[nombre] += cantidad;
            }

            for (const nombre in cantidadesTotales) {
                const total = cantidadesTotales[nombre];

                const producto = await ProductStock.findOne({ where: { product_name: nombre } });

                if (producto) {
                    await producto.update({ product_quantity: total });
                } else {
                    const productoBase = await ProductsAvailable.findOne({
                        where: { product_name: nombre },
                        include: {
                            model: ProductCategories,
                            as: "category",
                            attributes: ["category_name"]
                        }
                    });

                    if (productoBase) {
                        await ProductStock.create({
                            product_name: nombre,
                            product_quantity: cantidad,
                            product_cod: productoBase.id,
                            product_category: productoBase.category.category_name
                        });

                    } else {
                        console.warn(`No se pudo crear stock para "${nombre}" porque no existe en ProductsAvailable.`);
                    }
                }
            }

            return res.status(200).json({ mensaje: "Los productos fueron actualizados correctamente." });

        } catch (error) {
            console.error(" Error al actualizar los cortes:", error);
            return res.status(500).json({ mensaje: "Error al actualizar los cortes", error: error.message });
        }
    },





    productStock: async (req, res) => {
        try {
            const allproductsStock = await meatIncome.findAll();

            res.json(allproductsStock)
        } catch (error) {
            console.error("Error al obtener stock:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    findRemit: async (req, res) => {
        try {
            let id = req.params.remitoId;

            const remitoEncontrado = await billSupplier.findOne({
                where: { id: id },
            });



            if (!remitoEncontrado) {
                return res.status(404).json({ message: "Remito no encontrado" });
            }

            return res.status(200).json(remitoEncontrado);
        } catch (error) {
            console.error("Error al buscar el remito:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    deleteItemFromMeatManualIncome: async (req, res) => {
        try {
            const id = req.params.id;

            // 1. Buscar el item en meatIncome
            const item = await meatIncome.findOne({ where: { id } });

            if (!item) {
                return res.status(404).json({ mensaje: "El item no se encuentra" });
            }

            const nombreProducto = item.products_name;

            // 2. Buscar el producto exacto en ProductStock (coincidencia exacta)
            const productoStock = await ProductStock.findOne({
                where: { product_name: nombreProducto },
            });

            if (productoStock) {
                // 3. Restar la cantidad del stock
                const cantidadActual = Number(productoStock.product_quantity || 0);
                const cantidadARestar = Number(item.products_quantity || 0);
                const nuevaCantidad = cantidadActual - cantidadARestar;

                await productoStock.update({
                    product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad,
                });

                console.log(`🟢 Stock actualizado: ${nombreProducto} → ${nuevaCantidad}`);
            } else {
                console.warn(`⚠️ Producto "${nombreProducto}" no encontrado en ProductStock.`);
            }

            // 4. Eliminar el item
            await meatIncome.destroy({ where: { id } });

            // 5. Devolver resultado
            return res.status(200).json({
                mensaje: "Item eliminado con éxito y stock actualizado.",
                itemEliminado: {
                    id: item.id,
                    producto: item.products_name,
                    cantidad: item.products_quantity,
                    garron: item.products_garron,
                    peso: item.net_weight,
                },
            });
        } catch (error) {
            console.error("❌ Error al eliminar item de meatIncome:", error);
            return res.status(500).json({
                mensaje: "Error al eliminar item de meatIncome",
                error: error.message || error.toString(),
            });
        }
    },


    deleteProduct: async (req, res) => {
        try {
            const id = req.params.id;

            // Buscar proveedor
            const ConstbillSupplier = await billSupplier.findOne({ where: { id } });
            if (!ConstbillSupplier) {
                return res.status(404).json({ mensaje: "El proveedor no existe" });
            }

            // Obtener cortes en meat_manual_income (manual)
            const meatIncomes = await meatIncome.findAll({ where: { id_bill_suppliers: id } });

            // Obtener detalles en bill_details (por ejemplo, romaneo)
            const billDetails = await billDetail.findAll({ where: { bill_supplier_id: id } });

            // Actualizar stock para cortes manuales (meat_manual_income)
            for (const item of meatIncomes) {
                const stock = await ProductStock.findOne({ where: { product_name: item.products_name } });
                if (stock) {
                    const nuevaCantidad = stock.product_quantity - parseInt(item.products_quantity);
                    await stock.update({ product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad });
                }
            }

            // Actualizar stock para bill details (romaneo)
            for (const detail of billDetails) {
                const stock = await ProductStock.findOne({ where: { product_name: detail.type } });
                if (stock) {
                    const nuevaCantidad = stock.product_quantity - (detail.quantity || 0);
                    await stock.update({ product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad });
                }
            }

            // Eliminar registros relacionados
            await meatIncome.destroy({ where: { id_bill_suppliers: id } });
            await billDetail.destroy({ where: { bill_supplier_id: id } });
            await billSupplier.destroy({ where: { id } });

            return res.status(200).json({ mensaje: "Proveedor y registros asociados eliminados. Cantidades de stock actualizadas." });
        } catch (error) {
            console.error("Error al eliminar el proveedor:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
        }
    },


    loadProductsPrimaryCategory: async (req, res) => {
        try {
            const allProductsPrimary = await ProductsAvailable.findAll({
                attributes: ['id', 'product_name'],
                where: {
                    product_category: "primario",
                },
            });
            const productNames = allProductsPrimary.map(product => product.product_name);

            res.json(productNames);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

    },
    loadAllProductsCategories: async (req, res) => {
        try {
            const allProductsCategories = await ProductsAvailable.findAll({
                attributes: ['id', 'product_name', 'product_general_category', 'category_id'],
                include: [
                    {
                        model: db.ProductCategories,
                        as: 'category',
                        attributes: ['id', 'category_name']
                    }
                ]
            });

            res.json(allProductsCategories);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },


    deleteDetailProviderForm: async (req, res) => {
        const { id } = req.params;

        try {
            const detalle = await billDetail.findOne({ where: { id } });

            if (!detalle) {
                return res.status(404).json({ message: "Detalle no encontrado" });
            }

            const billId = detalle.bill_supplier_id;


            const producto = await ProductStock.findOne({
                where: { product_name: detalle.type }
            });

            if (producto) {
                const nuevaCantidad = producto.product_quantity - Number(detalle.quantity);
                await producto.update({
                    product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad
                });
            }

            await billDetail.destroy({ where: { id } });

            const detallesRestantes = await billDetail.findAll({ where: { bill_supplier_id: billId } });

            const nuevosTotales = detallesRestantes.reduce(
                (totales, d) => {
                    const cantidad = Number(d.quantity) || 0;
                    const peso = Number(d.weight) || 0;

                    if (Number(d.heads) > 0 || peso === 0) {

                        totales.quantity += cantidad;
                    } else {

                        totales.fresh_quantity += cantidad;
                        totales.fresh_weight += peso;
                    }

                    return totales;
                },
                { quantity: 0, fresh_quantity: 0, fresh_weight: 0 }
            );

            await billSupplier.update(
                {
                    quantity: nuevosTotales.quantity,
                    fresh_quantity: nuevosTotales.fresh_quantity,
                    fresh_weight: nuevosTotales.fresh_weight
                },
                { where: { id: billId } }
            );

            res.json({ message: "Detalle eliminado y totales actualizados." });

        } catch (error) {
            console.error("Error al eliminar el detalle:", error);
            res.status(500).json({ message: "Error al eliminar el detalle", error: error.message });
        }
    },
    addOtherProductsManual: async (req, res) => {
        try {
            const { congelados } = req.body;

            if (!Array.isArray(congelados) || congelados.length === 0) {
                return res.status(400).json({ mensaje: "No se enviaron productos." });
            }

            for (const item of congelados) {
                const {
                    product_name,
                    product_portion,
                    product_quantity,
                    product_net_weight,
                    product_gross_weight,
                    decrease = 0,
                    id_bill_suppliers,
                } = item;

                if (!product_name || product_quantity == null || product_net_weight == null) {
                    return res.status(400).json({ mensaje: `Datos incompletos en el producto "${product_name}".` });
                }

                // Buscar el producto base
                const productoBase = await ProductsAvailable.findOne({
                    where: { product_name },
                    include: {
                        model: ProductCategories,
                        as: "category",
                        attributes: ["category_name"],
                    },
                });

                if (!productoBase || !productoBase.id || !productoBase.category || !productoBase.category.category_name) {
                    return res.status(400).json({ mensaje: `No se puede guardar "${product_name}" porque falta ID o categoría.` });
                }


                await OtherProductManual.create({
                    product_name,
                    product_portion,
                    product_quantity,
                    product_net_weight,
                    product_gross_weight,
                    decrease,
                    id_bill_suppliers,
                    product_cod: productoBase.id,
                    product_category: productoBase.category.category_name,
                });


                const stock = await ProductStock.findOne({ where: { product_name } });

                if (stock) {
                    await stock.increment("product_quantity", { by: product_quantity });
                } else {
                    await ProductStock.create({
                        product_name,
                        product_quantity,
                        product_cod: productoBase.id,
                        product_category: productoBase.category.category_name,
                    });
                }
            }

            return res.status(201).json({ mensaje: "Congelados cargados correctamente." });

        } catch (error) {
            console.error("Error al cargar congelados:", error);
            return res.status(500).json({ mensaje: "Error interno", error: error.message });
        }
    },

    getOtherProductsFromRemito: async (req, res) => {
        try {
            const { id } = req.params;

            const productos = await OtherProductManual.findAll({
                where: { id_bill_suppliers: id },
                order: [["id", "ASC"]],
            });

            return res.status(200).json({ productos });
        } catch (error) {
            console.error("Error al obtener otros productos:", error);
            return res.status(500).json({
                message: "Error al obtener otros productos.",
                error: error.message,
            });
        }
    },
    editOtherProductsManual: async (req, res) => {
        const { id } = req.params;
        const { congelados = [] } = req.body;

        try {
            if (!Array.isArray(congelados)) {
                return res.status(400).json({ mensaje: "El cuerpo debe contener un arreglo de productos." });
            }

            // 1. Eliminar congelados anteriores
            await OtherProductManual.destroy({ where: { id_bill_suppliers: id } });

            // 2. Insertar nuevos congelados
            for (const prod of congelados) {
                const {
                    product_name,
                    product_quantity,
                    product_net_weight,
                    product_gross_weight,
                    product_portion,
                    decrease = 0,
                } = prod;

                if (!product_name || product_quantity == null || product_net_weight == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto congelado." });
                }

                const productoBase = await ProductsAvailable.findOne({
                    where: { product_name },
                    include: {
                        model: ProductCategories,
                        as: "category",
                        attributes: ["category_name"]
                    }
                });

                if (!productoBase || !productoBase.id || !productoBase.category || !productoBase.category.category_name) {
                    console.log(`Producto "${product_name}" no válido en ProductsAvailable.`);
                    return res.status(400).json({
                        mensaje: `No se puede crear stock para "${product_name}" porque falta ID o categoría.`,
                    });
                }

                await OtherProductManual.create({
                    product_name,
                    product_quantity,
                    product_net_weight,
                    product_gross_weight,
                    product_portion,
                    decrease,
                    id_bill_suppliers: id,
                    product_cod: productoBase.id,
                    product_category: productoBase.category.category_name,
                });
            }

            // 3. Recalcular stock
            const actuales = await OtherProductManual.findAll({ where: { id_bill_suppliers: id } });

            const cantidadesPorProducto = {};

            for (const item of actuales) {
                const nombre = item.product_name;
                const cantidad = Number(item.product_quantity || 0);

                if (!cantidadesPorProducto[nombre]) {
                    cantidadesPorProducto[nombre] = 0;
                }

                cantidadesPorProducto[nombre] += cantidad;
            }

            for (const nombre in cantidadesPorProducto) {
                const cantidadTotal = cantidadesPorProducto[nombre];

                const stock = await ProductStock.findOne({ where: { product_name: nombre } });

                if (stock) {
                    await stock.update({ product_quantity: cantidadTotal });
                } else {
                    const productoBase = await ProductsAvailable.findOne({
                        where: { product_name: nombre },
                        include: {
                            model: ProductCategories,
                            as: "category",
                            attributes: ["category_name"]
                        }
                    });

                    if (!productoBase || !productoBase.id || !productoBase.category || !productoBase.category.category_name) {
                        console.log(`Producto "${nombre}" no válido para crear stock.`);
                        return res.status(400).json({
                            mensaje: `No se puede crear stock para "${nombre}" porque falta ID o categoría.`,
                        });
                    }

                    await ProductStock.create({
                        product_name: nombre,
                        product_quantity: cantidadTotal,
                        product_cod: productoBase.id,
                        product_category: productoBase.category.category_name,
                    });
                }
            }

            return res.status(200).json({ mensaje: "Congelados actualizados correctamente." });

        } catch (error) {
            console.error("Error en editOtherProductsManual:", error);
            return res.status(500).json({
                mensaje: "Error al actualizar productos congelados",
                error: error.message || error.toString(),
            });
        }
    },


    deleteOtherProduct: async (req, res) => {
        try {
            const { id } = req.params;


            const item = await OtherProductManual.findOne({ where: { id } });

            if (!item) {
                return res.status(404).json({ message: "Producto no encontrado." });
            }

            const nombreProducto = item.product_name;

            const productoStock = await ProductStock.findOne({
                where: { product_name: nombreProducto },
            });

            if (productoStock) {
                const cantidadActual = Number(productoStock.product_quantity || 0);
                const cantidadARestar = Number(item.product_quantity || 0);
                const nuevaCantidad = cantidadActual - cantidadARestar;

                await productoStock.update({
                    product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad,
                });

                console.log(` Stock actualizado: ${nombreProducto} → ${nuevaCantidad}`);
            } else {
                console.warn(`Producto congelado "${nombreProducto}" no encontrado en ProductStock.`);
            }

            await OtherProductManual.destroy({ where: { id } });

            return res.status(200).json({
                message: "Producto congelado eliminado correctamente.",
                itemEliminado: {
                    id: item.id,
                    producto: item.product_name,
                    cantidad: item.product_quantity,
                    peso: item.product_net_weight,
                },
            });
        } catch (error) {
            console.error(" Error al eliminar producto congelado:", error);
            return res.status(500).json({
                message: "Error al eliminar producto congelado.",
                error: error.message || error.toString(),
            });
        }
    },

    updateProductStockQuantity: async (req, res) => {
        try {
            const { product_name, subtract_quantity } = req.body;

            if (!product_name || typeof subtract_quantity !== 'number') {
                return res.status(400).json({ message: "Datos inválidos. Se requiere product_name y subtract_quantity como número." });
            }

            const existingProduct = await ProductStock.findOne({ where: { product_name } });

            if (!existingProduct) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            if (existingProduct.product_quantity < subtract_quantity) {
                return res.status(400).json({ message: "Cantidad insuficiente en stock para restar." });
            }

            await existingProduct.decrement('product_quantity', { by: subtract_quantity });

            return res.json({ message: "Cantidad descontada correctamente", product_name, subtracted_quantity: subtract_quantity });

        } catch (error) {
            console.error("Error al descontar la cantidad del producto:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    deleteProductAvailable: async (req, res) => {
        try {
            const { id } = req.params;

            // Verificar si el producto tiene stock
            const stockAsociado = await ProductStock.findOne({ where: { product_cod: id } });
            if (stockAsociado) {
                return res.status(400).json({
                    message: "No se puede eliminar el producto porque tiene stock asignado."
                });
            }

            // Eliminar subproductos si existen
            await ProductSubproduct.destroy({ where: { parent_product_id: id } });

            // Eliminar el producto
            await ProductsAvailable.destroy({ where: { id } });

            res.status(200).json({ message: "Producto eliminado correctamente." });
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            res.status(500).json({ message: "Error al eliminar producto." });
        }
    },

    // editProductAvailable: async (req, res) => {
    //     try {
    //         const { id } = req.params;
    //         const { product_name, category_id, product_general_category, min_stock, max_stock } = req.body;

    //         // Validación de campos obligatorios
    //         if (!product_name || !category_id || !product_general_category || min_stock == null || max_stock == null) {
    //             return res.status(400).json({ message: "Faltan campos obligatorios." });
    //         }

    //         const producto = await ProductsAvailable.findOne({ where: { id } });

    //         if (!producto) {
    //             return res.status(404).json({ message: "Producto no encontrado." });
    //         }

    //         await producto.update({
    //             product_name,
    //             category_id,
    //             product_general_category,
    //             min_stock,
    //             max_stock
    //         });

    //         return res.status(200).json({ message: "Producto actualizado correctamente." });
    //     } catch (error) {
    //         console.error("Error al actualizar producto:", error);
    //         return res.status(500).json({
    //             message: "Error al actualizar producto.",
    //             error: error.message || error.toString(),
    //         });
    //     }
    // },


    getProductById: async (req, res) => {
        try {
            const { id } = req.params;

            const product = await ProductsAvailable.findOne({
                where: { id }
            });

            if (!product) {
                return res.status(404).json({ message: "Producto no encontrado." });
            }

            return res.json(product);
        } catch (error) {
            console.error("Error al obtener producto por ID:", error);
            return res.status(500).json({ message: "Error interno del servidor." });
        }
    },

    getSubproductsForProduct: async (req, res) => {
        const { name } = req.params;

        try {
            console.log(" Buscando producto con nombre (sin case):", name);

            const product = await ProductsAvailable.findOne({
                where: {
                    product_name: {
                        [Op.like]: `%${name}%`
                    }
                },
                order: [
                    [sequelize.literal(`CASE WHEN LOWER(product_name) = '${name.toLowerCase()}' THEN 0 ELSE 1 END`), 'ASC'],
                    [sequelize.fn('LENGTH', col('product_name')), 'ASC']
                ]
            });

            if (!product) {
                console.log(" Producto no encontrado");
                return res.status(404).json({ message: "Producto no encontrado" });
            }
            const subproducts = await ProductSubproduct.findAll({
                where: { parent_product_id: product.id },
                include: [
                    {
                        model: ProductsAvailable,
                        as: "subProduct",
                        attributes: ["product_name"]
                    }
                ]
            });

            const resultado = subproducts.map(sp => ({
                nombre: sp.subProduct?.product_name || "SUBPRODUCTO SIN NOMBRE",
                cantidadPorUnidad: parseFloat(sp.quantity)
            }));


            return res.status(200).json(resultado);
        } catch (error) {
            console.error(" Error al obtener subproductos:", error);
            res.status(500).json({ message: "Error interno al obtener subproductos" });
        }
    },


}

module.exports = operatorApiController;