const express = require("express");
const router = express.Router();
const path = require("path");
const apiSaleController = require("../../controllers/api/saleApiController");
const saleApiController = require("../../controllers/api/saleApiController");


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
router.get("/all-products-orders",saleApiController.getAllOrdersContent);
//Api para traer una sola orden por id
router.get("/get-order-by-id/:id",saleApiController.getSaleOrderbyId)
//Api para entrar productos por orden
router.get("/get-all-products-by-order/:id",saleApiController.getOrderProductbyId);

//Api para crear Vendedores
router.post("/create-salesman",apiSaleController.createNewSeller);
//Api para crear una nueva orden 
router.post("/create-order",apiSaleController.createOrder);
//Api para crear una nueva lista d eprecios
router.post("/create-new-price-list",apiSaleController.createPriceList);
//Api para crear productos de una orden
router.post("/generate-sales-order/:id", apiSaleController.generateSalesOrder);


//Api para eliminar un Vendedor
router.delete("/delete-seller/:id", apiSaleController.deleteSeller);
//Api para eliminar una orden de venta(remito)
router.delete("/delete-order/:id", apiSaleController.deleteOrder);


//Api para modificar un vendedor
router.put("/update-seller/:id", apiSaleController.updateSeller);
//Api para modificar cantidad de producto desde modal de disponibilidad
router.put("/update-order-product/:id",apiSaleController.updateOrderProductQuantity);
// Api para modificar una orden existente
router.put("/update-order/:id", apiSaleController.updateOrder);





module.exports = router;