import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import MeatIncome from './components/MeatIncome.jsx';
import ProviderForm from './components/ProviderForm.jsx';
import OperatorPanel from './components/OperatorPanel.jsx';
import AdministrativePanel from './components/AdministrativePanel.jsx';
import LoadNewProduct from './components/LoadNewProduct.jsx';
import LoadNewProvider from './components/LoadNewProvider.jsx'
import ProviderList from './components/ProviderList.jsx'
import MeatLoad from './components/MeatLoad.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import MeatManualIncome from './components/MeatManualIncome.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Tareload from './components/TareLoad.jsx';



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
    path: "/product-load",
    element: (
      <ProtectedRoute>
        <LoadNewProduct />
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
    path: "/meat-income/:id/:remitoId",
    element: (
      <ProtectedRoute>
        <MeatIncome />
      </ProtectedRoute>
    ),
  },
  {
    path: "/meat-manual-icome/:remitoId/",
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
        <Tareload/>
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>


);
