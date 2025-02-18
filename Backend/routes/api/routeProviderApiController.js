const express = require("express");
const router = express.Router();
const path = require("path");
const apiProviderController= require("../../controllers/api/providerApiController");

//Api para cargar productos
router.post("/uploadProduct",apiProviderController.uploadProducts);


module.exports=router;