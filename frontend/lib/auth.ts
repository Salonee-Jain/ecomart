interface TokenData {
  token: string;
  expiresAt: number;
}

export const saveToken = (token: string, expiresIn: number = 86400) => {
  // expiresIn is in seconds, default 24 hours
  if (typeof window !== 'undefined') {
    const expiresAt = Date.now() + expiresIn * 1000;
    const tokenData: TokenData = { token, expiresAt };
    localStorage.setItem('token', JSON.stringify(tokenData));
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('token');
    
    if (!stored) return null;
    
    try {
      // Try to parse as TokenData first
      const tokenData: TokenData = JSON.parse(stored);
      
      // Check if token is expired
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        removeToken();
        return null;
      }
      
      return tokenData.token;
    } catch {
      // If parsing fails, it's an old plain token string
      return stored;
    }
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const isTokenExpired = (): boolean => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('token');
    
    if (!stored) return true;
    
    try {
      const tokenData: TokenData = JSON.parse(stored);
      return tokenData.expiresAt ? Date.now() > tokenData.expiresAt : false;
    } catch {
      return false;
    }
  }
  return true;
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

// Axios/fetch interceptor helper
export const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?expired=true';
    }
    throw new Error('Session expired. Please login again.');
  }
  return response;
};
