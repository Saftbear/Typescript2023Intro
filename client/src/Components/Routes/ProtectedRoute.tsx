import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser && !user) {
      navigate('/Login');
    }
  }, [user, loadingUser, navigate]);

  if (loadingUser) return null; 

  if (!user) return null;

  return <>{children}</>;
};
