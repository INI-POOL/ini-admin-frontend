import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard/Dashboard";

// ... 其他导入

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/auth/login" element={<Login />} />

        {/* 受保护路由 */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* 子路由 */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* ... 其他路由 */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
