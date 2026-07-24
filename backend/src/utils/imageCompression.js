const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const logger = require("../config/logger");

const compressImage = async (inputPath, outputPath, quality = 82) => {
  try {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await sharp(inputPath)
      .rotate() // Auto-rotates image according to EXIF orientation tag
      .resize(1920, 1080, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality, progressive: true, force: false })
      .toFile(outputPath);

    return true;
  } catch (error) {
    logger.error(`Error compressing image: ${error.message}`);
    // If sharp fails (e.g. non-standard format), copy file as fallback
    try {
      fs.copyFileSync(inputPath, outputPath);
      return true;
    } catch (fallbackError) {
      logger.error(`Fallback image copy failed: ${fallbackError.message}`);
      return false;
    }
  }
};

module.exports = {
  compressImage,
};
