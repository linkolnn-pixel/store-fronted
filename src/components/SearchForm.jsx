import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchForm.css';

export default function SearchForm({ inputRef, initialQuery = '', initialAI = false, onSearch, panel = false }) {
  const [query, setQuery] = useState(initialQuery);
  const [ai, setAI] = useState(initialAI);
  const navigate = useNavigate();

  return <form id={panel ? 'header-search' : undefined} className={panel ? 'header-panel search-panel' : 'ai-search-form'} onSubmit={event => {
    event.preventDefault();
    navigate(`${ai ? '/ai-search' : '/catalog'}?q=${encodeURIComponent(query.trim())}`);
    onSearch?.();
  }}>
    <div className="search-input-row">
      <button className="search-submit" type="submit" aria-label={ai ? 'Подобрать товары с AI' : 'Найти товары'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
      </button>
      <input className="search-query" id={panel ? 'product-search' : 'ai-product-search'} ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder={ai ? 'Опишите, что ищете…' : 'Поиск товаров...'} aria-label={ai ? 'Запрос для AI-поиска' : 'Поиск товаров'} type="search" required={ai} minLength={ai ? 3 : undefined} maxLength={ai ? 500 : undefined}/>
      <label className="ai-search-toggle">
        <span aria-hidden="true">+ AI</span>
        <input type="checkbox" role="switch" aria-label="AI-поиск" checked={ai} onChange={event => setAI(event.target.checked)}/>
        <span className="ai-search-switch" aria-hidden="true"/>
      </label>
    </div>
  </form>;
}
