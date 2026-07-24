const Joi = require("joi");

const createManufacturerSchema = Joi.object({
  name: Joi.string().required(),
});

const updateManufacturerSchema = Joi.object({
  name: Joi.string().optional(),
});

module.exports = {
  createManufacturerSchema,
  updateManufacturerSchema,
};
