const Joi = require("joi");

const addTransformerSchema = Joi.object({
  surveyId: Joi.string().uuid().required(),
  capacityKVA: Joi.number().min(0).allow(null).optional(),
  voltageRatio: Joi.string().allow("").optional(),
  currentRating: Joi.string().allow("").optional(),
  oilLevelOk: Joi.boolean().default(true),
  earthingStatus: Joi.string().allow("").optional(),
});

module.exports = {
  addTransformerSchema,
};
