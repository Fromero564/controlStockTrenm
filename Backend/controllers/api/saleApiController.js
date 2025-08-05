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
const Seller = db.Seller;
const NewOrder = db.NewOrder;
const OrderProductClient = db.OrderProductClient;
const PriceList = db.PriceList;
const PriceListProduct = db.PriceListProduct;

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
}



}

module.exports = saleApiController;