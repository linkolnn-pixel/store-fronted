import React from 'react';
import { Link } from 'react-router-dom';

function Success() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'sans-serif', color: '#333' }}>
      <div style={{ fontSize: '64px', color: '#4CAF50', marginBottom: '20px' }}>✓</div>

      <h1 style={{ fontSize: '28px', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>
        Заказ успешно оформлен
      </h1>

      <p style={{ color: '#555', fontSize: '16px', maxWidth: '500px', margin: '0 auto 40px', lineHeight: '1.6' }}>
        Спасибо за доверие! Ваша заявка сохранена. В ближайшее время администратор свяжется с вами по указанному номеру для подтверждения деталей.
      </p>

      <Link to="/catalog" style={{
        padding: '12px 24px',
        backgroundColor: '#d4af37', // Золотистый цвет из нашего стиля
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        transition: 'opacity 0.3s'
      }}
      onMouseEnter={(e) => e.target.style.opacity = 0.9}
      onMouseLeave={(e) => e.target.style.opacity = 1}
      >
        Вернуться в каталог
      </Link>
    </div>
  );
}

export default Success;