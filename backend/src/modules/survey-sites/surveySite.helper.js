const formatSurveySite = (site) => {
  if (!site) return null;
  return {
    ...site,
    siteId: site.siteId || `BSC-${site.id.slice(0, 4).toUpperCase()}`,
    coordinates: site.latitude && site.longitude ? { lat: site.latitude, lng: site.longitude } : null,
  };
};

module.exports = {
  formatSurveySite,
};
