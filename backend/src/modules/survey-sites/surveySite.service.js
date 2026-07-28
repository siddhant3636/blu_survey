const { prisma } = require("../../config/database");
const { formatSurveySite } = require("./surveySite.helper");
const ExcelJS = require("exceljs");

const getAllSites = async (user) => {
  if (!user || !["ADMIN", "SUB_ADMIN", "SURVEY_PERSON", "SURVEYOR", "MANAGER"].includes(user.role)) {
    return [];
  }
  let where = { isDeleted: false };

  if (user && (user.role === "SURVEY_PERSON" || user.role === "SURVEYOR")) {
    where.assignments = {
      some: {
        surveyorId: user.id,
        isDeleted: false,
      },
    };
  }
  // SUB_ADMIN can view all sites similar to ADMIN

  const sites = await prisma.surveySite.findMany({
    where,
    include: {
      assignments: {
        where: { isDeleted: false },
        include: {
          surveyor: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    },
  });

  const getLatestAssignmentTime = (site) => {
    const activeAssignments = site.assignments || [];
    if (activeAssignments.length === 0) {
      return new Date(site.createdAt).getTime();
    }
    const dates = activeAssignments.map((a) => new Date(a.assignedDate).getTime());
    return Math.max(...dates);
  };

  sites.sort((a, b) => getLatestAssignmentTime(b) - getLatestAssignmentTime(a));

  return sites.map(formatSurveySite);
};

const getSiteById = async (id) => {
  const site = await prisma.surveySite.findFirst({
    where: { id, isDeleted: false },
    include: {
      assignments: {
        where: { isDeleted: false },
        include: {
          surveyor: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    },
  });
  if (!site) throw new Error("Survey site not found.");
  return formatSurveySite(site);
};

const createSite = async (data) => {
  if (!data.siteId) {
    const count = await prisma.surveySite.count();
    const nextNum = (count + 1).toString().padStart(3, "0");
    data.siteId = `BSC${nextNum}`;
  } else {
    data.siteId = data.siteId.trim().toUpperCase();
  }
  const site = await prisma.surveySite.create({ data });
  return formatSurveySite(site);
};

const updateSite = async (id, data, user) => {
  const existing = await getSiteById(id);
  const { surveyorIds, ...siteData } = data;

  let newStatus = siteData.status || existing.status;
  if (surveyorIds !== undefined) {
    if (surveyorIds.length > 0 && newStatus === "PENDING") {
      newStatus = "ASSIGNED";
    } else if (surveyorIds.length === 0 && newStatus === "ASSIGNED") {
      newStatus = "PENDING";
    }
  }

  const site = await prisma.surveySite.update({
    where: { id: existing.id },
    data: {
      ...siteData,
      status: newStatus
    },
  });

  if (surveyorIds !== undefined) {
    const activeAssignments = await prisma.surveyAssignment.findMany({
      where: { surveySiteId: id, isDeleted: false }
    });
    const activeSurveyorIds = activeAssignments.map((a) => a.surveyorId);

    const toRemove = activeSurveyorIds.filter((sId) => !surveyorIds.includes(sId));
    if (toRemove.length > 0) {
      await prisma.surveyAssignment.updateMany({
        where: {
          surveySiteId: id,
          surveyorId: { in: toRemove }
        },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });
    }

    for (const sId of surveyorIds) {
      const existingAssignment = await prisma.surveyAssignment.findFirst({
        where: { surveySiteId: id, surveyorId: sId }
      });

      if (existingAssignment) {
        if (existingAssignment.isDeleted) {
          await prisma.surveyAssignment.update({
            where: { id: existingAssignment.id },
            data: {
              isDeleted: false,
              deletedAt: null,
              status: "ASSIGNED",
              assignedDate: new Date(),
              createdBy: user?.id || null
            }
          });
        }
      } else {
        await prisma.surveyAssignment.create({
          data: {
            surveySiteId: id,
            surveyorId: sId,
            createdBy: user?.id || null
          }
        });
      }
    }
  }

  return getSiteById(id);
};

const deleteSite = async (id) => {
  const existing = await getSiteById(id);
  await prisma.surveySite.update({
    where: { id: existing.id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  return true;
};

const bulkUploadSites = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];

  let totalProcessed = 0;
  let successfullyAdded = 0;
  let skippedDuplicates = 0;
  const invalidRows = [];
  const parsedDataRows = [];

  // Fetch all existing sites to perform lightning-fast in-memory deduplication checks
  const allExistingSites = await prisma.surveySite.findMany({
    where: { isDeleted: false },
    select: { name: true, concessionaire: true, landOwningAgency: true }
  });

  const existingMap = new Map();
  allExistingSites.forEach((site) => {
    const key = `${(site.name || "").trim().toLowerCase()}|${(site.concessionaire || "").trim().toLowerCase()}|${(site.landOwningAgency || "").trim().toLowerCase()}`;
    existingMap.set(key, true);
  });

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    rows.push({ row, rowNumber });
  });

  for (const { row, rowNumber } of rows) {
    const sNoCell = row.getCell(1).value;
    const nameCell = row.getCell(2).value;
    const concessionaireCell = row.getCell(3).value;
    const landAgencyCell = row.getCell(4).value;

    const getCellValue = (cell) => {
      if (cell === null || cell === undefined) return "";
      if (typeof cell === "object" && cell.text) return cell.text.toString();
      if (typeof cell === "object" && cell.result) return cell.result.toString();
      return cell.toString();
    };

    const sNoStr = getCellValue(sNoCell).trim();
    const nameStr = getCellValue(nameCell).trim();
    const concessionaireStr = getCellValue(concessionaireCell).trim();
    const landAgencyStr = getCellValue(landAgencyCell).trim();

    // 1. Skip completely blank rows
    if (!sNoStr && !nameStr && !concessionaireStr && !landAgencyStr) {
      continue;
    }

    // 2. Skip header row
    const isHeaderRow = 
      sNoStr.toLowerCase().includes("s.no") ||
      nameStr.toLowerCase().includes("name") ||
      concessionaireStr.toLowerCase().includes("concessionaire") ||
      landAgencyStr.toLowerCase().includes("land owning");
    
    if (isHeaderRow) {
      continue;
    }

    // 3. Section heading rows check
    const isNumericSNo = /^\d+$/.test(sNoStr) || /^\d+\.?\d*$/.test(sNoStr);
    const hasValues = concessionaireStr || landAgencyStr;

    if (!isNumericSNo && !hasValues && nameStr) {
      continue;
    }

    // 4. Data Row processing
    totalProcessed++;

    // Clean data
    const cleanedName = nameStr.replace(/\s+/g, " ").trim();
    const cleanedConcessionaire = concessionaireStr.replace(/\s+/g, " ").trim();
    const cleanedLandAgency = landAgencyStr.replace(/\s+/g, " ").trim();

    if (!cleanedName) {
      invalidRows.push({
        rowNumber,
        reason: "Missing site name"
      });
      continue;
    }

    // Uniqueness key
    const uniqueKey = `${cleanedName.toLowerCase()}|${cleanedConcessionaire.toLowerCase()}|${cleanedLandAgency.toLowerCase()}`;
    if (existingMap.has(uniqueKey)) {
      skippedDuplicates++;
      continue;
    }

    parsedDataRows.push({
      name: cleanedName,
      concessionaire: cleanedConcessionaire || null,
      landOwningAgency: cleanedLandAgency || null,
      address: cleanedName,
      rowNumber
    });
  }

  // Row-by-row insertion
  for (let i = 0; i < parsedDataRows.length; i++) {
    const rowData = parsedDataRows[i];
    try {
      let count = await prisma.surveySite.count();
      let siteId;
      let exists = true;
      while (exists) {
        const nextNum = (count + 1).toString().padStart(3, "0");
        siteId = `BSC${nextNum}`;
        const match = await prisma.surveySite.findUnique({ where: { siteId } });
        if (!match) {
          exists = false;
        } else {
          count++;
        }
      }

      await prisma.surveySite.create({
        data: {
          siteId,
          name: rowData.name,
          concessionaire: rowData.concessionaire,
          landOwningAgency: rowData.landOwningAgency,
          address: rowData.address,
          status: "PENDING"
        }
      });
      successfullyAdded++;
    } catch (dbErr) {
      console.error(`Error saving row ${rowData.rowNumber}:`, dbErr);
      invalidRows.push({
        rowNumber: rowData.rowNumber,
        reason: `Database error: ${dbErr.message}`
      });
    }
  }

  return {
    totalProcessed,
    successfullyAdded,
    skippedDuplicates,
    invalidRows
  };
};

module.exports = {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
  bulkUploadSites,
};
