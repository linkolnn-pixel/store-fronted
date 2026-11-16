import { useState } from 'react';

function CategoryOptions({ nodes, activeCategory, select, depth = 0 }) {
  return <ul className="filter-category-list">
    {nodes.map(node => <li key={node.id}>
      <button type="button" className={activeCategory === String(node.id) ? 'is-active' : ''} aria-pressed={activeCategory === String(node.id)} style={{ paddingLeft: `${12 + depth * 18}px` }} onClick={() => select(node.id)}>
        {depth > 0 && <span className="filter-tree-mark" aria-hidden="true">↳</span>}{node.name}
      </button>
      {node.children.length > 0 && <CategoryOptions nodes={node.children} activeCategory={activeCategory} select={select} depth={depth + 1}/>}
    </li>)}
  </ul>;
}

export default function CatalogFilters({ categories, brands, activeCategory, setActiveCategory, activeBrand, setActiveBrand, query, setQuery, reset, activeCount, disabled }) {
  const [expanded, setExpanded] = useState(false);
  return <aside className="catalog-sidebar" aria-label="Фильтры каталога">
    <button className="catalog-filter-toggle" type="button" aria-controls="catalog-filter-content" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 6h18M6 12h12M9 18h6"/></svg>
      Фильтры{activeCount > 0 && <span className="filter-count">{activeCount}</span>}<span className="filter-toggle-sign" aria-hidden="true">{expanded ? '−' : '+'}</span>
    </button>
    <div id="catalog-filter-content" className={`catalog-filter-content ${expanded ? 'is-expanded' : ''}`}>
      <div className="filter-heading"><h2>Фильтры</h2><button type="button" onClick={reset} disabled={!activeCount}>Сбросить{activeCount > 0 ? ` (${activeCount})` : ''}</button></div>
      <div className="filter-section filter-search"><label htmlFor="catalog-filter-search">Поиск</label><input id="catalog-filter-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Средство или бренд"/></div>
      <details className="filter-section" open>
        <summary>Категории</summary>
        <fieldset disabled={disabled}><legend className="visually-hidden">Категории</legend>
          <button className={`filter-all-categories ${activeCategory === null ? 'is-active' : ''}`} type="button" aria-pressed={activeCategory === null} onClick={() => setActiveCategory(null)}>Все товары</button>
          <CategoryOptions nodes={categories} activeCategory={activeCategory} select={setActiveCategory}/>
        </fieldset>
      </details>
      {brands.length > 0 && <details className="filter-section" open><summary>Бренды</summary><fieldset disabled={disabled} className="filter-brand-list"><legend className="visually-hidden">Бренды</legend>
        <label><input type="radio" name="catalog-brand" checked={activeBrand === null} onChange={() => setActiveBrand(null)}/><span>Все бренды</span></label>
        {brands.map(brand => <label key={brand}><input type="radio" name="catalog-brand" checked={activeBrand === brand} onChange={() => setActiveBrand(brand)}/><span>{brand}</span></label>)}
      </fieldset></details>}
    </div>
  </aside>;
}
