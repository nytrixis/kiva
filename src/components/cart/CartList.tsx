import CartItem from "./CartItem";

export default function CartList({ items, onUpdateQuantity, onRemoveItem, isUpdating }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">
        Items in Your Cart ({items.length})
      </h2>
      
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
