import { Link } from 'react-router-dom';

export default function Delivery() {
  return <section className="information-page"><span className="eyebrow">ПОКУПКИ С ЗАБОТОЙ</span><h1>Доставка</h1><p className="information-lead">Всё о получении вашего заказа.</p><div className="information-grid"><article><span>01</span><h2>Оформите заказ</h2><p>Добавьте средства в корзину и укажите контактные данные при оформлении.</p></article><article><span>02</span><h2>Уточните условия</h2><p>Способ, стоимость и сроки доставки необходимо согласовать при подтверждении заказа.</p></article><article><span>03</span><h2>Получите свой уход</h2><p>При получении проверьте комплектность заказа и целостность упаковки.</p></article></div><Link to="/catalog" className="dark-button">Перейти в каталог ↗</Link></section>;
}
