const Joi = require("joi");

const addPanelSchema = Joi.object({
  surveyId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  capacity: Joi.string().allow("").optional(),
  incomingSource: Joi.string().allow("").optional(),
  breakerRating: Joi.string().allow("").optional(),
  cableSize: Joi.string().allow("").optional(),
});

module.exports = {
  addPanelSchema,
};
