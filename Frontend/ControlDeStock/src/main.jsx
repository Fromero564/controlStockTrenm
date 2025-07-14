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
]);

Modal.setAppElement('#root');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>


);
