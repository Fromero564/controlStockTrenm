const express = require("express");
const router = express.Router();
const path = require("path");
const apiOperatorController= require("../../controllers/api/operatorApiController.js");

//Api para ver productos cargados
router.get("/allProducts",apiOperatorController.allProducts);
//Api para ver stock productos
router.get("/allProductsStock",apiOperatorController.productStock);
//Api para encontrar productos
router.get("/find-remit/:remitoId",apiOperatorController.findRemit);
//Api todas las Taras
router.get("/allTares",apiOperatorController.alltares);
//Api Cargar productos en seccion primaria
router.get("/product-primary-name",apiOperatorController.loadProductsPrimaryCategory);
//Api Cargar stock disponible
router.get("/stock-available",apiOperatorController.stockAvailable);
//Api Cargar todos los productos 
router.get("/product-name",apiOperatorController.loadAllProductsCategories);
//Api Cargar ultimo boleta de venta del proveedor
router.get("/last-provider-bill",apiOperatorController.loadLastBillSupplier);
//Api para cargar productos
router.post("/uploadProduct",apiOperatorController.uploadProducts);
//Api para cargar productos de proceso
router.post("/uploadProcessMeat",apiOperatorController.uploadProductsProcess);
//Api para cargar Taras
router.post("/tareLoad",apiOperatorController.tareLoad);
//Api para cargar cortes que vienen por remito
router.post("/addProducts/:id",apiOperatorController.addIncomeMeat);
//Api para eliminar un carga de producto proveniente del proveedor
router.delete("/products/:id",apiOperatorController.deleteProduct);


module.exports=router;