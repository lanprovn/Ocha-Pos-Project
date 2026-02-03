"use client";
import React from 'react';
import { formatPrice } from '@/utils/formatPrice';
import type { Product } from '@/types/product';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Image as ImageIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading && products.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-xl border border-dashed border-slate-200">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Đang đồng bộ dữ liệu sản phẩm...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center gap-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 mt-4">
        <div className="p-4 bg-white rounded-full shadow-sm">
          <Search className="w-10 h-10 text-slate-300" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-700">Không tìm thấy sản phẩm</h3>
          <p className="text-sm text-slate-400">Thử thay đổi bộ lọc hoặc thêm món mới vào menu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Hình ảnh</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Giá bán</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="group transition-all">
              <TableCell>
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                  {product.image ? (
                    <img
                      className="h-full w-full object-cover"
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.png';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-bold text-slate-800">{product.name}</div>
                {product.description && (
                  <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{product.description}</div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium text-[10px]">
                  {product.category || 'Chưa phân loại'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-bold text-slate-900">{formatPrice(product.price)}</div>
                {product.discount && product.discount > 0 && (
                  <Badge className="bg-rose-50 text-rose-600 border-rose-100 text-[9px] h-4 px-1 mt-1">
                    -{product.discount}%
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "font-mono font-bold",
                  (product.stock || 0) <= 5 ? "text-rose-500" : "text-slate-600"
                )}>
                  {product.stock !== undefined ? product.stock : '—'}
                </span>
              </TableCell>
              <TableCell>
                {product.isAvailable !== false ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700">Đang bán</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-xs font-bold text-slate-400">Ngừng bán</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product)}
                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
