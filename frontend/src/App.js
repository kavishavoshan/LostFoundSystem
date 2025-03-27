<<<<<<< HEAD
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Messaging from './pages/Messaging';
import Analytics from './pages/Analytics';
=======
import { Routes, Route } from "react-router-dom";
import Main from "./pages/main/main";
import Home from "./pages/Home";

//User
import UserTable from "./pages/user/UserTable";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import UserProfile from "./pages/user/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
>>>>>>> development

//Footer
import Footer from "./components/UI/Footer";

//Admin
import AdminLogin from "./pages/admin/AdminLogin";

function App() {
  return (
<<<<<<< HEAD
    <Routes>
      <Route path="/messages" element={<Messaging />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
=======
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserTable />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/userprofile" element={<UserProfile />} />
      </Routes>
      <Footer />
    </>
>>>>>>> development
  );
}

export default App;
