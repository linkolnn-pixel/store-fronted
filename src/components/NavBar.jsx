import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

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

      {/* Новая ссылка на сертификаты */}
      <Link to="/certificates" style={{...linkStyle, color: '#d4af37'}}>Сертификаты</Link>

      <Link to="/profile" style={linkStyle}>Кабинет</Link>

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

export default NavBar;