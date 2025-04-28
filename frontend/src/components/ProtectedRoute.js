import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Destructure user and loading state from AuthContext
  const { user, loading } = useContext(AuthContext);

  // While loading, don't render anything yet (or show a loading spinner)
  if (loading) {
    return <div>Loading...</div>; // Or return null;
  }

  // After loading, check if user exists
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
