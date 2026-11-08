import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../services/api';

export default function AdminLogin() {
  // Добавили состояние для логина (по умолчанию пусто или можно вписать 'admin')
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Отправляем обычный JavaScript объект. Axios сам сделает из него JSON.
      const payload = {
        username: username,
        password: password
      };

      const response = await apiClient.post('/admin/login', payload);

      localStorage.setItem('adminToken', response.data.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: 'sans-serif' }}>
      <form
        onSubmit={handleLogin}
        style={{
          padding: '30px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          width: '320px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          backgroundColor: '#fff'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          Вход в админку
        </h2>

        {error && (
          <div style={{
            color: '#d32f2f',
            backgroundColor: '#fdecea',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* НОВОЕ ПОЛЕ: Логин */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#555' }}>
            Логин
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              fontSize: '16px'
            }}
          />
        </div>

        {/* ПОЛЕ: Пароль */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#555' }}>
            Пароль
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#9e9e9e' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Проверка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}