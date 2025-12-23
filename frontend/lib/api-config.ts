// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to build API URLs
export const getApiUrl = (path: string): string => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Remove /api prefix if present (since baseURL already includes it)
    const finalPath = cleanPath.startsWith('api/') ? cleanPath.slice(4) : cleanPath;
    return `${API_BASE_URL}/${finalPath}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,

    // Products
    PRODUCTS: `${API_BASE_URL}/products`,
    PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/products/${id}`,
    CATEGORIES: `${API_BASE_URL}/products/categories`,

    // Cart
    CART: `${API_BASE_URL}/cart`,
    CART_ITEM: (productId: string) => `${API_BASE_URL}/cart/${productId}`,
    CART_CLEAR: `${API_BASE_URL}/cart/clear`,

    // Orders
    ORDERS: `${API_BASE_URL}/orders`,
    MY_ORDERS: `${API_BASE_URL}/orders/my`,
    ORDER_BY_ID: (id: string) => `${API_BASE_URL}/orders/${id}`,
    CANCEL_ORDER: (id: string) => `${API_BASE_URL}/orders/${id}/cancel`,
    PAY_ORDER: (id: string) => `${API_BASE_URL}/orders/${id}/pay`,

    // Payment
    CREATE_PAYMENT_INTENT: `${API_BASE_URL}/payment/create-intent`,

    // Wishlist
    WISHLIST: `${API_BASE_URL}/wishlist`,

    // Admin - Database
    DATABASE_STATS: `${API_BASE_URL}/database/stats`,
    DATABASE_REFACTOR: `${API_BASE_URL}/database/refactor`,
    DATABASE_CLEAR: `${API_BASE_URL}/database/clear-all`,
    DATABASE_SEED: `${API_BASE_URL}/database/seed`,
};

export default API_BASE_URL;
