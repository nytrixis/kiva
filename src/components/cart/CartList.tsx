import CartItem from "./CartItem";

interface CartListProps {
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
      discountPercentage: number;
      images: string[];
      stock: number;
      category?: {
        name: string;
      };
      seller?: {
        name: string;
      };
    };
    quantity: number;
  }>;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  isUpdating: boolean;
}

export default function CartList({ items, onUpdateQuantity, onRemoveItem, isUpdating }: CartListProps) {
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
