import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { BACKEND_URL } from '../services/api';
import FavoriteButton from './FavoriteButton';
import './Favorites.css';

export default function FavoritesSection() {
  const { favorites, storageError } = useFavorites();
  return <section id="favorites" className="favorites-section" aria-labelledby="favorites-title">
    <div className="favorites-heading"><h2 id="favorites-title">Избранное <span>({favorites.length})</span></h2><Link to="/catalog">В каталог →</Link></div>
    {storageError && <p role="status">Браузер не разрешил сохранить избранное. Товары доступны до закрытия страницы.</p>}
    {!favorites.length ? <p className="favorites-empty">Здесь будут товары, отмеченные сердечком.</p> : <div className="favorites-grid">
      {favorites.map(product => {
        const image = product.images?.[0];
        const imageUrl = image ? (image.startsWith('http') ? image : `${BACKEND_URL}${image}`) : '/product-placeholder.svg';
        return <article className="favorite-card" key={product.id}><FavoriteButton product={product}/><Link to={`/product/${product.id}`}><img src={imageUrl} alt={product.title || product.name}/><span className="favorite-brand">{product.brand}</span><h3>{product.title || product.name}</h3><span className="favorite-view">Посмотреть товар →</span></Link></article>;
      })}
    </div>}
  </section>;
}
