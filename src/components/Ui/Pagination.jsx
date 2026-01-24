import React from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

/**
 * Componente CustomPagination
 * Componente de paginación reutilizable basado en Material UI.
 *
 * @param {Object} props
 * @param {number} props.page - Página actual (1-indexed).
 * @param {number} props.total - Número total de elementos.
 * @param {number} props.limit - Elementos por página.
 * @param {Function} props.onPageChange - Callback al cambiar la página.
 */
export default function CustomPagination({ page, total, limit, onPageChange }) {
  // Calcular número total de páginas
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
