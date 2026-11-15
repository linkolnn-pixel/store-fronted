import React from 'react';

const GiftPromoSection = ({ productName }) => {
  // Получаем текущую ссылку на страницу товара
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Формируем текст намека
  const hintMessage = `Привет! Смотри, что я очень хочу в подарок: ${productName} 🎁`;

  // Генерируем ссылки для шеринга (обязательно кодируем текст для URL)
  const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(hintMessage)}`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(hintMessage + ' ' + productUrl)}`;

  return (
    <div className="flex flex-col md:flex-row gap-6 my-8 w-full">

      {/* ЛЕВАЯ СТОРОНА: Подарочный сертификат */}
      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col justify-between">
        <div>
          <div className="text-2xl mb-2">💳</div>
          <h3 className="text-lg font-semibold mb-2">Подарочный сертификат</h3>
          <p className="text-gray-600 text-sm mb-4">
            Боитесь не угадать с уходом? Подарите свободу выбора. Сертификат придет на email получателя сразу после оплаты.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/certificates'} // Ссылка на страницу покупки сертификатов
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Купить сертификат
        </button>
      </div>

      {/* ПРАВАЯ СТОРОНА: Намекнуть на подарок */}
      <div className="flex-1 bg-pink-50 border border-pink-100 rounded-xl p-6 flex flex-col justify-between">
        <div>
          <div className="text-2xl mb-2">💌</div>
          <h3 className="text-lg font-semibold mb-2">Намекнуть на подарок</h3>
          <p className="text-gray-600 text-sm mb-4">
            Понравилось средство, но хотите получить его в подарок? Отправьте тонкий (или не очень) намек!
          </p>
        </div>

        <div className="flex gap-2">
          {/* Кнопка Telegram */}
          <a
            href={tgShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#0088cc] text-white py-3 rounded-lg font-medium hover:bg-[#0077b3] transition-colors"
          >
            <span>Telegram</span>
          </a>

          {/* Кнопка WhatsApp */}
          <a
            href={waShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-lg font-medium hover:bg-[#20bd5a] transition-colors"
          >
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default GiftPromoSection;