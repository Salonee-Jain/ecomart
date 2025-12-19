import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '1rem',
      textAlign: 'center'
    }}>
      <Link to={`/products/${product._id}`}>
        <img 
          src={product.image} 
          alt={product.name}
          style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
        />
      </Link>
      <h3 style={{ margin: '1rem 0 0.5rem' }}>{product.name}</h3>
      <p style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.2rem' }}>
        {formatPrice(product.price)}
      </p>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>
        ⭐ Eco Rating: {product.sustainabilityRating}/5
      </p>
      <button 
        onClick={handleAddToCart}
        style={{ 
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#2ecc71',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
