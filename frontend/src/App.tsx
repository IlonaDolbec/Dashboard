import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CheckEmailPage from "./pages/CheckEmailPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage"

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/check-email" element={<CheckEmailPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage/>}/>
            </Route>

            <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin" element={<AdminPage />} />
            </Route>
        </Routes>
    );
}

export default App;
