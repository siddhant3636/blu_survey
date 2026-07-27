const Joi = require("joi");

const createSiteSchema = Joi.object({
  name: Joi.string().required(),
  concessionaire: Joi.string().allow("", null).optional(),
  landOwningAgency: Joi.string().allow("", null).optional(),
  address: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
  status: Joi.string().valid("PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED").optional(),
  surveyorIds: Joi.array().items(Joi.string()).optional(),
});

const updateSiteSchema = Joi.object({
  name: Joi.string().optional(),
  concessionaire: Joi.string().allow("", null).optional(),
  landOwningAgency: Joi.string().allow("", null).optional(),
  address: Joi.string().optional(),
  status: Joi.string().valid("PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED").optional(),
  surveyorIds: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  createSiteSchema,
  updateSiteSchema,
};
