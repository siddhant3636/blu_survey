const express = require("express");
const photoController = require("./photo.controller");
const { uploadSingle, uploadArray } = require("../../middleware/upload.middleware");
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(auth);

router.get("/", photoController.getPhotos);
router.post("/", uploadSingle("photo"), photoController.uploadPhoto);
router.post("/multiple", uploadArray("photos", 10), photoController.uploadMultiplePhotos);
router.delete("/:id", photoController.deletePhoto);

module.exports = router;
