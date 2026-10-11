import { useState, useEffect } from 'react';
import { fetchCart, checkoutCart, updateCartItem, removeCartItem } from '../services/api';
import { useCart } from '../context/CartContext';

// Стили для маленьких кнопок управления
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

function Cart() {
  const { updateCartCount } = useCart();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  // Вынесли загрузку корзины в отдельную функцию, чтобы переиспользовать при обновлении
  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (error) {
      console.log('Корзина пуста или не найдена');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Изменение количества товара
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(productId, newQuantity);
      await loadCart(); // Перезапрашиваем корзину, чтобы обновить итоговую сумму
      await updateCartCount(); // Обновляем кружок в шапке
    } catch (error) {
      console.log('Ошибка при обновлении количества');
    }
  };

  // Удаление товара из корзины
  const handleRemoveItem = async (productId) => {
    try {
      await removeCartItem(productId);
      await loadCart();
      await updateCartCount();
    } catch (error) {
      console.log('Ошибка при удалении товара');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const result = await checkoutCart(formData);
      await updateCartCount(); // Обнуляем счетчик в шапке после оформления
      if (result.payment_url) {
        window.location.href = result.payment_url;
      }
    } catch (error) {
      alert('Ошибка при оформлении заказа. Проверьте введенные данные.');
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'sans-serif' }}>
        <h2>Ваша корзина пуста</h2>
        <p style={{ color: '#777' }}>Перейдите в раздел услуг или каталог, чтобы добавить позиции.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#333' }}>
      <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '30px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
        Оформление заказа
      </h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Список товаров */}
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Ваш выбор</h2>
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
            {cart.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eaeaea', paddingBottom: '15px' }}>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '8px' }}>ID: {item.product_id}</div>

                  {/* Интерактивный блок управления количеством */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                      style={quantityBtnStyle}
                    >-</button>

                    <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      style={quantityBtnStyle}
                    >+</button>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product_id)}
                      style={{ ...quantityBtnStyle, color: '#ff4d4f', borderColor: '#ff4d4f', width: 'auto', padding: '0 8px', fontSize: '12px' }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>{item.price * item.quantity} ₽</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
              <span>Итого:</span>
              <span>{cart.total} ₽</span>
            </div>
          </div>
        </div>

        {/* Форма контактов */}
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Данные пациента</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>ФИО *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Телефон *</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Email (для чека)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              style={{
                marginTop: '10px',
                padding: '15px',
                backgroundColor: processing ? '#999' : '#d4af37',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: processing ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {processing ? 'Переход к оплате...' : 'Оплатить заказ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Cart;