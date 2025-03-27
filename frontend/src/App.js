import { Routes, Route, useLocation } from "react-router-dom";
import Messaging from './pages/Messaging';
import Analytics from './pages/Analytics';
import Main from "./pages/main/main";
import Home from "./pages/Home";

//User
import UserTable from "./pages/user/UserTable";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import UserProfile from "./pages/user/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

//Footer
import Footer from "./components/UI/Footer";

//ItemManagement
import ItemDashboard from './pages/itemManagement/dashboard'
//Admin
import AdminLogin from "./pages/admin/AdminLogin";

//Components
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/UI/Footer";
import Header from "./components/UI/Header";

function App() {
  const location = useLocation();

  return (
    <>
      {/* Hide header only on main page */}
      {location.pathname !== "/" && <Header />}
      


      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/messages" element={<Messaging />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserTable/>}/>

        {/* ItemManagement */}
        <Route path="/itemDashboard" element={<ItemDashboard/>}/>
        <Route path="/user" element={<UserTable />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/userprofile" element={<UserProfile />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
