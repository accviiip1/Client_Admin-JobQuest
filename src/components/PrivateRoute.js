import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // Lấy user từ localStorage (hoặc AuthContext nếu bạn dùng context)
  const user = JSON.parse(localStorage.getItem("user"));
  const company = JSON.parse(localStorage.getItem("company"));

  // Nếu chưa login thì về trang login
  if (!user && !company) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
