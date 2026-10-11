import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import About from './pages/About';
import Catalog from './pages/Catalog';
import Services from './pages/Services';
import Cart from './pages/Cart';
import Success from './pages/Success';

// Вынесли шапку в отдельный компонент
function NavBar() {
  const { cartCount } = useCart(); // Достаем счетчик из глобального состояния

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
      <Link to="/cart" style={{...linkStyle, color: '#d4af37', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
        Корзина
        {/* Показываем кружочек с цифрой, только если счетчик > 0 */}
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
              <Route path="/" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/success" element={<Success />} />
            </Routes>
          </div>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;