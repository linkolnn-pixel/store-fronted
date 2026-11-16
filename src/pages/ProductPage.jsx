import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Если используете React Router
import { fetchProduct, addToCart, BACKEND_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import FavoriteButton from '../components/FavoriteButton';

export default function ProductPage() {
  const { id } = useParams(); // Получаем ID товара из URL
  const { updateCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(''); // Текущая большая картинка
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProduct(id);
        setProduct(data);
        // По умолчанию ставим первую картинку главной (если они есть)
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }
      } catch (error) {
        console.error("Ошибка загрузки товара:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '50px' }}>Товар не найден</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

      {/* ЛЕВАЯ КОЛОНКА: Галерея фото */}
      <div style={{ flex: '1 1 400px' }}>
        {/* Главное фото */}
        <div style={{ width: '100%', height: '400px', backgroundColor: '#f9f9f9', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
          <img
            src={mainImage ? `${BACKEND_URL}${mainImage}` : 'https://placehold.co/400x400/eeeeee/999999?text=Нет+фото'}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Миниатюры для перелистывания */}
        {product.images && product.images.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {product.images.map((img, index) => (
              <div
                key={index}
                onClick={() => setMainImage(img)} // По клику меняем главное фото
                style={{
                  width: '70px', height: '70px', cursor: 'pointer', borderRadius: '4px', overflow: 'hidden',
                  border: mainImage === img ? '2px solid #333' : '1px solid #ddd'
                }}
              >
                <img src={`${BACKEND_URL}${img}`} alt={`thumb-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ПРАВАЯ КОЛОНКА: Информация и Описание */}
      <div style={{ flex: '1 1 400px' }}>
        <h1 style={{ margin: '0 0 15px 0', fontSize: '28px', fontWeight: '500' }}>{product.title}</h1>
        <FavoriteButton product={product} showLabel/>
        <div style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
          Артикул: {product.sku || product.internal_code} <br/>
          Объем: {Number(product.quantity_value)} {product.measure_unit}
        </div>

        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
          {product.price} ₽
        </div>

        {/* Добавление в корзину */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
            <span style={{ padding: '0 15px', fontWeight: 'bold' }}>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
          </div>
          <button
            onClick={async () => {
              await addToCart(product.id, quantity, product.price);
              updateCartCount();
              alert('Добавлено в корзину!');
            }}
            style={{ flex: 1, backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            Добавить в корзину
          </button>
        </div>

        {/* Описание товара */}
        <div>
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Описание</h3>
          <p style={{ lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}>
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
