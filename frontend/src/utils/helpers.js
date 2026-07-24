export const truncateString = (str, len = 20) => {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
};
