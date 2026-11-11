import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCart, checkoutCart, updateCartItem, removeCartItem, BACKEND_URL } from '../services/api';
import { useCart } from '../context/CartContext';

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
  const navigate = useNavigate();
  const { updateCartCount } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (error) {
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

  // === ОБРАБОТЧИК ДЛЯ ИМЕНИ ===
  const handleNameChange = (e) => {
    // Разрешаем буквы, дефис и ПРОБЕЛЫ (чтобы можно было ввести ФИО)
    const cleanName = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '');
    setFormData({ ...formData, name: cleanName });
  };

  // === ВСТРОЕННАЯ НАДЕЖНАЯ МАСКА ДЛЯ ТЕЛЕФОНА ===
  const handlePhoneChange = (e) => {
    let inputDigits = e.target.value.replace(/\D/g, '');

    if (!inputDigits) {
      setFormData({ ...formData, phone: '' });
      return;
    }

    if (inputDigits[0] === '8') inputDigits = '7' + inputDigits.substring(1);
    if (inputDigits[0] === '9') inputDigits = '7' + inputDigits;

    let formatted = '+7';
    if (inputDigits.length > 1) formatted += ' (' + inputDigits.substring(1, 4);
    if (inputDigits.length > 4) formatted += ') ' + inputDigits.substring(4, 7);
    if (inputDigits.length > 7) formatted += '-' + inputDigits.substring(7, 9);
    if (inputDigits.length > 9) formatted += '-' + inputDigits.substring(9, 11);

    setFormData({ ...formData, phone: formatted });
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(productId, newQuantity);
      await loadCart();
      await updateCartCount();
    } catch (error) {
      console.log('Ошибка при обновлении количества');
    }
  };

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

    // --- УМНАЯ ОБРАБОТКА ИМЕНИ ---
    // Разбиваем введенный текст по пробелам
    const nameParts = formData.name.trim().split(/\s+/);

    // Берем первое слово (Имя) и второе (Фамилия, если есть)
    const firstName = nameParts[0] || '';
    const lastName = nameParts[1] || '';
    // Всё остальное (отчество) просто игнорируется

    // Склеиваем обратно только Имя и Фамилию
    const finalName = lastName ? `${firstName} ${lastName}` : firstName;

    // Создаем копию данных для отправки с "очищенным" именем
    const dataToSend = {
      ...formData,
      name: finalName
    };
    // -----------------------------

    try {
      const result = await checkoutCart(dataToSend);
      await updateCartCount();
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        navigate('/success');
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
        <p style={{ color: '#777' }}>Перейдите в каталог, чтобы добавить позиции.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#333' }}>
      <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '30px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
        Оформление заказа
      </h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Ваш выбор</h2>
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>

            {cart.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '15px', borderBottom: '1px solid #eaeaea', paddingBottom: '15px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={item.image ? (item.image.startsWith('http') ? item.image : `${BACKEND_URL}${item.image}`) : 'https://placehold.co/80x80/eeeeee/999999?text=Нет'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: '500', fontSize: '16px', lineHeight: '1.2' }}>
                    {item.name || `Товар #${item.product_id}`}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button type="button" onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} style={quantityBtnStyle}>-</button>
                      <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button type="button" onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} style={quantityBtnStyle}>+</button>
                      <button type="button" onClick={() => handleRemoveItem(item.product_id)} style={{ ...quantityBtnStyle, color: '#ff4d4f', borderColor: '#ff4d4f', width: 'auto', padding: '0 8px', fontSize: '12px', marginLeft: '5px' }}>
                        Удалить
                      </button>
                    </div>

                    <div style={{ fontWeight: 'bold' }}>
                      {item.price * item.quantity} ₽
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
              <span>Итого:</span>
              <span>{cart.total} ₽</span>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Данные покупателя</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>ФИО *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Иванов Иван"
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Телефон *</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+7 (999) 000-00-00"
                maxLength="18"
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Email (для чека)</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" disabled={processing} style={{ marginTop: '10px', padding: '15px', backgroundColor: processing ? '#999' : '#d4af37', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: processing ? 'not-allowed' : 'pointer', textTransform: 'uppercase' }}>
              {processing ? 'Обработка заказа...' : 'Оформить заказ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Cart;