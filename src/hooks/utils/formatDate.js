/**
 * Formatea una fecha dada al formato local de España (DD/MM/AAAA).
 * Intenta parsear cadenas con formato YYYY-MM-DD manualmente para evitar problemas de zona horaria.
 *
 * @param {string|Date} date - La fecha a formatear.
 * @returns {string} La fecha formateada o una cadena vacía si la fecha no es válida.
 */
const formatDate = (date) => {
  if (!date) return "";

  const options = { year: "numeric", month: "2-digit", day: "2-digit" };

  let dt;

  // Si el valor es una cadena que empieza con YYYY-MM-DD, parsear como fecha local
  // Esto evita que '2023-05-01' se convierta en '30/04/2023' por diferencias de UTC
  if (typeof date === "string") {
    const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1; // Meses en JS son 0-indexados
      const d = Number(m[3]);
      dt = new Date(y, mo, d);
    } else {
      // Fallback para otros formatos
      dt = new Date(date);
    }
  } else {
    dt = new Date(date);
  }

  if (isNaN(dt)) return "";

  return dt.toLocaleDateString("es-ES", options);
};

export default formatDate;
