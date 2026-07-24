const formatDate = (date, formatPattern = "YYYY-MM-DD") => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  if (formatPattern === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  }
  return d.toISOString();
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

module.exports = {
  formatDate,
  addDays,
};
