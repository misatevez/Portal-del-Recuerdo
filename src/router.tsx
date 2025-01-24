import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import App from './App';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { CreateTributeForm } from './components/tributes/CreateTributeForm';
import { ExplorePage } from './pages/ExplorePage';
import { TributeDetailPage } from './pages/TributeDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { PricingPage } from './pages/PricingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ErrorPage } from './pages/ErrorPage';
import { supabase } from './lib/supabase';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = supabase.auth.getUser();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'explorar',
        element: <ExplorePage />,
      },
      {
        path: 'crear-homenaje',
        element: (
          <ProtectedRoute>
            <CreateTributeForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'homenaje/:id',
        element: <TributeDetailPage />,
      },
      {
        path: 'perfil',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'moderacion',
        element: (
          <ProtectedRoute>
            <ModeratorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'precios',
        element: <PricingPage />,
      },
      {
        path: 'login',
        element: <LoginForm />,
      },
      {
        path: 'registro',
        element: <RegisterForm />,
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
]);

export default router;
