const express = require("express");
const router = express.Router();
const apiSaleController = require("../../controllers/api/saleApiController");

// ----------------------
// GET
// ----------------------
router.get("/all-sellers", apiSaleController.getAllSellers);
router.get("/seller/:id", apiSaleController.getSellerById);

router.get("/all-orders", apiSaleController.getAllOrders);
router.get("/all-price-list", apiSaleController.getAllPriceList);
router.get("/all-info-price-list", apiSaleController.getAllPriceListProduct);
router.get("/all-products-orders", apiSaleController.getAllOrdersContent);
router.get("/get-order-by-id/:id", apiSaleController.getSaleOrderbyId);
router.get("/get-all-products-by-order/:id", apiSaleController.getOrderProductbyId);
router.get("/final-orders", apiSaleController.getFinalOrdersGrouped);

router.get("/sale-conditions", apiSaleController.getAllSaleConditions);
router.get("/sale-conditions/:id", apiSaleController.getSaleConditionById);
router.get("/payment-conditions", apiSaleController.getAllPaymentConditions);
router.get("/payment-conditions/:id", apiSaleController.getPaymentConditionById);

router.get("/sell-order-products/:id", apiSaleController.getSellOrderProducts);
router.get("/orders/:id/header", apiSaleController.getOrderHeaderForWeighing);
router.get("/orders/:id/weighings", apiSaleController.getOrderWeighing);

router.get("/price-list/:number", apiSaleController.getPriceListByNumber);
router.get("/compare-price-lists/:a/:b", apiSaleController.comparePriceLists);

router.get("/drivers", apiSaleController.getAllDrivers);
router.get("/drivers/:id", apiSaleController.getDriverById);

router.get("/remits/from-order/:id/preview", apiSaleController.getRemitControlState);
router.get("/remits/:id/pdf", apiSaleController.getRemitPdf);
router.get("/remits/from-order/:id/pdf", apiSaleController.getRemitPdfByOrder);
router.get("/remits/by-receipt/:receipt", apiSaleController.getRemitByReceipt);
router.get("/final-remits", apiSaleController.checkFinalRemitExists);
router.get("/remits/options", apiSaleController.listRemitsOptions);

router.get("/roadmaps/date-groups", apiSaleController.listRoadmapDateGroups);
router.get("/roadmaps/:id", apiSaleController.getRoadmap);
router.get("/roadmaps", apiSaleController.listRoadmaps);

router.get("/destinations", apiSaleController.getAllDestinations);
router.get("/destinations/:id", apiSaleController.getDestinationById);

router.get("/trucks", apiSaleController.getAllTrucks);
router.get("/trucks/:id", apiSaleController.getTruckById);

// ======================
// PREFAC NUEVA (GET)
// ======================

// detalle completo de las hojas seleccionadas (cabecera + remitos + items)
router.get( "/preinvoices/detail/by-roadmaps", apiSaleController.getPreinvoiceDetailByRoadmapIds);

// devoluciones / redirecciones ya cargadas
router.get("/preinvoices/returns/by-roadmaps",apiSaleController.readPreinvoiceReturnsByRoadmapIds);
router.get( "/preinvoices/list", apiSaleController.listPreinvoicesGrouped);

router.get("/preinvoices/history", apiSaleController.getPreinvoicesHistory);
router.get("/preinvoices/detail/by-receipt/:receipt", apiSaleController.getPreinvoiceDetailByReceipt);



// ----------------------
// POST
// ----------------------
router.post("/orders/:id/weighings", apiSaleController.saveOrderWeighing);
router.post("/drivers", apiSaleController.createDriver);
router.post("/create-salesman", apiSaleController.createNewSeller);
router.post("/create-order", apiSaleController.createOrder);
router.post("/create-new-price-list", apiSaleController.createPriceList);
router.post("/generate-sales-order/:id", apiSaleController.generateSalesOrder);

router.post("/sale-conditions", apiSaleController.createSaleCondition);
router.post("/payment-conditions", apiSaleController.createPaymentCondition);

router.post("/remits/from-order/:id", apiSaleController.createRemitFromOrder);

router.post("/destinations", apiSaleController.createDestination);
router.post("/trucks", apiSaleController.createTruck);
router.post("/roadmaps", apiSaleController.createRoadmap);

// ======================
// PREFAC NUEVA (POST)
// ======================

// guardar recepción (unidades/kilos recepcionados)
router.post(
    "/preinvoices/save/by-roadmaps",
    apiSaleController.savePreinvoiceByRoadmapIds
);

// registrar / actualizar redirección de faltantes
router.post(
    "/preinvoices/redirect/by-roadmaps",
    apiSaleController.savePreinvoiceRedirectByRoadmapIds
);

// ----------------------
// DELETE
// ----------------------
router.delete("/delete-seller/:id", apiSaleController.deleteSeller);
router.delete("/delete-order/:id", apiSaleController.deleteOrder);

router.delete("/sale-conditions/:id", apiSaleController.deleteSaleCondition);
router.delete("/payment-conditions/:id", apiSaleController.deletePaymentCondition);

router.delete("/drivers/:id", apiSaleController.deleteDriver);
router.delete("/destinations/:id", apiSaleController.deleteDestination);
router.delete("/trucks/:id", apiSaleController.deleteTruck);
router.delete("/roadmaps/:id", apiSaleController.deleteRoadmap);
// Borrar TODA la prefacturación por número de comprobante (receipt)
router.delete("/preinvoices/by-receipt/:receipt", apiSaleController.deletePreinvoiceByReceipt);



// ----------------------
// PUT
// ----------------------
router.put("/update-price-list/:number", apiSaleController.updatePriceList);

router.put("/update-seller/:id", apiSaleController.updateSeller);
router.put("/update-order-product/:id", apiSaleController.updateOrderProductQuantity);
router.put("/update-order/:id", apiSaleController.updateOrder);

router.put("/sale-conditions/:id", apiSaleController.updateSaleCondition);
router.put("/payment-conditions/:id", apiSaleController.updatePaymentCondition);

router.put("/sell-order-products/:id", apiSaleController.updateSellOrderProductQuantity);

router.put("/orders/:id/weight-check", apiSaleController.setOrderWeightChecked);

router.put("/drivers/:id", apiSaleController.updateDriver);
router.put("/destinations/:id", apiSaleController.updateDestination);
router.put("/trucks/:id", apiSaleController.updateTruck);
router.put("/roadmaps/:id", apiSaleController.updateRoadmap);

router.put("/bulk-update-price-lists", apiSaleController.bulkUpdatePriceLists);
// Guardar cambios de edición (update por recibo)
router.put( "/preinvoices/edit/by-receipt/:receipt",apiSaleController.savePreinvoiceEditsByReceipt);


module.exports = router;
