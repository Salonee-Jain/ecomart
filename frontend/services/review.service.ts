import api from "./api";

export const createReview = async (productId: string, data: { rating: number; comment: string }) => {
    const res = await api.post(`/products/${productId}/reviews`, data);
    return res.data;
};

export const updateReview = async (
    productId: string,
    reviewIndex: number,
    data: { rating: number; comment: string }
) => {
    const res = await api.put(`/products/${productId}/reviews/${reviewIndex}`, data);
    return res.data;
};

export const deleteReview = async (productId: string, reviewIndex: number) => {
    const res = await api.delete(`/products/${productId}/reviews/${reviewIndex}`);
    return res.data;
};
