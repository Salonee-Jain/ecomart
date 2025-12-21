import api from "./api";

export const getWishlist = async () => {
    const res = await api.get("/wishlist");
    return res.data;
};

export const addToWishlist = async (productId: string) => {
    const res = await api.post(`/wishlist/${productId}`);
    return res.data;
};

export const removeFromWishlist = async (productId: string) => {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data;
};

export const clearWishlist = async () => {
    const res = await api.delete("/wishlist");
    return res.data;
};
