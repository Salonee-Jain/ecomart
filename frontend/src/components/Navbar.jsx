import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#2ecc71', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>
          🌿 EcoMart
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link>
          <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>
            Cart ({items.length})
          </Link>
          {userInfo ? (
            <>
              {userInfo.isAdmin && (
                <Link to="/admin/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
              )}
              <span>{userInfo.name}</span>
              <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
