import React from 'react';

function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#333' }}>

      {/* Заголовок-шапка */}
      <div style={{ borderBottom: '2px solid #e0e0e0', paddingBottom: '20px', marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Альбина Шайхенуровна Мухамедьянова
        </h1>
        <p style={{ color: '#777', fontSize: '16px', letterSpacing: '1px' }}>
          Врач-косметолог • Дерматовенеролог
        </p>
      </div>

      {/* Основной блок с информацией */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Место под фото */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#aaa'
          }}>
            [ Место для профессионального фото ]
          </div>
        </div>

        {/* Текст и регалии */}
        <div style={{ flex: '2 1 400px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '20px' }}>Образование и опыт</h2>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8' }}>
            <li style={{ marginBottom: '15px' }}>
              <strong>Базовое образование:</strong><br />
              Башкирский государственный медицинский университет (БГМУ)
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Специализация:</strong><br />
              Ординатура Московского областного научно-исследовательского клинического института им. М.Ф. Владимирского (МОНИКИ)
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Профиль:</strong><br />
              Комплексное лечение акне, инъекционная косметология, пилинги и подбор профессионального домашнего ухода.
            </li>
          </ul>

          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderLeft: '3px solid #d4af37' }}>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>
              «Моя главная цель — подчеркнуть вашу естественную красоту и сохранить здоровье кожи, используя только проверенные медицинские протоколы».
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default About;