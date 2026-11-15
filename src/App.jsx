import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Импорт компонентов
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

// Импорт страниц
import About from './pages/About';
import Catalog from './pages/Catalog';
import Services from './pages/Services';
import Cart from './pages/Cart';
import Success from './pages/Success';
import ProductPage from './pages/ProductPage';
import Profile from "./pages/Profile";
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductEdit from './pages/AdminProductEdit';
import GiftCertificatePage from './pages/GiftCertificatePage'; // <-- ДОБАВИЛИ ИМПОРТ

function App() {
  return (
    <CartProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

          {/* Используем вынесенный компонент */}
          <NavBar />

          <div style={{ flex: 1, backgroundColor: '#fff' }}>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/success" element={<Success />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/profile" element={<Profile/>} />
              <Route path="/certificates" element={<GiftCertificatePage />} />

              {/* Авторизация админа */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/product/:id" element={<ProtectedRoute><AdminProductEdit /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;