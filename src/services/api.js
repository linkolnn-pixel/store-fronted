import axios from 'axios';

// Базовый URL вашего FastAPI бэкенда
export const BACKEND_URL = 'http://127.0.0.1:8000';

const API_URL = `${BACKEND_URL}/api/v1`;

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ==========================================
// УПРАВЛЕНИЕ ТОКЕНАМИ И СЕССИЯМИ
// ==========================================

// Работа с ID сессии (Анонимная корзина)
export const getSessionId = () => localStorage.getItem('session_id');
export const setSessionId = (id) => localStorage.setItem('session_id', id);

// Работа с токеном клиента (Личный кабинет)
export const getCustomerToken = () => localStorage.getItem('customerToken');
export const setCustomerToken = (token) => localStorage.setItem('customerToken', token);
export const logoutCustomer = () => localStorage.removeItem('customerToken');

// Помощник для заголовков клиента (используется в корзине и профиле)
const getCustomerAuthHeaders = () => {
    const token = getCustomerToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Помощник для получения заголовков админа
const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};


// ==========================================
// АДМИН-ПАНЕЛЬ
// ==========================================

// Авторизация администратора (отправляем Form-Data)
export const loginAdmin = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post('/admin/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

// Обновление товара
export const updateProductMeta = async (productId, data) => {
    const response = await apiClient.patch(`/catalog/${productId}/meta`, data, {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Загрузка фото
export const uploadProductImage = async (productId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(`/catalog/${productId}/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()
        }
    });
    return response.data;
};


// ==========================================
// КАТАЛОГ И КАТЕГОРИИ
// ==========================================

export const fetchCatalog = async () => {
    const response = await apiClient.get('/catalog');
    return response.data;
};

export const fetchRecommendations = async (query, { signal } = {}) => {
    const response = await apiClient.post('/assistant/recommend', { query, limit: 5 }, { signal });
    return response.data;
};

export const fetchNewArrivals = async () => {
    const response = await apiClient.get('/catalog/new_arrivals');
    return response.data;
};

export const fetchProduct = async (id) => {
    const response = await apiClient.get(`/catalog/${id}`);
    return response.data;
};

export const fetchCategories = async () => {
  try {
    const response = await apiClient.get('/catalog/categories');
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении категорий:", error);
    return [];
  }
};


// ==========================================
// КОРЗИНА И ПРОМОКОДЫ
// ==========================================

// Применить промокод
export const applyPromoCode = async (promoCode) => {
  const sessionId = getSessionId();
  if (!sessionId) throw new Error("Нет сессии корзины");

  const response = await apiClient.post(`/promo/apply?session_id=${sessionId}`, {
    promo_code: promoCode
  });
  return response.data;
};

// Удалить промокод
export const removePromoCode = async () => {
  const sessionId = getSessionId();
  if (!sessionId) throw new Error("Нет сессии корзины");

  const response = await apiClient.delete(`/promo/remove?session_id=${sessionId}`);
  return response.data;
};

// 1. Получить корзину
export const fetchCart = async () => {
    const sessionId = getSessionId();
    if (!sessionId) return null;
    const response = await apiClient.get(`/cart/${sessionId}`, {
        headers: getCustomerAuthHeaders() // <-- ПЕРЕДАЕМ ТОКЕН
    });
    return response.data;
};

// 2. Добавить товар в корзину
export const addToCart = async (productId, quantity, price) => {
    let sessionId = getSessionId();
    const url = sessionId ? `/cart/add?session_id=${sessionId}` : `/cart/add`;

    const response = await apiClient.post(url, {
        product_id: String(productId),
        quantity: Number(quantity),
        price: Number(price)
    }, {
        headers: getCustomerAuthHeaders() // <-- ПЕРЕДАЕМ ТОКЕН
    });

    if (response.data.session_id && !sessionId) {
        setSessionId(response.data.session_id);
    }
    return response.data;
};

// 3. Обновить количество товара
export const updateCartItem = async (productId, quantity) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const response = await apiClient.post('/cart/update', {
        session_id: sessionId,
        product_id: String(productId),
        quantity: Number(quantity)
    }, {
        headers: getCustomerAuthHeaders() // <-- ПЕРЕДАЕМ ТОКЕН
    });
    return response.data;
};

// 4. Удалить товар из корзины
export const removeCartItem = async (productId) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const response = await apiClient.post('/cart/remove', {
        session_id: sessionId,
        product_id: String(productId)
    }, {
        headers: getCustomerAuthHeaders() // <-- ПЕРЕДАЕМ ТОКЕН
    });
    return response.data;
};

// 5. Оформить заказ
export const checkoutCart = async (customerData) => {
    const sessionId = getSessionId();
    if (!sessionId) throw new Error("Нет сессии корзины");

    const response = await apiClient.post('/checkout', {
        session_id: sessionId,
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_email: customerData.email,
        comment: customerData.comment || null,                   // <-- Добавили
        gift_certificate: customerData.gift_certificate || null  // <-- Добавили
    }, {
        headers: getCustomerAuthHeaders()
    });
    return response.data;
};


// ==========================================
// ЛИЧНЫЙ КАБИНЕТ КЛИЕНТА
// ==========================================

// 1. Запросить СМС-код
export const requestAuthCode = async (phone) => {
    const response = await apiClient.post('/customer/request-code', {
        phone: phone
    });
    return response.data;
};

// 2. Проверить код и залогиниться
export const verifyAuthCode = async (phone, code) => {
    const response = await apiClient.post('/customer/verify-code', {
        phone: phone,
        code: code
    });

    // Сохраняем токен
    if (response.data.access_token) {
        setCustomerToken(response.data.access_token);
    }
    return response.data;
};

// 3. Получить историю заказов
export const fetchMyOrders = async () => {
    const response = await apiClient.get('/profile/orders', {
        headers: getCustomerAuthHeaders()
    });
    return response.data;
};

// ==========================================
// ПОДАРОЧНЫЕ СЕРТИФИКАТЫ
// ==========================================

export const checkGiftCertificate = async (code) => {
    const response = await apiClient.get(`/certificates/validate/?code=${code}`);
    return response.data;
};
