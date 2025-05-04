import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ quantity, onUpdate, min = 1, max = 99, disabled = false }) {
  const handleIncrement = () => {
    if (quantity < max && !disabled) {
      onUpdate(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > min && !disabled) {
      onUpdate(quantity - 1);
    }
  };

  return (
    <div className="flex items-center border border-gray-200 rounded-md">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min || disabled}
        className={`p-2 ${
          quantity <= min || disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:text-primary'
        }`}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      
      <span className="w-10 text-center font-medium text-gray-700">
        {quantity}
      </span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max || disabled}
        className={`p-2 ${
          quantity >= max || disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:text-primary'
        }`}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
