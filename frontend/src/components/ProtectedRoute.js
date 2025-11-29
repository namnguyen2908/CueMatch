import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import api from "../api/api";
import { useUser } from "../contexts/UserContext";
import userApi from "../api/userApi";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { datauser, Datalogin, logout } = useUser();
  const hasChecked = useRef(false); // Để tránh check nhiều lần

  useEffect(() => {
    // Chỉ check một lần
    if (hasChecked.current) {
      console.log('🔒 ProtectedRoute: Already checked, skipping...');
      return;
    }
    
    const checkAuth = async () => {
      console.log('🔒 ProtectedRoute: Starting auth check...');
      hasChecked.current = true;
      
      // Dùng .then().catch() để đảm bảo catch được gọi
      console.log('🔒 ProtectedRoute: Calling /auth/check...');
      // Gọi /auth/check - nếu token hết hạn, interceptor sẽ tự động thử refresh token
      api.get("/auth/check")
        .then((res) => {
          console.log('🔒 ProtectedRoute: /auth/check response:', res?.status, res?.data);
          
          if (res && res.status === 200 && res.data.loggedIn) {
            console.log('✅ ProtectedRoute: User is logged in');
            setLoggedIn(true);
            setLoading(false);
            
            // Kiểm tra và cập nhật thông tin user nếu cần
            userApi.getUserDetail()
              .then((userInfo) => {
                console.log('🔒 ProtectedRoute: User info:', userInfo);
                
                if (userInfo) {
                  const userData = {
                    id: userInfo.id || userInfo._id,
                    name: userInfo.Name,
                    avatar: userInfo.Avatar,
                    clubId: userInfo.clubId,
                    role: datauser?.role || res.data.user?.Role,
                  };
                  
                  // Chỉ cập nhật nếu có thay đổi
                  if (JSON.stringify(userData) !== JSON.stringify(datauser)) {
                    console.log('🔒 ProtectedRoute: Updating user data');
                    Datalogin(userData);
                  }
                  
                  // Kiểm tra nếu user là partner nhưng chưa có club
                  const userRole = userData.role || res.data.user?.Role;
                  const isPartner = userRole === 'partner';
                  
                  // Convert clubId sang string và kiểm tra
                  const clubIdFromData = userData.clubId ? String(userData.clubId) : null;
                  const clubIdFromInfo = userInfo.clubId ? String(userInfo.clubId) : null;
                  const hasClub = (clubIdFromData && clubIdFromData !== 'null' && clubIdFromData !== 'undefined') ||
                                  (clubIdFromInfo && clubIdFromInfo !== 'null' && clubIdFromInfo !== 'undefined');
                  const hasNoClub = !hasClub;
                  const isNotOnCreateClubPage = !location.pathname.includes('/partner/create-club');
                  
                  console.log('🔒 ProtectedRoute: Partner check:', { 
                    isPartner, 
                    hasNoClub, 
                    isNotOnCreateClubPage,
                    clubIdFromData,
                    clubIdFromInfo,
                    hasClub
                  });
                  
                  if (isPartner && hasNoClub && isNotOnCreateClubPage) {
                    console.log('🔒 ProtectedRoute: Redirecting to create club page');
                    navigate('/partner/create-club', { replace: true });
                  }
                }
              })
              .catch((userError) => {
                console.error("❌ ProtectedRoute: Error fetching user info:", userError);
                // Vẫn cho phép truy cập nếu không fetch được user info
                if (datauser) {
                  const isPartner = datauser.role === 'partner';
                  // Convert clubId sang string và kiểm tra
                  const clubIdString = datauser.clubId ? String(datauser.clubId) : null;
                  const hasClub = clubIdString && clubIdString !== 'null' && clubIdString !== 'undefined';
                  const hasNoClub = !hasClub;
                  const isNotOnCreateClubPage = !location.pathname.includes('/partner/create-club');
                  
                  console.log('🔒 ProtectedRoute: Partner check (fallback):', { 
                    isPartner, 
                    hasNoClub, 
                    isNotOnCreateClubPage,
                    clubIdString
                  });
                  
                  if (isPartner && hasNoClub && isNotOnCreateClubPage) {
                    navigate('/partner/create-club', { replace: true });
                  }
                }
              });
          } else {
            // Nếu không logged in, clear user data và redirect về trang đăng nhập
            console.log('❌ ProtectedRoute: User is NOT logged in, redirecting...');
            console.log('❌ ProtectedRoute: Response status:', res?.status);
            console.log('❌ ProtectedRoute: Response data:', res?.data);
            setLoading(false);
            logout();
            setShouldRedirect(true);
            console.log('❌ ProtectedRoute: shouldRedirect set to true');
          }
        })
        .catch((err) => {
          // Nếu có lỗi (401 sau khi refresh token thất bại, hoặc lỗi khác)
          console.error("❌ ProtectedRoute: Auth check failed with error:");
          console.error("❌ Error response:", err.response);
          console.error("❌ Error status:", err.response?.status);
          console.error("❌ Error data:", err.response?.data);
          console.error("❌ Error message:", err.message);
          console.error("❌ Error config:", err.config);
          
          setLoading(false);
          logout();
          setShouldRedirect(true);
          console.log('❌ ProtectedRoute: shouldRedirect set to true (from catch)');
        });
      
      return; // Return ngay, không cần try-catch nữa

    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: Log current state
  console.log('🔒 ProtectedRoute Render:', {
    loading,
    loggedIn,
    shouldRedirect,
    hasChecked: hasChecked.current,
    currentPath: location.pathname
  });

  // Nếu cần redirect, dùng Navigate component
  if (shouldRedirect) {
    console.log('🔄 ProtectedRoute: Rendering Navigate component to redirect to /');
    return <Navigate to="/" replace state={{ showModal: true }} />;
  }

  if (loading) {
    // Hiển thị loading spinner
    console.log('⏳ ProtectedRoute: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (loggedIn) {
    console.log('✅ ProtectedRoute: User is logged in, rendering children');
    return children;
  }
  
  console.log('❌ ProtectedRoute: User is not logged in and not redirecting, returning null');
  return null;
};

export default ProtectedRoute;
