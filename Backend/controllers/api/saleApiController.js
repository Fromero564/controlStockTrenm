const path = require("path");
const db = require("../../src/config/models");
const sequelize = db.sequelize;
const { Op, fn, col, where } = require("sequelize");
const moment = require("moment");
const { stringify } = require("querystring");
const OrderProductsClient = require("../../src/config/models/OrderProductsClient");

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
const Seller = db.Seller;
const NewOrder = db.NewOrder;
const OrderProductClient = db.OrderProductClient;
const PriceList = db.PriceList;
const PriceListProduct = db.PriceListProduct;
const ProductsSellOrder = db.ProductsSellOrder;

const toNumber = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    const n = parseFloat(String(v).replace(",", "."));
    return isNaN(n) ? 0 : n;
};


const saleApiController = {
    createNewSeller: async (req, res) => {
        try {
            const {
                code,
                name,
                province,
                city,
                street,
                number,
                floor,
                office
            } = req.body;

            const newSeller = await Seller.create({
                code,
                name,
                province,
                city,
                street,
                number,
                floor,
                office
            });

            return res.status(201).json({
                ok: true,
                seller: newSeller
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                msg: "Error al crear vendedor"
            });
        }
    },
    getAllSellers: async (req, res) => {
        try {
            const sellers = await Seller.findAll({
                order: [["name", "ASC"]]
            });

            return res.status(200).json({
                ok: true,
                sellers
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                msg: "Error al obtener los vendedores"
            });
        }
    },
    deleteSeller: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Seller.destroy({
                where: { id }
            });

            if (deleted) {
                return res.status(200).json({ ok: true, msg: "Vendedor eliminado" });
            } else {
                return res.status(404).json({ ok: false, msg: "Vendedor no encontrado" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al eliminar vendedor" });
        }
    },


    updateSeller: async (req, res) => {
        try {
            const { id } = req.params;
            const [updated] = await Seller.update(req.body, {
                where: { id }
            });

            if (updated) {
                const seller = await Seller.findByPk(id);
                return res.json({ ok: true, seller, msg: "Vendedor actualizado" });
            } else {
                return res.status(404).json({ ok: false, msg: "Vendedor no encontrado" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al actualizar vendedor" });
        }
    },


    getSellerById: async (req, res) => {
        try {
            const { id } = req.params;
            const seller = await Seller.findByPk(id);
            if (!seller) {
                return res.status(404).json({ ok: false, msg: "Vendedor no encontrado" });
            }
            return res.json({ ok: true, seller });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al obtener vendedor" });
        }
    },
    getAllOrders: async (req, res) => {
        try {
            const AllOrders = await NewOrder.findAll({});
            res.json(AllOrders);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al obtener ordenes" });
        }
    },
    createOrder: async (req, res) => {
        try {
            const {
                date_order,
                client_name,
                salesman_name,
                price_list,
                sell_condition,
                payment_condition,
                observation_order,
                products
            } = req.body;

            if (!date_order || !client_name || !salesman_name) {
                return res.status(400).json({ ok: false, msg: "Faltan datos obligatorios." });
            }

            const newOrder = await NewOrder.create({
                date_order,
                client_name,
                salesman_name,
                price_list,
                sell_condition,
                payment_condition,
                observation_order
            });


            if (Array.isArray(products) && products.length > 0) {
                const productsToSave = products.map(prod => ({
                    order_id: newOrder.id,
                    product_cod: prod.codigo,
                    product_name: prod.corte?.value?.product_name || '',
                    precio: prod.precio,
                    cantidad: prod.cantidad,
                    tipo_medida: prod.tipoMedida
                }));
                await OrderProductClient.bulkCreate(productsToSave);
            }

            return res.status(201).json({
                ok: true,
                order: newOrder
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                msg: "Error al crear la orden"
            });
        }
    },
    createPriceList: async (req, res) => {
        try {
            const { name, clients, products } = req.body;

            if (!name) {
                return res.status(400).json({ ok: false, msg: "El nombre es obligatorio." });
            }


            const lastList = await PriceList.findOne({
                order: [["list_number", "DESC"]]
            });
            const lastNumber = lastList ? lastList.list_number : 0;
            const nextListNumber = lastNumber + 1;


            if (!clients || !Array.isArray(clients) || clients.length === 0) {
                await PriceList.create({
                    list_number: nextListNumber,
                    name,
                    client_id: null
                });
            } else {
                const records = clients.map(clientId => ({
                    list_number: nextListNumber,
                    name,
                    client_id: clientId
                }));
                await PriceList.bulkCreate(records);
            }

            if (Array.isArray(products) && products.length > 0) {
                const productRecords = products.map(prod => ({
                    price_list_number: nextListNumber,
                    product_id: prod.id,
                    product_name: prod.name,
                    unidad_venta: prod.unidad_venta, // "UN" o "KG"
                    costo: prod.costo,
                    precio_sin_iva: prod.precio_sin_iva,
                    precio_con_iva: prod.precio_con_iva
                }));
                await PriceListProduct.bulkCreate(productRecords);
            }

            return res.status(201).json({
                ok: true,
                msg: "Lista y productos creados correctamente",
                list_number: nextListNumber
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al crear la lista de precios" });
        }
    },
    getAllPriceList: async (req, res) => {
        try {
            const PriceLists = await PriceList.findAll({});
            res.json(PriceLists);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al traer todas las listas de precios" });
        }
    },
    getAllPriceListProduct: async (req, res) => {
        try {
            const AllPriceListProducts = await PriceListProduct.findAll({});
            res.json(AllPriceListProducts);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al traer todas las listas productos con precios" });
        }
    },
    getAllOrdersContent: async (req, res) => {
        try {
            const AllOrdersContent = await OrderProductClient.findAll({});
            res.json(AllOrdersContent);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al traer todos los productos de las ordenes" });
        }
    },
    updateOrderProductQuantity: async (req, res) => {
        try {
            const { id } = req.params; // id del registro en order_products_client
            const { cantidad } = req.body;

            if (cantidad < 0) {
                return res.status(400).json({ ok: false, msg: "La cantidad no puede ser menor a 0" });
            }

            const [updated] = await OrderProductClient.update(
                { cantidad },
                { where: { id } }
            );

            if (updated) {
                const updatedRecord = await OrderProductClient.findByPk(id);
                return res.status(200).json({ ok: true, product: updatedRecord });
            } else {
                return res.status(404).json({ ok: false, msg: "Registro no encontrado" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al actualizar cantidad" });
        }
    },
    getSaleOrderbyId: async (req, res) => {
        const { id } = req.params;
        try {
            const saleOrder = await NewOrder.findByPk(id);
            if (!saleOrder) {
                return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            }

            if (saleOrder.order_check === true) {
                return res
                    .status(409) // Conflict
                    .json({ ok: false, msg: "La orden ya fue generada y no puede volver a generarse." });
            }

            return res.json(saleOrder);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al encontrar la orden" });
        }
    },

    getOrderProductbyId: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ ok: false, msg: "Falta id" });

            const products = await OrderProductClient.findAll({
                where: { order_id: id },
                order: [["id", "ASC"]],
            });


            return res.status(200).json(products);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al encontrar los productos" });
        }
    },
    generateSalesOrder: async (req, res) => {
        const { id } = req.params;
        const t = await sequelize.transaction();
        try {
            const header = await NewOrder.findByPk(id, { transaction: t });
            if (!header) {
                await t.rollback();
                return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            }

            const lines = await OrderProductClient.findAll({
                where: { order_id: id },
                transaction: t
            });
            if (!lines.length) {
                await t.rollback();
                return res.status(400).json({ ok: false, msg: "La orden no tiene productos" });
            }

            const noStock = [];
            const prepared = [];

            for (const ln of lines) {
                const code = ln.product_cod ?? ln.product_id ?? null;
                const name = ln.product_name ?? "";
                const requested = toNumber(ln.cantidad);
                const price = toNumber(ln.precio);

                let stockRow = null;
                if (code != null) {
                    stockRow = await ProductStock.findOne({
                        where: { product_cod: code },
                        transaction: t,
                        lock: t.LOCK.UPDATE
                    });
                }
                if (!stockRow) {
                    stockRow = await ProductStock.findOne({
                        where: { product_name: name },
                        transaction: t,
                        lock: t.LOCK.UPDATE
                    });
                }

                const available = toNumber(stockRow?.product_quantity);

                if (!stockRow || available <= 0) {
                    noStock.push({ product_id: code, product_name: name });
                    continue;
                }

                const sendQty = Math.min(requested, available);
                prepared.push({ ln, stockRow, sendQty, price, code, name, available, requested });
            }

            if (noStock.length) {
                await t.rollback();
                return res.status(400).json({
                    ok: false,
                    msg: "Hay productos sin stock, no se puede generar la orden.",
                    noStock
                });
            }

            for (const item of prepared) {
                await ProductsSellOrder.create({
                    sell_order_id: Number(id),
                    product_id: item.code ?? null,
                    product_name: item.name,
                    product_price: item.price,
                    product_quantity: item.sendQty
                }, { transaction: t });

                item.stockRow.product_quantity = Math.max(0, toNumber(item.stockRow.product_quantity) - item.sendQty);
                await item.stockRow.save({ transaction: t });
            }

            // Marcar la orden como chequeada
            await NewOrder.update(
                { order_check: true },
                { where: { id }, transaction: t }
            );

            await t.commit();

            return res.status(201).json({
                ok: true,
                msg: "Orden generada correctamente.",
                items: prepared.map(p => ({
                    product_name: p.name,
                    solicitado: p.requested,
                    enviado: p.sendQty,
                    restante_en_stock: Math.max(0, p.available - p.sendQty)
                }))
            });
        } catch (error) {
            await t.rollback();
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al generar la orden" });
        }
    },
    updateOrder: async (req, res) => {
        const { id } = req.params;
        const {
            date_order,
            client_name,
            salesman_name,
            price_list,
            sell_condition,
            payment_condition,
            observation_order,
            products
        } = req.body;

        try {
            // Verificar si existe
            const order = await NewOrder.findByPk(id);
            if (!order) {
                return res.status(404).json({ ok: false, msg: "Orden no encontrada" });
            }

            // Actualizar encabezado
            await order.update({
                date_order,
                client_name,
                salesman_name,
                price_list,
                sell_condition,
                payment_condition,
                observation_order
            });

            // Eliminar productos actuales y volver a insertar
            await OrderProductClient.destroy({ where: { order_id: id } });

            if (Array.isArray(products) && products.length > 0) {
                const productsToSave = products.map(prod => ({
                    order_id: id,
                    product_cod: prod.codigo,
                    product_name: prod.corte?.value?.product_name || '',
                    precio: prod.precio,
                    cantidad: prod.cantidad,
                    tipo_medida: prod.tipoMedida
                }));
                await OrderProductClient.bulkCreate(productsToSave);
            }

            return res.json({ ok: true, msg: "Orden actualizada correctamente" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al actualizar la orden" });
        }
    },
    deleteOrder: async (req, res) => {
        const { id } = req.params;
        try {
            // si la orden ya fue generada, habrá registros en products_sell_order
            const vinculadas = await ProductsSellOrder.count({ where: { sell_order_id: id } });
            if (vinculadas > 0) {
                return res.status(409).json({
                    ok: false,
                    msg: "No se puede eliminar: la orden ya fue generada y tiene productos asociados."
                });
            }

            // (opcional) bloquear también por flag de header
            const header = await NewOrder.findByPk(id);
            if (!header) return res.status(404).json({ ok: false, msg: "Pedido no encontrado" });
            if (header.order_check === true) {
                return res.status(409).json({
                    ok: false,
                    msg: "No se puede eliminar: la orden ya fue generada (order_check = true)."
                });
            }

            // borrar líneas y luego header en transacción
            const t = await sequelize.transaction();
            try {
                await OrderProductClient.destroy({ where: { order_id: id }, transaction: t });
                const deleted = await NewOrder.destroy({ where: { id }, transaction: t });
                await t.commit();

                if (!deleted) return res.status(404).json({ ok: false, msg: "Pedido no encontrado" });
                return res.json({ ok: true, msg: "Pedido eliminado correctamente" });
            } catch (err) {
                await t.rollback();
                console.error(err);
                return res.status(500).json({ ok: false, msg: "Error al eliminar el pedido" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, msg: "Error al eliminar el pedido" });
        }
    },







}

module.exports = saleApiController;