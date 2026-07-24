const PDFDocument = require("pdfkit");

const createPDFDocument = (options = {}) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    ...options,
  });
  return doc;
};

module.exports = {
  createPDFDocument,
};
