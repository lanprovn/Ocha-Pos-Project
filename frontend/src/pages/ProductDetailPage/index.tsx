import React from 'react';
import { useProductDetail } from './hooks/useProductDetail';
import { ProductNotFound } from './components/ProductNotFound';
import { ProductImage } from './components/ProductImage';
import { ProductInfo } from './components/ProductInfo';
import { SizeSelector } from './components/SizeSelector';
import { ToppingSelector } from './components/ToppingSelector';
import { QuantitySelector } from './components/QuantitySelector';
import { NoteInput } from './components/NoteInput';
import { TotalPriceDisplay } from './components/TotalPriceDisplay';
import { AddToCartButton } from './components/AddToCartButton';

const ProductDetailPage: React.FC = () => {
  const {
    product,
    isCustomerDisplay,
    navigate,
    state,
    setSelectedSize,
    setQuantity,
    setNote,
    handleToppingToggle,
    handleAddToCart
  } = useProductDetail();

  if (!product) {
    return (
      <ProductNotFound
        isCustomerDisplay={isCustomerDisplay}
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Category Filter */}
      <div className="lg:hidden mb-6">
        <div className="flex overflow-x-auto pb-2">
          <button
            onClick={() => {}}
            className="flex-shrink-0 px-4 py-2 rounded-full mr-2 transition-all duration-300 bg-orange-500 text-white"
          >
            Chi tiết sản phẩm
          </button>
        </div>
      </div>

      {/* Product Detail Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductImage product={product} />

          <div className="space-y-6">
            <ProductInfo product={product} />

            <SizeSelector
              sizes={product.sizes || []}
              selectedSize={state.selectedSize}
              onSelectSize={setSelectedSize}
            />

            <ToppingSelector
              toppings={product.toppings || []}
              selectedToppings={state.selectedToppings}
              onToggleTopping={handleToppingToggle}
            />

            <QuantitySelector
              quantity={state.quantity}
              onDecrease={() => setQuantity(Math.max(1, state.quantity - 1))}
              onIncrease={() => setQuantity(state.quantity + 1)}
            />

            <NoteInput
              note={state.note}
              onNoteChange={setNote}
            />

            <TotalPriceDisplay
              product={product}
              selectedSize={state.selectedSize}
              selectedToppings={state.selectedToppings}
              quantity={state.quantity}
            />

            <AddToCartButton onAddToCart={handleAddToCart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

