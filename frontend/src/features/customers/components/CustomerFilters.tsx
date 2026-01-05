import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { MembershipLevel } from '@/types/customer';

interface CustomerFiltersProps {
  searchQuery: string;
  membershipLevel?: MembershipLevel;
  selectedTags: string[];
  isActive?: boolean;
  availableTags: string[];
  onSearchChange: (query: string) => void;
  onMembershipLevelChange: (level: MembershipLevel | undefined) => void;
  onTagsChange: (tags: string[]) => void;
  onIsActiveChange: (isActive: boolean | undefined) => void;
}

const membershipLevels: { value: MembershipLevel; label: string; color: string }[] = [
  { value: 'BRONZE', label: 'Đồng', color: 'bg-amber-100 text-amber-800' },
  { value: 'SILVER', label: 'Bạc', color: 'bg-gray-100 text-gray-800' },
  { value: 'GOLD', label: 'Vàng', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PLATINUM', label: 'Bạch Kim', color: 'bg-purple-100 text-purple-800' },
];

const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchQuery,
  membershipLevel,
  selectedTags,
  isActive,
  availableTags,
  onSearchChange,
  onMembershipLevelChange,
  onTagsChange,
  onIsActiveChange,
}) => {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, số điện thoại, email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Membership Level Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ thành viên</label>
          <select
            value={membershipLevel || ''}
            onChange={(e) => onMembershipLevelChange(e.target.value ? (e.target.value as MembershipLevel) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả</option>
            {membershipLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Status Filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select
            value={isActive === undefined ? '' : isActive ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.target.value;
              onIsActiveChange(value === '' ? undefined : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFilters;

