export interface PricingBreakdown {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface CartItem {
  price: number;
  quantity: number;
}

// Tax rates by region (in Australia, GST is 10%)
export const TAX_RATES: Record<string, number> = {
  AUS: 0.10, // 10% GST
  USA: 0.07, // Example: 7% average sales tax
  UK: 0.20,  // 20% VAT
  CA: 0.13,  // 13% HST (average)
};

// Shipping cost calculation based on order total
export const calculateShipping = (subtotal: number, country: string = "AUS"): number => {
  // Free shipping over $100
  if (subtotal >= 100) {
    return 0;
  }
  
  // Standard shipping rates by country
  const shippingRates: Record<string, number> = {
    AUS: 8.99,
    USA: 12.99,
    UK: 9.99,
    CA: 11.99,
  };
  
  return shippingRates[country] || 10.00;
};

// Calculate tax based on subtotal and country
export const calculateTax = (subtotal: number, country: string = "AUS"): number => {
  const taxRate = TAX_RATES[country] || 0;
  return subtotal * taxRate;
};

// Apply discount code
export const applyDiscount = (subtotal: number, discountCode?: string): number => {
  if (!discountCode) return 0;
  
  // Example discount codes
  const discounts: Record<string, number> = {
    WELCOME10: 0.10,    // 10% off
    SAVE20: 0.20,       // 20% off
    FREESHIP: 0,        // Free shipping (handled separately)
    SALE15: 0.15,       // 15% off
  };
  
  const discountRate = discounts[discountCode.toUpperCase()] || 0;
  return subtotal * discountRate;
};

// Main pricing calculation function
export const calculatePricing = (
  items: CartItem[],
  country: string = "AUS",
  discountCode?: string
): PricingBreakdown => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate discount
  const discount = applyDiscount(subtotal, discountCode);
  
  // Calculate subtotal after discount
  const subtotalAfterDiscount = subtotal - discount;
  
  // Calculate tax on discounted subtotal
  const tax = calculateTax(subtotalAfterDiscount, country);
  
  // Calculate shipping (free if code is FREESHIP)
  let shipping = calculateShipping(subtotalAfterDiscount, country);
  if (discountCode?.toUpperCase() === "FREESHIP") {
    shipping = 0;
  }
  
  // Calculate total
  const total = subtotalAfterDiscount + tax + shipping;
  
  return {
    subtotal,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

// Format price with currency symbol
export const formatPrice = (price: number, currency: string = "AUD"): string => {
  const symbols: Record<string, string> = {
    AUD: "$",
    USD: "$",
    GBP: "£",
    CAD: "$",
  };
  
  const symbol = symbols[currency] || "$";
  return `${symbol}${price.toFixed(2)}`;
};

// Validate discount code
export const validateDiscountCode = (code: string): { valid: boolean; message: string } => {
  const validCodes = ["WELCOME10", "SAVE20", "FREESHIP", "SALE15"];
  
  if (!code) {
    return { valid: false, message: "Please enter a discount code" };
  }
  
  if (validCodes.includes(code.toUpperCase())) {
    return { valid: true, message: "Discount code applied successfully!" };
  }
  
  return { valid: false, message: "Invalid discount code" };
};
