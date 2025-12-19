import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#2ecc71' }}>
        Welcome to EcoMart 🌿
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '2rem' }}>
        Your destination for sustainable and eco-friendly products
      </p>
      <Link 
        to="/products"
        style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          backgroundColor: '#2ecc71',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '1.1rem'
        }}
      >
        Shop Now
      </Link>
      <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '4rem auto' }}>
        <div style={{ padding: '2rem', backgroundColor: '#ecf0f1', borderRadius: '8px' }}>
          <h3>🌍 Eco-Friendly</h3>
          <p>All products are sourced sustainably</p>
        </div>
        <div style={{ padding: '2rem', backgroundColor: '#ecf0f1', borderRadius: '8px' }}>
          <h3>♻️ Recyclable</h3>
          <p>Minimal waste packaging</p>
        </div>
        <div style={{ padding: '2rem', backgroundColor: '#ecf0f1', borderRadius: '8px' }}>
          <h3>🌱 Organic</h3>
          <p>Natural and chemical-free</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
