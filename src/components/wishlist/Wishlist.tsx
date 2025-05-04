import WishlistItem from "./WishlistItem";

export default function WishlistList({ items, onRemoveItem, onAddToCart, isUpdating }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">
        Saved Items ({items.length})
      </h2>
      
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <WishlistItem
            key={item.id}
            item={item}
            onRemoveItem={onRemoveItem}
            onAddToCart={onAddToCart}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
