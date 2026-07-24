const Joi = require("joi");

const addChargerSchema = Joi.object({
  surveyId: Joi.string().uuid().required(),
  manufacturerId: Joi.string().uuid().required(),
  modelId: Joi.string().uuid().required(),
  connectorId: Joi.string().uuid().required(),
  serialNumber: Joi.string().allow("").optional(),
  status: Joi.string().allow("").optional(),
  quantity: Joi.number().min(1).default(1),
});

module.exports = {
  addChargerSchema,
};
