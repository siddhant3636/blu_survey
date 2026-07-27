const formatPhotoPath = (photo) => {
  if (!photo) return null;
  const rawPath = photo.filePath || "";
  const encodedPath = rawPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return {
    ...photo,
    url: `/uploads/${encodedPath}`,
  };
};

module.exports = {
  formatPhotoPath,
};
