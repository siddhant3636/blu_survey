const Joi = require("joi");

const step1Schema = Joi.object({
  surveySiteId: Joi.string().uuid().required().messages({
    "string.empty": "Survey Site ID is required",
    "string.guid": "Invalid Survey Site ID format",
  }),
  surveyDate: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const today = new Date().toISOString().split("T")[0];
      if (value > today) {
        return helpers.message("Survey Date cannot be in the future");
      }
      return value;
    })
    .messages({
      "string.empty": "Survey Date is required",
    }),
  surveyTime: Joi.string().trim().required().messages({
    "string.empty": "Survey Time is required",
  }),
  buildingName: Joi.string().trim().allow("", null).optional(),
  operator: Joi.string().trim().required().messages({
    "string.empty": "Operator Name is required and cannot be blank",
  }),
  city: Joi.string().trim().required().messages({
    "string.empty": "City is required and cannot be blank",
  }),
  pincode: Joi.string()
    .trim()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
    .messages({
      "string.empty": "Pincode is required",
      "string.pattern.base": "Pincode must be a valid 6-digit Indian pincode",
    }),
  latitude: Joi.number().min(-90).max(90).allow(null, "").optional().messages({
    "number.base": "Latitude must be a valid number",
    "number.min": "Latitude must be between -90 and 90",
    "number.max": "Latitude must be between -90 and 90",
  }),
  longitude: Joi.number().min(-180).max(180).allow(null, "").optional().messages({
    "number.base": "Longitude must be a valid number",
    "number.min": "Longitude must be between -180 and 180",
    "number.max": "Longitude must be between -180 and 180",
  }),
  accessPersonName: Joi.string().trim().allow("", null).optional(),
  accessPersonMobile: Joi.string()
    .trim()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (!value) return value;
      const cleaned = value.replace(/[\s-]/g, "");
      const isIndianMobile = /^(\+91)?[6-9]\d{9}$/.test(cleaned);
      if (!isIndianMobile) {
        return helpers.message("Access Person Mobile must be a valid 10-digit Indian mobile number");
      }
      return value;
    }),
  parkingArea: Joi.string()
    .trim()
    .valid("Basement / Ground", "Open Surface", "Multi-Level Parking (MLCP)")
    .required()
    .messages({
      "any.only": "Please select a valid Parking Area Type",
      "string.empty": "Parking Area Type is required",
    }),
  internetAvailability: Joi.string()
    .trim()
    .valid("Only 4G / 5G", "Only Wi-Fi", "4G / 5G + Wi-Fi", "No Connectivity / Weak Signal")
    .required()
    .messages({
      "any.only": "Please select a valid Internet Availability option",
      "string.empty": "Internet Availability option is required",
    }),
  totalChargers: Joi.number().integer().min(0).max(200).required().messages({
    "number.base": "Total Chargers Count must be a valid number",
    "number.integer": "Total Chargers Count must be an integer without decimals",
    "number.min": "Total Chargers Count cannot be negative",
    "number.max": "Total Chargers Count cannot exceed 200",
  }),
  totalPanels: Joi.number().integer().min(0).max(100).required().messages({
    "number.base": "Total Panels Count must be a valid number",
    "number.integer": "Total Panels Count must be an integer without decimals",
    "number.min": "Total Panels Count cannot be negative",
    "number.max": "Total Panels Count cannot exceed 100",
  }),
  totalTransformers: Joi.number().integer().min(0).max(50).required().messages({
    "number.base": "Total Transformers Count must be a valid number",
    "number.integer": "Total Transformers Count must be an integer without decimals",
    "number.min": "Total Transformers Count cannot be negative",
    "number.max": "Total Transformers Count cannot exceed 50",
  }),
  totalDG: Joi.number().integer().min(0).max(50).required().messages({
    "number.base": "Total DG Sets Count must be a valid number",
    "number.integer": "Total DG Sets Count must be an integer without decimals",
    "number.min": "Total DG Sets Count cannot be negative",
    "number.max": "Total DG Sets Count cannot exceed 50",
  }),
  remarks: Joi.string().trim().allow("", null).optional(),
});

const lockAssetSchema = Joi.object({
  assetType: Joi.string().valid("charger", "panel", "transformer", "dg").required(),
  assetId: Joi.string().uuid().required(),
});

const chargerDataSchema = Joi.object({
  manufacturerId: Joi.string().trim().required().messages({
    "string.empty": "Manufacturer is required",
    "any.required": "Manufacturer is required",
  }),
  modelId: Joi.string().trim().required().messages({
    "string.empty": "Charger Model is required",
    "any.required": "Charger Model is required",
  }),
  connectorId: Joi.string().trim().required().messages({
    "string.empty": "Connector Type is required",
    "any.required": "Connector Type is required",
  }),
  serialNumber: Joi.string().trim().allow("", null).optional(),
  powerRating: Joi.string().trim().allow("", null).optional(),
  mccb4p: Joi.string().trim().allow("", null).optional(),
  mccb4pCount: Joi.number().integer().min(0).allow(null).optional(),
  mccb4pTypes: Joi.array().items(Joi.string().trim().allow("", null)).allow(null).optional(),
  mcb2p: Joi.string().trim().allow("", null).optional(),
  mcb2pCount: Joi.number().integer().min(0).allow(null).optional(),
  mcb2pTypes: Joi.array().items(Joi.string().trim().allow("", null)).allow(null).optional(),
  mcb4p: Joi.string().trim().allow("", null).optional(),
  mcb4pCount: Joi.number().integer().min(0).allow(null).optional(),
  mcb4pTypes: Joi.array().items(Joi.string().trim().allow("", null)).allow(null).optional(),
  voltage: Joi.string().trim().allow("", null).optional(),
  chargerType: Joi.string().trim().allow("", null).optional(),
  chargerCategory: Joi.string().trim().allow("", null).optional(),
  currentStatus: Joi.string().trim().allow("", null).optional(),
  displayWorking: Joi.string().trim().allow("", null).optional(),
  cableCondition: Joi.string().trim().allow("", null).optional(),
  earthingStatus: Joi.string().trim().allow("", null).optional(),
  fireSafety: Joi.string().trim().allow("", null).optional(),
  lightingStatus: Joi.string().trim().allow("", null).optional(),
  remarks: Joi.string().trim().allow("", null).optional(),
  latitude: Joi.number().min(-90).max(90).required().messages({
    "number.base": "Latitude must be a valid number",
    "number.min": "Latitude must be between -90 and 90",
    "number.max": "Latitude must be between -90 and 90",
    "any.required": "GPS Location latitude is required",
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    "number.base": "Longitude must be a valid number",
    "number.min": "Longitude must be between -180 and 180",
    "number.max": "Longitude must be between -180 and 180",
    "any.required": "GPS Location longitude is required",
  }),
});

const panelDataSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Panel Board Name / Tag is required",
    "any.required": "Panel Board Name / Tag is required",
  }),
  breakerRating: Joi.string().trim().required().messages({
    "string.empty": "Breaker Make / Brand is required",
    "any.required": "Breaker Make / Brand is required",
  }),
  capacity: Joi.string().trim().allow("", null).optional(),
  incomingSource: Joi.string().trim().allow("", null).optional(),
  cableSize: Joi.string().trim().allow("", null).optional(),
  latitude: Joi.number().min(-90).max(90).required().messages({
    "number.base": "Latitude must be a valid number",
    "number.min": "Latitude must be between -90 and 90",
    "number.max": "Latitude must be between -90 and 90",
    "any.required": "GPS Location latitude is required",
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    "number.base": "Longitude must be a valid number",
    "number.min": "Longitude must be between -180 and 180",
    "number.max": "Longitude must be between -180 and 180",
    "any.required": "GPS Location longitude is required",
  }),
});

const transformerDataSchema = Joi.object({
  capacityKVA: Joi.number().greater(0).required().messages({
    "number.base": "Capacity in KVA must be a valid number",
    "number.greater": "Capacity in KVA must be greater than 0",
    "any.required": "Capacity in KVA is required",
  }),
  voltageRatio: Joi.string().trim().required().messages({
    "string.empty": "Voltage Ratio is required",
    "any.required": "Voltage Ratio is required",
  }),
  currentRating: Joi.string().trim().required().messages({
    "string.empty": "Rated Current is required",
    "any.required": "Rated Current is required",
  }),
  earthingStatus: Joi.string().trim().required().messages({
    "string.empty": "Earthing Pit Status & Continuity is required",
    "any.required": "Earthing Pit Status & Continuity is required",
  }),
  oilLevelOk: Joi.boolean().default(true),
  latitude: Joi.number().min(-90).max(90).required().messages({
    "number.base": "Latitude must be a valid number",
    "number.min": "Latitude must be between -90 and 90",
    "number.max": "Latitude must be between -90 and 90",
    "any.required": "GPS Location latitude is required",
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    "number.base": "Longitude must be a valid number",
    "number.min": "Longitude must be between -180 and 180",
    "number.max": "Longitude must be between -180 and 180",
    "any.required": "GPS Location longitude is required",
  }),
});

const dgDataSchema = Joi.object({
  capacityKVA: Joi.number().greater(0).required().messages({
    "number.base": "Capacity in KVA must be a valid number",
    "number.greater": "Capacity in KVA must be greater than 0",
    "any.required": "Capacity in KVA is required",
  }),
  fuelTankLitres: Joi.number().greater(0).required().messages({
    "number.base": "Fuel Tank Capacity must be a valid number",
    "number.greater": "Fuel Tank Capacity must be greater than 0",
    "any.required": "Fuel Tank Capacity is required",
  }),
  earthingStatus: Joi.string().trim().required().messages({
    "string.empty": "Earthing Pit Condition is required",
    "any.required": "Earthing Pit Condition is required",
  }),
  amfPanelPresent: Joi.boolean().default(false),
  latitude: Joi.number().min(-90).max(90).required().messages({
    "number.base": "Latitude must be a valid number",
    "number.min": "Latitude must be between -90 and 90",
    "number.max": "Latitude must be between -90 and 90",
    "any.required": "GPS Location latitude is required",
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    "number.base": "Longitude must be a valid number",
    "number.min": "Longitude must be between -180 and 180",
    "number.max": "Longitude must be between -180 and 180",
    "any.required": "GPS Location longitude is required",
  }),
});

const saveAssetSchema = Joi.object({
  assetType: Joi.string().valid("charger", "panel", "transformer", "dg").required(),
  assetId: Joi.string().uuid().required(),
  data: Joi.object().when("assetType", {
    switch: [
      { is: "charger", then: chargerDataSchema },
      { is: "panel", then: panelDataSchema },
      { is: "transformer", then: transformerDataSchema },
      { is: "dg", then: dgDataSchema },
    ],
  }).required(),
});

const reviewSurveySchema = Joi.object({
  status: Joi.string().valid("APPROVED", "RETURNED").required(),
  reviewRemarks: Joi.string().allow("", null).optional(),
});

module.exports = {
  step1Schema,
  lockAssetSchema,
  saveAssetSchema,
  reviewSurveySchema,
};
