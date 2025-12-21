import api from "./api";

// Analytics
export const getAnalytics = async () => {
    const [orderAnalytics, productAnalytics, users] = await Promise.all([
        api.get("/orders/analytics"),
        api.get("/products/analytics"),
        api.get("/users"),
    ]);

    return {
        orders: orderAnalytics.data,
        products: productAnalytics.data,
        users: users.data,
    };
};

// User Management
export const getAllUsers = async () => {
    const res = await api.get("/users");
    return res.data;
};

export const updateUserRole = async (userId: string, isAdmin: boolean) => {
    const res = await api.put(`/users/${userId}/role`, { isAdmin });
    return res.data;
};

export const deleteUser = async (userId: string) => {
    const res = await api.delete(`/users/${userId}`);
    return res.data;
};

// Product Management
export const createProduct = async (data: any) => {
    const res = await api.post("/products", data);
    return res.data;
};

export const updateProduct = async (id: string, data: any) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
};

export const deleteProduct = async (id: string) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
};

export const bulkDeleteProducts = async (ids: string[]) => {
    const res = await api.post("/products/bulk-delete", { ids });
    return res.data;
};

// Order Management
export const getAllOrders = async () => {
    const res = await api.get("/orders");
    return res.data;
};

export const markOrderDelivered = async (id: string) => {
    const res = await api.put(`/orders/${id}/deliver`);
    return res.data;
};

// Payment Management
export const getAllPayments = async () => {
    const res = await api.get("/payment/all");
    return res.data;
};

export const confirmPayment = async (paymentIntentId: string) => {
    const res = await api.post(`/payment/confirm/${paymentIntentId}`, {
        paymentMethod: "pm_card_visa",
    });
    return res.data;
};

export const markPaymentSucceeded = async (paymentId: string) => {
    const res = await api.put(`/payment/${paymentId}/mark-succeeded`);
    return res.data;
};
