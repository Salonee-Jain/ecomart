import api from "./api";

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const addToCart = async (data: {
  productId: string;
  quantity: number;
}) => {
  const res = await api.post("/cart", data);
  return res.data;
};

export const updateCartItem = async (
  productId: string,
  quantity: number
) => {
  const res = await api.put(`/cart/${productId}`, { quantity });
  return res.data;
};

export const removeCartItem = async (productId: string) => {
  const res = await api.delete(`/cart/${productId}`);
  return res.data;
};
