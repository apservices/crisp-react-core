import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoutes from './routes/ProtectedRoutes';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const rrFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
} as const;

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoutes />,
    children: [
      { path: '/', element: <Index /> },
      { path: '/dashboard', element: <Index /> },
      { path: '/tracks', element: <Index /> },
      { path: '/vault', element: <Index /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], { future: rrFuture as any });

function App() {
  return (
    <AuthProvider>
      <RouterProvider 
        router={router} 
        future={rrFuture as any}
      />
    </AuthProvider>
  );
}

export default App;

