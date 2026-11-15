import { useState, useEffect } from 'react';
import {
  getCustomerToken,
  logoutCustomer,
  requestAuthCode,
  verifyAuthCode,
  fetchMyOrders,
  // updateCustomerProfile
} from '../services/api';

function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getCustomerToken());
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // === ТЕПЕРЬ ИМЯ И ФАМИЛИЯ ОТДЕЛЬНО ===
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadProfileData();
    }
  }, [isAuthenticated]);

  const loadProfileData = () => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const user = JSON.parse(saved);

        // Подтягиваем Имя и Фамилию
        if (user.first_name || user.last_name) {
          setFirstName(user.first_name || '');
          setLastName(user.last_name || '');
        } else if (user.name) {
          // На случай, если в кэше старое слитное имя, аккуратно разбиваем его
          const parts = user.name.trim().split(/\s+/);
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }

        setProfileEmail(user.email || '');
        if (!phone && user.phone) setPhone(user.phone);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    let cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.startsWith('8')) cleanPhone = '+7' + cleanPhone.substring(1);
    if (cleanPhone.startsWith('9')) cleanPhone = '+7' + cleanPhone;

    try {
      await requestAuthCode(cleanPhone);
      setPhone(cleanPhone);
      setStep(2);
    } catch (error) {
      setAuthError(error.response?.data?.detail || "Ошибка отправки кода");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      await verifyAuthCode(phone, code);
      localStorage.setItem('user', JSON.stringify({ phone: phone, first_name: '', last_name: '', email: '' }));
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(error.response?.data?.detail || "Неверный код");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logoutCustomer();
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setStep(1);
    setPhone('');
    setCode('');
    setOrders([]);
    setFirstName('');
    setLastName('');
    setProfileEmail('');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    const saved = localStorage.getItem('user');
    let userData = { phone: phone };
    if (saved) {
      try { userData = JSON.parse(saved); } catch(e){}
    }

    // Сохраняем имя и фамилию раздельно
    userData.first_name = firstName.trim();
    userData.last_name = lastName.trim();
    // Для совместимости с некоторыми старыми скриптами оставляем склеенное name
    userData.name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    userData.email = profileEmail.trim();

    localStorage.setItem('user', JSON.stringify(userData));

    // updateCustomerProfile({ first_name: userData.first_name, last_name: userData.last_name, email: userData.email });

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '15px',
    border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
  };
  const btnStyle = {
    width: '100%', padding: '15px', backgroundColor: '#333', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Вход в личный кабинет</h2>
        {authError && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{authError}</div>}

        {step === 1 ? (
          <form onSubmit={handlePhoneSubmit}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Номер телефона</label>
            <input type="tel" placeholder="+7 (999) 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} required />
            <button type="submit" style={btnStyle} disabled={authLoading}>
              {authLoading ? 'Отправка...' : 'Получить код'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Код из сообщения</label>
            <input type="text" placeholder="0000" maxLength="4" value={code} onChange={(e) => setCode(e.target.value)} style={{...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px'}} required />
            <button type="submit" style={btnStyle} disabled={authLoading}>
              {authLoading ? 'Проверка...' : 'Войти'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ ...btnStyle, backgroundColor: 'transparent', color: '#666', marginTop: '10px' }}>
              Изменить номер
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Личный кабинет</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
          Выйти
        </button>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

        {/* === БЛОК ЛИЧНЫХ ДАННЫХ === */}
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Мои данные</h2>
          <form onSubmit={handleSaveProfile} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Ваш телефон</label>
            <input type="text" value={phone} style={{...inputStyle, backgroundColor: '#eee', color: '#777'}} disabled />

            {/* РАЗДЕЛИЛИ ИМЯ И ФАМИЛИЮ */}
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Имя</label>
            <input
              type="text"
              placeholder="Иван"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
            />

            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Фамилия</label>
            <input
              type="text"
              placeholder="Иванов"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
            />

            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Email (для чеков)</label>
            <input
              type="email"
              placeholder="example@mail.ru"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              style={inputStyle}
            />

            <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#d4af37', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              Сохранить данные
            </button>
            {profileSaved && <div style={{ color: 'green', marginTop: '10px', textAlign: 'center', fontSize: '14px' }}>Данные успешно сохранены!</div>}
          </form>
        </div>

        {/* === БЛОК ИСТОРИИ ЗАКАЗОВ === */}
        <div style={{ flex: '2 1 400px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>История заказов</h2>

          {ordersLoading ? (
            <div>Загрузка заказов...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#777' }}>
              У вас пока нет заказов.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orders.map((order) => {
                const discount = parseFloat(order.discount_amount || 0);
                const certAmount = parseFloat(order.certificate_amount_used || 0);
                const total = parseFloat(order.calculated_total || 0);
                const paidByCard = total - certAmount;

                return (
                  <div key={order.id} style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '15px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Заказ №{order.external_id || order.number || order.id}</span>
                      <span style={{ color: '#888', fontSize: '14px' }}>
                        {new Date(order.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                          <span>{item.product_name || `Товар #${item.product}`} x {item.quantity} шт.</span>
                          <span style={{ fontWeight: '500' }}>{item.sale_price * item.quantity} ₽</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px dashed #ccc', paddingTop: '10px', fontSize: '14px' }}>
                      {order.promo_code && discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2b782b', marginBottom: '5px' }}>
                              <span>Скидка (<b>{order.promo_code}</b>):</span>
                              <span>-{discount} ₽</span>
                          </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '5px' }}>
                          <span>Сумма заказа:</span>
                          <span>{total} ₽</span>
                      </div>

                      {order.gift_certificate && certAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', marginBottom: '5px' }}>
                              <span>Оплачено сертификатом (<b>{order.gift_certificate}</b>):</span>
                              <span>-{certAmount} ₽</span>
                          </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eaeaea' }}>
                          <span>Итого оплачено картой:</span>
                          <span style={{ color: paidByCard <= 0 ? '#2b782b' : '#333' }}>
                              {paidByCard <= 0 ? '0 ₽ (Покрыто сертификатом)' : `${paidByCard} ₽`}
                          </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;