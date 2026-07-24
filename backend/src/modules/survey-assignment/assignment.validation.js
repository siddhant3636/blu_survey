const Joi = require("joi");

const createAssignmentSchema = Joi.object({
  surveySiteId: Joi.string().uuid().required(),
  surveyorId: Joi.string().uuid().optional(),
  surveyorIds: Joi.array().items(Joi.string().uuid()).optional(),
  dueDate: Joi.date().iso().optional().allow(null),
});

const updateAssignmentStatusSchema = Joi.object({
  status: Joi.string().valid("ASSIGNED", "IN_PROGRESS", "COMPLETED", "SUBMITTED").required(),
});

module.exports = {
  createAssignmentSchema,
  updateAssignmentStatusSchema,
};
