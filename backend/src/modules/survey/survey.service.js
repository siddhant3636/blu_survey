const { prisma } = require("../../config/database");
const { formatPhotoPath } = require("../photos/photo.helper");

const getAllSurveys = async (user) => {
  let where = { isDeleted: false };

  if (user && (user.role === "SURVEY_PERSON" || user.role === "SURVEYOR")) {
    where.OR = [
      { createdById: user.id },
      {
        surveySite: {
          assignments: {
            some: {
              surveyorId: user.id,
              isDeleted: false,
            }
          }
        }
      }
    ];
  } else if (user && user.role === "SUB_ADMIN") {
    const managedSurveyors = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: "SURVEY_PERSON",
        OR: [{ createdBy: user.id }, { createdBy: null }]
      },
      select: { id: true }
    });
    const surveyorIds = managedSurveyors.map((s) => s.id);
    where.createdById = { in: surveyorIds };
  }

  return prisma.survey.findMany({
    where,
    include: {
      surveySite: {
        include: {
          assignments: {
            where: { isDeleted: false },
            include: { surveyor: { select: { id: true, name: true, email: true } } }
          }
        }
      },
      createdBySurveyor: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getSurveyById = async (id, user) => {
  const survey = await prisma.survey.findFirst({
    where: { id, isDeleted: false },
    include: {
      surveySite: {
        include: {
          assignments: {
            where: { isDeleted: false },
            include: { surveyor: { select: { id: true, name: true, email: true } } }
          }
        }
      },
      createdBySurveyor: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
      chargers: {
        where: { isDeleted: false },
        include: {
          manufacturer: true,
          model: true,
          connector: true,
          mccbMaker: true,
          mcbMaker: true,
          lockedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assetIndex: "asc" },
      },
      panels: {
        where: { isDeleted: false },
        include: {
          lockedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assetIndex: "asc" },
      },
      transformers: {
        where: { isDeleted: false },
        include: {
          lockedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assetIndex: "asc" },
      },
      dgs: {
        where: { isDeleted: false },
        include: {
          lockedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assetIndex: "asc" },
      },
      photos: {
        where: { isDeleted: false },
        include: { category: true },
      },
    },
  });
  if (!survey) throw new Error("Survey not found.");

  if (user && user.role !== "ADMIN") {
    if (user.role === "SUB_ADMIN") {
      const managedSurveyors = await prisma.user.findMany({
        where: {
          isDeleted: false,
          role: "SURVEY_PERSON",
          OR: [{ createdBy: user.id }, { createdBy: null }]
        },
        select: { id: true }
      });
      const surveyorIds = managedSurveyors.map((s) => s.id);
      const isCreator = surveyorIds.includes(survey.createdById);
      const isAssigned = survey.surveySite?.assignments?.some((a) => surveyorIds.includes(a.surveyorId));
      if (!isCreator && !isAssigned) {
        const error = new Error("Access denied. You do not manage this survey.");
        error.statusCode = 403;
        throw error;
      }
    } else if (user.role === "SURVEY_PERSON" || user.role === "SURVEYOR") {
      const isCreator = survey.createdById === user.id;
      const isAssigned = survey.surveySite?.assignments?.some((a) => a.surveyorId === user.id);
      if (!isCreator && !isAssigned) {
        const error = new Error("Access denied. You can only access your assigned surveys.");
        error.statusCode = 403;
        throw error;
      }
    }
  }

  if (survey.photos) {
    survey.photos = survey.photos.map(formatPhotoPath);
  }

  return survey;
};

const getSurveyBySiteId = async (surveySiteId, user) => {
  let where = { surveySiteId, isDeleted: false, status: { not: "APPROVED" } };
  
  const survey = await prisma.survey.findFirst({
    where,
    include: {
      surveySite: {
        include: {
          assignments: {
            where: { isDeleted: false }
          }
        }
      },
      chargers: {
        where: { isDeleted: false },
        include: {
          manufacturer: true,
          model: true,
          connector: true,
          mccbMaker: true,
          mcbMaker: true,
          lockedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assetIndex: "asc" },
      },
      panels: {
        where: { isDeleted: false },
        include: {
          lockedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assetIndex: "asc" },
      },
      transformers: {
        where: { isDeleted: false },
        include: {
          lockedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assetIndex: "asc" },
      },
      dgs: {
        where: { isDeleted: false },
        include: {
          lockedByUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assetIndex: "asc" },
      },
    },
  });

  if (!survey) return null;

  if (user) {
    if (user.role === "SURVEY_PERSON" || user.role === "SURVEYOR") {
      const isAssigned = survey.surveySite?.assignments?.some((a) => a.surveyorId === user.id);
      if (!isAssigned && survey.createdById !== user.id) {
        const error = new Error("Access denied. You can only access your assigned surveys.");
        error.statusCode = 403;
        throw error;
      }
    }
  }

  return survey;
};

// ------------------------------------
// STEP 1: INITIALIZE SITE & AUTO-GENERATE ASSET PLACEHOLDERS
// ------------------------------------
const initiateStep1 = async (surveyorId, data) => {
  const { surveySiteId, totalChargers = 0, totalPanels = 0, totalTransformers = 0, totalDG = 0 } = data;

  const targetChargerCount = Math.max(0, parseInt(totalChargers) || 0);
  const targetPanelCount = Math.max(0, parseInt(totalPanels) || 0);
  const targetTransformerCount = Math.max(0, parseInt(totalTransformers) || 0);
  const targetDGCount = Math.max(0, parseInt(totalDG) || 0);

  const user = await prisma.user.findUnique({
    where: { id: surveyorId },
    select: { role: true }
  });

  const step1Payload = {
    surveyDate: data.surveyDate || new Date().toISOString().split("T")[0],
    surveyTime: data.surveyTime || new Date().toTimeString().split(" ")[0].substring(0, 5),
    buildingName: data.buildingName || null,
    operator: data.operator || null,
    city: data.city || null,
    pincode: data.pincode || null,
    latitude: data.latitude !== undefined && data.latitude !== null && !isNaN(data.latitude) ? parseFloat(data.latitude) : null,
    longitude: data.longitude !== undefined && data.longitude !== null && !isNaN(data.longitude) ? parseFloat(data.longitude) : null,
    accessPersonName: data.accessPersonName || null,
    accessPersonMobile: data.accessPersonMobile || null,
    parkingArea: data.parkingArea || null,
    internetAvailability: data.internetAvailability || null,
    remarks: data.remarks || null,
    totalChargers: targetChargerCount,
    totalPanels: targetPanelCount,
    totalTransformers: targetTransformerCount,
    totalDG: targetDGCount,
  };

  // Perform full Step 1 update and asset count sync within a single database transaction
  const surveyId = await prisma.$transaction(async (tx) => {
    if (user && user.role !== "ADMIN" && user.role !== "SUB_ADMIN") {
      const assignment = await tx.surveyAssignment.findFirst({
        where: {
          surveySiteId,
          surveyorId,
          isDeleted: false,
        },
      });

      if (!assignment) {
        throw new Error("This site is not assigned to you.");
      }

      await tx.surveyAssignment.update({
        where: { id: assignment.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Update site status to IN_PROGRESS
    await tx.surveySite.update({
      where: { id: surveySiteId },
      data: { status: "IN_PROGRESS" },
    });

    // Check if survey container already exists for this site which is not yet APPROVED
    let survey = await tx.survey.findFirst({
      where: {
        surveySiteId,
        status: { not: "APPROVED" },
        isDeleted: false,
      },
    });

    if (survey) {
      if (survey.firstPageLocked && survey.firstPageLockedByUserId !== surveyorId) {
        throw new Error(`The first page has already been completed by ${survey.firstPageLockedBy || "another surveyor"}.`);
      }
      if (["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(survey.status)) {
        throw new Error("This survey has been submitted and is locked for editing.");
      }
    }

    const userObj = await tx.user.findUnique({
      where: { id: surveyorId },
      select: { name: true }
    });

    if (!survey) {
      survey = await tx.survey.create({
        data: {
          surveySiteId,
          createdById: surveyorId,
          status: "DRAFT",
          firstPageLocked: true,
          firstPageLockedBy: userObj?.name || "Surveyor",
          firstPageLockedByUserId: surveyorId,
          firstPageLockedAt: new Date(),
          ...step1Payload,
        },
      });
    } else {
      survey = await tx.survey.update({
        where: { id: survey.id },
        data: {
          ...step1Payload,
          firstPageLocked: true,
          firstPageLockedBy: userObj?.name || "Surveyor",
          firstPageLockedByUserId: surveyorId,
          firstPageLockedAt: new Date(),
        },
      });
    }

    // Dynamic Asset Synchronization Helper (Idempotent, Transactional, End-of-list Soft Delete)
    const syncAssetsTx = async (sId, modelName, targetCount, createDataFn) => {
      const model = tx[modelName];
      const existing = await model.findMany({
        where: { surveyId: sId, isDeleted: false },
        orderBy: { assetIndex: "asc" },
      });

      const currentCount = existing.length;

      // Equal count -> Idempotent, do nothing
      if (currentCount === targetCount) {
        return;
      }

      // Increase Count -> Append new asset records at end of list
      if (currentCount < targetCount) {
        const lastIndex = existing.length > 0 ? existing[existing.length - 1].assetIndex : 0;
        const toCreateCount = targetCount - currentCount;

        for (let i = 1; i <= toCreateCount; i++) {
          const nextIndex = lastIndex + i;
          await model.create({
            data: createDataFn(sId, nextIndex),
          });
        }
      }
      // Decrease Count -> Soft delete highest-numbered assets from the end of the list ONLY
      else if (currentCount > targetCount) {
        const sortedDesc = [...existing].sort((a, b) => b.assetIndex - a.assetIndex);
        const numToRemove = currentCount - targetCount;
        const excessToRemove = sortedDesc.slice(0, numToRemove);

        for (const item of excessToRemove) {
          await model.update({
            where: { id: item.id },
            data: {
              isDeleted: true,
              deletedAt: new Date(),
            },
          });
        }
      }
    };

    // Execute synchronization for all 4 asset categories
    await syncAssetsTx(survey.id, "charger", targetChargerCount, (sId, index) => ({
      surveyId: sId,
      assetIndex: index,
      status: "AVAILABLE",
    }));

    await syncAssetsTx(survey.id, "panel", targetPanelCount, (sId, index) => ({
      surveyId: sId,
      assetIndex: index,
      name: `Panel Board #${index}`,
      status: "AVAILABLE",
    }));

    await syncAssetsTx(survey.id, "transformer", targetTransformerCount, (sId, index) => ({
      surveyId: sId,
      assetIndex: index,
      status: "AVAILABLE",
    }));

    await syncAssetsTx(survey.id, "dG", targetDGCount, (sId, index) => ({
      surveyId: sId,
      assetIndex: index,
      status: "AVAILABLE",
    }));

    return survey.id;
  });

  return getSurveyById(surveyId);
};

// ------------------------------------
// ASSET LOCKING ENGINE
// ------------------------------------
const lockAsset = async (userId, { assetType, assetId }) => {
  const modelMap = {
    charger: prisma.charger,
    panel: prisma.panel,
    transformer: prisma.transformer,
    dg: prisma.dG,
  };

  const model = modelMap[assetType.toLowerCase()];
  if (!model) throw new Error("Invalid asset type.");

  const lockedAsset = await prisma.$transaction(async (tx) => {
    const asset = await tx[assetType.toLowerCase()].findUnique({
      where: { id: assetId },
      include: {
        lockedByUser: { select: { id: true, name: true, email: true } },
      }
    });

    if (!asset) throw new Error("Asset record not found.");

    // Fetch user and verify permission
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    const isUserAdmin = user && (user.role === "ADMIN" || user.role === "SUB_ADMIN");

    // Fetch survey and verify surveyor assignment
    const survey = await tx.survey.findUnique({
      where: { id: asset.surveyId },
      include: {
        surveySite: {
          include: {
            assignments: {
              where: { isDeleted: false }
            }
          }
        }
      }
    });

    if (!isUserAdmin && survey) {
      const isAssigned = survey.createdById === userId || survey.surveySite?.assignments?.some((a) => a.surveyorId === userId);
      if (!isAssigned) {
        throw new Error("Access denied. You are not assigned to this survey.");
      }
    }

    const now = new Date();
    const isLockedByOther = asset.lockedByUserId && asset.lockedByUserId !== userId;
    const isLockExpired = asset.lockedAt && (now.getTime() - new Date(asset.lockedAt).getTime() > 5 * 60 * 1000); // 5 minutes timeout

    if (!isUserAdmin) {
      if (asset.status === "COMPLETED") {
        if (asset.lockedByUserId && asset.lockedByUserId !== userId) {
          throw new Error(`This equipment item is already completed by ${asset.lockedByUser?.name || "another surveyor"}.`);
        }
      }

      if (isLockedByOther && !isLockExpired) {
        throw new Error(`This equipment item is currently locked/being edited by ${asset.lockedByUser?.name || "another surveyor"}.`);
      }
    }

    return tx[assetType.toLowerCase()].update({
      where: { id: assetId },
      data: {
        status: asset.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
        lockedByUserId: userId,
        lockedAt: now,
      },
      include: {
        lockedByUser: { select: { id: true, name: true, email: true } },
      }
    });
  });

  return lockedAsset;
};

const unlockAsset = async (userId, { assetType, assetId }) => {
  const modelMap = {
    charger: prisma.charger,
    panel: prisma.panel,
    transformer: prisma.transformer,
    dg: prisma.dG,
  };

  const model = modelMap[assetType.toLowerCase()];
  if (!model) throw new Error("Invalid asset type.");

  await prisma.$transaction(async (tx) => {
    const asset = await tx[assetType.toLowerCase()].findUnique({
      where: { id: assetId }
    });

    if (!asset) return;

    if (asset.lockedByUserId === userId && asset.status !== "COMPLETED") {
      await tx[assetType.toLowerCase()].update({
        where: { id: assetId },
        data: {
          status: "AVAILABLE",
          lockedByUserId: null,
          lockedAt: null,
        }
      });
    }
  });

  return true;
};

// ------------------------------------
// SAVE ASSET SURVEY DATA & COMPLETE
// ------------------------------------
const saveAssetData = async (userId, { assetType, assetId, data }) => {
  const normalizedType = assetType.toLowerCase();
  const modelMap = {
    charger: prisma.charger,
    panel: prisma.panel,
    transformer: prisma.transformer,
    dg: prisma.dG,
  };

  const model = modelMap[normalizedType];
  if (!model) {
    const err = new Error("Invalid asset type.");
    err.statusCode = 400;
    throw err;
  }

  // Retrieve current asset record
  const existingAsset = await model.findUnique({ where: { id: assetId } });
  if (!existingAsset) {
    const err = new Error("Asset record not found.");
    err.statusCode = 404;
    throw err;
  }

  // Retrieve survey to check status
  const survey = await prisma.survey.findUnique({
    where: { id: existingAsset.surveyId },
  });
  if (!survey) {
    const err = new Error("Associated survey not found.");
    err.statusCode = 404;
    throw err;
  }

  if (["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(survey.status)) {
    const err = new Error("This survey has been submitted and is locked for editing.");
    err.statusCode = 400;
    throw err;
  }

  // Lock check
  await lockAsset(userId, { assetType, assetId });

  // Asset type title formatting for photo categories
  const assetTitles = {
    charger: "Charger",
    panel: "Panel",
    transformer: "Transformer",
    dg: "DG",
  };
  const title = assetTitles[normalizedType] || "Asset";
  const index = existingAsset.assetIndex || 1;

  // Validate Photo Requirements for Front, Left, and Right views
  const photos = await prisma.photo.findMany({
    where: { surveyId: existingAsset.surveyId, isDeleted: false },
    include: { category: true },
  });

  const photoCatNames = photos.map((p) => (p.category?.name || "").toLowerCase());

  const expectedFront = `${title} #${index} - Front View`.toLowerCase();
  const expectedLeft = `${title} #${index} - Left View`.toLowerCase();
  const expectedRight = `${title} #${index} - Right View`.toLowerCase();

  // Fallbacks for legacy/single asset category naming (e.g. "Panel Front", "Transformer Front", etc.)
  const fallbackFront = `${title} Front`.toLowerCase();
  const fallbackLeft = `${title} Left`.toLowerCase();
  const fallbackRight = `${title} Right`.toLowerCase();

  const hasFront = photoCatNames.some((n) => n === expectedFront || (index === 1 && n.includes("front") && (n === fallbackFront || n.startsWith(title.toLowerCase()))));
  const hasLeft = photoCatNames.some((n) => n === expectedLeft || (index === 1 && n.includes("left") && (n === fallbackLeft || n.startsWith(title.toLowerCase()))));
  const hasRight = photoCatNames.some((n) => n === expectedRight || (index === 1 && n.includes("right") && (n === fallbackRight || n.startsWith(title.toLowerCase()))));

  if (!hasFront) {
    const err = new Error("Front View photo is required.");
    err.statusCode = 400;
    throw err;
  }
  if (!hasLeft) {
    const err = new Error("Left View photo is required.");
    err.statusCode = 400;
    throw err;
  }
  if (!hasRight) {
    const err = new Error("Right View photo is required.");
    err.statusCode = 400;
    throw err;
  }

  // Map allowed keys per asset model
  const allowedKeysMap = {
    charger: [
      "manufacturerId", "modelId", "connectorId", "mccbMakerId", "mcbMakerId",
      "serialNumber", "powerRating", "mccb4p", "mcb2p", "mcb4p", "voltage",
      "chargerType", "chargerCategory", "currentStatus", "displayWorking",
      "cableCondition", "earthingStatus", "fireSafety", "lightingStatus",
      "remarks", "latitude", "longitude"
    ],
    panel: [
      "name", "capacity", "incomingSource", "breakerRating", "cableSize", "latitude", "longitude"
    ],
    transformer: [
      "capacityKVA", "voltageRatio", "currentRating", "oilLevelOk", "earthingStatus", "latitude", "longitude"
    ],
    dg: [
      "capacityKVA", "fuelTankLitres", "amfPanelPresent", "earthingStatus", "latitude", "longitude"
    ],
  };

  const allowedKeys = allowedKeysMap[normalizedType] || [];
  const cleanData = {};
  allowedKeys.forEach((key) => {
    if (data && data[key] !== undefined) {
      if (["manufacturerId", "modelId", "connectorId", "mccbMakerId", "mcbMakerId"].includes(key) && data[key] === "") {
        cleanData[key] = null;
      } else if (typeof data[key] === "string") {
        const trimmed = data[key].trim();
        cleanData[key] = trimmed === "" ? null : trimmed;
      } else {
        cleanData[key] = data[key];
      }
    }
  });

  // Numeric type coercions
  if (cleanData.capacityKVA !== undefined && cleanData.capacityKVA !== null) {
    cleanData.capacityKVA = parseFloat(cleanData.capacityKVA);
  }
  if (cleanData.fuelTankLitres !== undefined && cleanData.fuelTankLitres !== null) {
    cleanData.fuelTankLitres = parseFloat(cleanData.fuelTankLitres);
  }
  if (cleanData.latitude !== undefined && cleanData.latitude !== null) {
    cleanData.latitude = parseFloat(cleanData.latitude);
  }
  if (cleanData.longitude !== undefined && cleanData.longitude !== null) {
    cleanData.longitude = parseFloat(cleanData.longitude);
  }

  // Charger Breakers JSON Serialization (MCCB 4P, MCB 2P, MCB 4P)
  if (normalizedType === "charger") {
    if (data && (data.mccb4pCount !== undefined || data.mccb4pTypes !== undefined)) {
      const count = Number(data.mccb4pCount || 0);
      const types = Array.isArray(data.mccb4pTypes) ? data.mccb4pTypes : [];
      cleanData.mccb4p = JSON.stringify({ count, types });
    }
    if (data && (data.mcb2pCount !== undefined || data.mcb2pTypes !== undefined)) {
      const count = Number(data.mcb2pCount || 0);
      const types = Array.isArray(data.mcb2pTypes) ? data.mcb2pTypes : [];
      cleanData.mcb2p = JSON.stringify({ count, types });
    }
    if (data && (data.mcb4pCount !== undefined || data.mcb4pTypes !== undefined)) {
      const count = Number(data.mcb4pCount || 0);
      const types = Array.isArray(data.mcb4pTypes) ? data.mcb4pTypes : [];
      cleanData.mcb4p = JSON.stringify({ count, types });
    }
  }

  // Update asset with sanitized data and mark COMPLETED
  const updatedAsset = await model.update({
    where: { id: assetId },
    data: {
      ...cleanData,
      status: "COMPLETED",
      lockedByUserId: userId,
      lockedAt: new Date(),
      updatedBy: userId,
    },
  });

  // Update survey status to READY_FOR_SUBMISSION if all assets completed (draft -> ready)
  const surveyDetails = await getSurveyById(updatedAsset.surveyId);
  const allChargersCompleted = surveyDetails.chargers.every((c) => c.status === "COMPLETED");
  const allPanelsCompleted = surveyDetails.panels.every((p) => p.status === "COMPLETED");
  const allTransformersCompleted = surveyDetails.transformers.every((t) => t.status === "COMPLETED");
  const allDGsCompleted = surveyDetails.dgs.every((d) => d.status === "COMPLETED");

  if (allChargersCompleted && allPanelsCompleted && allTransformersCompleted && allDGsCompleted) {
    if (surveyDetails.status === "DRAFT" || surveyDetails.status === "IN_PROGRESS") {
      await prisma.survey.update({
        where: { id: surveyDetails.id },
        data: { status: "READY_FOR_SUBMISSION" },
      });
    }
  }

  return updatedAsset;
};

const submitSurvey = async (userId, surveyId) => {
  const survey = await getSurveyById(surveyId);
  if (!survey) {
    const err = new Error("Survey not found.");
    err.statusCode = 404;
    throw err;
  }

  // Verify authorization
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  const isAdmin = user && (user.role === "ADMIN" || user.role === "SUB_ADMIN");
  if (!isAdmin && survey.createdById !== userId) {
    const isAssigned = survey.surveySite?.assignments?.some((a) => a.surveyorId === userId && !a.isDeleted);
    if (!isAssigned) {
      const err = new Error("Access denied. You are not assigned to this survey.");
      err.statusCode = 403;
      throw err;
    }
  }

  // 1. Verify Step 1 basic info exists
  if (!survey.operator || !survey.city || !survey.pincode || !survey.parkingArea || !survey.internetAvailability) {
    const err = new Error("Site Information (Step 1) is incomplete. Please complete all required site details.");
    err.statusCode = 400;
    throw err;
  }

  // 2. Check all dynamic assets are COMPLETED
  const chargers = survey.chargers || [];
  const panels = survey.panels || [];
  const transformers = survey.transformers || [];
  const dgs = survey.dgs || [];

  const incompleteCharger = chargers.find((c) => c.status !== "COMPLETED");
  if (incompleteCharger) {
    const err = new Error(`Charger #${incompleteCharger.assetIndex} is incomplete. Please complete all required asset forms before submitting.`);
    err.statusCode = 400;
    throw err;
  }

  const incompletePanel = panels.find((p) => p.status !== "COMPLETED");
  if (incompletePanel) {
    const err = new Error(`Panel #${incompletePanel.assetIndex} is incomplete. Please complete all required asset forms before submitting.`);
    err.statusCode = 400;
    throw err;
  }

  const incompleteTransformer = transformers.find((t) => t.status !== "COMPLETED");
  if (incompleteTransformer) {
    const err = new Error(`Transformer #${incompleteTransformer.assetIndex} is incomplete. Please complete all required asset forms before submitting.`);
    err.statusCode = 400;
    throw err;
  }

  const incompleteDG = dgs.find((d) => d.status !== "COMPLETED");
  if (incompleteDG) {
    const err = new Error(`DG #${incompleteDG.assetIndex} is incomplete. Please complete all required asset forms before submitting.`);
    err.statusCode = 400;
    throw err;
  }

  // 3. Update survey status to SUBMITTED and record submittedAt
  const updated = await prisma.$transaction(async (tx) => {
    const upd = await tx.survey.update({
      where: { id: surveyId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        updatedBy: userId,
      },
    });
    await propagateStatus(tx, survey, "SUBMITTED");
    return upd;
  });

  return getSurveyById(updated.id);
};

const propagateStatus = async (tx, survey, status) => {
  // Update SurveySite status
  await tx.surveySite.update({
    where: { id: survey.surveySiteId },
    data: { status: status === "APPROVED" ? "COMPLETED" : "IN_PROGRESS" },
  });

  // Find active assignment
  const assignment = await tx.surveyAssignment.findFirst({
    where: {
      surveySiteId: survey.surveySiteId,
      surveyorId: survey.createdById,
      isDeleted: false,
    },
  });

  if (assignment) {
    let assignmentStatus = "IN_PROGRESS";
    if (status === "APPROVED") {
      assignmentStatus = "COMPLETED";
    } else if (status === "SUBMITTED" || status === "UNDER_REVIEW") {
      assignmentStatus = "SUBMITTED";
    } else if (status === "DRAFT" || status === "RETURNED") {
      assignmentStatus = "IN_PROGRESS";
    }

    await tx.surveyAssignment.update({
      where: { id: assignment.id },
      data: { status: assignmentStatus },
    });
  }
};

const reviewSurvey = async (reviewerId, surveyId, { status, reviewRemarks }) => {
  const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
  if (!survey) throw new Error("Survey not found.");

  const updated = await prisma.$transaction(async (tx) => {
    const upd = await tx.survey.update({
      where: { id: surveyId },
      data: {
        status, // APPROVED or RETURNED
        reviewRemarks,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });
    await propagateStatus(tx, survey, status);
    return upd;
  });

  return updated;
};

const updateSurvey = async (userId, surveyId, data) => {
  const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
  if (!survey) throw new Error("Survey not found.");

  const allowedFields = [
    "status", "remarks", "reviewRemarks", "operator", "city", "pincode",
    "buildingName", "accessPersonName", "accessPersonMobile", "parkingArea",
    "internetAvailability", "surveyDate", "surveyTime", "latitude", "longitude"
  ];

  const updateData = { updatedBy: userId };
  allowedFields.forEach((field) => {
    if (data && data[field] !== undefined) {
      if (field === "remarks") {
        updateData.reviewRemarks = data[field];
      } else {
        updateData[field] = data[field];
      }
    }
  });

  const updated = await prisma.$transaction(async (tx) => {
    const upd = await tx.survey.update({
      where: { id: surveyId },
      data: updateData,
    });
    if (data && data.status) {
      await propagateStatus(tx, survey, data.status);
    }
    return upd;
  });

  return getSurveyById(updated.id);
};

module.exports = {
  getAllSurveys,
  getSurveyById,
  getSurveyBySiteId,
  initiateStep1,
  lockAsset,
  unlockAsset,
  saveAssetData,
  submitSurvey,
  reviewSurvey,
  updateSurvey,
};
