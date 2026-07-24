const assignmentService = require("./assignment.service");
const apiResponse = require("../../utils/apiResponse");

const getAssignments = async (req, res, next) => {
  try {
    const assignments = await assignmentService.getAllAssignments(req.user);
    return apiResponse.success(res, "Assignments fetched successfully", { assignments });
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(req.body, req.user);
    return apiResponse.success(res, "Assignment created successfully", { assignment }, 201);
  } catch (error) {
    if (error.statusCode === 403) {
      return apiResponse.forbidden(res, error.message);
    }
    return apiResponse.badRequest(res, error.message);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const assignment = await assignmentService.updateAssignmentStatus(
      req.params.id,
      req.body.status
    );
    return apiResponse.success(res, "Assignment status updated successfully", { assignment });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    await assignmentService.deleteAssignment(req.params.id, req.user);
    return apiResponse.success(res, "Assignment deleted successfully");
  } catch (error) {
    if (error.statusCode === 403) {
      return apiResponse.forbidden(res, error.message);
    }
    next(error);
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateStatus,
  deleteAssignment,
};
