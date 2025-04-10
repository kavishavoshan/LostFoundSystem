import { Routes, Route, useLocation } from "react-router-dom";
import Messaging from "./pages/Messaging";
import Analytics from "./pages/Analytics";
import Main from "./pages/main/main";
import Home from "./pages/Home";

//User

import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import UserProfile from "./pages/user/Profile";

//ItemManagement
import ItemDashboard from "./pages/itemManagement/dashboard";
//Admin
import AdminLogin from "./pages/admin/AdminLogin";
import UserTable from "./pages/admin/UserTable";

//Components
// import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/UI/Footer";
import Header from "./components/UI/Header";

import Comunity from "./pages/main/Comunity";
import NewsSection from "./pages/main/NewsSection";
import Feature from "././pages/main/feature"

function App() {
  const location = useLocation();

  return (
    <>
      {/* Hide header only on main page */}
      {location.pathname !== "/" &&
      location.pathname !== "/comunity" &&
      location.pathname !== "/news" ? (
        <Header />
      ) : null}

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/messages" element={<Messaging />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/comunity" element={<Comunity />} />
        <Route path="/news" element={<NewsSection />} />
        <Route path="/feature"element={<Feature/>}/>

        {/* ItemManagement */}
        <Route path="/itemDashboard" element={<ItemDashboard />} />
        <Route path="/user" element={<UserTable />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/userprofile" element={<UserProfile />} />
      </Routes>

      {location.pathname !== "/" && <Footer />}
    </>
  );
}

export default App;
