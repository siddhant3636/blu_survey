const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s.'-]+$/)
    .required()
    .messages({
      "string.empty": "Full Name is required and cannot be blank",
      "string.min": "Full Name must be at least 2 characters long",
      "string.pattern.base": "Full Name should contain valid alphabetic characters",
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email Address is required",
      "string.email": "Please enter a valid email address",
    }),
  password: Joi.string().min(6).optional().allow("", null),
  phone: Joi.string()
    .trim()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (!value) return value;
      const cleaned = value.replace(/[\s-]/g, "");
      if (!/^(\+91)?[6-9]\d{9}$/.test(cleaned)) {
        return helpers.message("Mobile Number must be a valid 10-digit Indian phone number");
      }
      return value;
    }),
  role: Joi.string()
    .valid("ADMIN", "SUB_ADMIN", "SURVEY_PERSON", "MANAGER", "SURVEYOR")
    .default("SURVEY_PERSON")
    .messages({
      "any.only": "Invalid user role specified",
    }),
  siteIds: Joi.array().items(Joi.string().uuid()).unique().optional().messages({
    "array.unique": "Duplicate site IDs are not allowed",
  }),
});

const updateUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s.'-]+$/)
    .optional()
    .messages({
      "string.empty": "Full Name cannot be empty or blank",
      "string.min": "Full Name must be at least 2 characters long",
      "string.pattern.base": "Full Name should contain valid alphabetic characters",
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      "string.empty": "Email Address cannot be empty",
      "string.email": "Please enter a valid email address",
    }),
  password: Joi.string().min(6).optional().allow("", null),
  phone: Joi.string()
    .trim()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (!value) return value;
      const cleaned = value.replace(/[\s-]/g, "");
      if (!/^(\+91)?[6-9]\d{9}$/.test(cleaned)) {
        return helpers.message("Mobile Number must be a valid 10-digit Indian phone number");
      }
      return value;
    }),
  role: Joi.string()
    .valid("ADMIN", "SUB_ADMIN", "SURVEY_PERSON", "MANAGER", "SURVEYOR")
    .optional()
    .messages({
      "any.only": "Invalid user role specified",
    }),
  isActive: Joi.boolean().optional(),
  siteIds: Joi.array().items(Joi.string().uuid()).unique().optional().messages({
    "array.unique": "Duplicate site IDs are not allowed",
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};
