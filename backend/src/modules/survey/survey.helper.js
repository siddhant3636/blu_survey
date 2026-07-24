const checkRequiredPhotos = (photos, minCount = 5) => {
  return photos.length >= minCount;
};

module.exports = {
  checkRequiredPhotos,
};
