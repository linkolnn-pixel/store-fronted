
import { BACKEND_URL } from '../api';

export const ProductCard = ({ product }) => {
    // Формируем правильную ссылку на картинку
    const imageUrl = product.images && product.images.length > 0
        ? `${BACKEND_URL}${product.images[0]}`
        : '/placeholder.jpg';

    return (
        <div className="product-card" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px' }}>
            <img src={imageUrl} alt={product.title || product.name} width="200" height="200" style={{ objectFit: 'cover' }} />
            <h3>{product.title || product.name}</h3>
            <p>Цена: {product.price} руб.</p>
            <button>В корзину</button>
        </div>
    );
};