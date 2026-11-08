import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addToCart, fetchCatalog, BACKEND_URL, fetchCategories } from '../services/api'; // Импортировали fetchCategories
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

  // === НОВЫЕ СОСТОЯНИЯ ДЛЯ КАТЕГОРИЙ ===
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  // =====================================

  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // === ЗАГРУЖАЕМ ОДНОВРЕМЕННО ТОВАРЫ И КАТЕГОРИИ ===
        const [catalogData, categoriesData] = await Promise.all([
          fetchCatalog(),
          fetchCategories()
        ]);

        const productsArray = catalogData.results ? catalogData.results : catalogData;
        setProducts(productsArray);
        setCategories(categoriesData);

      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = currentQty + delta;
      if (newQty < 1) return prev;
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = async (product) => {
    const qty = quantities[product.id] || 1;

    setAddingId(product.id);
    try {
      await addToCart(product.id, qty, product.sale_price);
      await updateCartCount();
      setSuccessId(product.id);
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
      setTimeout(() => setSuccessId(null), 2000);
    } catch (error) {
      alert('Ошибка при добавлении в корзину.');
    } finally {
      setAddingId(null);
    }
  };

  // === ЛОГИКА ФИЛЬТРАЦИИ ===
  const filteredProducts = activeCategory
    ? products.filter(product => product.category === activeCategory)
    : products;
  // =========================

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#333' }}>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Домашний уход
        </h1>
        <p style={{ color: '#777', marginTop: '10px' }}>Профессиональная косметика из наличия</p>
      </div>

      {/* ===== ПАНЕЛЬ КНОПОК КАТЕГОРИЙ ===== */}
      {!loading && categories.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: activeCategory === null ? 'none' : '1px solid #ccc',
              backgroundColor: activeCategory === null ? '#333' : '#fff',
              color: activeCategory === null ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Все
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: activeCategory === cat.id ? 'none' : '1px solid #ccc',
                backgroundColor: activeCategory === cat.id ? '#333' : '#fff',
                color: activeCategory === cat.id ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      {/* ==================================== */}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Загрузка ассортимента со склада...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Товаров пока нет в наличии.</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>В этой категории пока нет товаров.</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {/* ОБРАТИТЕ ВНИМАНИЕ: ЗДЕСЬ ТЕПЕРЬ МАПИМ filteredProducts */}
          {filteredProducts.map((product) => (
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

              <Link
                to={`/product/${product.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}
              >
                <div style={{
                  width: '100%',
                  height: '220px',
                  marginBottom: '15px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px'
                }}>
                  <img
                    src={product.images && product.images.length > 0
                          ? `${BACKEND_URL}${product.images[0]}`
                          : 'https://placehold.co/300x300/eeeeee/999999?text=Нет+фото'}
                    alt={product.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 5px 0' }}>
                  {product.name}
                </h3>

                {/* ВЫВОД НАЗВАНИЯ КАТЕГОРИИ ПОД ТОВАРОМ (опционально, для красоты) */}
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {product.category_name}
                </div>

                <div style={{ color: '#555', fontSize: '14px', marginBottom: '20px', flexGrow: 1 }}>
                  Объем: {Number(product.quantity_value)} {product.measure_unit}
                </div>
              </Link>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                  {product.sale_price} ₽
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;