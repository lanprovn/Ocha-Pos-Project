import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface CategoryFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm danh mục..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
      </div>
    </div>
  );
};

export default CategoryFilters;

