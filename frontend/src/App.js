import { Routes, Route } from "react-router-dom";
import Main from "./pages/main/main";
import Home from "./pages/Home";

//User
import UserTable from "./pages/user/UserTable";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseItems from "./pages/browse-items";

import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/UI/Footer";
import Header from "./components/UI/Header";


function App() {
  return (
    <>
    <Header/>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserTable/>}/>
        <Route path="/browseitems" element={<BrowseItems/>}/>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
