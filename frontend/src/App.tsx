import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from '@/layouts/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import FeedPage from '@/pages/FeedPage';
import TrendingPage from '@/pages/TrendingPage';
import FavoritesPage from '@/pages/FavoritesPage';
import SettingsPage from '@/pages/SettingsPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <FeedPage /> },
          { path: '/trending', element: <TrendingPage /> },
          { path: '/favorites', element: <FavoritesPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}