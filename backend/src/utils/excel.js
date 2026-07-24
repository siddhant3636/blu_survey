const ExcelJS = require("exceljs");

const createWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BluSmart Charge Survey System";
  workbook.lastModifiedBy = "BluSmart Charge Survey System";
  workbook.created = new Date();
  return workbook;
};

module.exports = {
  createWorkbook,
};
