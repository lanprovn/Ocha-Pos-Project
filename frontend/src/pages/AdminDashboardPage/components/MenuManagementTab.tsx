import React from 'react';
import ProductManagementTab from '../../MenuManagementPage/components/ProductManagementTab';
import CategoryManagementTab from '../../MenuManagementPage/components/CategoryManagementTab';
import { useState } from 'react';

const MenuManagementTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories'>('products');

  return (
    <div>
      {/* Sub Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Sub Tabs">
            <button
              onClick={() => setActiveSubTab('products')}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeSubTab === 'products'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Sản Phẩm
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeSubTab === 'categories'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Danh Mục
            </button>
          </nav>
        </div>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'products' && <ProductManagementTab />}
      {activeSubTab === 'categories' && <CategoryManagementTab />}
    </div>
  );
};

export default MenuManagementTab;

