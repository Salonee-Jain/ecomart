export default function ProductCard({ product }: any) {
  return (
    <div className="border rounded p-4">
      <img src={product.image} className="h-40 w-full object-cover" />
      <h2 className="font-bold">{product.name}</h2>
      <p>${product.price}</p>
      <button className="bg-green-600 text-white px-4 py-2 mt-2">
        Add to Cart
      </button>
    </div>
  );
}
