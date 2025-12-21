import api from "./api";

export const getProducts = async (params?: {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get("/products", { params });
  return res.data;
};


export const getProductById = (id: string) =>
  api.get(`/products/${id}`);

export const getCategories = async () => {
  const res = await api.get("/products/categories");
  return res.data;
};

