import React from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import Messaging from "./pages/Messaging";
import Analytics from "./pages/Analytics";
import Main from "./pages/main/main";
import Home from "./pages/Home";
import AboutUs from './pages/main/AboutUs';

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
import BrowseItems from "./pages/main/BrowseItems";
import { AuthProvider } from './context/AuthContext';

function App() {
  const location = useLocation();
  
  const isAuthPage = ["/login", "/register", "/adminlogin"].includes(location.pathname);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-white">
        {!isAuthPage && <Header />}
        
        <main className={`flex-grow ${!isAuthPage ? 'pt-16' : ''}`}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/messages" element={<Messaging />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/comunity" element={<Comunity />} />
            <Route path="/news" element={<NewsSection />} />
            <Route path="/browseitems" element={<BrowseItems />} />
            <Route path="/itemDashboard" element={<ItemDashboard />} />
            <Route path="/usertable" element={<UserTable />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/aboutus" element={<AboutUs />} />
           
          </Routes>
        </main>

        {!isAuthPage && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
