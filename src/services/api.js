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

// Работа с ID сессии (корзины)
export const getSessionId = () => localStorage.getItem('session_id');
export const setSessionId = (id) => localStorage.setItem('session_id', id);
// Получить список товаров из каталога (через наш FastAPI)
export const fetchCatalog = async () => {
    const response = await apiClient.get('/catalog');
    return response.data;
};


// 1. Получить корзину
export const fetchCart = async () => {
    const sessionId = getSessionId();
    if (!sessionId) return null;
    const response = await apiClient.get(`/cart/${sessionId}`);
    return response.data;
};

// 2. Добавить товар в корзину
export const addToCart = async (productId, quantity, price) => {
    let sessionId = getSessionId();
    // Если сессия есть, передаем её в query-параметрах
    const url = sessionId ? `/cart/add?session_id=${sessionId}` : `/cart/add`;

    const response = await apiClient.post(url, {
        product_id: String(productId),
        quantity: Number(quantity),
        price: Number(price)
    });

    if (response.data.session_id && !sessionId) {
        setSessionId(response.data.session_id);
    }
    return response.data;
};

// 3. Обновить количество товара (НОВЫЙ ПРАВИЛЬНЫЙ РОУТ)
export const updateCartItem = async (productId, quantity) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const response = await apiClient.post('/cart/update', {
        session_id: sessionId,
        product_id: String(productId),
        quantity: Number(quantity)
    });
    return response.data;
};

// 4. Удалить товар из корзины (НОВЫЙ ПРАВИЛЬНЫЙ РОУТ)
export const removeCartItem = async (productId) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const response = await apiClient.post('/cart/remove', {
        session_id: sessionId,
        product_id: String(productId)
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
        customer_email: customerData.email
    });
    return response.data;
};

// Получить один товар по ID
export const fetchProduct = async (id) => {
    const response = await apiClient.get(`/catalog/${id}`);
    return response.data;
};