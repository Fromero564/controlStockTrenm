import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; 


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path:"/registro",
    element:<Register />,
  },
  {
    path: "/dashboard",
    element:    <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <RouterProvider router={router} /> 
    </AuthProvider>
  </StrictMode>
);
