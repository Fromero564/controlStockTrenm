const express = require("express");
const router = express.Router();
const path = require("path");
const apiProviderController= require("../../controllers/api/providerApiController");

//Api para ver productos cargados
router.get("/allProducts",apiProviderController.allProducts);
//Api para cargar productos
router.post("/uploadProduct",apiProviderController.uploadProducts);
//Api para cargar cortes que vienen por remito
router.post("/addProducts/:id",apiProviderController.addIncomeMeat)


module.exports=router;