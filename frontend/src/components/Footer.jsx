const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#34495e', 
      color: 'white', 
      padding: '2rem', 
      marginTop: 'auto',
      textAlign: 'center' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p>&copy; 2024 EcoMart. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Sustainable shopping for a better tomorrow 🌍
        </p>
      </div>
    </footer>
  );
};

export default Footer;
