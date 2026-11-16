import { Link } from 'react-router-dom';

export default function Home() {
  return <>
    <section className="home-hero">
      <div className="hero-copy"><span className="eyebrow">КОСМЕТОЛОГИЯ С ЗАБОТОЙ О ВАС</span><h1>Ваша кожа.<br/>Ваш <em>особенный</em><br/>уход.</h1><p>Профессиональная косметика и внимательный подход врача. Для ежедневных ритуалов, которые приносят удовольствие.</p><Link className="dark-button" to="/catalog">Найти свой уход <span>↗</span></Link><span className="hero-footnote">Красота начинается с заботы</span></div>
      <div className="hero-art" aria-hidden="true"><div className="art-orbit"/><div className="art-caption">THE ART<br/>OF SKINCARE</div><div className="bottle bottle-tall"><div className="bottle-cap"/><span>a·m</span><small>DAILY CARE<br/>YOUR SKIN RITUAL</small><i>01 / nourish</i></div><div className="bottle bottle-small"><div className="bottle-cap"/><span>a·m</span><small>GENTLE CARE</small><i>02 / glow</i></div><span className="art-bottom">A LITTLE CARE. EVERY DAY.</span></div>
    </section>
    <div className="values-strip"><span>Профессиональный подход</span><span>Уход с учётом потребностей кожи</span><span>Осознанный выбор косметики</span></div>
    <section className="home-discover"><div className="section-heading"><div><span className="eyebrow">БОЛЬШЕ, ЧЕМ КОСМЕТИКА</span><h2>Забота в каждой детали</h2></div><Link to="/catalog">Смотреть каталог ↗</Link></div><div className="discovery-grid"><Link to="/catalog" className="discovery-card"><span>01 / ЕЖЕДНЕВНЫЙ РИТУАЛ</span><h3>Уход для вас</h3><p>Откройте каталог профессиональной косметики.</p><b>В каталог ↗</b></Link><Link to="/services" className="discovery-card"><span>02 / ЭКСПЕРТНЫЙ ПОДХОД</span><h3>Начнём со знакомства</h3><p>Подбор домашнего ухода на консультации врача.</p><b>Подобрать уход ↗</b></Link><Link to="/certificates" className="discovery-card"><span>03 / ПРИЯТНЫЙ ПОВОД</span><h3>Подарите заботу</h3><p>Подарочная карта — возможность выбрать своё.</p><b>Выбрать карту ↗</b></Link></div></section>
    <section className="expert-banner"><span className="eyebrow">ЗНАКОМСТВО С ЭКСПЕРТОМ</span><h2>Здоровая кожа —<br/>наша общая цель.</h2><p>Альбина Шайхенуровна Мухамедьянова<br/>Врач-косметолог · Дерматовенеролог</p><Link to="/about" className="text-link">Узнать больше ↗</Link></section>
  </>;
}
