import api from "./api";

export const getProducts = (params?: any) =>
  api.get("/products", { params });

export const getProductById = (id: string) =>
  api.get(`/products/${id}`);

