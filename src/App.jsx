import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import FavoritesSection from './components/FavoritesSection';

// Импорт компонентов
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Delivery from './pages/Delivery';
import { Link } from 'react-router-dom';
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
    <FavoritesProvider><CartProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

          {/* Используем вынесенный компонент */}
          <NavBar />

          <main id="main-content" style={{ flex: 1, backgroundColor: '#fff' }}>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/services" element={<Services />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/success" element={<Success />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/profile" element={<Profile/>} />
              <Route path="/favorites" element={<FavoritesSection />} />
              <Route path="/certificates" element={<GiftCertificatePage />} />

              {/* Авторизация админа */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/product/:id" element={<ProtectedRoute><AdminProductEdit /></ProtectedRoute>} />
            </Routes>
          </main>
          <footer className="site-footer"><Link className="wordmark" to="/">a·m<span className="wordmark-note">SKINCARE</span></Link><p>Забота о коже. С вниманием к вам.</p><nav aria-label="Навигация в подвале"><Link to="/catalog">Каталог</Link><Link to="/delivery">Доставка</Link><Link to="/about">О нас</Link></nav></footer>
        </div>
      </Router>
    </CartProvider></FavoritesProvider>
  );
}

export default App;
