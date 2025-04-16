import React from 'react';
import Option from '@/components/main/Search/Option';

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