import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LostItems from '../components/itemManagement/LostItems'

const Home = () => {
  const { handleLogout } = useContext(AuthContext);

  return (
    <div>
      <h2>Welcome to a Dashboard</h2>
      <h1>Lost & Found System</h1>
        <LostItems />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
