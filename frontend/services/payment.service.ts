import api from "./api";

export const createPaymentIntent = (orderId: string) =>
  api.post("/payment/create-intent", { orderId });
