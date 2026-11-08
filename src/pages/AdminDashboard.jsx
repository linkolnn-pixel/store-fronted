import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Загружаем список товаров (можно использовать ваш обычный эндпоинт каталога)
    apiClient.get('/catalog').then(response => {
      setProducts(response.data);
    });
  }, []);

  // Функция для выхода из админки
  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // Удаляем ключ
    navigate('/admin/login'); // Выкидываем на страницу логина
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Панель управления товарами</h2>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 15px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Выйти
        </button>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {products.map(product => (
          <div key={product.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px', border: '1px solid #ddd', borderRadius: '8px'
          }}>
            <div>
              <strong>{product.title || product.name}</strong>
              <div style={{ fontSize: '14px', color: '#666' }}>ID: {product.id} | Цена: {product.price} руб.</div>
            </div>

            {/* Кнопка перехода в вашу форму редактирования */}
            <Link
              to={`/admin/product/${product.id}`}
              style={{ padding: '8px 15px', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}
            >
              Редактировать
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}