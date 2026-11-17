export function categoryTree(data) {
  const rows = Array.isArray(data) ? data : data?.results || [];
  const nodes = new Map();
  function collect(items, parent = null) {
    items.forEach(item => {
      const value = item.parent_id ?? item.parent ?? parent;
      nodes.set(String(item.id), { ...item, parentId: value && typeof value === 'object' ? value.id : value, children: [] });
      collect(item.children || item.subcategories || [], item.id);
    });
  }
  collect(rows);
  const roots = [];
  nodes.forEach(node => {
    const parent = nodes.get(String(node.parentId));
    if (parent && parent !== node) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}
export function categoryIds(node) {
  return [String(node.id), ...node.children.flatMap(categoryIds)];
}

export const NEW_ARRIVALS_CATEGORY = { id: 'new-arrivals', name: 'Новинки', children: [] };
