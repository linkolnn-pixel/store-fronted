import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CatalogMenu.css';
import { NEW_ARRIVALS_CATEGORY } from '../services/categories';

const categoryUrl = node => `/catalog?category=${encodeURIComponent(node.id)}`;

export default function CatalogMenu({ categories: warehouseCategories, mobile, close, openSearch }) {
  const categories = [NEW_ARRIVALS_CATEGORY, ...warehouseCategories];
  const [path, setPath] = useState([]);
  const [mobileCatalog, setMobileCatalog] = useState(false);
  const current = path.at(-1);
  const children = current?.children || categories;
  const columns = [categories, ...path.filter(node => node.children.length).map(node => node.children)];

  const select = (node, depth) => setPath(previous => [...previous.slice(0, depth), node]);
  const back = () => {
    if (path.length) setPath(previous => previous.slice(0, -1));
    else setMobileCatalog(false);
  };

  if (mobile) return <section id="catalog-menu" className="catalog-flyout catalog-flyout--mobile" aria-label="Меню магазина">
    <div className="catalog-mobile-toolbar"><span>Меню</span><button type="button" onClick={close} aria-label="Закрыть меню">×</button></div>
    <div className="catalog-mobile-screen" key={mobileCatalog ? current?.id ?? 'categories' : 'menu'}>
      {mobileCatalog ? <>
        <button className="catalog-mobile-back" type="button" onClick={back}>{current?.name || 'Каталог'}</button>
        <Link className="catalog-mobile-all" to={current ? categoryUrl(current) : '/catalog'} onClick={close}>{current ? 'Все товары категории' : 'Смотреть все товары'}</Link>
        <ul className="catalog-mobile-list">
          {children.map(node => <li key={node.id}>{node.children.length ?
            <button type="button" onClick={() => setPath(previous => [...previous, node])}>{node.name}</button> :
            <Link to={categoryUrl(node)} onClick={close}>{node.name}</Link>}
          </li>)}
        </ul>
        {!children.length && <p className="catalog-unavailable">Категории пока недоступны. Все товары можно посмотреть в каталоге.</p>}
      </> : <>
        <ul className="catalog-mobile-list catalog-mobile-main">
          <li><button type="button" onClick={() => setMobileCatalog(true)}>Каталог</button></li>
          <li><Link to="/services" onClick={close}>Подбор ухода</Link></li>
          <li><Link to="/certificates" onClick={close}>Подарочные карты</Link></li>
          <li><Link to="/delivery" onClick={close}>Доставка</Link></li>
          <li><Link to="/about" onClick={close}>О нас</Link></li>
        </ul>
        <div className="catalog-mobile-secondary"><button type="button" onClick={openSearch}>Поиск по магазину</button><Link to="/" onClick={close}>Главная</Link></div>
      </>}
    </div>
  </section>;

  return <section id="catalog-menu" className="catalog-flyout" aria-label="Категории товаров">
    <div className="catalog-cascade">
      {columns.map((nodes, depth) => <ul className={`catalog-cascade-column ${depth === 0 ? 'catalog-cascade-root' : ''}`} key={depth === 0 ? 'root' : path[depth - 1].id} aria-label={depth === 0 ? 'Категории' : path[depth - 1].name}>
        {depth === 0 && <li><Link className="catalog-all" to="/catalog" onClick={close} onPointerEnter={() => setPath([])} onFocus={() => setPath([])}>Все товары</Link></li>}
        {nodes.map(node => <li key={node.id} className={path[depth]?.id === node.id ? 'is-selected' : ''} onPointerEnter={event => { if (event.pointerType === 'mouse') select(node, depth); }}>
          <Link to={categoryUrl(node)} onClick={close} onFocus={() => select(node, depth)} onKeyDown={event => {
            if (event.key === 'ArrowRight' && node.children.length) {
              event.preventDefault();
              select(node, depth);
              requestAnimationFrame(() => event.target.closest('.catalog-cascade-column')?.nextElementSibling?.querySelector('a')?.focus());
            }
            if (event.key === 'ArrowLeft' && depth > 0) {
              event.preventDefault();
              const previous = event.target.closest('.catalog-cascade-column')?.previousElementSibling?.querySelector('.is-selected a');
              previous?.focus();
            }
          }}>{node.name}</Link>
        </li>)}
        {depth === 0 && !nodes.length && <li className="catalog-unavailable">Категории пока недоступны.</li>}
      </ul>)}
    </div>
  </section>;
}