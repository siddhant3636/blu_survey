const express = require("express");
const assignmentController = require("./assignment.controller");
const validate = require("../../middleware/validation.middleware");
const {
  createAssignmentSchema,
  updateAssignmentStatusSchema,
} = require("./assignment.validation");
const { auth } = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", assignmentController.getAssignments);
router.post(
  "/",
  authorize("ADMIN", "SUB_ADMIN"),
  validate(createAssignmentSchema),
  assignmentController.createAssignment
);
router.patch(
  "/:id/status",
  validate(updateAssignmentStatusSchema),
  assignmentController.updateStatus
);
router.delete(
  "/:id",
  authorize("ADMIN", "SUB_ADMIN"),
  assignmentController.deleteAssignment
);

module.exports = router;
