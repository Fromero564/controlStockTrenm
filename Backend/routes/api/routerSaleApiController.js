const express = require("express");
const router = express.Router();
const path = require("path");
const apiSaleController = require("../../controllers/api/saleApiController");



//Api para traer todos los vendedores
router.get("/all-sellers",apiSaleController.getAllSellers);
//Api para buscar un vendedor por ID
router.get("/seller/:id", apiSaleController.getSellerById);
//Api para traer todas las ordenes
router.get("/all-orders",apiSaleController.getAllOrders);
//Api para traer todos los listados de precios
router.get("/all-price-list",apiSaleController.getAllPriceList);
//Api para traer todos los datos de los listados de precios
router.get("/all-info-price-list",apiSaleController.getAllPriceListProduct);
//Api para traer todos los productos de las ordenes
router.get("/all-products-orders",apiSaleController.getAllOrdersContent);
//Api para traer una sola orden por id
router.get("/get-order-by-id/:id",apiSaleController.getSaleOrderbyId)
//Api para entrar productos por orden
router.get("/get-all-products-by-order/:id",apiSaleController.getOrderProductbyId);
//Api para traer todos los productos de una orden lista para pesar
router.get("/final-orders", apiSaleController.getFinalOrdersGrouped);
//Api para ver todas las condiciones de venta
router.get("/sale-conditions", apiSaleController.getAllSaleConditions);
//Api para ver una condicion puntal de venta
router.get("/sale-conditions/:id", apiSaleController.getSaleConditionById);
//Api para ver todas las condiciones de ventas
router.get("/payment-conditions", apiSaleController.getAllPaymentConditions);
//Api para ver una condicion de venta por ID
router.get("/payment-conditions/:id", apiSaleController.getPaymentConditionById);
//Api para productos de la tabla products_sell_order por orden
router.get("/sell-order-products/:id", apiSaleController.getSellOrderProducts);
//Buscar una orden para el header de pesaje
router.get("/orders/:id/header", apiSaleController.getOrderHeaderForWeighing);
//Leer datos guardados de la pesada del comprobante
router.get("/orders/:id/weighings", apiSaleController.getOrderWeighing);


//Api para cargar datos de pessada tanto general como de cada item de una orden de venta
router.post("/orders/:id/weighings", apiSaleController.saveOrderWeighing);
//Api para crear Vendedores
router.post("/create-salesman",apiSaleController.createNewSeller);
//Api para crear una nueva orden 
router.post("/create-order",apiSaleController.createOrder);
//Api para crear una nueva lista d eprecios
router.post("/create-new-price-list",apiSaleController.createPriceList);
//Api para crear productos de una orden
router.post("/generate-sales-order/:id", apiSaleController.generateSalesOrder);
//Api para crear una condicion de venta
router.post("/sale-conditions",apiSaleController.createSaleCondition);
//Api para crear un metodo de pago
router.post("/payment-conditions", apiSaleController.createPaymentCondition);


//Api para eliminar un Vendedor
router.delete("/delete-seller/:id", apiSaleController.deleteSeller);
//Api para eliminar una orden de venta(remito)
router.delete("/delete-order/:id", apiSaleController.deleteOrder);
//Api para eliminar una condicion de venta
router.delete("/sale-conditions/:id", apiSaleController.deleteSaleCondition);
//Api para eliminar un metodo de pago
router.delete("/payment-conditions/:id", apiSaleController.deletePaymentCondition);


//Api para modificar un vendedor
router.put("/update-seller/:id", apiSaleController.updateSeller);
//Api para modificar cantidad de producto desde modal de disponibilidad
router.put("/update-order-product/:id",apiSaleController.updateOrderProductQuantity);
// Api para modificar una orden existente
router.put("/update-order/:id", apiSaleController.updateOrder);
//Api para modificar una condicion de venta
router.put("/sale-conditions/:id", apiSaleController.updateSaleCondition);
//Api para modificar un metodo de pago 
router.put("/payment-conditions/:id", apiSaleController.updatePaymentCondition);
//Api para actualizar cantidad/peso de un renglón de products_sell_order
router.put("/sell-order-products/:id", apiSaleController.updateSellOrderProductQuantity);
//Api para marcar orden ya pesada
router.put("/orders/:id/weight-check", apiSaleController.setOrderWeightChecked);





module.exports = router;