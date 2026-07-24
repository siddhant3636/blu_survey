const formatChargerSpec = (charger) => {
  if (!charger) return null;
  return {
    id: charger.id,
    surveyId: charger.surveyId,
    manufacturer: charger.manufacturer?.name,
    model: charger.model?.name,
    powerRating: charger.model?.powerRating,
    connector: charger.connector?.type,
    serialNumber: charger.serialNumber,
    quantity: charger.quantity,
  };
};

module.exports = {
  formatChargerSpec,
};
