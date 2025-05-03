import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface TagFilterDropdownProps {
  uniqueTags: string[];
  selectedTags: string[];
  toggleTagSelection: (tag: string) => void;
}

const TagFilterDropdown: React.FC<TagFilterDropdownProps> = ({
  uniqueTags,
  selectedTags,
  toggleTagSelection
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Tags ({selectedTags.length})</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-56 rounded-md bg-white shadow-lg">
          <div className="max-h-60 overflow-auto p-2">
            <div className="space-y-1">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedTags.length === uniqueTags.length}
                  onChange={() => toggleTagSelection("Todas as tags")}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span>Todas as tags</span>
              </label>

              {uniqueTags.map((tag) => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTagSelection(tag)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagFilterDropdown; 