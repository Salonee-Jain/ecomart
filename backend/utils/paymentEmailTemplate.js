export const paymentSuccessTemplate = (order) => {
  return `
    <h2>🎉 Payment Successful</h2>
    <p>Hi, thank you for your purchase!</p>

    <p>Your order <strong>${order._id}</strong> has been successfully paid.</p>

    <h3>Order Summary:</h3>
    <ul>
      ${order.orderItems
        .map(
          (item) =>
            `<li>${item.name} — ${item.quantity} × $${item.price}</li>`
        )
        .join("")}
    </ul>

    <p><strong>Total:</strong> $${order.totalPrice}</p>

    <p>We will notify you once it is shipped.</p>

    <br/>
    <p>— EcoMart Team</p>
  `;
};
