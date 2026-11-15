import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const GiftCertificatePage = () => {
  const { updateCartCount } = useCart();

  const amounts = [3000, 5000, 10000, 15000];

  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // ==========================================
  // ДОБАВЛЕНИЕ В КОРЗИНУ (ЧЕРЕЗ FETCH)
  // ==========================================
  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const payload = {
        price: selectedAmount,
        recipient_email: recipientEmail,
        sender_name: senderName,
        message: message,
        quantity: 1
      };

      const sessionId = localStorage.getItem('session_id');

      const BASE_URL = 'http://localhost:8000';

      const url = sessionId
        ? `${BASE_URL}/api/v1/cart/certificate?session_id=${sessionId}`
        : `${BASE_URL}/api/v1/cart/certificate`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Ошибка ответа от сервера');
      }

      const data = await response.json();

      if (data.session_id && !sessionId) {
        localStorage.setItem('session_id', data.session_id);
      }

      // alert(`Сертификат на ${selectedAmount.toLocaleString('ru-RU')} ₽ добавлен в корзину!`);

      if (updateCartCount) updateCartCount();

      setRecipientEmail('');
      setMessage('');
    } catch (error) {
      console.error("Ошибка сети:", error);
      alert('Ошибка при добавлении сертификата. Попробуйте еще раз.');
    } finally {
      setIsAdding(false);
    }
  };

  // ==========================================
  // НАМЕКНУТЬ НА ПОДАРОК (Web Share API)
  // ==========================================
  const handleHint = (e) => {
    e.preventDefault();
    const shareData = {
      title: 'Подарочный сертификат M.D.M',
      text: `Смотри, какой идеальный подарок! Намекаю на сертификат M.D.M номиналом ${selectedAmount.toLocaleString('ru-RU')} ₽ 😉`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.error('Ошибка шаринга:', err));
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      alert('Ссылка и текст скопированы в буфер обмена! Отправь их тому, кому намекаешь 🤍');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-light text-center mb-10">Электронный подарочный сертификат</h1>

      <div className="flex flex-col md:flex-row gap-12 items-start">

        {/* ЛЕВАЯ ЧАСТЬ: Визуализация сертификата */}
        <div className="w-full md:w-1/2 sticky top-24">
          <div className="aspect-[1.6/1] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>

            <div className="relative z-10">
              <h2 className="text-xl tracking-widest uppercase text-gray-300 mb-1">M.D.M</h2>
              <p className="text-sm font-light text-gray-400">Подарочный сертификат</p>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-400 mb-1">Номинал</p>
                <p className="text-4xl font-light">{selectedAmount.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Действителен 1 год</p>
              </div>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Форма настройки */}
        <div className="w-full md:w-1/2">
          <form onSubmit={handleAddToCart} className="space-y-8">

            {/* Выбор номинала */}
            <div>
              <h3 className="text-lg font-medium mb-4">1. Выберите номинал</h3>
              <div className="grid grid-cols-2 gap-3">
                {amounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedAmount(amount)}
                    className={`py-3 px-4 border rounded-lg text-center transition-all ${
                      selectedAmount === amount 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {amount.toLocaleString('ru-RU')} ₽
                  </button>
                ))}
              </div>
            </div>

            {/* Данные получателя */}
            <div>
              <h3 className="text-lg font-medium mb-4">2. Кому отправить?</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email получателя *</label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">На этот адрес придет письмо с уникальным промокодом</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ваше имя (от кого)</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Например: Анна"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Сообщение (необязательно)</label>
                  <textarea
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Поздравляю с днем рождения! Выбирай всё, что захочешь 🤍"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-black resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-black text-white py-4 rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {isAdding ? (
                  <span className="animate-pulse">Добавление...</span>
                ) : (
                  `В корзину — ${selectedAmount.toLocaleString('ru-RU')} ₽`
                )}
              </button>

              <button
                onClick={handleHint}
                type="button"
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:border-black hover:text-black transition-colors flex justify-center items-center gap-2"
              >
                <span>🎁</span> Намекнуть на подарок
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default GiftCertificatePage;