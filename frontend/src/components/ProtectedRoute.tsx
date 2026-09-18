import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from './State';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/api';

export function ProtectedRoute({ roles }: { roles?: Role[] }) { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <LoadingState />; if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />; if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />; return <Outlet />; }
