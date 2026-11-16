import { useFavorites } from '../context/FavoritesContext';
import './Favorites.css';

export default function FavoriteButton({ product, showLabel = false }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(product.id);
  const label = active ? 'Убрать из избранного' : 'Добавить в избранное';
  return <button type="button" className={`favorite-button ${active ? 'is-favorite' : ''} ${showLabel ? 'favorite-button--label' : ''}`} aria-label={`${label}: ${product.title || product.name}`} aria-pressed={active} title={label} onClick={() => toggleFavorite(product)}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M20.8 4.6a5.2 5.2 0 0 0-7.4 0L12 6l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-9a5.2 5.2 0 0 0 0-7.4Z"/></svg>
    {showLabel && <span>{label}</span>}
  </button>;
}
