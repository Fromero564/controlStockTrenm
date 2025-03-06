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
import ProtectedRoute from './components/ProtectedRoute.jsx';


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
      element:( <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
      )
    }, 
  {
    path: "/provider-form",
    element: (
  
        <ProviderForm />
   
    ),
  },
  {
    path: "/operator-panel",
    element: (
     
        < OperatorPanel/>
    
    ),
  },
  {
    path: "/administrative-panel",
    element: (
    <AdministrativePanel/>
    ),
  },
  {
    path: "/product-load",
    element: (
    <LoadNewProduct/>
    ),
  },
  {
    path: "/provider-load",
    element: (
    <LoadNewProvider/>
    ),
  },
  {
    path: "/meat-load",
    element: (
    
        < MeatLoad/>
 
    ),
  },
  {
    path: "/provider-list",
    element: (
      <ProviderList/>
    ),
  },
  {
    path: "/meat-income/:id/:remitoId", 
    element: (
      
        <MeatIncome />
   
    ),
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>


);
