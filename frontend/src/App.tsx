import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from '@/layouts/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import FeedPage from '@/pages/FeedPage';
import TrendingPage from '@/pages/TrendingPage';
import FavoritesPage from '@/pages/FavoritesPage';
import SettingsPage from '@/pages/SettingsPage';
import { MotionConfig } from 'framer-motion';
import SearchPage from '@/pages/SearchPage';
import ReadPage from '@/pages/ReadPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/search', element: <SearchPage /> },
  
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
          { path: '/read', element: <ReadPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}