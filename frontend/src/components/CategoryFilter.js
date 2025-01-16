import React from 'react';
import SearchDropdown from './SearchDropdown';

const CategoryFilter = ({ selectedCategory, onCategoryChange, onSearch, onFilter }) => {
  const categories = ['All', 'Flower', 'Pre-roll', 'Vape', 'Edible', 'Extract', 'Misc'];

  return (
    <div
      className="category-filter sticky-top border"
      style={{
        backgroundColor: '#F1F1F1',
        padding: '0.3rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        position: 'sticky',
        top: '0',
        zIndex: 5,
        height: '50px',
      }}
    >
      {/* Search Dropdown Container */}
      <div style={{ position: 'relative' }}>
        <SearchDropdown
          onSearch={onSearch}
          onFilter={onFilter}
          style={{
            fontSize: '0.85rem',
            height: '25px',
          }}
        />
      </div>

      {/* Category Links */}
      <div
        style={{
          display: 'flex',
          gap: '0.9rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          flexGrow: 1,
        }}
      >
        {categories.map((category) => (
          <span
            key={category}
            onClick={() => onCategoryChange(category)}
            style={{
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: selectedCategory === category ? 'bold' : 'normal',
              color: selectedCategory === category ? '#242424' : '#4E4E4E',
              textTransform: 'uppercase',
              borderBottom: selectedCategory === category ? '2px solid #242424' : 'none',
              paddingBottom: '0.2rem',
              transition: 'color 0.3s ease, border-bottom 0.3s ease',
            }}
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;