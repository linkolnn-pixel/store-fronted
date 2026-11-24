import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import { fetchCatalog, fetchRecommendations, BACKEND_URL } from '../services/api';

export default function AISearch() {
  const [params] = useSearchParams();
  const query = (params.get('q') || '').trim();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setResult(null);
      setError('');
      if (query.length < 3 || query.length > 500) {
        setError('Введите запрос от 3 до 500 символов.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [recommendations, catalogData] = await Promise.all([
          fetchRecommendations(query, { signal: controller.signal }),
          fetchCatalog()
        ]);
        if (controller.signal.aborted) return;
        const catalog = catalogData.results || catalogData;
        const products = new Map(catalog.map(product => [String(product.id), product]));
        setResult({ answer: recommendations.answer, items: recommendations.items.map(item => ({ ...item, product: products.get(String(item.product_id)) })).filter(item => item.product) });
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err.response?.status === 429 ? 'Слишком много запросов. Подождите минуту и повторите поиск.' : 'AI-поиск временно недоступен. Попробуйте позже или воспользуйтесь обычным поиском.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [query, attempt]);

  return <div className="information-page">
    <div className="breadcrumbs"><Link to="/">Главная</Link> / AI-поиск</div>
    <h1>AI-подбор ухода</h1>
    <SearchForm key={query} initialQuery={query} initialAI/>
    <section aria-label="Результаты AI-поиска" aria-busy={loading}>
      {loading && <p role="status">Подбираем товары по вашему запросу…</p>}
      {error && <p role="alert">{error}</p>}
      {error && query.length >= 3 && query.length <= 500 && <button className="dark-button" type="button" onClick={() => setAttempt(value => value + 1)}>Повторить поиск</button>}
      {result && <>
        <p className="ai-search-answer" role="status">{result.answer}</p>
        {!result.items.length && <p>Подходящих товаров не найдено. Попробуйте уточнить пожелания.</p>}
        <ul className="ai-search-products">{result.items.map(({ product_id, reason, product }) => {
          const image = product.images?.[0];
          return <li className="ai-search-product" key={product_id}>
            <img src={image ? (image.startsWith('http') ? image : `${BACKEND_URL}${image}`) : '/product-placeholder.svg'} alt={product.title || product.name}/>
            <h2><Link to={`/product/${product_id}`}>{product.title || product.name}</Link></h2>
            <p>{reason}</p>
            <p>{product.sale_price ?? product.price} ₽</p>
            <Link to={`/product/${product_id}`}>Подробнее о товаре →</Link>
          </li>;
        })}</ul>
      </>}
      {!loading && <Link className="text-link" to={`/catalog?q=${encodeURIComponent(query)}`}>Обычный поиск →</Link>}
    </section>
  </div>;
}
