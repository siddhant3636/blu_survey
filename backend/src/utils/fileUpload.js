const fs = require("fs");
const path = require("path");
const appConfig = require("../config/appConfig");

const moveFile = (tempFileName, subDirectory) => {
  if (!tempFileName) return null;

  const tempPath = path.join(process.cwd(), appConfig.uploadPath, "temp", tempFileName);
  const targetDir = path.join(process.cwd(), appConfig.uploadPath, subDirectory);
  const targetPath = path.join(targetDir, tempFileName);

  if (!fs.existsSync(tempPath)) {
    return null;
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.renameSync(tempPath, targetPath);
  return `${subDirectory}/${tempFileName}`;
};

const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(process.cwd(), appConfig.uploadPath, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  moveFile,
  deleteFile,
};
