const Joi = require("joi");

const createConnectorSchema = Joi.object({
  type: Joi.string().required(),
});

const updateConnectorSchema = Joi.object({
  type: Joi.string().optional(),
});

module.exports = {
  createConnectorSchema,
  updateConnectorSchema,
};
