import React from 'react';
import { SortOption } from '../types';
import { SlidersHorizontal, Check, ArrowUpDown } from 'lucide-react';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  showOutOfStock: boolean;
  onToggleOutOfStock: (show: boolean) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalProductsCount: number;
  filteredCount: number;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  showOutOfStock,
  onToggleOutOfStock,
  sortOption,
  onSortChange,
  totalProductsCount,
  filteredCount,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-3 sm:p-4 mb-5 sm:mb-6">
      {/* Category Tabs with horizontal scroll on mobile - Vibrant Palette style pills */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
        <button
          id="cat-all"
          onClick={() => onSelectCategory('Semua')}
          className={`shrink-0 whitespace-nowrap px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            selectedCategory === 'Semua'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'bg-white text-slate-600 font-medium hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🌾 Semua Kategori</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
            selectedCategory === 'Semua' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {totalProductsCount}
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          let icon = '📦';
          if (cat.toLowerCase().includes('beras')) icon = '🍚';
          else if (cat.toLowerCase().includes('minyak')) icon = '🛢️';
          else if (cat.toLowerCase().includes('telur')) icon = '🥚';
          else if (cat.toLowerCase().includes('minum')) icon = '🧃';
          else if (cat.toLowerCase().includes('bumbu')) icon = '🧂';
          else if (cat.toLowerCase().includes('sabun') || cat.toLowerCase().includes('cuci')) icon = '🧼';
          else if (cat.toLowerCase().includes('snack') || cat.toLowerCase().includes('makan')) icon = '🍪';

          return (
            <button
              key={cat}
              id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 whitespace-nowrap px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 font-medium hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{icon} {cat}</span>
            </button>
          );
        })}
      </div>

      {/* Sub controls: Filter Out of Stock & Sort Options */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 hover:text-slate-900 font-medium text-xs">
            <input
              id="toggle-out-of-stock"
              type="checkbox"
              checked={showOutOfStock}
              onChange={(e) => onToggleOutOfStock(e.target.checked)}
              className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Tampilkan Stok Habis</span>
          </label>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500">
            Menampilkan <strong className="text-slate-800">{filteredCount}</strong> barang
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Urutkan:</span>
          </div>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="featured">Paling Populer</option>
            <option value="price_asc">Harga: Termurah</option>
            <option value="price_desc">Harga: Termahal</option>
            <option value="name_asc">Nama: A - Z</option>
            <option value="stock_desc">Stok Terbanyak</option>
          </select>
        </div>
      </div>
    </div>
  );
};
