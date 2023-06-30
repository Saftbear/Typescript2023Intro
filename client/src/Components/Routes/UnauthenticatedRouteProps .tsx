import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';

interface UnauthenticatedRouteProps {
  children: React.ReactNode;
}

export const UnauthenticatedRoute: React.FC<UnauthenticatedRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loadingUser && user) {
      navigate('/');
      }
  }, [user, loadingUser, navigate]);

  if (loadingUser) return null; 

  if (user) return null;

  return <>{children}</>;
};
