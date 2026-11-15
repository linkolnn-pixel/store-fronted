import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCart, checkoutCart, updateCartItem, removeCartItem, BACKEND_URL, applyPromoCode, removePromoCode, checkGiftCertificate } from '../services/api';
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

// Универсальная функция автоматического извлечения данных пользователя из localStorage
const getSavedUserData = () => {
  const possibleKeys = ['user', 'user_profile', 'profile', 'auth_user', 'customer'];

  for (const key of possibleKeys) {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        const parsed = JSON.parse(item);
        const userData = parsed.user || parsed;

        const fullName = userData.name || [userData.first_name, userData.last_name].filter(Boolean).join(' ') || '';
        const phone = userData.phone || userData.customer_phone || '';
        const email = userData.email || userData.customer_email || '';

        if (fullName || phone) {
          return { name: fullName, phone: phone, email: email, comment: '' };
        }
      } catch (e) {
        // Ошибка парсинга игнорируется
      }
    }
  }
  return { name: '', phone: '', email: '', comment: '' };
};

function Cart() {
  const navigate = useNavigate();
  const { updateCartCount } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Автозаполнение формы из localStorage
  const [formData, setFormData] = useState(getSavedUserData);

  // === СОСТОЯНИЯ ДЛЯ ПРОМОКОДА ===
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // === СОСТОЯНИЯ ДЛЯ ПОДАРОЧНОГО СЕРТИФИКАТА ===
  const [giftCertificateCode, setGiftCertificateCode] = useState('');
  const [certificateMessage, setCertificateMessage] = useState(null);
  const [isCheckingCertificate, setIsCheckingCertificate] = useState(false);
  const [checkedCertificate, setCheckedCertificate] = useState(null);
  const [appliedCertificate, setAppliedCertificate] = useState(null);

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

  const handleNameChange = (e) => {
    const cleanName = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '');
    setFormData({ ...formData, name: cleanName });
  };

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

  // === ОБРАБОТЧИКИ ДЛЯ ПРОМОКОДА ===
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoMessage(null);

    try {
      await applyPromoCode(promoInput);
      setPromoMessage({ text: 'Промокод успешно применен!', type: 'success' });
      setPromoInput('');
      await loadCart();
    } catch (error) {
      setPromoMessage({ text: error.message || 'Ошибка применения промокода', type: 'error' });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    setIsApplyingPromo(true);
    setPromoMessage(null);
    try {
      await removePromoCode();
      await loadCart();
    } catch (error) {
      console.log('Ошибка при удалении промокода');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // === ОБРАБОТЧИКИ ДЛЯ СЕРТИФИКАТА ===

  // 1. Только проверяем баланс на бэкенде
  const handleCheckCertificate = async () => {
    if (!giftCertificateCode.trim()) return;
    setIsCheckingCertificate(true);
    setCertificateMessage(null);
    setCheckedCertificate(null);

    try {
      const data = await checkGiftCertificate(giftCertificateCode.trim());

      if (data.is_valid) {
        setCheckedCertificate({
            code: giftCertificateCode.trim(),
            balance: parseFloat(data.current_balance)
        });
        setCertificateMessage({ text: `Доступно: ${data.current_balance} ₽`, type: 'success' });
      } else {
        setCertificateMessage({ text: data.message || 'Сертификат не найден', type: 'error' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Ошибка при проверке сертификата';
      setCertificateMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsCheckingCertificate(false);
    }
  };

  // 2. Применяем проверенный сертификат к корзине
  const handleApplyCertificate = () => {
    if (checkedCertificate) {
      setAppliedCertificate(checkedCertificate);
      setCheckedCertificate(null);
      setCertificateMessage(null);
    }
  };

  // 3. Удаляем примененный сертификат
  const handleRemoveCertificate = () => {
    setAppliedCertificate(null);
    setGiftCertificateCode('');
    setCertificateMessage(null);
    setCheckedCertificate(null);
  };

  // === ОФОРМЛЕНИЕ ЗАКАЗА ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const nameParts = formData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts[1] || '';
    const finalName = lastName ? `${firstName} ${lastName}` : firstName;

    const dataToSend = {
      ...formData,
      name: finalName,
      // БЕРЕМ КОД ТОЛЬКО ЕСЛИ ОН БЫЛ УСПЕШНО ПРОВЕРЕН И ПРИМЕНЕН
      gift_certificate: appliedCertificate ? appliedCertificate.code : null
    };

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

            {/* === БЛОК ПРОМОКОДА === */}
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
              {!cart.promo_code ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Есть промокод?"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoInput.trim()}
                      style={{ padding: '8px 15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {isApplyingPromo ? '...' : 'Применить'}
                    </button>
                  </div>
                  {promoMessage && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: promoMessage.type === 'error' ? 'red' : 'green' }}>
                      {promoMessage.text}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eef8ee', padding: '10px', borderRadius: '4px', border: '1px solid #cce5cc' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#666' }}>Применен промокод: </span>
                    <strong style={{ color: '#2b782b', textTransform: 'uppercase' }}>{cart.promo_code}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    disabled={isApplyingPromo}
                    style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>

            {/* === БЛОК ПОДАРОЧНОГО СЕРТИФИКАТА === */}
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
              {!appliedCertificate ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Подарочный сертификат"
                      value={giftCertificateCode}
                      onChange={(e) => {
                          setGiftCertificateCode(e.target.value.toUpperCase());
                          setCertificateMessage(null);
                          setCheckedCertificate(null); // Сбрасываем проверку, если юзер начал менять код
                      }}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textTransform: 'uppercase' }}
                    />

                    {/* Если сертификат проверен, показываем кнопку Применить, иначе - Проверить */}
                    {checkedCertificate ? (
                      <button
                        type="button"
                        onClick={handleApplyCertificate}
                        style={{ padding: '8px 15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Применить
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCheckCertificate}
                        disabled={isCheckingCertificate || !giftCertificateCode.trim()}
                        style={{ padding: '8px 15px', backgroundColor: '#777', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {isCheckingCertificate ? '...' : 'Проверить'}
                      </button>
                    )}
                  </div>

                  {certificateMessage && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: certificateMessage.type === 'error' ? 'red' : 'green', fontWeight: 'bold' }}>
                      {certificateMessage.text}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff8dc', padding: '10px', borderRadius: '4px', border: '1px solid #eedc82' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#666' }}>Применен сертификат: </span>
                    <strong style={{ color: '#d4af37', textTransform: 'uppercase' }}>{appliedCertificate.code}</strong>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      Спишется до {appliedCertificate.balance} ₽
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCertificate}
                    style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
            {/* ======================= */}

            {/* === БЛОК ИТОГОВЫХ СУММ === */}
            <div style={{ marginTop: '20px' }}>
              {cart.promo_code && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
                    <span>Сумма:</span>
                    <span>{cart.subtotal} ₽</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#2b782b', fontWeight: 'bold' }}>
                    <span>Скидка:</span>
                    <span>-{cart.discount_amount} ₽</span>
                  </div>
                </>
              )}

              {/* НОВЫЙ БЛОК: Показываем списание по сертификату, если он применен */}
              {appliedCertificate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#d4af37', fontWeight: 'bold' }}>
                  <span>Сертификат:</span>
                  <span>-{Math.min(cart.total, appliedCertificate.balance)} ₽</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                <span>К оплате:</span>
                <span>
                  {/* Вычитаем из total сумму, которую покроет сертификат, но не уходим в минус */}
                  {appliedCertificate
                    ? Math.max(0, cart.total - appliedCertificate.balance)
                    : cart.total} ₽
                </span>
              </div>
            </div>
            {/* ========================== */}

          </div>
        </div>

        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Данные покупателя</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>ФИО *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleNameChange} placeholder="Иванов Иван" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Телефон *</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} placeholder="+7 (999) 000-00-00" maxLength="18" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Email (для чека)</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Комментарий к заказу</label>
              <textarea name="comment" value={formData.comment} onChange={handleInputChange} placeholder="Пожелания к доставке или упаковке..." style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} />
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