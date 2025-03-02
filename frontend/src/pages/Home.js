import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { handleLogout } = useContext(AuthContext);

  return (
    <div>
      <h2>Welcome to Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
