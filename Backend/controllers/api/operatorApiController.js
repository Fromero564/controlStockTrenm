const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
const moment = require("moment");
const { stringify } = require("querystring");

const billSupplier = db.BillSupplier;
const meatIncome = db.MeatIncome;
const billDetail = db.BillDetail;
const tare = db.Tare;
const ProductsAvailable = db.ProductsAvailable;
const ProcessMeat = db.ProcessMeat;
const ObservationsMeatIncome = db.ObservationsMeatIncome;

const operatorApiController = {
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

            const { proveedor, pesoTotal, cabezas, romaneo, tipoIngreso, cantidad, cortes } = req.body;

            if (!proveedor || !pesoTotal || !cabezas || !romaneo) {
                return res.status(400).json({ message: "Faltan campos obligatorios." });
            }

            if (tipoIngreso === "romaneo" && (!cantidad || !Array.isArray(cortes) || cortes.length === 0)) {
                return res.status(400).json({ message: "Debe proporcionar cantidad y al menos un corte para ingreso con romaneo." });
            }

            if (tipoIngreso !== "romaneo" && tipoIngreso !== "manual") {
                return res.status(400).json({ message: "Tipo de ingreso inválido." });
            }

            // Crear el registro principal
            const nuevoRegistro = await billSupplier.create({
                supplier: proveedor,
                total_weight: pesoTotal,
                head_quantity: cabezas,
                quantity: cantidad,
                romaneo_number: romaneo,
                income_state: tipoIngreso,
                check_state: tipoIngreso === "romaneo",
            });

            // Guardar los detalles si hay cortes
            if (Array.isArray(cortes) && cortes.length > 0) {
                for (const corte of cortes) {
                    const { tipo, cantidad, cabezas } = corte;

                    if (!tipo || cantidad == null || cabezas == null) {
                        return res.status(400).json({ message: "Cada corte debe tener tipo, cantidad y cabezas." });
                    }

                    await billDetail.create({
                        bill_supplier_id: nuevoRegistro.id,
                        type: tipo,
                        quantity: cantidad,
                        heads: cabezas,
                    });
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
            const { proveedor, pesoTotal, romaneo, cabezas, cantidad, tipoIngreso, cortes } = req.body;

            if (!id) return res.status(400).json({ message: "Falta el ID del registro a actualizar." });


            if (!proveedor || !pesoTotal || !romaneo || !cabezas) {
                return res.status(400).json({ message: "Faltan campos obligatorios." });
            }

            await billSupplier.update(
                {
                    supplier: proveedor,
                    total_weight: pesoTotal,
                    romaneo_number: romaneo,
                    head_quantity: cabezas,
                    quantity: cantidad,
                    income_state: tipoIngreso,
                    check_state: tipoIngreso === "romaneo",
                },
                { where: { id } }
            );


            if (Array.isArray(cortes)) {
                for (const corte of cortes) {
                    const { id: corteId, tipo, cantidad, cabezas } = corte;

                    if (!tipo || cantidad == null || cabezas == null) {
                        return res.status(400).json({ message: "Cada corte debe tener tipo, cantidad y cabezas." });
                    }

                    if (corteId) {

                        await billDetail.update(
                            { type: tipo, quantity: cantidad, heads: cabezas },
                            { where: { id: corteId, bill_supplier_id: id } }
                        );
                    } else {

                        await billDetail.create({
                            bill_supplier_id: id,
                            type: tipo,
                            quantity: cantidad,
                            heads: cabezas,
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
            peso_total_neto_cargado
        } = req.body;

        try {
            const result = await billSupplier.update(
                {
                    total_weight: peso_total_neto_cargado,
                    head_quantity: cantidad_cabezas_cargadas,
                    quantity: cantidad_animales_cargados,
                },
                {
                    where: { id: id },
                }
            );

            if (result[0] === 0) {
                return res.status(404).json({ message: "No se encontró el registro para actualizar" });
            }

            res.status(200).json({ message: "Registro actualizado correctamente" });
        } catch (error) {
            console.error("Error al actualizar:", error);
            res.status(500).json({ message: "Error al actualizar el registro", error });
        }
    },
    uploadProductsProcess: async (req, res) => {
        try {

            const { tipo, promedio, cantidad, pesoBruto, tara, pesoNeto } = req.body;

            if (!tipo || !promedio || !cantidad || !pesoBruto || !tara || !pesoNeto) {
                return res.status(400).json({ message: "Faltan campos obligatorios." });
            }

            await ProcessMeat.create({
                type: tipo,
                average: promedio,
                quantity: cantidad,
                gross_weight: pesoBruto,
                tares: tara,
                net_weight: pesoNeto,
            })
            return res.status(201).json({ message: "Corte guardado correctamente.", data: req.body });
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
                cabezas: det.heads
            }));

            res.json({
                proveedor: billSupplierUpdate.supplier,
                peso_total: billSupplierUpdate.total_weight,
                romaneo: billSupplierUpdate.romaneo_number,
                internal_number: billSupplierUpdate.id,
                tipo_ingreso: billSupplierUpdate.income_state,
                detalles: formattedDetails
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
                console.log("Datos del corte recibido:", corte);
                const {
                    tipo,
                    garron,
                    cabeza,
                    cantidad,
                    pesoBruto,
                    tara,
                    pesoNeto,
                    pesoProveedor,

                } = corte;

                // Validación
                if (!tipo || !garron || cabeza == null || cantidad == null || pesoBruto == null || tara == null || pesoNeto == null) {
                    return res.status(400).json({ mensaje: "Faltan campos obligatorios en al menos un producto." });
                }


                const existente = await meatIncome.findByPk(garron);
                if (existente) {
                    return res.status(400).json({ mensaje: `El garrón ${garron} ya existe.` });
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
                    net_weight: pesoNeto
                });


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

            // Eliminar los cortes existentes para ese remito
            await meatIncome.destroy({
                where: { id_bill_suppliers: Supplierid }
            });

            // Crear los nuevos cortes
            for (const corte of cortes) {
                const {
                    tipo,
                    garron,
                    cabeza,
                    cantidad,
                    pesoBruto,
                    tara,
                    pesoNeto,
                    pesoProveedor
                } = corte;

                // Validación
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
                    net_weight: pesoNeto
                });
            }

            return res.status(200).json({ mensaje: "Los productos fueron actualizados correctamente." });

        } catch (error) {
            console.error("Error al actualizar los cortes:", error);
            return res.status(500).json({ mensaje: "Error en la base de datos", error: error.message });
        }

    },
    productStock: async (req, res) => {
        try {
            const allproductsStock = await meatIncome.findAll();


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
            let id = req.params.id;


            const item = await meatIncome.findOne({
                where: { id: id },
            });

            if (!item) {
                return res.status(404).json({ mensaje: "El item no se encuentra" });
            }


            await meatIncome.destroy({
                where: { id: id },
            });

            res.status(200).json({ mensaje: "Item eliminado con éxito" });

        } catch (error) {
            console.error("Error al eliminar el item:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
        }

    },
    deleteProduct: async (req, res) => {
        try {
            let id = req.params.id;


            const product = await billSupplier.findOne({
                where: { id: id },
            });

            if (!product) {
                return res.status(404).json({ mensaje: "El producto no existe" });
            }
            await meatIncome.destroy({
                where: { id_bill_suppliers: id },
            });


            await billSupplier.destroy({
                where: { id: id },
            });

            res.status(200).json({ mensaje: "Producto eliminado con éxito" });

        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
        }
    },
    loadProductsPrimaryCategory: async (req, res) => {
        try {
            const allProductsPrimary = await ProductsAvailable.findAll({
                attributes: ['product_name'],
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
                attributes: ['product_name'],
            });
            const productNamesCategories = allProductsCategories.map(product => product.product_name);

            res.json(productNamesCategories);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

    },
    deleteDetailProviderForm: async (req, res) => {
        const { id } = req.params;

        try {
            await billDetail.destroy({ where: { id } });
            res.json({ message: "Detalle eliminado correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al eliminar el detalle" });
        }
    },

}

module.exports = operatorApiController;