const formatPhotoPath = (photo) => {
  if (!photo) return null;
  return {
    ...photo,
    url: `/uploads/${photo.filePath}`,
  };
};

module.exports = {
  formatPhotoPath,
};
