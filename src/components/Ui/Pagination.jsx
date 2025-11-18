import React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function CustomPagination({ page, total, limit, onPageChange }) {
  const pageCount = Math.ceil(total / limit);

  const handleChange = (event, value) => {
    onPageChange(value);
  };

  return (
    <Stack spacing={2} sx={{ padding: "20px 0", alignItems: "center" }}>
      <Pagination
        count={pageCount}
        page={page}
        onChange={handleChange}
        color="primary"
      />
    </Stack>
  );
}
