import React from 'react';

interface TagFilterDropdownProps {
  uniqueTags: string[]; 
  selectedTags: string[]; 
  toggleTagSelection: (tag: string) => void; 
}

const TagFilterDropdown: React.FC<TagFilterDropdownProps> = ({ uniqueTags, selectedTags, toggleTagSelection }) => {
  return (
    <div>
      {uniqueTags.map((tag: string, index: number) => (
        <div key={index}>
          <input
            type="checkbox"
            checked={selectedTags.includes(tag)}
            onChange={() => toggleTagSelection(tag)}
          />
          {tag}
        </div>
      ))}
    </div>
  );
};

export default TagFilterDropdown;
