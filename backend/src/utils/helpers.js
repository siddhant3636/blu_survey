const generateRandomString = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01233456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
};

module.exports = {
  generateRandomString,
  sanitizeFileName,
};
