import React, { useState } from 'react';

interface TagFilterDropdownProps {
  uniqueTags: string[];
  selectedTags: string[];
  toggleTagSelection: (tag: string) => void;
}

const TagFilterDropdown: React.FC<TagFilterDropdownProps> = ({
  uniqueTags,
  selectedTags,
  toggleTagSelection,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 flex items-center gap-2"
      >
        <span>Filtrar por Tags</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-full rounded-md bg-white shadow-lg border border-gray-200">
          <div className="max-h-60 overflow-y-auto p-2">
            <ul className="space-y-2">
              {uniqueTags.map((tag, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTagSelection(tag)}
                    className="h-4 w-4 text-blue-600 focus:ring-0"
                  />
                  <span className="text-sm text-gray-700">{tag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagFilterDropdown;
