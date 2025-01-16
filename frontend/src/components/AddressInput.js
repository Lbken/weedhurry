import React, { useState } from 'react';

const AddressInput = ({ onAddressSelect }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);


  const handleInputChange = async (e) => {
    try {
      setInput(e.target.value);
  
      if (e.target.value.length > 2) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(e.target.value)}&key=AIzaSyBpNm0WI_YNu8HKZMWZzfDZFwGuov7CUkY`
        );
        const data = await response.json();
  
        console.log('API Response:', data); // Check the structure here
  
        if (data.predictions && data.predictions.length > 0) {
          setSuggestions(data.predictions);
        } else {
          console.error('No predictions returned:', data);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error.message);
      setSuggestions([]);
    }
  };
  

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.description);
    setSuggestions([]);
    onAddressSelect(suggestion.description);
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Enter your address"
      />
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion.place_id} onClick={() => handleSuggestionClick(suggestion)}>
            {suggestion.description} &gt;
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddressInput;
