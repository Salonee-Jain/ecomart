import api from "./api";

export const getCart = () => api.get("/cart");

export const addToCart = (data: any) =>
  api.post("/cart", data);

export const updateCartItem = (productId: string, quantity: number) =>
  api.put(`/cart/${productId}`, { quantity });

export const removeCartItem = (productId: string) =>
  api.delete(`/cart/${productId}`);
