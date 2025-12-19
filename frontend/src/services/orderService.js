import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await api.get('/orders/myorders');
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const createPaymentIntent = async (amount) => {
  const response = await api.post('/payment/create-intent', { amount });
  return response.data;
};
