import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchCart } from '../services/api';

// Создаем сам контекст
const CartContext = createContext();

// Провайдер, который обернет наше приложение
export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  // Функция для запроса актуального количества товаров с бэкенда
  const updateCartCount = async () => {
    try {
      const cart = await fetchCart();
      if (cart && cart.items) {
        // Считаем общее количество всех позиций (а не только уникальных)
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      setCartCount(0);
    }
  };

  // При первой загрузке сайта сразу проверяем, есть ли что-то в корзине
  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Удобный хук для использования в страницах
export const useCart = () => useContext(CartContext);