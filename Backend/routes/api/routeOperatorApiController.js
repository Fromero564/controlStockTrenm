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

//Api para cargar productos
router.post("/uploadProduct",apiOperatorController.uploadProducts);
//Api para cargar cortes que vienen por remito
router.post("/addProducts/:id",apiOperatorController.addIncomeMeat);
//Api para eliminar un carga de producto proveniente del proveedor
router.delete("/products/:id",apiOperatorController.deleteProduct);


module.exports=router;