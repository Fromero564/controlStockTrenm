import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import MeatIncome from './components/MeatIncome.jsx';
import ProviderForm from './components/ProviderForm.jsx';
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
    element: <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }, {
    path: "/provider-form",
    element: (
      <ProtectedRoute>
        <ProviderForm />
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
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
