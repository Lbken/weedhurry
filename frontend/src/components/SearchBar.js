import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import './SearchBar.css';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <InputGroup className="ms-0 position-relative search-container" style={{width: '320px'}}>
      <Form.Control
        type="text"
        placeholder="Strains, brands, products..."
        className={`form-control rounded-pill me-2 search-input ${isFocused ? 'focused' : ''}`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <span
        className={`position-absolute top-50 start-0 translate-middle-y ps-3 search-icon ${
          isFocused ? 'focused' : ''
        }`}
      >
        <i className="bi bi-search"></i>
      </span>
    </InputGroup>
  );
};

export default SearchBar;