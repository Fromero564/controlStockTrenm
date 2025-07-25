const express = require("express");
const router = express.Router();
const path = require("path");
const apiAdministrativeController= require("../../controllers/api/administrativeApiController");

//Obterner todos los productos del proceso productivo
router.get("/all-process-products",apiAdministrativeController.getAllProcessProducts);
// Obtener un producto con sus subproductos
router.get("/product/:id", apiAdministrativeController.getProductWithSubproducts);
//Api para obtener todos los depósitos
router.get("/all-warehouses", apiAdministrativeController.getAllWarehouses);
//Api para ver proveedores cargados
router.get("/allProviders",apiAdministrativeController.allProviders);
//Api para cargar proveedor filtrado
router.get("/provider/:id",apiAdministrativeController.filterProvider);
//Api para cargar cliente filtrado
router.get("/client/:id",apiAdministrativeController.filterClient);
//Api para ver clientes cargados
router.get("/allClients",apiAdministrativeController.allClients);
//Api para ver todas las categorias cargadas
router.get("/all-product-categories",apiAdministrativeController.allProductCategories);
//Api para ver categoria por id
router.get("/product-category/:id", apiAdministrativeController.getProductCategoryById);
//Api para ver un deposito por id
router.get("/warehouse/:id", apiAdministrativeController.getOneWarehouse);
//Api para todos los productos en almacenes
router.get("/warehouse-stock", apiAdministrativeController.getAllWarehouseStock);
//Api para ver stock no asignado
router.get("/warehouse-stock-unassigned", apiAdministrativeController.getUnassignedStock);
//Api para encontrar productos cargados en un remito
router.get("/bill-details/:id",apiAdministrativeController.findBillDetailsById);
//Api para ver todos los productos disponibles
router.get("/all-products-availables", apiAdministrativeController.getAllAvailableProducts);


//Api para actualizar proveedor
router.put("/provider-edit/:id",apiAdministrativeController.editProvider);
//Api para actualizar cliente
router.put("/client-edit/:id",apiAdministrativeController.editClient);
//Api para actualizar categorias
router.put("/category-product-edit/:id",apiAdministrativeController.editCategory);
//Api para editar depósito
router.put("/warehouse-edit/:id", apiAdministrativeController.editWarehouse);
//Api modificar stock de un deposito
router.put("/warehouse-stock-update", apiAdministrativeController.updateWarehouseStock);
//Api para editar un producto
router.put('/product-update/:id', apiAdministrativeController.editProductAvailable);





//Crear nuevo almancen
router.post("/warehouse-load",apiAdministrativeController.loadNewWarehouse);
//Cargar nuevo proveedor
router.post("/provider-load",apiAdministrativeController.loadNewProvider);
//Cargar nuevo cliente
router.post("/client-load",apiAdministrativeController.loadNewClient);
//Cargar nuevo producto en la bd para ser usado en operaciones
// router.post("/product-load",apiAdministrativeController.loadNewProduct);
//Api para cargar productos a un almacen
router.post("/warehouse-stock-assign", apiAdministrativeController.assignStockToWarehouse);
//Api para eliminar un producto de un almacen
router.post("/warehouse-stock-remove", apiAdministrativeController.removeFromWarehouse);
//Api para crear productos con subproductos
router.post("/product-load-with-subproducts", apiAdministrativeController.createProductWithSubproducts);
// Api para crear o actualizar un subproducto
// router.post("/create-or-update-subproduct", apiAdministrativeController.createOrUpdateSubproduct);



//Api para eliminar proveedor
router.delete("/deleteProvider/:id", apiAdministrativeController.deleteProvider);
//Api para eliminar cliente
router.delete("/deleteClient/:id", apiAdministrativeController.deleteClient);
//Api para borrar una categoria de producto
router.delete("/deleteCategory/:id", apiAdministrativeController.deleteProductCategory);
// Api para eliminar un depósito
router.delete("/deleteWarehouse/:id", apiAdministrativeController.deleteWarehouse);
//Api para eliminar un subproducto cuando editas
router.delete("/delete-subproduct/:id", apiAdministrativeController.deleteSubproduct);
//Api para eliminar un proceso productivo
router.delete('/delete-process-by-bill/:bill_id',apiAdministrativeController.deleteProcessByBillId);



module.exports = router;