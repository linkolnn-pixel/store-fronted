import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import About from './pages/About';
import Catalog from './pages/Catalog';
import Services from './pages/Services';
import Cart from './pages/Cart';
import Success from './pages/Success';
import ProductPage from './pages/ProductPage';
import AdminProductEdit from './pages/AdminProductEdit';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import ProtectedRoute from './components/ProtectedRoute';
import Profile from "./pages/Profile.jsx";

function NavBar() {
  const { cartCount } = useCart();

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    fontSize: '15px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <nav style={{
      padding: '20px 40px',
      background: '#fff',
      borderBottom: '1px solid #eaeaea',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      <Link to="/" style={linkStyle}>О владельце</Link>
      <Link to="/services" style={linkStyle}>Услуги</Link>
      <Link to="/catalog" style={linkStyle}>Каталог товаров</Link>

      <Link to="/profile" style={linkStyle}>
        Кабинет
      </Link>
      {/* ======================================= */}

      <Link to="/cart" style={{...linkStyle, color: '#d4af37', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
        Корзина
          <span style={{
            background: '#d4af37',
            color: '#fff',
            borderRadius: '50%',
            padding: '2px 7px',
            fontSize: '12px',
            marginLeft: '8px'
          }}>
            {cartCount}
          </span>
      </Link>
    </nav>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

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

              {/* Авторизация админа */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              {/* 2. ЗАЩИЩЕННЫЙ МАРШРУТ */}
              <Route
                path="/admin/product/:id"
                element={
                  <ProtectedRoute>
                    <AdminProductEdit />
                  </ProtectedRoute>
                }
              />

            </Routes>
          </div>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;