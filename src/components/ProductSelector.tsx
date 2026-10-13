import React, { useState } from 'react';
import { MockupProduct, ProductCategory } from '../types/mockup';
import { PRODUCTS } from '../data/products';
import { Coffee, Shirt, ShoppingBag, BookOpen, Layers } from 'lucide-react';

interface ProductSelectorProps {
  selectedProduct: MockupProduct;
  onSelectProduct: (product: MockupProduct) => void;
  productCountMap?: Record<string, number>;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProduct,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');

  const categories: { id: ProductCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Products', icon: Layers },
    { id: 'drinkware', label: 'Drinkware (Mugs & Tumblers)', icon: Coffee },
    { id: 'apparel', label: 'Apparel (T-Shirts & Hoodies)', icon: Shirt },
    { id: 'accessories', label: 'Accessories & Totes', icon: ShoppingBag },
    { id: 'stationery', label: 'Stationery & Stickers', icon: BookOpen },
  ];

  const filteredProducts = PRODUCTS.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Cards Horizontal / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {filteredProducts.map((p) => {
          const isSelected = selectedProduct.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className={`group relative p-3 rounded-2xl border text-left transition flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
              }`}
            >
              {/* Product Badge */}
              {p.badge && (
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-md mb-2 w-fit">
                  {p.badge}
                </span>
              )}

              {/* Title & Category */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 transition">
                  {p.shortName}
                </h4>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                  {p.tagline.split(' ')[0]} {p.tagline.split(' ')[1] || ''}
                </p>
              </div>

              {/* Small color dot indicators */}
              <div className="flex items-center gap-1 mt-3">
                {p.availableColors.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {p.availableColors.length > 4 && (
                  <span className="text-[9px] text-zinc-400">+{p.availableColors.length - 4}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
