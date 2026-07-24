const Joi = require("joi");

const createEquipmentSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow("", null),
});

const updateEquipmentSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional().allow("", null),
});

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema,
};
