import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/check");

        if (res.status === 200 && res.data.loggedIn) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
          navigate("/", { state: { showModal: true } });
        }
      } catch (err) {
        console.error("Auth check failed:", err.response?.data || err.message);
        setLoggedIn(false);
        navigate("/", { state: { showModal: true } });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) return null;
  return loggedIn ? children : null;
};

export default ProtectedRoute;
