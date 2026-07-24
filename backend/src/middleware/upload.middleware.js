const { upload } = require("../config/multer");
const apiResponse = require("../utils/apiResponse");

const uploadSingle = (fieldname) => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldname);

    uploadHandler(req, res, (err) => {
      if (err) {
        return apiResponse.badRequest(res, err.message);
      }
      next();
    });
  };
};

const uploadMultiple = (fields) => {
  return (req, res, next) => {
    const uploadHandler = upload.fields(fields);

    uploadHandler(req, res, (err) => {
      if (err) {
        return apiResponse.badRequest(res, err.message);
      }
      next();
    });
  };
};

const uploadArray = (fieldname, maxCount = 10) => {
  return (req, res, next) => {
    const uploadHandler = upload.array(fieldname, maxCount);

    uploadHandler(req, res, (err) => {
      if (err) {
        return apiResponse.badRequest(res, err.message);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadArray,
};
