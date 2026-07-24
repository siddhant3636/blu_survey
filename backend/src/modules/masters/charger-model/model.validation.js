const Joi = require("joi");

const createModelSchema = Joi.object({
  manufacturerId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  powerRating: Joi.string().required(),
});

const updateModelSchema = Joi.object({
  manufacturerId: Joi.string().uuid().optional(),
  name: Joi.string().optional(),
  powerRating: Joi.string().optional(),
});

module.exports = {
  createModelSchema,
  updateModelSchema,
};
