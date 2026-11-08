import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Импорт Link добавлен
import { addToCart, fetchCatalog, BACKEND_URL } from '../services/api';
import { useCart } from '../context/CartContext';

// Стили для маленьких кнопок +/-
const quantityBtnStyle = {
  border: '1px solid #ccc',
  background: '#fff',
  borderRadius: '4px',
  width: '28px',
  height: '28px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  color: '#333'
};

function Catalog() {
  const { updateCartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Запрашиваем реальные данные с бэкенда
        const data = await fetchCatalog();

        // Если DRF вернул пагинацию (объект с полем results), берем data.results
        // Если вернул просто список, берем саму data
        const productsArray = data.results ? data.results : data;

        setProducts(productsArray);
      } catch (error) {
        console.error("Ошибка загрузки каталога:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Функция для изменения количества конкретного товара
  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = currentQty + delta;
      if (newQty < 1) return prev; // Меньше 1 выбрать нельзя
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = async (product) => {
    const qty = quantities[product.id] || 1; // Берем выбранное количество или 1

    setAddingId(product.id);
    try {
      // Отправляем на бэкенд с учетом выбранного количества
      await addToCart(product.id, qty, product.sale_price);
      await updateCartCount();

      setSuccessId(product.id);

      // Сбрасываем счетчик обратно на 1 после успешного добавления
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));

      setTimeout(() => setSuccessId(null), 2000);
    } catch (error) {
      alert('Ошибка при добавлении в корзину.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#333' }}>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Домашний уход
        </h1>
        <p style={{ color: '#777', marginTop: '10px' }}>Профессиональная косметика из наличия</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Загрузка ассортимента со склада...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Товаров пока нет в наличии.</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {products.map((product) => (
            <div key={product.id} style={{
              border: '1px solid #eaeaea',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#fff',
              transition: 'box-shadow 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >

              {/* ===== НАЧАЛО КЛИКАБЕЛЬНОЙ ССЫЛКИ НА СТРАНИЦУ ТОВАРА ===== */}
              <Link
                to={`/product/${product.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}
              >
                {/* БЛОК С КАРТИНКОЙ */}
                <div style={{
                  width: '100%',
                  height: '220px',
                  marginBottom: '15px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px' // Отступ внутри контейнера, чтобы картинка не прилипала к краям
                }}>
                  <img
                    src={product.images && product.images.length > 0
                          ? `${BACKEND_URL}${product.images[0]}`
                          : 'https://placehold.co/300x300/eeeeee/999999?text=Нет+фото'}
                    alt={product.name}
                    style={{
                      // Картинка не будет превышать размеры контейнера
                      maxWidth: '100%',
                      maxHeight: '100%',
                      // Сохраняет пропорции без обрезки.
                      // Если хотите, чтобы картинка заполняла весь блок с обрезкой - используйте 'cover' вместо 'contain'
                      objectFit: 'contain'
                    }}
                  />
                </div>

                {/* НАЗВАНИЕ ТОВАРА */}
                <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 10px 0', flexGrow: 1 }}>
                  {product.name}
                </h3>

                {/* ОБЪЕМ */}
                <div style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>
                  Объем: {Number(product.quantity_value)} {product.measure_unit}
                </div>
              </Link>
              {/* ===== КОНЕЦ КЛИКАБЕЛЬНОЙ ССЫЛКИ ===== */}

              {/* Обновленный блок цены и управления количеством (СНАРУЖИ ССЫЛКИ) */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                  {product.sale_price} ₽
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Блок выбора количества */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      style={quantityBtnStyle}
                    >-</button>
                    <span style={{ width: '20px', textAlign: 'center', fontSize: '15px' }}>
                      {quantities[product.id] || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      style={quantityBtnStyle}
                    >+</button>
                  </div>

                  {/* Кнопка добавления в корзину */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product.id}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: successId === product.id ? '#4CAF50' : '#fff',
                      color: successId === product.id ? '#fff' : '#333',
                      border: successId === product.id ? '1px solid #4CAF50' : '1px solid #333',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s',
                      flex: 1,
                      marginLeft: '15px'
                    }}
                  >
                    {addingId === product.id ? '...' : successId === product.id ? '✓ Добавлено' : 'В корзину'}
                  </button>
                </div>
              </div>
              {/* Конец обновленного блока */}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;