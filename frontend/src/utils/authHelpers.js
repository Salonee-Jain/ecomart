export const getUserFromStorage = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const isAuthenticated = () => {
  return !!getUserFromStorage();
};

export const isAdmin = () => {
  const user = getUserFromStorage();
  return user && user.isAdmin;
};
