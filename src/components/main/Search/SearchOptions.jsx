// @/components/main/Search/SearchOptions.jsx
import React from 'react';
import Option from '@/components/main/Search/Option'; // Assuming Option is in the same directory

const SearchOptions = ({ options }) => {
  return (
    <ul>
      {options.map((option) => (
        <Option key={option.id || option.nombre} data={option.nombre} />
      ))}
    </ul>
  );
};

export default SearchOptions;