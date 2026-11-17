import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchCategories } from '../services/api';
import { categoryTree } from '../services/categories';
import CatalogMenu from './CatalogMenu';

function Icon({ name }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'search' && <><circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 5 5"/></>}
    {name === 'user' && <><circle cx="12" cy="7" r="3.5"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/></>}
    {name === 'bag' && <><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2"/></>}
    {name === 'menu' && <path d="M3 6h18M3 12h18M3 18h18"/>}
    {name === 'close' && <path d="m6 6 12 12M6 18 18 6"/>}
    {name === 'heart' && <path d="M20.8 4.6a5.2 5.2 0 0 0-7.4 0L12 6l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-9a5.2 5.2 0 0 0 0-7.4Z"/>}
  </svg>;
}
export default function NavBar() {
  const { cartCount } = useCart();
  const [panel, setPanel] = useState(null);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 800px)').matches);
  const navigate = useNavigate();
  const header = useRef(null);
  const search = useRef(null);
  const leaveTimer = useRef(null);
  const cancelLeave = () => clearTimeout(leaveTimer.current);
  const close = () => { cancelLeave(); setPanel(null); };
  const toggle = value => { cancelLeave(); setPanel(panel === value ? null : value); };
  const openCatalogOnHover = event => {
    if (!mobile && event.pointerType === 'mouse' && window.matchMedia('(hover: hover)').matches) {
      cancelLeave();
      setPanel('catalog');
    }
  };
  const scheduleClose = event => {
    if (!mobile && event.pointerType === 'mouse' && panel === 'catalog') {
      cancelLeave();
      leaveTimer.current = setTimeout(() => setPanel(value => value === 'catalog' ? null : value), 500);
    }
  };
  useEffect(() => {
    const media = window.matchMedia('(max-width: 800px)');
    const update = () => { setMobile(media.matches); setPanel(null); clearTimeout(leaveTimer.current); };
    media.addEventListener('change', update);
    return () => { media.removeEventListener('change', update); clearTimeout(leaveTimer.current); };
  }, []);
  useEffect(() => {
    if (!mobile || !panel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const background = [...document.querySelectorAll('#main-content, .site-footer')];
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
    };
  }, [mobile, panel]);
  useEffect(() => { let active = true; fetchCategories().then(data => { if (active) setCategories(categoryTree(data)); }); return () => { active = false; }; }, []);
  useEffect(() => {
    const dismiss = event => {
      if (event.type === 'keydown' && event.key === 'Tab' && mobile && panel) {
        const focusable = [...header.current.querySelectorAll('button, a[href], input')].filter(element => element.getClientRects().length && !element.classList.contains('skip-link'));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && (document.activeElement === first || !header.current.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && (document.activeElement === last || !header.current.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
      }
      if (event.type === 'keydown' && event.key === 'Escape') {
        setPanel(null);
        const controls = panel === 'search' ? 'header-search' : panel === 'favorites' ? 'favorites-menu' : 'catalog-menu';
        const trigger = [...(header.current?.querySelectorAll(`[aria-controls="${controls}"]`) || [])].find(element => element.getClientRects().length);
        trigger?.focus();
      }
      if (event.type === 'pointerdown' && !header.current?.contains(event.target)) setPanel(null);
    };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', dismiss);
    if (panel === 'search') search.current?.focus();
    return () => { document.removeEventListener('keydown', dismiss); document.removeEventListener('pointerdown', dismiss); };
  }, [panel, mobile]);
  return <header className="site-header" ref={header} onPointerEnter={cancelLeave} onPointerLeave={scheduleClose} onBlur={event => { if (!mobile && !event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <a className="skip-link" href="#main-content">Перейти к содержимому</a>
    <div className="header-inner">
      <Link className="wordmark" to="/" onClick={close}>a<span>·</span>m<span className="wordmark-note">SKINCARE</span></Link>
      <nav className="main-nav" aria-label="Основная навигация" onPointerOver={event => {
        const link = event.target.closest('a');
        if (event.pointerType === 'mouse' && link && !link.classList.contains('nav-catalog') && panel === 'catalog') close();
      }}>
        <Link className="nav-catalog" to="/catalog" aria-controls="catalog-menu" aria-expanded={panel === 'catalog'} onPointerEnter={openCatalogOnHover} onClick={close} onKeyDown={event => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            cancelLeave();
            setPanel('catalog');
            requestAnimationFrame(() => header.current.querySelector('.catalog-flyout a')?.focus());
          }
        }}>Каталог <span className="chevron"></span></Link>
        <NavLink to="/services" onClick={close}>Подбор ухода</NavLink>
        <NavLink to="/certificates" onClick={close}>Подарочные карты</NavLink>
        <NavLink to="/delivery" onClick={close}>Доставка</NavLink>
        <NavLink to="/about" onClick={close}>О нас</NavLink>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Поиск" aria-controls="header-search" aria-expanded={panel === 'search'} onClick={() => toggle('search')}><Icon name={panel === 'search' ? 'close' : 'search'}/></button>
        <Link className="icon-button" to="/profile" aria-label="Личный кабинет" onClick={close}><Icon name="user"/></Link>
        <Link className="icon-button cart-icon" to="/cart" aria-label={`Корзина: ${cartCount}`} onClick={close}><Icon name="bag"/>{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</Link>
      </div>
    </div>
    <nav className="mobile-bottom-nav" aria-label="Мобильная навигация">
      <button type="button" aria-controls="catalog-menu" aria-expanded={panel === 'catalog'} onClick={() => toggle('catalog')}><Icon name={panel === 'catalog' ? 'close' : 'menu'}/><span>Каталог</span></button>
      <NavLink to="/favorites" onClick={close}><Icon name="heart"/><span>Избранное</span></NavLink>
      <NavLink to="/cart" onClick={close} aria-label={`Корзина: ${cartCount}`}><span className="mobile-cart-icon"><Icon name="bag"/>{cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}</span><span>Корзина</span></NavLink>
      <NavLink to="/profile" onClick={close}><Icon name="user"/><span>Аккаунт</span></NavLink>
    </nav>
    <button className={`icon-button mobile-search-button ${panel === 'catalog' ? 'is-catalog-open' : ''}`} type="button" aria-label="Поиск" aria-controls="header-search" aria-expanded={panel === 'search'} onClick={() => toggle('search')}><Icon name={panel === 'search' ? 'close' : 'search'}/></button>
    {panel === 'catalog' && <CatalogMenu categories={categories} mobile={mobile} close={close} openSearch={() => setPanel('search')}/>}
    {panel === 'search' && <form id="header-search" className="header-panel search-panel" onSubmit={event => { event.preventDefault(); navigate(`/catalog?q=${encodeURIComponent(query.trim())}`); close(); }}><label htmlFor="product-search">Найдите свой уход</label><div><input id="product-search" ref={search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Название средства или бренд" type="search"/><button className="dark-button">Найти →</button></div></form>}
  </header>;
}
