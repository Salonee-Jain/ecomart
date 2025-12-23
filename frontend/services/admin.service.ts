import api from "./api";
import { API_ENDPOINTS } from "@/lib/api-config";

// Analytics
export const getAnalytics = async () => {
    const [orderAnalytics, productAnalytics, users] = await Promise.all([
        api.get(API_ENDPOINTS.ORDER_ANALYTICS),
        api.get(API_ENDPOINTS.PRODUCT_ANALYTICS),
        api.get(API_ENDPOINTS.USERS),
    ]);

    return {
        orders: orderAnalytics.data,
        products: productAnalytics.data,
        users: users.data,
    };
};

// User Management
export const getAllUsers = async () => {
    const res = await api.get(API_ENDPOINTS.USERS);
    return res.data;
};

export const updateUserRole = async (userId: string, isAdmin: boolean) => {
    const res = await api.put(API_ENDPOINTS.USER_ROLE(userId), { isAdmin });
    return res.data;
};

export const deleteUser = async (userId: string) => {
    const res = await api.delete(API_ENDPOINTS.USER_BY_ID(userId));
    return res.data;
};

// Product Management
export const createProduct = async (data: any) => {
    const res = await api.post(API_ENDPOINTS.PRODUCTS, data);
    return res.data;
};

export const updateProduct = async (id: string, data: any) => {
    const res = await api.put(API_ENDPOINTS.PRODUCT_BY_ID(id), data);
    return res.data;
};

export const deleteProduct = async (id: string) => {
    const res = await api.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return res.data;
};

export const bulkDeleteProducts = async (ids: string[]) => {
    const res = await api.post(API_ENDPOINTS.BULK_DELETE_PRODUCTS, { ids });
    return res.data;
};

// Order Management
export const getAllOrders = async () => {
    const res = await api.get(API_ENDPOINTS.ORDERS);
    return res.data;
};

export const markOrderDelivered = async (id: string) => {
    const res = await api.put(API_ENDPOINTS.DELIVER_ORDER(id));
    return res.data;
};

// Payment Management
export const getAllPayments = async () => {
    const res = await api.get(API_ENDPOINTS.ALL_PAYMENTS);
    return res.data;
};

export const confirmPayment = async (paymentIntentId: string) => {
    const res = await api.post(API_ENDPOINTS.CONFIRM_PAYMENT(paymentIntentId), {
        paymentMethod: "pm_card_visa",
    });
    return res.data;
};

export const markPaymentSucceeded = async (paymentId: string) => {
    const res = await api.put(API_ENDPOINTS.MARK_PAYMENT_SUCCEEDED(paymentId));
    return res.data;
};
