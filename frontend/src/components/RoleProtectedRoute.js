import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import ProtectedRoute from './ProtectedRoute';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { datauser } = useUser();
  
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = datauser?.role || datauser?.Role || null;
    const hasPermission = userRole && rolesArray.includes(userRole);
  
    useEffect(() => {
      if (datauser && !hasPermission) {
        // toast.warn("Bạn không có quyền truy cập!");
        navigate(-1); // Best solution
      }
    }, [datauser, hasPermission, navigate]);
  
    if (!datauser || !hasPermission) return null;
  
    return <>{children}</>;
  };

export default RoleProtectedRoute;