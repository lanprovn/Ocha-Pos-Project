// Stock Modal hook
import { useState } from 'react';
import toast from 'react-hot-toast';
import stockService from '@services/stock.service.ts';
import type { StockProduct } from '@services/stock.service.ts';
import type { IngredientStock } from '../../../utils/ingredientManagement';

export const useStockModal = (
  reloadData: () => void,
  reloadIngredients: () => void
) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientStock | null>(null);
  const [forceAdjustMode, setForceAdjustMode] = useState<boolean | undefined>(undefined);

  const handleAddStock = async (quantity: number, reason: string, isAdjustMode: boolean) => {
    if (!selectedProduct) return;

    try {
      if (isAdjustMode) {
        await stockService.updateProductStock(selectedProduct.id, { quantity });
        toast.success(`Đã điều chỉnh tồn kho thành ${quantity} ${selectedProduct.unit}`);
      } else {
        await stockService.createTransaction({
          productId: selectedProduct.productId,
          type: 'purchase',
          quantity,
          reason: reason || 'Nhập hàng',
        });
        toast.success(`Đã nhập ${quantity} ${selectedProduct.unit} cho sản phẩm`);
      }
      
      reloadData();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Lỗi khi thực hiện thao tác');
    }
  };

  const handleAddIngredientStock = async (quantity: number, reason: string, isAdjustMode: boolean) => {
    if (!selectedIngredient) return;

    try {
      if (isAdjustMode) {
        await stockService.updateIngredientStock(selectedIngredient.id, { quantity });
        toast.success(`Đã điều chỉnh tồn kho thành ${quantity} ${selectedIngredient.unit}`);
      } else {
        await stockService.createTransaction({
          ingredientId: selectedIngredient.id,
          type: 'purchase',
          quantity,
          reason: reason || 'Nhập nguyên liệu',
        });
        toast.success(`Đã nhập ${quantity} ${selectedIngredient.unit} cho nguyên liệu`);
      }
      
      reloadIngredients();
      setSelectedIngredient(null);
    } catch (error) {
      console.error('Error updating ingredient stock:', error);
      toast.error('Lỗi khi thực hiện thao tác');
    }
  };

  const handleOpenModal = (product?: StockProduct, ingredient?: IngredientStock, adjustMode?: boolean) => {
    if (product) {
      setSelectedProduct(product);
      setSelectedIngredient(null);
    } else if (ingredient) {
      setSelectedIngredient(ingredient);
      setSelectedProduct(null);
    }
    setForceAdjustMode(adjustMode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setSelectedIngredient(null);
    setForceAdjustMode(undefined);
  };

  const handleConfirm = (quantity: number, reason: string, isAdjustMode: boolean) => {
    if (selectedProduct) {
      handleAddStock(quantity, reason, isAdjustMode);
    } else if (selectedIngredient) {
      handleAddIngredientStock(quantity, reason, isAdjustMode);
    }
  };

  return {
    showModal,
    selectedProduct,
    selectedIngredient,
    forceAdjustMode,
    handleOpenModal,
    handleCloseModal,
    handleConfirm,
  };
};

