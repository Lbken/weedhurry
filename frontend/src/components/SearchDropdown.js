import React, { useState } from 'react';
import { Dropdown, Form, Button } from 'react-bootstrap';
import './SearchDropdown.css';

const SearchDropdown = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sativa: false,
    hybrid: false,
    indica: false,
  });

  const handleButtonToggle = (classification) => {
    const updatedFilters = {
      ...filters,
      [classification]: !filters[classification],
    };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  // Custom toggle component to remove the dropdown arrow
  const CustomToggle = React.forwardRef(({ onClick }, ref) => (
    <button
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="btn btn-link"
      style={{
        border: 'none',
        background: 'none',
        padding: '6px 10px',
        color: '#6c757d',
        textDecoration: 'none',
        boxShadow: 'none',
      }}
    >
      <i className="bi bi-search"></i>
    </button>
  ));

  return (
    <div style={{ position: 'relative' }}>
      <Dropdown>
        <Dropdown.Toggle
          as={CustomToggle}
          id="search-dropdown"
        />
        
        <Dropdown.Menu
          className="p-3 search-dropdown-menu"
          style={{
            minWidth: '300px',
            position: 'fixed',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '0px solid #ddd',
            marginTop: '5px',
          }}
        >
          {/* Search Input */}
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search by brand or product name"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Form.Group>

          {/* Classification Filter Buttons */}
          <div className="d-flex justify-content-between">
            <Button
              variant={filters.sativa ? 'secondary' : 'outline-secondary'}
              className="flex-grow-1 mx-1"
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                lineHeight: '1.2',
                borderRadius: '8px',
              }}
              onClick={() => handleButtonToggle('sativa')}
            >
              Sativa
            </Button>
            <Button
              variant={filters.hybrid ? 'secondary' : 'outline-secondary'}
              className="flex-grow-1 mx-1"
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                lineHeight: '1.2',
                borderRadius: '8px',
              }}
              onClick={() => handleButtonToggle('hybrid')}
            >
              Hybrid
            </Button>
            <Button
              variant={filters.indica ? 'secondary' : 'outline-secondary'}
              className="flex-grow-1 mx-1"
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                lineHeight: '1.2',
                borderRadius: '8px',
              }}
              onClick={() => handleButtonToggle('indica')}
            >
              Indica
            </Button>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default SearchDropdown;