const { prisma } = require("../../config/database");
const { moveFile, deleteFile } = require("../../utils/fileUpload");
const { compressImage } = require("../../utils/imageCompression");
const { formatPhotoPath } = require("./photo.helper");
const path = require("path");
const fs = require("fs");

const getPhotosBySurvey = async (surveyId) => {
  const photos = await prisma.photo.findMany({
    where: { surveyId },
    include: { category: true },
  });
  return photos.map(formatPhotoPath);
};

const addPhoto = async (surveyId, categoryId, file, coordinates = {}) => {
  const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
  if (!survey) throw new Error("Survey not found.");
  if (survey.status === "SUBMITTED" || survey.status === "APPROVED") {
    // Prevent modification if survey is already submitted or approved
    throw new Error("Cannot add photos to a submitted or approved survey.");
  }

  let targetCategory = null;
  if (categoryId) {
    targetCategory = await prisma.photoCategory.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { name: categoryId }
        ]
      }
    });
    if (!targetCategory) {
      targetCategory = await prisma.photoCategory.create({
        data: { name: categoryId, description: categoryId, isActive: true }
      });
    }
  }

  if (!targetCategory) throw new Error("No photo category available.");

  // Check for existing photo under same category in this survey to replace cleanly without orphan files
  const existingPhoto = await prisma.photo.findFirst({
    where: {
      surveyId,
      categoryId: targetCategory.id,
    },
  });

  if (existingPhoto) {
    try {
      deleteFile(existingPhoto.filePath);
      await prisma.photo.delete({ where: { id: existingPhoto.id } });
    } catch (e) {
      // Ignore if old file/record deletion encounters warning
    }
  }

  const tempPath = file.path;
  const sanitizedSubDir = targetCategory.name.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const targetDir = path.join(process.cwd(), "src/uploads", sanitizedSubDir);
  const safeFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
  const targetPath = path.join(targetDir, safeFilename);

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Compress & optimize image with Sharp
    await compressImage(tempPath, targetPath);

    // Get actual compressed file size
    let finalSize = file.size;
    if (fs.existsSync(targetPath)) {
      finalSize = fs.statSync(targetPath).size;
    }

    // Validate GPS coordinates
    let lat = coordinates.latitude !== undefined && coordinates.latitude !== null ? parseFloat(coordinates.latitude) : null;
    let lng = coordinates.longitude !== undefined && coordinates.longitude !== null ? parseFloat(coordinates.longitude) : null;

    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) lat = null;
    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) lng = null;

    const relativePath = `${sanitizedSubDir}/${safeFilename}`;

    const photo = await prisma.photo.create({
      data: {
        surveyId,
        categoryId: targetCategory.id,
        filePath: relativePath,
        fileName: file.originalname,
        fileSize: finalSize,
        latitude: lat,
        longitude: lng,
        capturedAt: new Date(),
      },
      include: { category: true },
    });

    return formatPhotoPath(photo);
  } finally {
    // Always clean up temp uploaded file
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {}
    }
  }
};

const addMultiplePhotos = async (surveyId, categoryId, files, coordinates = {}) => {
  const uploaded = [];
  for (const file of files) {
    const photo = await addPhoto(surveyId, categoryId, file, coordinates);
    uploaded.push(photo);
  }
  return uploaded;
};

const removePhoto = async (id) => {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error("Photo not found.");

  const survey = await prisma.survey.findUnique({ where: { id: photo.surveyId } });
  if (survey && (survey.status === "SUBMITTED" || survey.status === "APPROVED")) {
    throw new Error("Cannot delete photos from a submitted or approved survey.");
  }

  // Delete physical file from storage
  deleteFile(photo.filePath);

  await prisma.photo.delete({ where: { id } });
  return true;
};

module.exports = {
  getPhotosBySurvey,
  addPhoto,
  addMultiplePhotos,
  removePhoto,
};
