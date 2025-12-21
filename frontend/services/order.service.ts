import api from "./api";

export const createOrder = (data: any) =>
  api.post("/orders", data);

export const getMyOrders = () =>
  api.get("/orders/my");
