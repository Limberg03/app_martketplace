import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import AppDetail from './pages/AppDetail';
import UploadApp from './pages/UploadApp';
import Portfolio from './pages/Portfolio';
import MyPurchases from './pages/MyPurchases';
import SalesDashboard from './pages/SalesDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApps from './pages/admin/AdminApps';
import AdminReports from './pages/admin/AdminReports';
import AdminUsers from './pages/admin/AdminUsers';
import { useLocation } from 'react-router-dom';

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="apps" element={<AdminApps />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/app/:id" element={<AppDetail />} />
              <Route path="/upload" element={<UploadApp />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/purchases" element={<MyPurchases />} />
              <Route path="/compras" element={<MyPurchases />} />
              <Route path="/sales" element={<SalesDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
