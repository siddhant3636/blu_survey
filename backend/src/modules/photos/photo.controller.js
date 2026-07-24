const photoService = require("./photo.service");
const apiResponse = require("../../utils/apiResponse");

const getPhotos = async (req, res, next) => {
  try {
    const photos = await photoService.getPhotosBySurvey(req.query.surveyId);
    return apiResponse.success(res, "Photos fetched successfully", { photos });
  } catch (error) {
    next(error);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return apiResponse.badRequest(res, "No file uploaded.");
    }
    const { surveyId, categoryId, latitude, longitude } = req.body;
    const photo = await photoService.addPhoto(
      surveyId,
      categoryId,
      req.file,
      { latitude, longitude }
    );
    return apiResponse.success(res, "Photo uploaded and processed successfully", { photo }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const uploadMultiplePhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return apiResponse.badRequest(res, "No files uploaded.");
    }
    const { surveyId, categoryId, latitude, longitude } = req.body;
    const photos = await photoService.addMultiplePhotos(
      surveyId,
      categoryId,
      req.files,
      { latitude, longitude }
    );
    return apiResponse.success(res, "Multiple photos uploaded successfully", { photos }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const deletePhoto = async (req, res, next) => {
  try {
    await photoService.removePhoto(req.params.id);
    return apiResponse.success(res, "Photo removed successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getPhotos,
  uploadPhoto,
  uploadMultiplePhotos,
  deletePhoto,
};
