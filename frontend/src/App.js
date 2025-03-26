import { Routes, Route } from "react-router-dom";
import Main from "./pages/main/main";
import Home from "./pages/Home";

//User
import UserTable from "./pages/user/UserTable";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/UI/Footer";

//ItemManagement
import ItemDashboard from './pages/itemManagement/dashboard'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserTable/>}/>

        {/* ItemManagement */}
        <Route path="/itemDashboard" element={<ItemDashboard/>}/>
      </Routes>
      {/* <Footer /> */}
    </>
  );
}

export default App;
