import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Spinner from '../components/Spinner';

export default function ProtectedRoute() {
  const status = useAppSelector((s) => s.auth.status);

  if (status === 'loading') return <Spinner />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}