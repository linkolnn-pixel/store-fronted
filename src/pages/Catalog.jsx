import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addToCart, fetchCatalog, BACKEND_URL, fetchCategories } from '../services/api';
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

// === 1. НОВЫЙ КОМПОНЕНТ ГАЛЕРЕИ ДЛЯ КАРТОЧКИ ТОВАРА ===
function CatalogItemGallery({ images, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomProps, setZoomProps] = useState({ show: false, x: 0, y: 0 });

  const validImages = images && images.length > 0
    ? images.map(img => img.startsWith('http') ? img : `${BACKEND_URL}${img}`)
    : ['https://placehold.co/300x300/eeeeee/999999?text=Нет+фото'];

  const handleMouseMove = (e) => {
    // === ДОБАВЛЕНА ПРОВЕРКА НА ТАЧСКРИН ===
    // Если устройство поддерживает касания (телефон/планшет), прерываем функцию
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomProps({ show: true, x, y });
  };

  const handleMouseLeave = () => {
    setZoomProps({ ...zoomProps, show: false });
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        height: '220px',
        marginBottom: '15px',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      <img
        src={validImages[currentIndex]}
        alt={productName}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: zoomProps.show ? 0 : 1
        }}
      />

      {zoomProps.show && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${validImages[currentIndex]})`,
            backgroundPosition: `${zoomProps.x}% ${zoomProps.y}%`,
            backgroundSize: '200%',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none'
          }}
        />
      )}

      {validImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            onMouseEnter={handleMouseLeave} // (Выключает лупу)
            onMouseMove={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '50%',
              width: '28px', height: '28px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 2, color: '#333', fontSize: '16px'
            }}
          >
            &#8249;
          </button>

          <button
            onClick={handleNext}
            onMouseEnter={handleMouseLeave}
            onMouseMove={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '50%',
              width: '28px', height: '28px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 2, color: '#333', fontSize: '16px'
            }}
          >
            &#8250;
          </button>

          <div style={{
            position: 'absolute', bottom: '10px', left: '0', width: '100%',
            display: 'flex', justifyContent: 'center', gap: '5px', pointerEvents: 'none'
          }}>
            {validImages.map((_, idx) => (
              <div key={idx} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: currentIndex === idx ? '#333' : '#ccc',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Catalog() {
  const { updateCartCount } = useCart();
  const [products, setProducts] = useState([]);

  // Состояния для категорий и брендов
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);

  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
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

  // Получаем массив уникальных брендов (игнорируя пустые значения)
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  // Логика двойной фильтрации (по категории и бренду)
  const filteredProducts = products.filter(product => {
    const matchCategory = activeCategory ? product.category === activeCategory : true;
    const matchBrand = activeBrand ? product.brand === activeBrand : true;
    return matchCategory && matchBrand;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#333' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Домашний уход
        </h1>
        <p style={{ color: '#777', marginTop: '10px' }}>Профессиональная косметика из наличия</p>
      </div>

      {/* ===== ПАНЕЛЬ ФИЛЬТРОВ ===== */}
      {!loading && (
        <div style={{ marginBottom: '40px' }}>

          {/* ФИЛЬТР ПО КАТЕГОРИЯМ */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#888', fontSize: '14px', marginRight: '10px' }}>Категория:</span>
              <button
                onClick={() => setActiveCategory(null)}
                style={{
                  padding: '6px 16px', borderRadius: '20px', fontSize: '14px',
                  border: activeCategory === null ? 'none' : '1px solid #ccc',
                  backgroundColor: activeCategory === null ? '#333' : '#fff',
                  color: activeCategory === null ? '#fff' : '#333',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Все
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '6px 16px', borderRadius: '20px', fontSize: '14px',
                    border: activeCategory === cat.id ? 'none' : '1px solid #ccc',
                    backgroundColor: activeCategory === cat.id ? '#333' : '#fff',
                    color: activeCategory === cat.id ? '#fff' : '#333',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* ФИЛЬТР ПО БРЕНДАМ */}
          {uniqueBrands.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#888', fontSize: '14px', marginRight: '10px' }}>Бренд:</span>
              <button
                onClick={() => setActiveBrand(null)}
                style={{
                  padding: '6px 16px', borderRadius: '20px', fontSize: '14px',
                  border: activeBrand === null ? 'none' : '1px solid #ccc',
                  backgroundColor: activeBrand === null ? '#d4af37' : '#fff',
                  color: activeBrand === null ? '#fff' : '#333',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Все
              </button>
              {uniqueBrands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setActiveBrand(brand)}
                  style={{
                    padding: '6px 16px', borderRadius: '20px', fontSize: '14px',
                    border: activeBrand === brand ? 'none' : '1px solid #ccc',
                    backgroundColor: activeBrand === brand ? '#d4af37' : '#fff',
                    color: activeBrand === brand ? '#fff' : '#333',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}

        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Загрузка ассортимента со склада...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Товаров пока нет в наличии.</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>По вашему запросу товаров не найдено.</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
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

                <CatalogItemGallery images={product.images} productName={product.name} />

                {/* ВЫВОД БРЕНДА */}
                {product.brand && (
                  <div style={{ color: '#d4af37', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {product.brand}
                  </div>
                )}

                <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 5px 0' }}>
                  {product.name}
                </h3>
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