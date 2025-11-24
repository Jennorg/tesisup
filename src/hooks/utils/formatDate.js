const formatDate = (date) => {
  if (!date) return "";

  const options = { year: "numeric", month: "2-digit", day: "2-digit" };

  let dt;

  // If value is a string that starts with YYYY-MM-DD, parse as local date
  if (typeof date === "string") {
    const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      dt = new Date(y, mo, d);
    } else {
      // fallback to Date constructor for other formats
      dt = new Date(date);
    }
  } else {
    dt = new Date(date);
  }

  if (isNaN(dt)) return "";

  return dt.toLocaleDateString("es-ES", options);
};

export default formatDate;
