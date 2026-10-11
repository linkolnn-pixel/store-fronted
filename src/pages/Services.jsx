import React, { useState } from 'react';
import { addToCart } from '../services/api';
import { useCart } from '../context/CartContext';

// Данные из вашего PDF-прайса
const servicesData = [
  {
    category: 'Консультации',
    items: [
      { id: 'srv_001', title: 'Онлайн-консультация (подбор ухода/разбор анализов)', time: '45 мин', price: 2500 },
      { id: 'srv_002', title: 'Очная консультация врача-косметолога', time: '30 мин', price: 2000 },
    ]
  },
  {
    category: 'Эстетическая косметология',
    items: [
      { id: 'srv_003', title: 'Лечебная чистка лица (работа с акне)', time: '90 мин', price: 4500 },
      { id: 'srv_004', title: 'Химический пилинг (по типу кожи)', time: '40 мин', price: 3500 },
    ]
  },
  {
    category: 'Инъекционная косметология',
    items: [
      { id: 'srv_005', title: 'Биоревитализация (глубокое увлажнение)', time: '60 мин', price: 8000 },
      { id: 'srv_006', title: 'Ботулинотерапия (коррекция мимических морщин)', time: '30 мин', price: 6500 },
    ]
  }
];

function Services() {
  const [loadingId, setLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const { updateCartCount } = useCart();

  const handleBook = async (service) => {
    setLoadingId(service.id);
    try {
      // Отправляем запрос на наш FastAPI бэкенд
      await addToCart(service.id, 1, service.price);
      await updateCartCount(); // Обновляем глобальный счетчик

      setSuccessId(service.id);
      setTimeout(() => setSuccessId(null), 2000); // Убираем галочку через 2 сек
    } catch (error) {
      alert('Ошибка при добавлении в корзину. Проверьте, запущен ли бэкенд.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#333' }}>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Услуги и цены
        </h1>
        <p style={{ color: '#777', marginTop: '10px' }}>Запись на процедуры и онлайн-консультации</p>
      </div>

      <div>
        {servicesData.map((group, index) => (
          <div key={index} style={{ marginBottom: '40px' }}>
            {/* Заголовок категории */}
            <h2 style={{
              fontSize: '20px',
              borderBottom: '1px solid #333',
              paddingBottom: '10px',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {group.category}
            </h2>

            {/* Список услуг в категории */}
            <div>
              {group.items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{ flex: 1, paddingRight: '20px' }}>
                    <h3 style={{ fontSize: '16px', margin: '0 0 5px 0', fontWeight: '500' }}>{item.title}</h3>
                    <span style={{ fontSize: '13px', color: '#888' }}>⏱ {item.time}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.price} ₽</span>

                    <button
                      onClick={() => handleBook(item)}
                      disabled={loadingId === item.id}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: successId === item.id ? '#4CAF50' : '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s',
                        minWidth: '130px'
                      }}
                    >
                      {loadingId === item.id ? 'Загрузка...' :
                       successId === item.id ? '✓ В корзине' : 'Записаться'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;