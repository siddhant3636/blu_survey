const Joi = require("joi");

const addDGSchema = Joi.object({
  surveyId: Joi.string().uuid().required(),
  capacityKVA: Joi.number().min(0).allow(null).optional(),
  fuelTankLitres: Joi.number().min(0).allow(null).optional(),
  amfPanelPresent: Joi.boolean().default(false),
  earthingStatus: Joi.string().allow("").optional(),
});

module.exports = {
  addDGSchema,
};
