import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './layouts/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/', element: <FeedPage /> }],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}