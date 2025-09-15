import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MeatIncome from './features/stock/MeatIncome.jsx';
import ProviderForm from './features/providers/ProviderForm.jsx';
import OperatorPanel from './pages/OperatorPanel.jsx';
import AdministrativePanel from './pages/AdministrativePanel.jsx';
import LoadNewProduct from './features/products/LoadNewProduct.jsx';
import LoadNewProvider from './features/providers/LoadNewProvider.jsx'
import ProviderList from './features/providers/ProviderList.jsx'
import MeatLoad from './features/stock/MeatLoad.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import MeatManualIncome from './features/stock/MeatManualIncome.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Tareload from './features/stock/TareLoad.jsx';
import ProductionProcess from './features/stock/ProductionProcess.jsx';
import GeneralStock from './features/stock/GeneralStock.jsx';
import Alltares from './features/stock/Alltares.jsx';
import LoadNewClient from './features/clients/LoadNewClient.jsx';
import ClientList from './features/clients/ClientList.jsx';
import ConfigurationProduct from './features/products/configurationProduct.jsx';
import SalesPanel from './pages/SalesPanel.jsx';
import Modal from 'react-modal';
import AllproductsAvailables from './features/products/AllProductsAvailables.jsx';
import LoadNewCategory from './features/products/LoadNewCategory.jsx';
import AllCategoriesList from './features/products/AllCategoriesList.jsx';
import LoadWarehouse from './features/products/LoadNewWarehouse.jsx';
import AllWarehousesList from './features/products/AllWarehousesList.jsx';
import WarehouseStockView from './features/stock/WarehousesStockView.jsx';
import ListProductionProcess from './features/stock/ListProductionProcess.jsx';
import LoadNewOrder from './features/sales/LoadNewOrder.jsx';
import LoadNewSeller from './features/salesman/LoadNewSeller.jsx';
import ListSellers from './features/salesman/ListSellers.jsx';
import LoadNewPriceList from './features/sales/LoadNewPriceList.jsx';
import ProductionProcessDetails from './features/stock/ProductionProcessDetails.jsx';
import ListOrders from './features/sales/ListOrders.jsx';
import GenerateSalesOrder from './features/sales/GenerateSalesOrder.jsx';
import ListFinalOrders from './features/sales/ListFinalOrders.jsx';
import MeatLoadView from './features/stock/MeatLoadView.jsx';
import SaleConfiguration from './pages/SaleConfiguration.jsx';
import SaleConditionLoad from './features/sales/SaleConditionLoad.jsx';
import ListSaleConditionLoad from './features/sales/ListSaleConditionLoad.jsx';
import PaymentConditionLoad from './features/sales/PaymentConditionLoad.jsx';
import ListPaymentConditionLoad from './features/sales/ListPaymentConditionLoad.jsx';
import RoadmapOptions from './features/sales/RoadmapOptions.jsx';
import OrderWeight from './features/sales/OrderWeight.jsx';
import LoadNewDriver from './features/sales/transport/LoadNewDriver.jsx';
import ListDrivers from './features/sales/transport/ListDrivers.jsx';
import AvailableStockOrders from './components/AvailableStockOrders.jsx';
import ListRemitFinalWeight from './features/sales/ListRemitFinalWeight.jsx';
import RemitControlState from './features/sales/RemitControlState.jsx';
import RemitPreview from './features/sales/RemitPreview.jsx';
import ListDestination from './features/sales/transport/ListDestination.jsx';
import ListTruck from './features/sales/transport/ListTruck.jsx';



const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/registro",
    element: <Register />,
  },

  {
    path: "/dashboard",
    element: (<ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
    )
  },
  {
    path: "/provider-form",
    element: (
      <ProtectedRoute>
        <ProviderForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/operator-panel",
    element: (
      <ProtectedRoute>
        < OperatorPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/administrative-panel",
    element: (
      <ProtectedRoute>
        <AdministrativePanel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sales-panel",
    element: (
      <ProtectedRoute>
        <SalesPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/product-load",
    element: (
      <ProtectedRoute>
        <LoadNewProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/warehouse-load",
    element: (
      <ProtectedRoute>
        <LoadWarehouse />
      </ProtectedRoute>
    ),
  },
  {
    path: "/warehouse-load/:id",
    element: (
      <ProtectedRoute>
        <LoadWarehouse />
      </ProtectedRoute>
    ),
  },
  {
    path: "/warehouses-list",
    element: (
      <ProtectedRoute>
        <AllWarehousesList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/product-categories-list",
    element: (
      <ProtectedRoute>
        <AllCategoriesList />
      </ProtectedRoute>
    ),
  },

  {
    path: "/product-load/:id",
    element: (
      <ProtectedRoute>
        <LoadNewProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/product-configuration",
    element: (
      <ProtectedRoute>
        <ConfigurationProduct />
      </ProtectedRoute>
    ),
  },

  {
    path: "/provider-load",
    element: (
      <ProtectedRoute>
        <LoadNewProvider />
      </ProtectedRoute>
    ),
  },

  {
    path: "/provider-load/:id",
    element: (
      <ProtectedRoute>
        <LoadNewProvider />
      </ProtectedRoute>
    ),
  },
  {
    path: "/meat-load",
    element: (
      <ProtectedRoute>
        < MeatLoad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/provider-list",
    element: (
      <ProtectedRoute>
        <ProviderList />
      </ProtectedRoute>
    ),
  },

  {
    path: "/meat-manual-income/:remitoId/",
    element: (
      <ProtectedRoute>
        <MeatManualIncome />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tare-load",
    element: (
      <ProtectedRoute>
        <Tareload />
      </ProtectedRoute>
    ),
  },
  {
    path: "/all-products-availables",
    element: (
      <ProtectedRoute>
        <AllproductsAvailables />
      </ProtectedRoute>
    ),
  },
  {
    path: "/category-load",
    element: (
      <ProtectedRoute>
        <LoadNewCategory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/category-load/:id",
    element: (
      <ProtectedRoute>
        <LoadNewCategory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tare-load/:id",
    element: (
      <ProtectedRoute>
        <Tareload />
      </ProtectedRoute>
    ),
  },
  {
    path: "/production-process",
    element: (
      <ProtectedRoute>
        <ProductionProcess />
      </ProtectedRoute>
    ),
  },
  {
    path: "/production-process/:id",
    element: (
      <ProtectedRoute>
        <ProductionProcess />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-production-process",
    element: (
      <ProtectedRoute>
        <ListProductionProcess />
      </ProtectedRoute>
    ),
  },
  {
    path: "/general-stock",
    element: (
      <ProtectedRoute>
        <GeneralStock />
      </ProtectedRoute>
    ),
  },
  {
    path: "/warehouse-stock",
    element: (
      <ProtectedRoute>
        <WarehouseStockView />
      </ProtectedRoute>
    ),
  },

  {
    path: "/all-tares",
    element: (
      <ProtectedRoute>
        <Alltares />
      </ProtectedRoute>
    ),
  },
  {
    path: "/client-load",
    element: (
      <ProtectedRoute>
        <LoadNewClient />
      </ProtectedRoute>
    ),
  },
  {
    path: "/client-load/:id",
    element: (
      <ProtectedRoute>
        <LoadNewClient />
      </ProtectedRoute>
    ),
  },
  {
    path: "/client-list",
    element: (
      <ProtectedRoute>
        <ClientList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/provider-form/:id",
    element: (
      <ProtectedRoute>
        <ProviderForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sales-orders-new",
    element: (
      <ProtectedRoute>
        <LoadNewOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sales-orders-new/:id",
    element: (
      <ProtectedRoute>
        <LoadNewOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller-new",
    element: (
      <ProtectedRoute>
        <LoadNewSeller />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-seller/:id",
    element: (
      <ProtectedRoute>
        <LoadNewSeller />
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller-list",
    element: (
      <ProtectedRoute>
        <ListSellers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/new-price-list",
    element: (
      <ProtectedRoute>
        <LoadNewPriceList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/production-process/details/:processNumber",
    element: (
      <ProtectedRoute>
        <ProductionProcessDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-orders",
    element: (
      <ProtectedRoute>
        <ListOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/generate-sales-order/:id",
    element: (
      <ProtectedRoute>
        <GenerateSalesOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-final-orders",
    element: (
      <ProtectedRoute>
        <ListFinalOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/meat-load-view/:id",
    element: (
      <ProtectedRoute>
        <MeatLoadView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sale-condition-load",
    element: (
      <ProtectedRoute>
        <SaleConditionLoad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-condition-load",
    element: (
      <ProtectedRoute>
        <PaymentConditionLoad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sale-configuration",
    element: (
      <ProtectedRoute>
        <SaleConfiguration />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-sell-condition",
    element: (
      <ProtectedRoute>
        <ListSaleConditionLoad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-payment-condition",
    element: (
      <ProtectedRoute>
        <ListPaymentConditionLoad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/roadmap-options",
    element: (
      <ProtectedRoute>
        <RoadmapOptions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/order-weight/:id",
    element: (
      <ProtectedRoute>
        <OrderWeight />
      </ProtectedRoute>
    ),
  },
  {
    path: "/remits/preview/:id",
    element: (
      <ProtectedRoute>
        <RemitPreview />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-destination",
    element: (
      <ProtectedRoute>
        <ListDestination />
      </ProtectedRoute>
    ),
  },
  {
    path: "/trucks",
    element: (
      <ProtectedRoute>
        <ListTruck/>
      </ProtectedRoute>
    ),
  },
  {
    path: "/sale-condition-load/:id",
    element: (
      <ProtectedRoute>
        <SaleConditionLoad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-condition-load/:id",
    element: (
      <ProtectedRoute>
        <PaymentConditionLoad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/load-new-driver",
    element: (
      <ProtectedRoute>
        <LoadNewDriver />
      </ProtectedRoute>
    ),
  },
  {
    path: "/load-new-driver/:id",
    element: (
      <ProtectedRoute>
        <LoadNewDriver />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-drivers",
    element: (
      <ProtectedRoute>
        <ListDrivers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-final-remits",
    element: (
      <ProtectedRoute>
        <ListRemitFinalWeight />
      </ProtectedRoute>
    ),
  },
  {
    path: "/remit-control-state/:id",
    element: (
      <ProtectedRoute>
        <RemitControlState />
      </ProtectedRoute>
    ),
  },
  {
    path: "/available-stock",
    element: (
      <ProtectedRoute>
        <AvailableStockOrders />
      </ProtectedRoute>
    ),
  },
]);


Modal.setAppElement('#root');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>


);
