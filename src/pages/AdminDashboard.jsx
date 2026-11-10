import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, BACKEND_URL } from '../services/api';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Загружаем список товаров
    apiClient.get('/catalog').then(response => {
      // Учитываем, что бэкенд может вернуть как массив, так и объект с пагинацией (results)
      const data = response.data.results ? response.data.results : response.data;
      setProducts(data);
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
        {products.map(product => {

          // Проверяем, есть ли картинки, и формируем правильную ссылку
          const imageUrl = product.images && product.images.length > 0
            ? (product.images[0].startsWith('http') ? product.images[0] : `${BACKEND_URL}${product.images[0]}`)
            : 'https://placehold.co/50x50/eeeeee/999999?text=Нет';

          return (
            <div key={product.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '15px', border: '1px solid #ddd', borderRadius: '8px',
              backgroundColor: '#fff'
            }}>

              {/* === ЛЕВАЯ ЧАСТЬ: Картинка + Текст === */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                {/* МИНИАТЮРА */}
                <img
                  src={imageUrl}
                  alt={product.title || product.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover', // Заполняет квадрат без искажений
                    borderRadius: '6px',
                    border: '1px solid #eaeaea'
                  }}
                />

                {/* ТЕКСТОВАЯ ИНФОРМАЦИЯ */}
                <div>
                  <strong>{product.title || product.name}</strong>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    ID: {product.id} | Цена: {product.price || product.sale_price} руб.
                  </div>
                </div>

              </div>

              {/* === ПРАВАЯ ЧАСТЬ: Кнопка === */}
              <Link
                to={`/admin/product/${product.id}`}
                style={{ padding: '8px 15px', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px', whiteSpace: 'nowrap' }}
              >
                Редактировать
              </Link>

            </div>
          );
        })}
      </div>
    </div>
  );
}