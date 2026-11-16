import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'store_favorites';
const FavoritesContext = createContext(null);
function parseFavorites(value) {
  try {
    const items = JSON.parse(value || '[]');
    return Array.isArray(items) ? items.filter(item => item && item.id != null) : [];
  } catch { return []; }
}
function readFavorites() {
  try { return parseFavorites(localStorage.getItem(STORAGE_KEY)); } catch { return []; }
}
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readFavorites);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [favorites]);
  useEffect(() => {
    const sync = event => { if (event.key === STORAGE_KEY || event.key === null) setFavorites(parseFavorites(event.newValue)); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const isFavorite = id => favorites.some(item => String(item.id) === String(id));
  const toggleFavorite = product => setFavorites(previous => {
    if (previous.some(item => String(item.id) === String(product.id))) return previous.filter(item => String(item.id) !== String(product.id));
    const { id, name, title, brand, images } = product;
    return [...previous, { id, name, title, brand, images }];
  });
  return <FavoritesContext.Provider value={{ favorites, storageError, isFavorite, toggleFavorite }}>{children}</FavoritesContext.Provider>;
}
export const useFavorites = () => useContext(FavoritesContext);
