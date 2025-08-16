import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      await api.get("/auth/check");
      setLoggedIn(true);
    } catch (err) {
      // Nếu accessToken hết hạn → cố gắng gọi refresh
      if (err.response?.status === 401) {
        try {
          await api.post('/auth/refresh', {}, { withCredentials: true });
          // Sau khi refresh thành công, thử lại
          await api.get("/auth/check");
          setLoggedIn(true);
        } catch (refreshError) {
          // Refresh thất bại → điều hướng về login
          navigate("/");
        }
      } else {
        // Nếu lỗi khác
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  if (loading) return null;

  return loggedIn ? children : null;
};

export default ProtectedRoute;