const express = require("express");
const router = express.Router();
const path = require("path");
const apiOperatorController= require("../../controllers/api/operatorApiController.js");
const operatorApiController = require("../../controllers/api/operatorApiController.js");



//Api para traer subproductos cuando se hace el proceso productivo
router.get("/subproducts-by-name/:name", operatorApiController.getSubproductsForProduct);
//Api para ver todos los productos congelados/otros cargados
router.get("/all-products-fresh-others",apiOperatorController.getAllOtherProductsManual);
//Api para ver carga de remitos de proveedores
router.get("/allProducts",apiOperatorController.allProducts);
//Api para ver stock productos
router.get("/allProductsStock",apiOperatorController.productStock);
//Api para encontrar productos
router.get("/find-remit/:remitoId",apiOperatorController.findRemit);
//Api todas las Taras
router.get("/allTares",apiOperatorController.alltares);
//Api Cargar productos en seccion primaria
router.get("/product-primary-name",apiOperatorController.loadProductsPrimaryCategory);
//Api para ver todas las obsercaciones disponibles
router.get("/allObservations",apiOperatorController.viewAllObservationMeatIncome)
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
// //Api para encontrar ultimo recibo de proveedor
// router.get("/last-provider-bill",apiOperatorController.loadLastBillSupplier);
//Api modificar ingreso por manual
router.get("/getProductsFromRemito/:id",apiOperatorController.updateProductFromRemit);
//Api para ver todos los productos congelados/otros productos que tengo cargue por manual
router.get("/getOtherProductsFromRemito/:id",apiOperatorController.getOtherProductsFromRemito);
//Api para ver stock disponible
router.get("/all-products-stock",apiOperatorController.getProductStock);
// //Api para traer producto disponible por ID
// router.get("/product/:id", operatorApiController.getProductById);
//Api para traer todas las categorias
router.get("/all-product-categories",operatorApiController.getAllProductCatagories);
router.get("/bill-details-readonly/:id", apiOperatorController.billDetailsReadonly);
router.get("/bill-details/:id", apiOperatorController.billDetails);
router.get("/productionprocess-subproduction",apiOperatorController.getAllSubproduction
);
router.get("/process/:process_number", operatorApiController.getProcessByNumber);

//Api para crear nuevas categorias
router.post("/uploadCategory",operatorApiController.loadNewCategory);
//Api para cargar productos
router.post("/uploadProduct",apiOperatorController.uploadProducts);
//Api para cargar productos de proceso
router.post("/uploadProcessMeat",apiOperatorController.uploadProductsProcess);
//Api para cargar Taras
router.post("/tareLoad",apiOperatorController.tareLoad);
//Api para cargar cortes que vienen por remito
router.post("/addProducts/:id",apiOperatorController.addIncomeMeat);
//Api para crear nueva observacion de corte
router.post("/observations-create",apiOperatorController.createObservation);
//Agregar productos congelados o otro productos no cortes por manual
router.post("/addOtherProductsManual",apiOperatorController.addOtherProductsManual);
//Api para descontar productos del stock cuando no tienen remitos en el proceso productivo 
router.post("/descontar-stock-sin-remito", operatorApiController.descontarStockSinRemito);



//Api para actualizar los productos disponibles 
// router.put('/product-update/:id', operatorApiController.editProductAvailable);
//Api para actualizar las piezas congeladas/otros productos
router.put("/editOtherProductsManual/:id",apiOperatorController.editOtherProductsManual);
//Api para actualizar las piezas que se despostaron
router.put("/update-product-stock",apiOperatorController.updateProductStockQuantity)
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
router.put("/stock/manual/:id", apiOperatorController.updateStockManual); 
router.put("/process/:process_number", operatorApiController.updateProcessByNumber);
router.put(
  "/bill-production-flag/:id",
  operatorApiController.toggleProductionProcessFlag
);
// Dar de baja un comprobante (soft-delete)
router.put("/products-bill/deactivate/:id", apiOperatorController.deactivateProduct);

// Dar de alta nuevamente un comprobante dado de baja
router.put("/products-bill/reactivate/:id", apiOperatorController.reactivateProduct);



//Api eliminar corte de la bd cuando se modifica detalle del proveedor
router.delete("/delete-bill-detail/:id",apiOperatorController.deleteDetailProviderForm);
//Api apra eliminar una tara
router.delete("/tare-delete/:id", apiOperatorController.deleteTare);
//Api para eliminar un carga de producto proveniente del proveedor
router.delete("/products-bill/:id",apiOperatorController.deleteProduct);
//Api para eliminar item que se agrega en carga manual
router.delete("/provider-item-delete/:id",apiOperatorController.deleteItemFromMeatManualIncome);
//Api para eliminar items que se cargan por manual que sean congelados/otros productos
router.delete("/other-product-delete/:id",apiOperatorController.deleteOtherProduct);
//Api para eliminar un producto disponible
router.delete("/delete-product-available/:id", apiOperatorController.deleteProductAvailable);

module.exports=router;