import api from "./api";

export const getProducts = async (params?: {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: "latest" | "price_asc" | "price_desc";
}) => {
  const res = await api.get("/products", { params });
  return res.data;
};


export const getProductById = (id: string) =>
  api.get(`/products/${id}`);

