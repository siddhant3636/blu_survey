const { createPDFDocument } = require("../../utils/pdf");
const fs = require("fs");
const path = require("path");

const exportSurveyToPDF = async (survey, res) => {
  const doc = createPDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Survey-Report-${survey.id.slice(0, 8)}.pdf`
  );

  doc.pipe(res);

  const surveyorName = survey.createdBySurveyor?.name || "N/A";
  const siteName = survey.surveySite?.name || "N/A";
  const siteAddress = survey.surveySite?.address || "N/A";

  // Helper to draw horizontal lines
  const drawLine = () => {
    doc.moveDown(0.5);
    doc.lineWidth(1);
    doc.strokeColor("#e2e8f0");
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
  };

  // Helper to render asset-specific photos
  const getAssetPhotos = (assetTypeTitle, assetIndex) => {
    const expectedPrefix = `${assetTypeTitle} #${assetIndex}`.toLowerCase();
    const fallbackPrefix = `${assetTypeTitle}`.toLowerCase();
    return (survey.photos || []).filter((p) => {
      const catName = (p.category?.name || "").toLowerCase();
      return catName.includes(expectedPrefix) || (assetIndex === 1 && catName.includes(fallbackPrefix));
    });
  };

  const renderPhotosInPDF = (assetPhotos) => {
    if (!assetPhotos || assetPhotos.length === 0) return;
    doc.fontSize(11).fillColor("#4a5568").text("Attached Evidence Photos:", { underline: true });
    doc.moveDown(0.3);

    let xPos = 50;
    let yPos = doc.y;

    assetPhotos.forEach((ph) => {
      const imgPath = path.join(process.cwd(), "src/uploads", ph.filePath);
      if (fs.existsSync(imgPath)) {
        // If we would hit page bottom, add a page first
        if (yPos + 110 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          yPos = doc.y;
          xPos = 50;
        }

        try {
          doc.image(imgPath, xPos, yPos, { fit: [100, 100] });
          // Category label overlay description below image
          const catLabel = ph.category?.name?.split("-")?.pop()?.trim() || "Evidence";
          doc.fontSize(8).fillColor("#718096").text(catLabel, xPos, yPos + 102, { width: 100, align: "center" });

          xPos += 115;
          if (xPos + 100 > 545) {
            xPos = 50;
            yPos += 125;
          }
        } catch (err) {
          doc.fontSize(9).fillColor("#e53e3e").text(`[Image Error: ${ph.fileName}]`, xPos, yPos);
          xPos += 115;
        }
      }
    });

    if (xPos !== 50) {
      yPos += 125;
    }
    doc.y = yPos;
    doc.moveDown(0.5);
  };

  // Helper to render Breaker Ratings lists
  const renderBreakersListPDF = (rawField, label) => {
    if (!rawField) return;
    try {
      const parsed = typeof rawField === "string" ? JSON.parse(rawField) : rawField;
      if (parsed && parsed.count > 0 && Array.isArray(parsed.types)) {
        const valid = parsed.types.filter((t) => {
          if (t && typeof t === "object") {
            return t.rating || t.brandId;
          }
          return Boolean(t);
        });
        if (valid.length > 0) {
          doc.fontSize(10).fillColor("#4a5568").text(`${label} Breakers:`, { bold: true });
          valid.forEach((val, index) => {
            let rating = "";
            let brand = "";
            if (val && typeof val === "object") {
              rating = val.rating || "N/A";
              brand = val.brandName || "";
            } else {
              rating = String(val || "N/A");
            }
            const brandText = brand ? ` | Brand: ${brand}` : "";
            doc.fontSize(9).fillColor("#2d3748").text(`  • Breaker #${index + 1}: Rating / Type: ${rating}${brandText}`);
          });
          doc.moveDown(0.2);
        }
      }
    } catch (e) { }
  };

  // ====================================================
  // COVER & TITLE SECTION
  // ====================================================
  doc.fillColor("#1a202c").fontSize(22).text("EV Charger Site Survey Report", { align: "center", bold: true });
  doc.fontSize(10).fillColor("#718096").text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" });
  drawLine();

  // ====================================================
  // SECTION 1: SITE INFORMATION
  // ====================================================
  doc.fontSize(14).fillColor("#2b6cb0").text("1. Site Information", { bold: true });
  doc.moveDown(0.4);

  doc.fontSize(10).fillColor("#2d3748");
  doc.text(`Site ID: ${survey.surveySite?.siteId || "N/A"}`);
  doc.text(`Site Name: ${siteName}`);
  doc.text(`Concessionaire: ${survey.surveySite?.concessionaire || "N/A"}`);
  doc.text(`Land Owning Agency: ${survey.surveySite?.landOwningAgency || "N/A"}`);
  doc.text(`Address: ${siteAddress}`);
  doc.text(`GPS Location: ${survey.surveySite?.latitude ? `${survey.surveySite.latitude}, ${survey.surveySite.longitude}` : "N/A"}`);
  doc.text(`Operator Name: ${survey.operator || "N/A"}`);
  doc.text(`City: ${survey.city || "N/A"}`);
  doc.text(`Pincode: ${survey.pincode || "N/A"}`);
  doc.text(`Access Person Name: ${survey.accessPersonName || "N/A"}`);
  doc.text(`Access Person Mobile: ${survey.accessPersonMobile || "N/A"}`);
  doc.text(`Parking Area Type: ${survey.parkingArea || "N/A"}`);
  doc.text(`Internet Availability: ${survey.internetAvailability || "N/A"}`);
  doc.text(`Survey Remarks: ${survey.remarks || "None"}`);
  drawLine();

  // ====================================================
  // SECTION 2: SURVEY METADATA & WORKFLOW STATUS
  // ====================================================
  doc.fontSize(14).fillColor("#2b6cb0").text("2. Survey Metadata", { bold: true });
  doc.moveDown(0.4);

  doc.fontSize(10).fillColor("#2d3748");
  doc.text(`Survey ID: ${survey.id}`);
  doc.text(`Surveyor: ${surveyorName} (${survey.createdBySurveyor?.email || "N/A"})`);
  doc.text(`Date of Survey: ${survey.surveyDate || "N/A"} ${survey.surveyTime || ""}`);
  doc.text(`Status: ${survey.status}`);
  doc.text(`Audit & Review Remarks: ${survey.reviewRemarks || "None"}`);
  doc.text(`Submitted At: ${survey.submittedAt ? new Date(survey.submittedAt).toLocaleString() : "N/A"}`);
  drawLine();

  // ====================================================
  // SECTION 3: SURVEY ASSET COUNTS SUMMARY
  // ====================================================
  doc.fontSize(14).fillColor("#2b6cb0").text("3. Survey Asset Counts Summary", { bold: true });
  doc.moveDown(0.4);

  doc.fontSize(10).fillColor("#2d3748");
  doc.text(`Total Configured Chargers: ${survey.totalChargers}`);
  doc.text(`Total Configured Electrical Panels: ${survey.totalPanels}`);
  doc.text(`Total Configured Distribution Transformers: ${survey.totalTransformers}`);
  doc.text(`Total Configured DG Sets: ${survey.totalDG}`);

  doc.addPage();

  // ====================================================
  // SECTION 4: CHARGERS SPECIFICATION DETAILS
  // ====================================================
  if (survey.chargers && survey.chargers.length > 0) {
    doc.fontSize(14).fillColor("#2b6cb0").text("4. Chargers Check Details", { bold: true });
    doc.moveDown(0.5);

    survey.chargers.forEach((ch, idx) => {
      // Avoid page-break layout splitting if possible
      if (doc.y > doc.page.height - 220) {
        doc.addPage();
      }

      doc.fontSize(12).fillColor("#2d3748").text(`Charger #${ch.assetIndex} (Status: ${ch.status || "N/A"})`, { bold: true, underline: true });
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#2d3748");
      doc.text(`Manufacturer: ${ch.manufacturer?.name || "N/A"}`);
      doc.text(`Model: ${ch.model?.name || "N/A"}`);
      doc.text(`Connector: ${ch.connector?.type || "N/A"}`);
      doc.text(`MCCB Maker: ${ch.mccbMaker?.name || "N/A"}`);
      doc.text(`MCB Maker: ${ch.mcbMaker?.name || "N/A"}`);
      doc.text(`Serial Number: ${ch.serialNumber || "N/A"}`);
      doc.text(`Capacity (Power Rating): ${ch.powerRating || "N/A"}`);
      doc.text(`Voltage Input/Output: ${ch.voltage || "N/A"}`);
      doc.text(`Charger Type: ${ch.chargerType || "N/A"} (${ch.chargerCategory || "N/A"})`);
      doc.text(`Current Status: ${ch.currentStatus || "N/A"}`);
      doc.text(`Display Working: ${ch.displayWorking || "N/A"}`);
      doc.text(`Cable Condition: ${ch.cableCondition || "N/A"}`);
      doc.text(`Earthing Status: ${ch.earthingStatus || "N/A"}`);
      doc.text(`Fire Safety: ${ch.fireSafety || "N/A"}`);
      doc.text(`Lighting Status: ${ch.lightingStatus || "N/A"}`);
      doc.text(`GPS Location: ${ch.latitude ? `${ch.latitude.toFixed(6)}, ${ch.longitude.toFixed(6)}` : "N/A"}`);
      doc.text(`Remarks: ${ch.remarks || "None"}`);
      doc.moveDown(0.4);

      // Render Breakers Ratings Lists
      renderBreakersListPDF(ch.mccb4p, "MCCB 4P");
      renderBreakersListPDF(ch.mcb2p, "MCB 2P");
      renderBreakersListPDF(ch.mcb4p, "MCB 4P");

      // Render Photos associated with this specific Charger
      const chargerPhotos = getAssetPhotos("Charger", ch.assetIndex);
      renderPhotosInPDF(chargerPhotos);

      drawLine();
    });
    doc.addPage();
  }

  // ====================================================
  // SECTION 5: ELECTRICAL PANEL DETAILS
  // ====================================================
  if (survey.panels && survey.panels.length > 0) {
    doc.fontSize(14).fillColor("#2b6cb0").text("5. Electrical Panels Details", { bold: true });
    doc.moveDown(0.5);

    survey.panels.forEach((p, idx) => {
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      doc.fontSize(12).fillColor("#2d3748").text(`Panel #${p.assetIndex} - ${p.name || "LT Panel"} (Status: ${p.status || "N/A"})`, { bold: true, underline: true });
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#2d3748");
      doc.text(`Panel Board Tag Name: ${p.name || "N/A"}`);
      doc.text(`Capacity: ${p.capacity || "N/A"}`);
      doc.text(`Incoming Source: ${p.incomingSource || "N/A"}`);
      let parsedSections = null;
      try {
        if (p.breakerRating && p.breakerRating.trim().startsWith("{")) {
          parsedSections = JSON.parse(p.breakerRating.trim());
        }
      } catch (err) {
        // Not a JSON
      }

      if (parsedSections) {
        doc.text("Breaker Panels / Nested Data:", { bold: true });
        const sectionLabels = {
          mainDistribution: "Main Distribution Charger Panel",
          fastSlow: "Fast + Slow Charger Panel",
          fast: "Fast Charger Panel",
          slow: "Slow Charger Panel"
        };
        Object.keys(sectionLabels).forEach((secKey) => {
          const panelsList = parsedSections[secKey] || [];
          if (panelsList.length > 0) {
            doc.text(`  • ${sectionLabels[secKey]}:`, { bold: true });
            panelsList.forEach((panel, pIdx) => {
              doc.text(`      - Panel #${pIdx + 1}: Name: "${panel.name || "N/A"}"`, { bold: true });
              if (panel.mccb4p && panel.mccb4p.length > 0) {
                panel.mccb4p.forEach((mccb, mIdx) => {
                  doc.text(`          * MCCB 4P #${mIdx + 1}: Rating: ${mccb.rating || "N/A"}, Brand: ${mccb.brand || "N/A"}`);
                });
              } else {
                doc.text(`          * No MCCB 4P breakers configured.`);
              }
            });
          }
        });
      } else {
        doc.text(`Breaker Make / Rating: ${p.breakerRating || "N/A"}`);
      }
      doc.text(`Cable Size: ${p.cableSize || "N/A"}`);
      doc.text(`GPS Location: ${p.latitude ? `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}` : "N/A"}`);
      doc.moveDown(0.4);

      // Panel Photos
      const panelPhotos = getAssetPhotos("Panel", p.assetIndex);
      renderPhotosInPDF(panelPhotos);

      drawLine();
    });
    doc.addPage();
  }

  // ====================================================
  // SECTION 6: TRANSFORMERS DETAILS
  // ====================================================
  if (survey.transformers && survey.transformers.length > 0) {
    doc.fontSize(14).fillColor("#2b6cb0").text("6. Distribution Transformers Details", { bold: true });
    doc.moveDown(0.5);

    survey.transformers.forEach((t, idx) => {
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      doc.fontSize(12).fillColor("#2d3748").text(`Transformer #${t.assetIndex} (Status: ${t.status || "N/A"})`, { bold: true, underline: true });
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#2d3748");
      doc.text(`Capacity (KVA): ${t.capacityKVA ? `${t.capacityKVA} KVA` : "N/A"}`);
      doc.text(`Voltage Ratio: ${t.voltageRatio || "N/A"}`);
      doc.text(`Rated Current: ${t.currentRating || "N/A"}`);
      doc.text(`Oil Level OK: ${t.oilLevelOk ? "Yes" : "No"}`);
      doc.text(`Earthing Status: ${t.earthingStatus || "N/A"}`);
      doc.text(`GPS Location: ${t.latitude ? `${t.latitude.toFixed(6)}, ${t.longitude.toFixed(6)}` : "N/A"}`);
      doc.moveDown(0.4);

      // Transformer Photos
      const transformerPhotos = getAssetPhotos("Transformer", t.assetIndex);
      renderPhotosInPDF(transformerPhotos);

      drawLine();
    });
    doc.addPage();
  }

  // ====================================================
  // SECTION 7: DG SET DETAILS
  // ====================================================
  if (survey.dgs && survey.dgs.length > 0) {
    doc.fontSize(14).fillColor("#2b6cb0").text("7. Diesel Generators (DG) Details", { bold: true });
    doc.moveDown(0.5);

    survey.dgs.forEach((d, idx) => {
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      doc.fontSize(12).fillColor("#2d3748").text(`DG Set #${d.assetIndex} (Status: ${d.status || "N/A"})`, { bold: true, underline: true });
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#2d3748");
      doc.text(`Capacity (KVA): ${d.capacityKVA ? `${d.capacityKVA} KVA` : "N/A"}`);
      doc.text(`Fuel Tank Capacity (L): ${d.fuelTankLitres ? `${d.fuelTankLitres} Litres` : "N/A"}`);
      doc.text(`AMF Panel Present: ${d.amfPanelPresent ? "Yes" : "No"}`);
      doc.text(`Earthing Status / Condition: ${d.earthingStatus || "N/A"}`);
      doc.text(`GPS Location: ${d.latitude ? `${d.latitude.toFixed(6)}, ${d.longitude.toFixed(6)}` : "N/A"}`);
      doc.moveDown(0.4);

      // DG Photos
      const dgPhotos = getAssetPhotos("DG", d.assetIndex);
      renderPhotosInPDF(dgPhotos);

      drawLine();
    });
  }

  doc.end();
};

module.exports = {
  exportSurveyToPDF,
};
