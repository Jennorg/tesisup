const formatDate = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const dateString = new Date(date).toLocaleDateString('es-ES', options);
  return dateString;
}

export default formatDate;