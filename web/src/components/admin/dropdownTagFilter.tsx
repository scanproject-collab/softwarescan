import { useState } from "react";
import { ChevronDown } from "lucide-react";

const TagFilterDropdown = ({ uniqueTags, selectedTags, toggleTagSelection }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
      >
        Filtrar Tags
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border text-gray-700 border-gray-900 opacity1 z-10">
          <div className="p-2 max-h-60 overflow-y-auto">
            {uniqueTags.map((tag, index) => (
              <label key={index} className="flex items-center space-x-2 px-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleTagSelection(tag)}
                  className="form-checkbox"
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagFilterDropdown;
