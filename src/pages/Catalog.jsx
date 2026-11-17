import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryTree, categoryIds, NEW_ARRIVALS_CATEGORY } from '../services/categories';
import { addToCart, fetchCatalog, fetchNewArrivals, BACKEND_URL, fetchCategories } from '../services/api';
import { useCart } from '../context/CartContext';
import CatalogFilters from '../components/CatalogFilters';
import './Catalog.css';
import FavoriteButton from '../components/FavoriteButton';

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
    : ['/product-placeholder.svg'];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateCartCount } = useCart();
  const [products, setProducts] = useState([]);

  // Состояния для категорий и брендов
  const [categories, setCategories] = useState([]);
  const activeCategory = searchParams.get('category');
  const isNewArrivals = activeCategory === NEW_ARRIVALS_CATEGORY.id;
  const setActiveCategory = value => setSearchParams(previous => {
    if (value === null) previous.delete('category');
    else previous.set('category', value);
    previous.delete('offset');
    return previous;
  });
  const activeBrand = searchParams.get('brand');
  const setActiveBrand = value => setSearchParams(previous => {
    if (value === null) previous.delete('brand');
    else previous.set('brand', value);
    previous.delete('offset');
    return previous;
  });
  const setQuery = value => setSearchParams(previous => {
    if (value) previous.set('q', value);
    else previous.delete('q');
    previous.delete('offset');
    return previous;
  }, { replace: true });
  const resetFilters = () => {
    setSearchParams(previous => { previous.delete('category'); previous.delete('q'); previous.delete('brand'); previous.delete('offset'); return previous; });
  };
  const activeFilterCount = Number(Boolean(activeCategory)) + Number(Boolean(activeBrand)) + Number(Boolean(searchParams.get('q')?.trim()));

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [catalogData, categoriesData] = await Promise.all([
          isNewArrivals ? fetchNewArrivals() : fetchCatalog(),
          fetchCategories()
        ]);

        if (!active) return;
        const productsArray = catalogData.results ? catalogData.results : catalogData;
        setProducts(productsArray);
        setCategories([NEW_ARRIVALS_CATEGORY, ...categoryTree(categoriesData)]);
      } catch (error) {
        if (!active) return;
        setLoadError(true);
        console.error("Ошибка загрузки данных:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [isNewArrivals]);

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
    } catch {
      alert('Ошибка при добавлении в корзину.');
    } finally {
      setAddingId(null);
    }
  };

  // Получаем массив уникальных брендов (игнорируя пустые значения)
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  // Логика двойной фильтрации (по категории и бренду)
  const findCategory = nodes => nodes.flatMap(node => [node, ...findCategory(node.children)]);
  const selectedCategory = findCategory(categories).find(node => String(node.id) === activeCategory);
  const selectedIds = selectedCategory ? categoryIds(selectedCategory) : [activeCategory];
  const query = (searchParams.get('q') || '').trim().toLocaleLowerCase('ru');
  const filteredProducts = products.filter(product => {
    const productCategory = product.category?.id ?? product.category;
    const matchCategory = activeCategory && !isNewArrivals ? selectedIds.includes(String(productCategory)) : true;
    const matchBrand = activeBrand ? product.brand === activeBrand : true;
    const matchSearch = !query || [product.title, product.name, product.brand].filter(Boolean).join(' ').toLocaleLowerCase('ru').includes(query);
    return matchCategory && matchBrand && matchSearch;
  });
  const pageSize = 24;
  const rawOffset = Number(searchParams.get('offset'));
  const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset / pageSize) * pageSize) : 0;
  const visibleProducts = filteredProducts.slice(0, Math.min(filteredProducts.length, offset + pageSize));
  const remainingCount = filteredProducts.length - visibleProducts.length;

  return (
    <div className="catalog-page" style={{ maxWidth: '1360px', margin: '0 auto', padding: '48px 24px', color: '#242424' }}>
      <div className="breadcrumbs"><Link to="/">Главная</Link> / Каталог{selectedCategory && ` / ${selectedCategory.name}`}</div>

      <div className="catalog-page-heading">
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {selectedCategory?.name || 'Каталог ухода'}
        </h1>
        <p style={{ color: '#777', marginTop: '10px' }}>Профессиональная косметика из наличия</p>
      </div>

      <div className="catalog-layout">
        <CatalogFilters
          categories={categories} brands={uniqueBrands}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          activeBrand={activeBrand} setActiveBrand={setActiveBrand}
          query={searchParams.get('q') || ''} setQuery={setQuery}
          reset={resetFilters} activeCount={activeFilterCount} disabled={loading}
        />
        <section className="catalog-results" aria-label="Товары каталога">
          <div className="catalog-results-toolbar" role="status" aria-live="polite">{loading ? 'Загрузка...' : loadError ? 'Каталог временно недоступен' : `Найдено товаров: ${filteredProducts.length}`}</div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Загрузка ассортимента со склада...</div>
      ) : loadError ? (
        <div role="alert" style={{ textAlign: 'center', padding: '40px', color: '#777' }}>Не удалось загрузить каталог. Попробуйте обновить страницу позже.</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Товаров пока нет в наличии.</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>По вашему запросу товаров не найдено.</div>
      ) : (
        <>
        <div className="catalog-product-grid">
          {visibleProducts.map((product) => (
            <div className="catalog-product-card" key={product.id} style={{
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
              <FavoriteButton product={product}/>
              <Link
                to={`/product/${product.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}
              >

                <CatalogItemGallery images={product.images} productName={product.title || product.name} />

                {/* ВЫВОД БРЕНДА */}
                {product.brand && (
                  <div style={{ color: '#d4af37', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {product.brand}
                  </div>
                )}

                <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 5px 0' }}>
                  {product.title || product.name}
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
        <div className="catalog-pagination">
          {remainingCount > 0 && <button className="catalog-load-more" type="button" onClick={() => setSearchParams(previous => { previous.set('offset', offset + pageSize); return previous; })}>Показать ещё {Math.min(pageSize, remainingCount)}</button>}
          <p role="status" aria-live="polite">Показано {visibleProducts.length} из {filteredProducts.length}</p>
        </div>
        </>
      )}
        </section>
      </div>
    </div>
  );
}

export default Catalog;
