const { createWorkbook } = require("../../utils/excel");

const exportSurveyToExcel = async (survey, res) => {
  const workbook = createWorkbook();

  // ----------------------------------------------------
  // WORKSHEET 1: SURVEY SUMMARY & SITE INFO
  // ----------------------------------------------------
  const summarySheet = workbook.addWorksheet("Survey Summary");
  summarySheet.views = [{ state: "frozen", ySplit: 1 }];
  summarySheet.columns = [
    { header: "Field", key: "field", width: 30 },
    { header: "Value", key: "value", width: 60 },
  ];
  summarySheet.getRow(1).font = { bold: true };

  const surveyorName = survey.createdBySurveyor?.name || "N/A";
  const siteName = survey.surveySite?.name || "N/A";
  const siteAddress = survey.surveySite?.address || "N/A";

  summarySheet.addRow({ field: "Survey ID", value: survey.id });
  summarySheet.addRow({ field: "Site Name", value: siteName });
  summarySheet.addRow({ field: "Site ID", value: survey.surveySite?.siteId || "N/A" });
  summarySheet.addRow({ field: "Concessionaire", value: survey.surveySite?.concessionaire || "N/A" });
  summarySheet.addRow({ field: "Land Owning Agency", value: survey.surveySite?.landOwningAgency || "N/A" });
  summarySheet.addRow({ field: "Address", value: siteAddress });
  summarySheet.addRow({ field: "GPS Coordinates", value: survey.surveySite?.latitude ? `${survey.surveySite.latitude}, ${survey.surveySite.longitude}` : "N/A" });
  summarySheet.addRow({ field: "Survey Date", value: survey.surveyDate || "N/A" });
  summarySheet.addRow({ field: "Survey Time", value: survey.surveyTime || "N/A" });
  summarySheet.addRow({ field: "Building / Landmark", value: survey.buildingName || "N/A" });
  summarySheet.addRow({ field: "Operator", value: survey.operator || "N/A" });
  summarySheet.addRow({ field: "City", value: survey.city || "N/A" });
  summarySheet.addRow({ field: "Pincode", value: survey.pincode || "N/A" });
  summarySheet.addRow({ field: "Access Person Name", value: survey.accessPersonName || "N/A" });
  summarySheet.addRow({ field: "Access Person Mobile", value: survey.accessPersonMobile || "N/A" });
  summarySheet.addRow({ field: "Parking Area Type", value: survey.parkingArea || "N/A" });
  summarySheet.addRow({ field: "Internet Availability", value: survey.internetAvailability || "N/A" });
  summarySheet.addRow({ field: "Surveyor", value: surveyorName });
  summarySheet.addRow({ field: "Status", value: survey.status });
  summarySheet.addRow({ field: "Audit Remarks", value: survey.reviewRemarks || "None" });
  summarySheet.addRow({ field: "Submitted At", value: survey.submittedAt ? new Date(survey.submittedAt).toLocaleString() : "N/A" });
  summarySheet.addRow({ field: "Created At", value: survey.createdAt ? new Date(survey.createdAt).toLocaleString() : "N/A" });

  summarySheet.addRow({});
  summarySheet.addRow({ field: "ASSET COUNTS", value: "" });
  summarySheet.addRow({ field: "Total Chargers", value: survey.totalChargers });
  summarySheet.addRow({ field: "Total Panels", value: survey.totalPanels });
  summarySheet.addRow({ field: "Total Transformers", value: survey.totalTransformers });
  summarySheet.addRow({ field: "Total DG Sets", value: survey.totalDG });

  // ----------------------------------------------------
  // WORKSHEET 2: CHARGERS
  // ----------------------------------------------------
  const chargersSheet = workbook.addWorksheet("Chargers");
  chargersSheet.views = [{ state: "frozen", ySplit: 1 }];
  chargersSheet.columns = [
    { header: "Charger ID", key: "id", width: 36 },
    { header: "Survey ID", key: "surveyId", width: 36 },
    { header: "Asset Index", key: "assetIndex", width: 15 },
    { header: "Manufacturer", key: "manufacturer", width: 25 },
    { header: "Model", key: "model", width: 25 },
    { header: "Connector Type", key: "connector", width: 25 },
    { header: "MCCB Maker", key: "mccbMaker", width: 25 },
    { header: "MCB Maker", key: "mcbMaker", width: 25 },
    { header: "Serial Number", key: "serialNumber", width: 25 },
    { header: "Power Rating (Capacity)", key: "powerRating", width: 25 },
    { header: "Voltage Input/Output", key: "voltage", width: 30 },
    { header: "Charger Type", key: "chargerType", width: 25 },
    { header: "Charger Category", key: "chargerCategory", width: 20 },
    { header: "Current Status", key: "currentStatus", width: 20 },
    { header: "Display Working", key: "displayWorking", width: 15 },
    { header: "Cable Condition", key: "cableCondition", width: 20 },
    { header: "Earthing Status", key: "earthingStatus", width: 25 },
    { header: "Fire Safety", key: "fireSafety", width: 25 },
    { header: "Lighting Status", key: "lightingStatus", width: 25 },
    { header: "Latitude", key: "latitude", width: 15 },
    { header: "Longitude", key: "longitude", width: 15 },
    { header: "Remarks", key: "remarks", width: 40 },
    { header: "Status", key: "status", width: 15 },
  ];
  chargersSheet.getRow(1).font = { bold: true };

  // ----------------------------------------------------
  // WORKSHEET 3: CHARGER BREAKER DETAILS (1-to-many relation)
  // ----------------------------------------------------
  const breakerSheet = workbook.addWorksheet("Charger Breaker Details");
  breakerSheet.views = [{ state: "frozen", ySplit: 1 }];
  breakerSheet.columns = [
    { header: "Survey ID", key: "surveyId", width: 36 },
    { header: "Charger ID", key: "chargerId", width: 36 },
    { header: "Asset Index", key: "assetIndex", width: 15 },
    { header: "Breaker Category", key: "breakerCategory", width: 20 },
    { header: "Sequence Number", key: "seqNumber", width: 18 },
    { header: "Selected Rating/Type", key: "rating", width: 25 },
    { header: "Maker", key: "maker", width: 25 },
  ];
  breakerSheet.getRow(1).font = { bold: true };

  if (survey.chargers && survey.chargers.length > 0) {
    survey.chargers.forEach((ch) => {
      chargersSheet.addRow({
        id: ch.id,
        surveyId: survey.id,
        assetIndex: ch.assetIndex,
        manufacturer: ch.manufacturer?.name || "N/A",
        model: ch.model?.name || "N/A",
        connector: ch.connector?.type || "N/A",
        mccbMaker: ch.mccbMaker?.name || "N/A",
        mcbMaker: ch.mcbMaker?.name || "N/A",
        serialNumber: ch.serialNumber || "N/A",
        powerRating: ch.powerRating || "N/A",
        voltage: ch.voltage || "N/A",
        chargerType: ch.chargerType || "N/A",
        chargerCategory: ch.chargerCategory || "N/A",
        currentStatus: ch.currentStatus || "N/A",
        displayWorking: ch.displayWorking || "N/A",
        cableCondition: ch.cableCondition || "N/A",
        earthingStatus: ch.earthingStatus || "N/A",
        fireSafety: ch.fireSafety || "N/A",
        lightingStatus: ch.lightingStatus || "N/A",
        latitude: ch.latitude || "N/A",
        longitude: ch.longitude || "N/A",
        remarks: ch.remarks || "N/A",
        status: ch.status || "N/A",
      });

      const parseBreakers = (rawField, category, makerName) => {
        if (!rawField) return;
        try {
          const parsed = typeof rawField === "string" ? JSON.parse(rawField) : rawField;
          if (parsed && parsed.types && Array.isArray(parsed.types)) {
            parsed.types.filter((t) => {
              if (t && typeof t === "object") {
                return t.rating || t.brandId;
              }
              return Boolean(t);
            }).forEach((type, index) => {
              let ratingVal = "";
              let makerVal = makerName || "N/A";
              if (type && typeof type === "object") {
                ratingVal = type.rating || "N/A";
                makerVal = type.brandName || makerName || "N/A";
              } else {
                ratingVal = String(type || "N/A");
              }
              breakerSheet.addRow({
                surveyId: survey.id,
                chargerId: ch.id,
                assetIndex: ch.assetIndex,
                breakerCategory: category,
                seqNumber: index + 1,
                rating: ratingVal,
                maker: makerVal,
              });
            });
          }
        } catch (e) {}
      };

      parseBreakers(ch.mccb4p, "MCCB 4P", ch.mccbMaker?.name);
      parseBreakers(ch.mcb2p, "MCB 2P", ch.mcbMaker?.name);
      parseBreakers(ch.mcb4p, "MCB 4P", ch.mcbMaker?.name);
    });
  }

  // ----------------------------------------------------
  // WORKSHEET 4: ELECTRICAL PANELS
  // ----------------------------------------------------
  const panelsSheet = workbook.addWorksheet("Electrical Panels");
  panelsSheet.views = [{ state: "frozen", ySplit: 1 }];
  panelsSheet.columns = [
    { header: "Panel ID", key: "id", width: 36 },
    { header: "Survey ID", key: "surveyId", width: 36 },
    { header: "Asset Index", key: "assetIndex", width: 15 },
    { header: "Name / Tag", key: "name", width: 25 },
    { header: "Capacity", key: "capacity", width: 20 },
    { header: "Incoming Source", key: "incomingSource", width: 25 },
    { header: "Incoming Cable Size", key: "cableSize", width: 20 },
    { header: "Latitude", key: "latitude", width: 15 },
    { header: "Longitude", key: "longitude", width: 15 },
    { header: "Status", key: "status", width: 15 },
    // Nested panel sections columns
    { header: "Section", key: "sectionName", width: 30 },
    { header: "Panel Number", key: "nestedPanelNum", width: 15 },
    { header: "Panel Name", key: "nestedPanelName", width: 25 },
    { header: "MCCB Number", key: "mccbNum", width: 15 },
    { header: "MCCB Rating", key: "mccbRating", width: 20 },
    { header: "MCCB Brand / Maker", key: "mccbBrand", width: 20 },
    // Keep legacy column for backward compatibility
    { header: "Breaker Make / Rating (Legacy)", key: "breakerRating", width: 30 },
  ];
  panelsSheet.getRow(1).font = { bold: true };

  if (survey.panels && survey.panels.length > 0) {
    survey.panels.forEach((p) => {
      let parsedSections = null;
      try {
        if (p.breakerRating && p.breakerRating.trim().startsWith("{")) {
          parsedSections = JSON.parse(p.breakerRating.trim());
        }
      } catch (err) {
        // Not a JSON
      }

      if (parsedSections) {
        const sectionKeys = ["mainDistribution", "fastSlow", "fast", "slow"];
        const sectionLabels = {
          mainDistribution: "Main Distribution Charger Panel",
          fastSlow: "Fast + Slow Charger Panel",
          fast: "Fast Charger Panel",
          slow: "Slow Charger Panel"
        };

        let hasAddedRows = false;

        sectionKeys.forEach((secKey) => {
          const list = parsedSections[secKey] || [];
          list.forEach((panel, pIdx) => {
            const mccbList = panel.mccb4p || [];
            if (mccbList.length > 0) {
              mccbList.forEach((mccb, mIdx) => {
                panelsSheet.addRow({
                  id: p.id,
                  surveyId: survey.id,
                  assetIndex: p.assetIndex,
                  name: p.name || "N/A",
                  capacity: p.capacity || "N/A",
                  incomingSource: p.incomingSource || "N/A",
                  cableSize: p.cableSize || "N/A",
                  latitude: p.latitude || "N/A",
                  longitude: p.longitude || "N/A",
                  status: p.status || "N/A",
                  sectionName: sectionLabels[secKey],
                  nestedPanelNum: pIdx + 1,
                  nestedPanelName: panel.name || "N/A",
                  mccbNum: mIdx + 1,
                  mccbRating: mccb.rating || "N/A",
                  mccbBrand: mccb.brand || "N/A",
                  breakerRating: "JSON Configuration",
                });
                hasAddedRows = true;
              });
            } else {
              // Panel exists but has 0 breakers
              panelsSheet.addRow({
                id: p.id,
                surveyId: survey.id,
                assetIndex: p.assetIndex,
                name: p.name || "N/A",
                capacity: p.capacity || "N/A",
                incomingSource: p.incomingSource || "N/A",
                cableSize: p.cableSize || "N/A",
                latitude: p.latitude || "N/A",
                longitude: p.longitude || "N/A",
                status: p.status || "N/A",
                sectionName: sectionLabels[secKey],
                nestedPanelNum: pIdx + 1,
                nestedPanelName: panel.name || "N/A",
                mccbNum: "N/A",
                mccbRating: "N/A",
                mccbBrand: "N/A",
                breakerRating: "JSON Configuration",
              });
              hasAddedRows = true;
            }
          });
        });

        if (!hasAddedRows) {
          // JSON parsed but empty lists
          panelsSheet.addRow({
            id: p.id,
            surveyId: survey.id,
            assetIndex: p.assetIndex,
            name: p.name || "N/A",
            capacity: p.capacity || "N/A",
            incomingSource: p.incomingSource || "N/A",
            cableSize: p.cableSize || "N/A",
            latitude: p.latitude || "N/A",
            longitude: p.longitude || "N/A",
            status: p.status || "N/A",
            sectionName: "N/A",
            nestedPanelNum: "N/A",
            nestedPanelName: "N/A",
            mccbNum: "N/A",
            mccbRating: "N/A",
            mccbBrand: "N/A",
            breakerRating: "JSON Configuration (Empty)",
          });
        }
      } else {
        // Legacy row
        panelsSheet.addRow({
          id: p.id,
          surveyId: survey.id,
          assetIndex: p.assetIndex,
          name: p.name || "N/A",
          capacity: p.capacity || "N/A",
          incomingSource: p.incomingSource || "N/A",
          cableSize: p.cableSize || "N/A",
          latitude: p.latitude || "N/A",
          longitude: p.longitude || "N/A",
          status: p.status || "N/A",
          sectionName: "N/A",
          nestedPanelNum: "N/A",
          nestedPanelName: "N/A",
          mccbNum: "N/A",
          mccbRating: "N/A",
          mccbBrand: "N/A",
          breakerRating: p.breakerRating || "N/A",
        });
      }
    });
  }

  // ----------------------------------------------------
  // WORKSHEET 5: TRANSFORMERS
  // ----------------------------------------------------
  const transformersSheet = workbook.addWorksheet("Transformers");
  transformersSheet.views = [{ state: "frozen", ySplit: 1 }];
  transformersSheet.columns = [
    { header: "Transformer ID", key: "id", width: 36 },
    { header: "Survey ID", key: "surveyId", width: 36 },
    { header: "Asset Index", key: "assetIndex", width: 15 },
    { header: "Capacity (KVA)", key: "capacityKVA", width: 20 },
    { header: "Voltage Ratio", key: "voltageRatio", width: 20 },
    { header: "Rated Current", key: "currentRating", width: 20 },
    { header: "Oil Level OK", key: "oilLevelOk", width: 15 },
    { header: "Earthing Status", key: "earthingStatus", width: 25 },
    { header: "Latitude", key: "latitude", width: 15 },
    { header: "Longitude", key: "longitude", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];
  transformersSheet.getRow(1).font = { bold: true };

  if (survey.transformers && survey.transformers.length > 0) {
    survey.transformers.forEach((t) => {
      transformersSheet.addRow({
        id: t.id,
        surveyId: survey.id,
        assetIndex: t.assetIndex,
        capacityKVA: t.capacityKVA || "N/A",
        voltageRatio: t.voltageRatio || "N/A",
        currentRating: t.currentRating || "N/A",
        oilLevelOk: t.oilLevelOk ? "Yes" : "No",
        earthingStatus: t.earthingStatus || "N/A",
        latitude: t.latitude || "N/A",
        longitude: t.longitude || "N/A",
        status: t.status || "N/A",
      });
    });
  }

  // ----------------------------------------------------
  // WORKSHEET 6: DG SETS
  // ----------------------------------------------------
  const dgsSheet = workbook.addWorksheet("DG Sets");
  dgsSheet.views = [{ state: "frozen", ySplit: 1 }];
  dgsSheet.columns = [
    { header: "DG ID", key: "id", width: 36 },
    { header: "Survey ID", key: "surveyId", width: 36 },
    { header: "Asset Index", key: "assetIndex", width: 15 },
    { header: "Capacity (KVA)", key: "capacityKVA", width: 20 },
    { header: "Fuel Tank Capacity (L)", key: "fuelTankLitres", width: 25 },
    { header: "AMF Panel Present", key: "amfPanelPresent", width: 20 },
    { header: "Earthing Status", key: "earthingStatus", width: 25 },
    { header: "Latitude", key: "latitude", width: 15 },
    { header: "Longitude", key: "longitude", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];
  dgsSheet.getRow(1).font = { bold: true };

  if (survey.dgs && survey.dgs.length > 0) {
    survey.dgs.forEach((d) => {
      dgsSheet.addRow({
        id: d.id,
        surveyId: survey.id,
        assetIndex: d.assetIndex,
        capacityKVA: d.capacityKVA || "N/A",
        fuelTankLitres: d.fuelTankLitres || "N/A",
        amfPanelPresent: d.amfPanelPresent ? "Yes" : "No",
        earthingStatus: d.earthingStatus || "N/A",
        latitude: d.latitude || "N/A",
        longitude: d.longitude || "N/A",
        status: d.status || "N/A",
      });
    });
  }

  // ----------------------------------------------------
  // WORKSHEET 7: PHOTOS & EVIDENCE GALLERY
  // ----------------------------------------------------
  const photosSheet = workbook.addWorksheet("Photos & Evidence");
  photosSheet.views = [{ state: "frozen", ySplit: 1 }];
  photosSheet.columns = [
    { header: "Survey ID", key: "surveyId", width: 36 },
    { header: "Asset Type", key: "assetType", width: 20 },
    { header: "Asset ID", key: "assetId", width: 36 },
    { header: "Asset Index", key: "assetIndex", width: 15 },
    { header: "Photo Category", key: "category", width: 35 },
    { header: "File Name", key: "fileName", width: 40 },
    { header: "File Path / URL", key: "url", width: 60 },
    { header: "Latitude", key: "latitude", width: 15 },
    { header: "Longitude", key: "longitude", width: 15 },
    { header: "Captured At", key: "capturedAt", width: 25 },
  ];
  photosSheet.getRow(1).font = { bold: true };

  const getAssetAssociation = (catName) => {
    const nameLower = catName.toLowerCase();
    if (nameLower.includes("charger")) {
      const match = nameLower.match(/charger\s*#?\s*(\d+)/);
      return { assetType: "Charger", assetIndex: match ? parseInt(match[1]) : 1 };
    }
    if (nameLower.includes("panel")) {
      const match = nameLower.match(/panel\s*#?\s*(\d+)/);
      return { assetType: "Panel", assetIndex: match ? parseInt(match[1]) : 1 };
    }
    if (nameLower.includes("transformer")) {
      const match = nameLower.match(/transformer\s*#?\s*(\d+)/);
      return { assetType: "Transformer", assetIndex: match ? parseInt(match[1]) : 1 };
    }
    if (nameLower.includes("dg") || nameLower.includes("generator")) {
      const match = nameLower.match(/(?:dg|generator)\s*#?\s*(\d+)/);
      return { assetType: "DG", assetIndex: match ? parseInt(match[1]) : 1 };
    }
    return { assetType: "Site / General", assetIndex: null };
  };

  if (survey.photos && survey.photos.length > 0) {
    survey.photos.forEach((ph) => {
      const catName = ph.category?.name || "Uncategorized";
      const assoc = getAssetAssociation(catName);
      
      let assetId = "N/A";
      if (assoc.assetType === "Charger" && survey.chargers) {
        const found = survey.chargers.find((c) => c.assetIndex === assoc.assetIndex);
        if (found) assetId = found.id;
      } else if (assoc.assetType === "Panel" && survey.panels) {
        const found = survey.panels.find((p) => p.assetIndex === assoc.assetIndex);
        if (found) assetId = found.id;
      } else if (assoc.assetType === "Transformer" && survey.transformers) {
        const found = survey.transformers.find((t) => t.assetIndex === assoc.assetIndex);
        if (found) assetId = found.id;
      } else if (assoc.assetType === "DG" && survey.dgs) {
        const found = survey.dgs.find((d) => d.assetIndex === assoc.assetIndex);
        if (found) assetId = found.id;
      }

      photosSheet.addRow({
        surveyId: survey.id,
        assetType: assoc.assetType,
        assetId: assetId,
        assetIndex: assoc.assetIndex || "N/A",
        category: catName,
        fileName: ph.fileName,
        url: ph.url || ph.filePath,
        latitude: ph.latitude || "N/A",
        longitude: ph.longitude || "N/A",
        capturedAt: ph.capturedAt ? new Date(ph.capturedAt).toLocaleString() : "N/A",
      });
    });
  }

  // ----------------------------------------------------
  // RESPONSE HEADERS & STREAM WRITE
  // ----------------------------------------------------
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Survey-Report-${survey.id.slice(0, 8)}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  exportSurveyToExcel,
};
