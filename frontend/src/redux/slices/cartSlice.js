import { createSlice } from '@reduxjs/toolkit';

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: cartItemsFromStorage,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.items.find((x) => x._id === item._id);

      if (existItem) {
        state.items = state.items.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.items.push(item);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((x) => x._id !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
