const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow("", null),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional().allow("", null),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
