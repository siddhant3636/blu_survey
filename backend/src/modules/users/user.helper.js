const formatUserObj = (user) => {
  if (!user) return null;
  const { password, ...formattedUser } = user;
  
  if (user.assignments) {
    formattedUser.assignedSites = user.assignments
      .filter((a) => !a.isDeleted && a.surveySite)
      .map((a) => ({
        id: a.surveySite.id,
        siteId: a.surveySite.siteId || `BSC-${a.surveySite.id.slice(0, 4).toUpperCase()}`,
        name: a.surveySite.name,
      }));
  } else {
    formattedUser.assignedSites = [];
  }

  return formattedUser;
};

module.exports = {
  formatUserObj,
};
