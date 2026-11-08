import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProduct } from '../services/api';
import AdminProductForm from '../components/AdminProductForm'; // Ваша форма

export default function AdminProductEdit() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProduct(id);
        setProduct(data);
      } catch (error) {
        console.error("Ошибка загрузки товара:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка товара...</div>;
  if (!product) return <div style={{ padding: '40px', textAlign: 'center' }}>Товар не найден</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/admin" style={{ textDecoration: 'none', color: '#1976d2', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Назад к списку товаров
      </Link>

      <h2 style={{ marginBottom: '20px' }}>
        Редактирование товара: {product.title || product.name}
      </h2>

      {/* ВОТ ЗДЕСЬ МЫ ВЫВОДИМ ФОРМУ И ПЕРЕДАЕМ В НЕЕ ДАННЫЕ ТОВАРА */}
      <AdminProductForm product={product} />

    </div>
  );
}