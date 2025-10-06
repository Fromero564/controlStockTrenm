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
const ProcessNumber = db.ProcessNumber;
const MeatIncomeManualWeight = db.MeatIncomeManualWeight;

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
                    product_total_weight: stock.product_total_weight,
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
            const {
                proveedor,
                pesoTotal,
                cabezas,
                romaneo,
                tipoIngreso,
                cantidad,
                cortes = [],
                congelados = [],
                fresh_quantity,
                fresh_weight
            } = req.body;

            if (!proveedor || pesoTotal == null || cabezas == null || !romaneo) {
                return res.status(400).json({ message: "Faltan campos obligatorios." });
            }
            if (!["romaneo", "manual"].includes(tipoIngreso)) {
                return res.status(400).json({ message: "Tipo de ingreso inválido." });
            }
            if (
                tipoIngreso === "romaneo" &&
                cortes.length === 0 &&
                congelados.length === 0
            ) {
                return res.status(400).json({ message: "Debe proporcionar al menos un corte o un congelado." });
            }

            const nuevoRegistro = await billSupplier.create({
                supplier: proveedor,
                date_bill_supplier: new Date(),
                total_weight: Number(pesoTotal || 0),
                head_quantity: Number(cabezas || 0),
                income_state: tipoIngreso,
                check_state: tipoIngreso === "romaneo",
                romaneo_number: Number(romaneo || 0),
                quantity: Number(cantidad || 0),
                fresh_quantity: Number(fresh_quantity || 0),
                fresh_weight: Number(fresh_weight || 0),
            });

            // CORTES: guardar detalle; solo impactar stock si es ROMANEO (ya lo tenías así)
            if (Array.isArray(cortes) && cortes.length) {
                for (const corte of cortes) {
                    const { nombre, cantidad, cabezas, cod, categoria, pesoRomaneo, identification_product } = corte;

                    await billDetail.create({
                        bill_supplier_id: nuevoRegistro.id,
                        type: nombre,
                        quantity: Number(cantidad || 0),
                        heads: Number(cabezas || 0),
                        weight: Number(pesoRomaneo || 0),
                        identification_product: Number(identification_product || 0),
                    });

                    if (tipoIngreso === "romaneo") {
                        const existing = await ProductStock.findOne({ where: { product_name: nombre } });
                        if (existing) {
                            existing.product_quantity += Number(cantidad || 0);
                            existing.product_total_weight += Number(pesoRomaneo || 0);
                            await existing.save();
                        } else {
                            await ProductStock.create({
                                product_name: nombre,
                                product_quantity: Number(cantidad || 0),
                                product_total_weight: Number(pesoRomaneo || 0),
                                product_cod: cod || null,
                                product_category: categoria || null
                            });
                        }
                    }
                }
            }

            // CONGELADOS: guardar detalle; SOLO impactar stock si es ROMANEO
            if (Array.isArray(congelados) && congelados.length) {
                for (const cong of congelados) {
                    const { tipo, cantidad, unidades, cod, categoria, identification_product } = cong;

                    await billDetail.create({
                        bill_supplier_id: nuevoRegistro.id,
                        type: tipo,
                        quantity: Number(cantidad || 0),
                        heads: 0,
                        weight: Number(unidades || 0),
                        identification_product: Number(identification_product || 0),
                    });

                    if (tipoIngreso === "romaneo") {
                        const existing = await ProductStock.findOne({ where: { product_name: tipo } });
                        if (existing) {
                            existing.product_quantity += Number(cantidad || 0);
                            existing.product_total_weight += Number(unidades || 0);
                            await existing.save();
                        } else {
                            await ProductStock.create({
                                product_name: tipo,
                                product_quantity: Number(cantidad || 0),
                                product_total_weight: Number(unidades || 0),
                                product_cod: cod || null,
                                product_category: categoria || null
                            });
                        }
                    }
                }
            }

            return res.status(201).json({ id: nuevoRegistro.id, romaneo: nuevoRegistro.romaneo_number });
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
                congelados = []
            } = req.body;

            if (!proveedor || pesoTotal == null || cabezas == null || !romaneo) {
                return res.status(400).json({ message: "Faltan datos obligatorios." });
            }

            // leer estado anterior para saber si había impactado stock
            const previo = await billSupplier.findOne({ where: { id } });
            const previoEraRomaneo = previo?.income_state === "romaneo";

            // si ANTES era romaneo, revertimos stock de los bill_details previos
            if (previoEraRomaneo) {
                const detallesPrevios = await billDetail.findAll({ where: { bill_supplier_id: id } });
                for (const det of detallesPrevios) {
                    const stock = await ProductStock.findOne({ where: { product_name: det.type } });
                    if (stock) {
                        stock.product_quantity -= Number(det.quantity || 0);
                        stock.product_total_weight -= Number(det.weight || 0);
                        if (stock.product_quantity < 0) stock.product_quantity = 0;
                        if (stock.product_total_weight < 0) stock.product_total_weight = 0;
                        await stock.save();
                    }
                }
            }

            // borrar todos los detalles para recrearlos
            await billDetail.destroy({ where: { bill_supplier_id: id } });

            // actualizar cabecera
            await billSupplier.update({
                supplier: proveedor,
                total_weight: Number(pesoTotal || 0),
                head_quantity: Number(cabezas || 0),
                quantity: Number(cantidad || 0),
                romaneo_number: Number(romaneo || 0),
                income_state: tipoIngreso,
                check_state: tipoIngreso === "romaneo"
            }, { where: { id } });

            const esRomaneoNuevo = tipoIngreso === "romaneo";

            // CORTES: crear detalle siempre; impactar stock solo si romaneo
            for (const corte of cortes) {
                const { tipo, cantidad: cant, cabezas: head, cod, categoria, pesoRomaneo, identification_product } = corte;

                let nombreProducto = tipo;
                if (!isNaN(tipo)) {
                    const prod = await ProductsAvailable.findByPk(tipo);
                    if (prod) nombreProducto = prod.product_name;
                }

                await billDetail.create({
                    bill_supplier_id: id,
                    type: nombreProducto,
                    quantity: Number(cant || 0),
                    heads: Number(head || 0),
                    weight: Number(pesoRomaneo || 0),
                    identification_product: Number(identification_product || 0)
                });

                if (esRomaneoNuevo) {
                    const stock = await ProductStock.findOne({ where: { product_name: nombreProducto } });
                    if (stock) {
                        stock.product_quantity += Number(cant || 0);
                        stock.product_total_weight += Number(pesoRomaneo || 0);
                        await stock.save();
                    } else {
                        await ProductStock.create({
                            product_name: nombreProducto,
                            product_quantity: Number(cant || 0),
                            product_total_weight: Number(pesoRomaneo || 0),
                            product_cod: cod || null,
                            product_category: categoria || null
                        });
                    }
                }
            }

            // CONGELADOS: crear detalle siempre; impactar stock solo si romaneo
            for (const cong of congelados) {
                const { tipo, cantidad: cant, unidades, cod, categoria, identification_product } = cong;

                await billDetail.create({
                    bill_supplier_id: id,
                    type: tipo,
                    quantity: Number(cant || 0),
                    heads: 0,
                    weight: Number(unidades || 0),
                    identification_product: Number(identification_product || 0)
                });

                if (esRomaneoNuevo) {
                    const stock = await ProductStock.findOne({ where: { product_name: tipo } });
                    if (stock) {
                        stock.product_quantity += Number(cant || 0);
                        stock.product_total_weight += Number(unidades || 0);
                        await stock.save();
                    } else {
                        await ProductStock.create({
                            product_name: tipo,
                            product_quantity: Number(cant || 0),
                            product_total_weight: Number(unidades || 0),
                            product_cod: cod || null,
                            product_category: categoria || null
                        });
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
            if (peso_total_neto_cargado != null) {
                await MeatIncomeManualWeight.upsert({
                    bill_supplier_id: id,
                    total_weight: Number(
                        peso_total_neto_cargado.toFixed
                            ? peso_total_neto_cargado.toFixed(2)
                            : peso_total_neto_cargado
                    ),
                });
            }

            const updateData = {};
            if (cantidad_animales_cargados != null) updateData.quantity = cantidad_animales_cargados;
            if (cantidad_cabezas_cargadas != null) updateData.head_quantity = cantidad_cabezas_cargadas;
            if (fresh_quantity != null) updateData.fresh_quantity = fresh_quantity;
            if (fresh_weight != null) updateData.fresh_weight = fresh_weight;

            if (Object.keys(updateData).length > 0) {
                await billSupplier.update(updateData, { where: { id } }); // <- minúscula
            }

            return res.json({ ok: true });
        } catch (err) {
            console.error("updateBillSupplier error:", err);
            return res.status(500).json({ error: "Error actualizando datos" });
        }
    },

    uploadProductsProcess: async (req, res) => {
        let t;
        try {
            const { cortes, bill_ids } = req.body;

            if (!Array.isArray(cortes) || cortes.length === 0 || !Array.isArray(bill_ids) || bill_ids.length === 0) {
                return res.status(400).json({ message: "Faltan cortes o comprobantes para asociar." });
            }

            t = await sequelize.transaction();

            const ultimoProceso = await ProcessNumber.findOne({ order: [['process_number', 'DESC']] });
            const nuevoProcessNumber = ultimoProceso ? ultimoProceso.process_number + 1 : 1;

            for (const bill_id of bill_ids) {
                await ProcessNumber.create({ process_number: nuevoProcessNumber, bill_id }, { transaction: t });
            }

            const childTotalsQty = {};
            let totalNetAdded = 0;

            for (const corte of cortes) {
                let { type, average, quantity, gross_weight, tares, net_weight } = corte;
                const avg = Number(average);
                const qty = Number(quantity);
                const gross = Number(gross_weight);
                const tare = Number(tares);
                const net = Number(net_weight);

                if (
                    type == null ||
                    Number.isNaN(avg) || Number.isNaN(qty) ||
                    Number.isNaN(gross) || Number.isNaN(tare) ||
                    Number.isNaN(net)
                ) {
                    await t.rollback();
                    return res.status(400).json({ message: "Faltan campos obligatorios o hay valores inválidos en algún corte." });
                }


                let baseProduct = null;
                let productName = null;

                if (!Number.isNaN(Number(type))) {
                    baseProduct = await ProductsAvailable.findByPk(type, {
                        include: [{ model: ProductCategories, as: "category", attributes: ["category_name"] }],
                        transaction: t
                    });
                    if (!baseProduct) {
                        await t.rollback();
                        return res.status(400).json({ message: `No se encontró ningún producto con ID ${type}` });
                    }
                    productName = baseProduct.product_name;
                } else {
                    baseProduct = await ProductsAvailable.findOne({
                        where: { product_name: type },
                        include: [{ model: ProductCategories, as: "category", attributes: ["category_name"] }],
                        transaction: t
                    });
                    if (!baseProduct) {
                        await t.rollback();
                        return res.status(400).json({ message: `No se pudo identificar el producto "${type}".` });
                    }
                    productName = baseProduct.product_name;
                }

                await ProcessMeat.create({
                    type: productName,
                    average: avg,
                    quantity: qty,
                    gross_weight: gross,
                    tares: tare,
                    net_weight: net,
                    process_number: nuevoProcessNumber
                }, { transaction: t });

                const existingChild = await ProductStock.findOne({ where: { product_name: productName }, transaction: t });
                if (existingChild) {
                    await existingChild.increment(
                        { product_quantity: qty, product_total_weight: net },
                        { transaction: t }
                    );
                } else {
                    await ProductStock.create({
                        product_name: productName,
                        product_quantity: qty,
                        product_total_weight: net,
                        product_cod: baseProduct.id,

                        product_category: baseProduct.category?.category_name ?? null
                    }, { transaction: t });
                }

                childTotalsQty[productName] = (childTotalsQty[productName] || 0) + qty;
                totalNetAdded += net;
            }


            const parentMap = {};
            for (const childName of Object.keys(childTotalsQty)) {
                const subs = await ProductSubproduct.findAll({
                    include: [
                        { model: ProductsAvailable, as: "subProduct", attributes: [], where: { product_name: childName } }
                    ],
                    transaction: t
                });

                for (const sp of subs) {
                    const parent = await ProductsAvailable.findByPk(sp.parent_product_id, {
                        attributes: ['product_name'],
                        transaction: t
                    });
                    if (!parent) continue;
                    const parentName = parent.product_name;
                    if (!parentMap[parentName]) parentMap[parentName] = {};
                    parentMap[parentName][childName] = Number(sp.quantity) || 0;
                }
            }

            const parentUsage = {};
            for (const parentName of Object.keys(parentMap)) {
                let required = 0;
                for (const [childName, perParent] of Object.entries(parentMap[parentName])) {
                    if (perParent > 0) {
                        const need = Math.ceil((childTotalsQty[childName] || 0) / perParent);
                        if (need > required) required = need;
                    }
                }
                if (required > 0) parentUsage[parentName] = required;
            }

            const totalParentUnits = Object.values(parentUsage).reduce((a, b) => a + b, 0);


            for (const [parentName, usedUnits] of Object.entries(parentUsage)) {
                const weightShare = totalParentUnits > 0 ? Number((totalNetAdded * usedUnits / totalParentUnits).toFixed(2)) : 0;
                const stockParent = await ProductStock.findOne({ where: { product_name: parentName }, transaction: t });
                if (stockParent) {
                    const newQty = Math.max(0, Number(stockParent.product_quantity || 0) - usedUnits);
                    const newWeight = Math.max(0, Number(stockParent.product_total_weight || 0) - weightShare);
                    await stockParent.update(
                        { product_quantity: newQty, product_total_weight: newWeight },
                        { transaction: t }
                    );
                }
            }


            for (const bill_id of bill_ids) {
                if (Number(bill_id) > 0) {
                    await billSupplier.update(
                        { production_process: true },
                        { where: { id: bill_id }, transaction: t }
                    );
                }
            }

            await t.commit();
            return res.status(201).json({ message: "Cortes y proceso guardados, stock ajustado.", process_number: nuevoProcessNumber });
        } catch (error) {
            if (t) { try { await t.rollback(); } catch { } }
            console.error("uploadProductsProcess error:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },




    chargeUpdateBillDetails: async (req, res) => {
        const { id } = req.params;
        try {
            const billSupplierUpdate = await billSupplier.findOne({ where: { id } });
            const billDetailsUpdate = await billDetail.findAll({ where: { bill_supplier_id: id } });

            const detalles = billDetailsUpdate.map(det => ({
                id: det.id,
                tipo: det.type,
                cantidad: det.quantity,
                cabezas: det.heads,
                peso: det.weight,
                pesoRomaneo: det.weight,
                identification_product: det.identification_product
            }));

            // Criterio: con cabezas => cortes; sin cabezas y con peso => congelados
            const cortes = detalles.filter(d => Number(d.cabezas || 0) > 0);
            const congelados = detalles.filter(d =>
                Number(d.cabezas || 0) === 0 && Number(d.peso || 0) > 0
            );

            return res.json({
                proveedor: billSupplierUpdate.supplier,
                peso_total: billSupplierUpdate.total_weight,
                romaneo: billSupplierUpdate.romaneo_number,
                internal_number: billSupplierUpdate.id,
                tipo_ingreso: billSupplierUpdate.income_state,
                detalles: cortes,
                congelados
            });
        } catch (err) {
            console.error("Error chargeUpdateBillDetails:", err);
            return res.status(500).json({ message: "Error al obtener datos del ingreso" });
        }
    },

    allProducts: async (req, res) => {
        try {
            const rows = await billSupplier.findAll({
                include: [
                    {
                        model: MeatIncomeManualWeight,
                        as: "manualWeight",
                        attributes: ["total_weight"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            const data = rows.map((r) => {
                const j = r.toJSON();
                return {
                    ...j,
                    manual_weight: j.manualWeight?.total_weight ?? null,
                };
            });

            return res.json(data);
        } catch (err) {
            console.error("allProducts error:", err);
            return res.status(500).json({ error: "Error listando ingresos" });
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
                    tipo, garron, cabeza, cantidad,
                    pesoBruto, tara, pesoNeto, pesoProveedor,
                    mermaPorcentaje, cod, categoria
                } = corte;

                if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
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
                    decrease: mermaPorcentaje || 0,
                });

                // stock
                const stock = await ProductStock.findOne({ where: { product_name: tipo } });
                if (stock) {
                    await stock.increment("product_quantity", { by: cantidad });
                    await stock.increment("product_total_weight", { by: pesoNeto });
                } else {
                    await ProductStock.create({
                        product_name: tipo,
                        product_quantity: cantidad,
                        product_total_weight: pesoNeto,
                        product_cod: cod,
                        product_category: categoria || null,
                    });
                }
            }

            if (observacion) {
                await ObservationsMeatIncome.create({ id: Supplierid, observation: observacion });
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

            // 1) Restar del stock lo anterior
            const anteriores = await meatIncome.findAll({ where: { id_bill_suppliers: Supplierid } });
            for (const item of anteriores) {
                const stock = await ProductStock.findOne({ where: { product_name: item.products_name } });
                if (stock) {
                    stock.product_quantity -= Number(item.products_quantity || 0);
                    stock.product_total_weight -= Number(item.net_weight || 0);
                    if (stock.product_quantity < 0) stock.product_quantity = 0;
                    if (stock.product_total_weight < 0) stock.product_total_weight = 0;
                    await stock.save();
                }
            }

            // 2) Borrar los cortes anteriores del remito
            await meatIncome.destroy({ where: { id_bill_suppliers: Supplierid } });

            // 3) Insertar los nuevos cortes (permitiendo garrones repetidos)
            for (const corte of cortes) {
                const {
                    tipo, garron, cabeza, cantidad,
                    pesoBruto, tara, pesoNeto, pesoProveedor,
                    cod, categoria, mermaPorcentaje
                } = corte;

                if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
                }

                // ❌ No usar: id: garron
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
                    decrease: mermaPorcentaje || 0,
                });

                // Sumar al stock
                const stock = await ProductStock.findOne({ where: { product_name: tipo } });
                if (stock) {
                    stock.product_quantity += Number(cantidad || 0);
                    stock.product_total_weight += Number(pesoNeto || 0);
                    await stock.save();
                } else {
                    await ProductStock.create({
                        product_name: tipo,
                        product_quantity: cantidad,
                        product_total_weight: pesoNeto,
                        product_cod: cod,
                        product_category: categoria || null,
                    });
                }
            }

            return res.status(200).json({ mensaje: "Productos actualizados correctamente." });
        } catch (error) {
            console.error("Error al actualizar los cortes:", error);
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
                    const cantidadARestar = Number(item.products_quantity || 0);
                    const pesoARestar = Number(item.net_weight || 0);

                    stock.product_quantity -= cantidadARestar;
                    stock.product_total_weight -= pesoARestar;

                    if (stock.product_quantity < 0) stock.product_quantity = 0;
                    if (stock.product_total_weight < 0) stock.product_total_weight = 0;

                    await stock.save();
                }
            }

            // Actualizar stock para bill details (romaneo)
            for (const detail of billDetails) {
                const stock = await ProductStock.findOne({ where: { product_name: detail.type } });
                if (stock) {
                    const cantidadARestar = Number(detail.quantity || 0);
                    const pesoARestar = Number(detail.weight || 0);

                    stock.product_quantity -= cantidadARestar;
                    stock.product_total_weight -= pesoARestar;

                    if (stock.product_quantity < 0) stock.product_quantity = 0;
                    if (stock.product_total_weight < 0) stock.product_total_weight = 0;

                    await stock.save();
                }
            }

            // Eliminar registros relacionados
            await meatIncome.destroy({ where: { id_bill_suppliers: id } });
            await billDetail.destroy({ where: { bill_supplier_id: id } });
            await billSupplier.destroy({ where: { id } });

            return res.status(200).json({ mensaje: "Proveedor y registros asociados eliminados. Stock actualizado correctamente." });
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
                const nuevaCantidad = producto.product_quantity - Number(detalle.quantity || 0);
                const nuevoPeso = producto.product_total_weight - Number(detalle.weight || 0);

                await producto.update({
                    product_quantity: nuevaCantidad < 0 ? 0 : nuevaCantidad,
                    product_total_weight: nuevoPeso < 0 ? 0 : nuevoPeso
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

                const productoBase = await ProductsAvailable.findOne({
                    where: { product_name },
                    include: {
                        model: ProductCategories,
                        as: "category",
                        attributes: ["category_name"],
                    },
                });

                if (!productoBase || !productoBase.id) {
                    return res.status(400).json({ mensaje: `No se puede guardar "${product_name}" porque falta ID en ProductsAvailable.` });
                }

                const categoriaNombre = productoBase.category?.category_name ?? null;

                await OtherProductManual.create({
                    product_name,
                    product_portion,
                    product_quantity,
                    product_net_weight,
                    product_gross_weight,
                    decrease,
                    id_bill_suppliers,
                    product_cod: productoBase.id,
                    product_category: categoriaNombre,
                });

                const stock = await ProductStock.findOne({ where: { product_name } });

                if (stock) {
                    stock.product_quantity += Number(product_quantity);
                    stock.product_total_weight += Number(product_net_weight);
                    await stock.save();
                } else {
                    await ProductStock.create({
                        product_name,
                        product_quantity,
                        product_total_weight: Number(product_net_weight),
                        product_cod: productoBase.id,
                        product_category: categoriaNombre,
                    });
                }
            }
            res.status(201).json({ mensaje: "Productos agregados correctamente." });
        } catch (error) {
            console.error("Error addOtherProductsManual:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor." });
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
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { congelados } = req.body;
            if (!id || !Array.isArray(congelados)) {
                return res.status(400).json({ mensaje: "Datos inválidos." });
            }

            await OtherProductManual.destroy({ where: { id_bill_suppliers: id }, transaction: t });

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
                        attributes: ["category_name"],
                    },
                });

                if (!productoBase || !productoBase.id) {
                    return res.status(400).json({ mensaje: `No se puede crear registro para "${product_name}" porque falta ID en ProductsAvailable.` });
                }

                const categoriaNombre = productoBase.category?.category_name ?? null;

                await OtherProductManual.create({
                    product_name,
                    product_quantity,
                    product_net_weight,
                    product_gross_weight,
                    product_portion,
                    decrease,
                    id_bill_suppliers: id,
                    product_cod: productoBase.id,
                    product_category: categoriaNombre,
                }, { transaction: t });
            }

            const productosEnBill = await OtherProductManual.findAll({ where: { id_bill_suppliers: id } });
            for (const prod of productosEnBill) {
                const { product_name, product_quantity, product_net_weight } = prod;
                let stock = await ProductStock.findOne({ where: { product_name } });
                if (stock) {
                    stock.product_quantity += Number(product_quantity);
                    stock.product_total_weight += Number(product_net_weight);
                    await stock.save({ transaction: t });
                } else {
                    const productoBase = await ProductsAvailable.findOne({
                        where: { product_name },
                        include: {
                            model: ProductCategories,
                            as: "category",
                            attributes: ["category_name"],
                        },
                    });
                    if (!productoBase || !productoBase.id) {
                        return res.status(400).json({ mensaje: `No se puede crear stock para "${product_name}" porque falta ID en ProductsAvailable.` });
                    }
                    const categoriaNombre = productoBase.category?.category_name ?? null;
                    await ProductStock.create({
                        product_name,
                        product_quantity,
                        product_cod: productoBase.id,
                        product_category: categoriaNombre,
                    }, { transaction: t });
                }
            }

            await t.commit();
            res.status(200).json({ mensaje: "Productos congelados editados correctamente." });
        } catch (error) {
            await t.rollback();
            console.error("Error editOtherProductsManual:", error);
            res.status(500).json({ mensaje: "Error interno del servidor." });
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
                    // Prioriza coincidencia exacta (case-insensitive), luego el más corto
                    [sequelize.literal(`CASE WHEN LOWER(product_name) = ${sequelize.escape(name.toLowerCase())} THEN 0 ELSE 1 END`), 'ASC'],
                    [sequelize.fn('LENGTH', col('product_name')), 'ASC']
                ]
            });

            if (!product) {
                console.log(" Producto no encontrado");
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            const subproducts = await ProductSubproduct.findAll({
                where: { parent_product_id: product.id },
                attributes: ['quantity', 'unit'],
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
                cantidadPorUnidad: parseFloat(sp.quantity),
                unit: sp.unit || "unidad" // 👈 devolvemos la unidad (fallback a "unidad")
            }));

            return res.status(200).json(resultado);
        } catch (error) {
            console.error(" Error al obtener subproductos:", error);
            res.status(500).json({ message: "Error interno al obtener subproductos" });
        }
    },

    descontarStockSinRemito: async (req, res) => {
        try {
            const { product_name, quantity } = req.body;

            // Validación básica
            if (!product_name || !quantity || quantity <= 0) {
                return res.status(400).json({ message: "Datos inválidos. Se requiere product_name y quantity mayor a 0." });
            }

            // Buscar producto en ProductStock
            const productoStock = await ProductStock.findOne({
                where: { product_name }
            });

            if (!productoStock) {
                return res.status(404).json({ message: `Producto "${product_name}" no encontrado en stock.` });
            }

            // Validar stock suficiente
            if (productoStock.product_quantity < quantity) {
                return res.status(400).json({
                    message: `Stock insuficiente para "${product_name}". Disponible: ${productoStock.product_quantity}, solicitado: ${quantity}`
                });
            }

            // Descontar cantidad
            productoStock.product_quantity -= quantity;
            if (productoStock.product_quantity < 0) productoStock.product_quantity = 0;
            await productoStock.save();

            return res.status(200).json({
                message: `Stock de "${product_name}" descontado correctamente.`,
                product_name,
                cantidad_restada: quantity,
                cantidad_restante: productoStock.product_quantity
            });
        } catch (error) {
            console.error("Error al descontar stock sin remito:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },
 updateStockManual: async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const {
            subtract_quantity,
            min_stock,
            max_stock,
            product_total_weight
        } = req.body || {};

        // --- 1) localizar fila de stock ---
        // prioridad: por ID numérico; fallback: por nombre/código
        let stockRow = null;

        if (!isNaN(Number(id))) {
            stockRow = await ProductStock.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
        }
        if (!stockRow) {
            stockRow = await ProductStock.findOne({
                where: {
                    [db.Sequelize.Op.or]: [
                        { product_cod: String(id) },
                        { product_id: String(id) },
                        { product_name: String(id) }
                    ]
                },
                transaction: t,
                lock: t.LOCK.UPDATE
            });
        }
        if (!stockRow) {
            await t.rollback();
            return res.status(404).json({ ok: false, msg: "Producto de stock no encontrado" });
        }

        // --- 2) restar unidades del stock (si corresponde) ---
        if (subtract_quantity != null) {
            const sub = Math.max(0, Number(subtract_quantity));
            const current = Number(stockRow.product_quantity || 0);
            if (sub > current) {
                await t.rollback();
                return res.status(400).json({
                    ok: false,
                    msg: `No hay stock suficiente: actual ${current}, intenta restar ${sub}`
                });
            }
            stockRow.product_quantity = current - sub;
        }

        // --- 3) corregir kg totales (opcional) ---
        if (product_total_weight != null && product_total_weight !== "") {
            stockRow.product_total_weight = Number(product_total_weight);
        }

        await stockRow.save({ transaction: t });

        // --- 4) actualizar min/max en catálogo (ProductsAvailable) ---
        // 🔧 FIX: matchear SOLO por product_name (products_available no tiene product_cod)
        let catRow = null;
        if (stockRow.product_name) {
            catRow = await ProductsAvailable.findOne({
                where: { product_name: stockRow.product_name },
                transaction: t,
                lock: t.LOCK.UPDATE
            });
        }

        if (catRow && (min_stock != null || max_stock != null)) {
            if (min_stock != null) catRow.min_stock = Number(min_stock);
            if (max_stock != null) catRow.max_stock = Number(max_stock);
            await catRow.save({ transaction: t });
        }

        await t.commit();

        // respuesta unificada para refrescar el front
        return res.json({
            ok: true,
            msg: "Ajuste aplicado correctamente",
            stock: {
                id: stockRow.id,
                product_cod: stockRow.product_cod,
                product_name: stockRow.product_name,
                product_quantity: Number(stockRow.product_quantity || 0),
                product_total_weight: Number(stockRow.product_total_weight || 0)
            },
            available: catRow
                ? {
                    id: catRow.id,
                    product_cod: catRow.product_cod,     // si no existe en tu modelo, podés quitar esta línea
                    product_name: catRow.product_name,
                    min_stock: Number(catRow.min_stock || 0),
                    max_stock: Number(catRow.max_stock || 0)
                }
                : null
        });
    } catch (e) {
        console.error(e);
        try { await t.rollback(); } catch { }
        return res.status(500).json({ ok: false, msg: "Error en ajuste manual de stock" });
    }
},


 billDetailsReadonly:async (req, res) => {
  try {
    const id = req.params.id;
    const bill = await billSupplier.findOne({ where: { id } });

    if (!bill) return res.status(404).json({ message: "Comprobante no encontrado" });

    if (bill.income_state === "manual") {
      // Leer de meat_manual_income
      const rows = await meatIncome.findAll({ where: { id_bill_suppliers: id } });
      const data = rows.map(r => ({
        type: r.products_name,                 // nombre del producto
        quantity: Number(r.products_quantity||0)
      }));
      return res.json(data);
    } else {
      // Leer de bill_details (romaneo)
      const rows = await billDetail.findAll({ where: { bill_supplier_id: id } });
      const data = rows.map(r => ({
        type: r.type,
        quantity: Number(r.quantity||0)
      }));
      return res.json(data);
    }
  } catch (err) {
    console.error("billDetailsReadonly error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
},

billDetails:async (req, res) => {
  try {
    const id = req.params.id;
    const bill = await billSupplier.findOne({ where: { id } });

    if (!bill) return res.status(404).json({ message: "Comprobante no encontrado" });

    if (bill.income_state === "manual") {
      // meat_manual_income
      const rows = await meatIncome.findAll({ where: { id_bill_suppliers: id } });
      const data = rows.map(r => ({
        id: r.id,
        type: r.products_name,
        quantity: Number(r.products_quantity||0),
        heads: Number(r.product_head||0),
        weight: Number(r.net_weight||0)
      }));
      return res.json(data);
    } else {
      // bill_details (romaneo)
      const rows = await billDetail.findAll({ where: { bill_supplier_id: id } });
      const data = rows.map(r => ({
        id: r.id,
        type: r.type,
        quantity: Number(r.quantity||0),
        heads: Number(r.heads||0),
        weight: Number(r.weight||0)
      }));
      return res.json(data);
    }
  } catch (err) {
    console.error("billDetails error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
},





}

module.exports = operatorApiController;