const express = require("express");
const router = express.Router();
const path = require("path");
const apiOperatorController= require("../../controllers/api/operatorApiController.js");
const operatorApiController = require("../../controllers/api/operatorApiController.js");

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
//Api para traer datos editar ingreso de boleta proveedor
router.get("/chargeUpdateBillDetails/:id",apiOperatorController.chargeUpdateBillDetails);
//Api Cargar ultimo boleta de venta del proveedor
router.get("/last-provider-bill",apiOperatorController.loadLastBillSupplier);
//Api encontrar tara edicion
router.get("/tareLoadFind/:id",apiOperatorController.tareLoadFind);
//Api para encontrar ultimo recibo de proveedor
router.get("/last-provider-bill",apiOperatorController.loadLastBillSupplier);
//Api modificar ingreso por manual
router.get("/getProductsFromRemito/:id",apiOperatorController.updateProductFromRemit);
//Api para cargar productos
router.post("/uploadProduct",apiOperatorController.uploadProducts);
//Api para cargar productos de proceso
router.post("/uploadProcessMeat",apiOperatorController.uploadProductsProcess);
//Api para cargar Taras
router.post("/tareLoad",apiOperatorController.tareLoad);
//Api para cargar cortes que vienen por remito
router.post("/addProducts/:id",apiOperatorController.addIncomeMeat);
//Api actualizar datos de la factura del proveedor 
router.put("/update-provider-bill/:id",apiOperatorController.updateProviderBill);
//Api para editar taras
router.put("/tare-edit/:id",operatorApiController.editTare);
//Api para actualizar tabla
router.put("/updateBillSupplier/:id",apiOperatorController.updateBillSupplier);
//Api para actualizar observaciones de carga de carne
router.put("/observations-edit/:id",apiOperatorController.updateObservationMeatIncome);
//Api para actualizar los cortes cargados en un remito
router.put("/meat-income-edit/:id",apiOperatorController.editAddIncome);
//Api eliminar corte de la bd cuando se modifica detalle del proveedor
router.delete("/delete-bill-detail/:id",apiOperatorController.deleteDetailProviderForm);
//Api apra eliminar una tara
router.delete("/tare-delete/:id", apiOperatorController.deleteTare);
//Api para eliminar un carga de producto proveniente del proveedor
router.delete("/products/:id",apiOperatorController.deleteProduct);
//Api para eliminar item que se agrega en carga manual
router.delete("/provider-item-delete/:id",apiOperatorController.deleteItemFromMeatManualIncome);


module.exports=router;