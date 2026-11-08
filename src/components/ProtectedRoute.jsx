import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  // Проверяем наличие токена, который мы сохраняем при логине
  const token = localStorage.getItem('adminToken');

  if (!token) {
    // Если токена нет, перекидываем на логин, но запоминаем, куда шел админ
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Если токен есть — рендерим страницу (детей)
  return children;
}