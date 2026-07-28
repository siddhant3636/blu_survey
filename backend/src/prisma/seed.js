const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Seed Masters - Connectors
  const connectors = ["CCS2", "Type 2", "GB/T", "CHAdeMO", "DC001"];
  const connectorRecords = [];
  for (const type of connectors) {
    const rec = await prisma.connector.upsert({
      where: { type },
      update: {},
      create: { type },
    });
    connectorRecords.push(rec);
  }
  console.log(`Seeded ${connectorRecords.length} Connectors`);

  // 2. Seed Masters - Photo Categories
  const categories = [
    { name: "SITE_ENTRANCE", description: "Main entry point of the site" },
    { name: "PANEL_BOARD", description: "Electrical Panel Boards and breakers" },
    { name: "TRANSFORMER", description: "Distribution transformer area" },
    { name: "DG_SET", description: "Diesel Generator set" },
    { name: "CHARGER_LOCATION", description: "Proposed EV charger installation area" },
    { name: "EARTHING_PIT", description: "Earthing pit points" },
    { name: "SIGNATURE", description: "Surveyor and site supervisor signatures" },
    { name: "OTHER", description: "Other general photos" },
  ];
  for (const cat of categories) {
    await prisma.photoCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} Photo Categories`);

  // 3. Seed Masters - Charger Manufacturer & Models
  const manufacturers = [
    {
      name: "Delta Electronics",
      models: [
        { name: "Delta DC Wallbox 25kW", powerRating: "25kW" },
        { name: "Delta Ultra Fast 150kW", powerRating: "150kW" },
      ],
    },
    {
      name: "ABB",
      models: [
        { name: "Terra 54 CJT 50kW", powerRating: "50kW" },
        { name: "Terra 24 Type 2 AC 22kW", powerRating: "22kW" },
      ],
    },
    {
      name: "Exicom",
      models: [
        { name: "Exicom Spin 7.4kW AC", powerRating: "7.4kW" },
        { name: "Exicom Harmony 120kW DC", powerRating: "120kW" },
      ],
    },
    { name: "Schneider Electric", models: [] },
    { name: "Siemens", models: [] },
    { name: "Servotech Power Systems", models: [] },
    { name: "Okaya EV", models: [] },
    { name: "Tirex EV", models: [] },
    { name: "Statiq", models: [] },
    { name: "ChargeZone", models: [] },
    { name: "Tata Power EZ Charge", models: [] },
    { name: "Livguard", models: [] },
    { name: "EVRE", models: [] },
    { name: "Quench Chargers", models: [] },
    { name: "Numocity", models: [] },
    { name: "VNT", models: [] },
    { name: "Ryze", models: [] },
    { name: "Mindra", models: [] },
    { name: "Anup EVCQNNECT", models: [] },
    { name: "Conquerent", models: [] },
    { name: "GLIDA", models: [] },
    { name: "Pulse Energy", models: [] },
    { name: "Etrio", models: [] },
    { name: "Magenta ChargeGrid", models: [] },
    { name: "Kazam", models: [] },
    { name: "Relux Electric", models: [] },
    { name: "PlugNGo", models: [] },
    { name: "Livwize", models: [] },
  ];

  for (const mfg of manufacturers) {
    const createdMfg = await prisma.chargerManufacturer.upsert({
      where: { name: mfg.name },
      update: {},
      create: { name: mfg.name },
    });

    for (const model of mfg.models) {
      await prisma.chargerModel.upsert({
        where: {
          manufacturerId_name: {
            manufacturerId: createdMfg.id,
            name: model.name,
          },
        },
        update: { powerRating: model.powerRating },
        create: {
          manufacturerId: createdMfg.id,
          name: model.name,
          powerRating: model.powerRating,
        },
      });
    }
  }
  console.log("Seeded Charger Manufacturers and Models");

  // 4. Seed Master Data Categories
  const masterDataCategories = [
    {
      name: "Charger Capacity - AC",
      values: ["3.3 kW AC", "6.6 kW AC", "7.4 kW AC", "7.5 kW AC", "9.9 kW AC", "11 kW AC", "22 kW AC"]
    },
    {
      name: "Charger Capacity - DC",
      values: ["20 kW DC", "24 kW DC", "25 kW DC", "30 kW DC", "40 kW DC", "50 kW DC", "60 kW DC", "100 kW DC", "120 kW DC", "150 kW DC", "160 kW DC", "180 kW DC", "200 kW DC", "300 kW DC", "360 kW DC"]
    },
    {
      name: "Charger Brand",
      values: ["Exicom", "Delta Electronics", "ABB", "Schneider Electric", "Siemens", "Servotech Power Systems", "Okaya EV", "Tirex EV", "Statiq", "ChargeZone", "Tata Power EZ Charge", "Livguard", "EVRE", "Quench Chargers", "Numocity", "VNT", "Ryze", "Mindra", "Anup EVCQNNECT", "Conquerent", "GLIDA", "Pulse Energy", "Etrio", "Magenta ChargeGrid", "Kazam", "Relux Electric", "PlugNGo", "Livwize"]
    },
    {
      name: "MCB 2P Rating",
      values: ["MCB 6A 2P", "MCB 10A 2P", "MCB 16A 2P", "MCB 20A 2P", "MCB 25A 2P", "MCB 32A 2P", "MCB 40A 2P", "MCB 50A 2P", "MCB 63A 2P"]
    },
    {
      name: "MCB 4P Rating",
      values: ["MCB 6A 4P", "MCB 10A 4P", "MCB 16A 4P", "MCB 20A 4P", "MCB 25A 4P", "MCB 32A 4P", "MCB 40A 4P", "MCB 50A 4P", "MCB 63A 4P"]
    },
    {
      name: "MCCB Rating",
      values: ["MCCB 63A 4P", "MCCB 80A 4P", "MCCB 100A 4P", "MCCB 125A 4P", "MCCB 160A 4P", "MCCB 200A 4P", "MCCB 250A 4P", "MCCB 300A 4P", "MCCB 315A 4P", "MCCB 350A 4P", "MCCB 400A 4P", "MCCB 500A 4P", "MCCB 630A 4P", "MCCB 800A 4P", "MCCB 1000A 4P", "MCCB 1250A 4P", "MCCB 1600A 4P"]
    },
    {
      name: "MCCB MAKE",
      values: ["L&T", "Schneider Electric", "ABB", "Havells", "Legrand", "Eaton", "C&S", "CHINT", "Siemens"]
    },
    {
      name: "MCB MAKE",
      values: ["L&T", "Schneider Electric", "Havells", "ABB", "C&S", "Polycab", "Hager", "Eaton", "Anchor", "Legrand", "Siemens", "Finolex", "CHINT", "Mitsubishi Electric", "Fuji Electric"]
    },
    {
      name: "Concessionaire",
      values: [
        "Blu Smart Pvt Ltd.",
        "BFPL",
        "BCPL",
        "BCPL-DTL Site",
        "BluSmart Mobility Pvt Ltd",
        "Tata Power EV Charging Solutions",
        "Jio-bp Pulse Hub",
        "BluSmart Charge Network",
        "Delta Electronics Charging Infrastructure",
        "Exicom Power Solutions",
        "ABB E-mobility India",
        "Tata Power EZ Charge"
      ]
    },
    {
      name: "Land Owning Agency",
      values: [
        "DMRC",
        "DTC",
        "DSIIDC",
        "TPDDL",
        "BYPL",
        "NDMC",
        "HSIIDC",
        "DIAL",
        "NOIDA",
        "MCG",
        "MCD",
        "DDA"
      ]
    }
  ];

  for (const cat of masterDataCategories) {
    for (const val of cat.values) {
      await prisma.equipment.upsert({
        where: { name: val },
        update: { description: cat.name },
        create: { name: val, description: cat.name }
      });
    }
  }
  console.log("Seeded Master Data Categories, Breakers, and Makes");

  // 5. Seed Users (Admin, Sub Admin, Survey Person)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("Admin@123", salt);
  const subAdminPassword = await bcrypt.hash("SubAdmin@123", salt);
  const surveyorPassword = await bcrypt.hash("Surveyor@123", salt);

  const users = [
    {
      email: "admin@blusmart.com",
      name: "System Admin",
      password: adminPassword,
      role: "ADMIN",
    },
    {
      email: "subadmin@blusmart.com",
      name: "Survey Auditor",
      password: subAdminPassword,
      role: "SUB_ADMIN",
    },
    {
      email: "surveyor@blusmart.com",
      name: "Field Surveyor 1",
      password: surveyorPassword,
      role: "SURVEY_PERSON",
    },
    {
      email: "surveyor2@blusmart.com",
      name: "Field Surveyor 2",
      password: surveyorPassword,
      role: "SURVEY_PERSON",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role, password: user.password },
      create: user,
    });
  }
  console.log("Seeded Users (Admin, Sub Admin, Survey Persons)");

  // 6. Seed Sample Survey Sites
  const sampleSites = [
    {
      siteId: "BSC001",
      name: "Connaught Place Hub 1",
      concessionaire: "BluSmart Mobility Pvt Ltd",
      landOwningAgency: "New Delhi Municipal Council (NDMC)",
      address: "Inner Circle, Block A, Connaught Place, New Delhi",
      latitude: 28.6328,
      longitude: 77.2197,
      status: "PENDING",
    },
    {
      siteId: "BSC002",
      name: "Cyber City EV Hub",
      concessionaire: "Tata Power EV Charging Solutions",
      landOwningAgency: "Haryana State Industrial & Infrastructure Development Corporation (HSIIDC)",
      address: "DLF Cyber City, Building 10, Sector 24, Gurugram",
      latitude: 28.495,
      longitude: 77.0895,
      status: "ASSIGNED",
    },
    {
      siteId: "BSC003",
      name: "Aerocity Charging Plaza",
      concessionaire: "Jio-bp Pulse Hub",
      landOwningAgency: "Delhi International Airport Limited (DIAL)",
      address: "Hospitality District, Aerocity, IGI Airport, New Delhi",
      latitude: 28.5562,
      longitude: 77.12,
      status: "COMPLETED",
    },
    {
      siteId: "BSC004",
      name: "Noida Sector 62 EV Charging Station",
      concessionaire: "BluSmart Charge Network",
      landOwningAgency: "Noida Industrial Development Authority (NOIDA)",
      address: "Block B, Sector 62, Noida, Uttar Pradesh 201309",
      latitude: 28.6271,
      longitude: 77.3725,
      status: "ASSIGNED",
    },
    {
      siteId: "BSC005",
      name: "Gurugram Sector 44 Smart Station",
      concessionaire: "Delta Electronics Charging Infrastructure",
      landOwningAgency: "Municipal Corporation of Gurugram (MCG)",
      address: "Plot 14, Institutional Area, Sector 44, Gurugram, Haryana 122003",
      latitude: 28.4502,
      longitude: 77.0718,
      status: "ASSIGNED",
    },
    {
      siteId: "BSC006",
      name: "South Extension Part 2 Hub",
      concessionaire: "BluSmart Mobility Pvt Ltd",
      landOwningAgency: "Municipal Corporation of Delhi (MCD)",
      address: "Main Market, Block E, South Extension II, New Delhi 110049",
      latitude: 28.5684,
      longitude: 77.2215,
      status: "ASSIGNED",
    },
    {
      siteId: "BSC007",
      name: "Vasant Kunj Promenade EV Park",
      concessionaire: "Exicom Power Solutions",
      landOwningAgency: "Delhi Development Authority (DDA)",
      address: "Nelson Mandela Marg, Vasant Kunj, New Delhi 110070",
      latitude: 28.5422,
      longitude: 77.1558,
      status: "PENDING",
    },
    {
      siteId: "BSC008",
      name: "Dwarka Sector 21 Metro Plaza Hub",
      concessionaire: "BluSmart Mobility Pvt Ltd",
      landOwningAgency: "Delhi Metro Rail Corporation (DMRC)",
      address: "Metro Station Complex, Sector 21, Dwarka, New Delhi 110077",
      latitude: 28.5521,
      longitude: 77.0583,
      status: "ASSIGNED",
    },
    {
      siteId: "BSC009",
      name: "Okhla Industrial Area Phase 3 Station",
      concessionaire: "ABB E-mobility India",
      landOwningAgency: "DSIIDC",
      address: "Phase III, Okhla Industrial Estate, New Delhi 110020",
      latitude: 28.5477,
      longitude: 77.2736,
      status: "PENDING",
    },
    {
      siteId: "BSC010",
      name: "Nehru Place Terminal Charging Hub",
      concessionaire: "Tata Power EZ Charge",
      landOwningAgency: "DTC / DDA",
      address: "Bus Terminal Road, Nehru Place, New Delhi 110019",
      latitude: 28.5494,
      longitude: 77.2519,
      status: "PENDING",
    },
  ];

  const createdSitesMap = {};
  for (const siteData of sampleSites) {
    const existingBySiteId = siteData.siteId ? await prisma.surveySite.findUnique({ where: { siteId: siteData.siteId } }) : null;
    if (existingBySiteId) {
      const updated = await prisma.surveySite.update({
        where: { id: existingBySiteId.id },
        data: {
          name: siteData.name,
          concessionaire: siteData.concessionaire,
          landOwningAgency: siteData.landOwningAgency,
          address: siteData.address,
          latitude: siteData.latitude,
          longitude: siteData.longitude,
          status: siteData.status,
        },
      });
      createdSitesMap[siteData.siteId] = updated;
    } else {
      const existingByName = await prisma.surveySite.findFirst({ where: { name: siteData.name } });
      if (existingByName) {
        const updated = await prisma.surveySite.update({
          where: { id: existingByName.id },
          data: {
            siteId: siteData.siteId,
            concessionaire: siteData.concessionaire,
            landOwningAgency: siteData.landOwningAgency,
            address: siteData.address,
            latitude: siteData.latitude,
            longitude: siteData.longitude,
            status: siteData.status,
          },
        });
        createdSitesMap[siteData.siteId] = updated;
      } else {
        const created = await prisma.surveySite.create({ data: siteData });
        createdSitesMap[siteData.siteId] = created;
      }
    }
  }
  console.log(`Seeded ${sampleSites.length} Sample Survey Sites`);

  // Seed OPS, NOPS, and HUB sites from JSON
  const defaultSitesData = require("./formatted_seeds.json");
  const allDefaultSites = [
    ...defaultSitesData.opsSites,
    ...defaultSitesData.nopsSites,
    ...defaultSitesData.hubSites,
  ];

  for (const siteData of allDefaultSites) {
    const existingBySiteId = siteData.siteId ? await prisma.surveySite.findUnique({ where: { siteId: siteData.siteId } }) : null;
    
    if (existingBySiteId) {
      const updated = await prisma.surveySite.update({
        where: { id: existingBySiteId.id },
        data: {
          name: siteData.name,
          concessionaire: siteData.concessionaire,
          landOwningAgency: siteData.landOwningAgency,
          address: siteData.address,
          latitude: siteData.latitude !== null ? siteData.latitude : existingBySiteId.latitude,
          longitude: siteData.longitude !== null ? siteData.longitude : existingBySiteId.longitude,
        },
      });
      createdSitesMap[siteData.siteId] = updated;
    } else {
      const existingByName = await prisma.surveySite.findFirst({ where: { name: siteData.name } });
      if (existingByName) {
        const updated = await prisma.surveySite.update({
          where: { id: existingByName.id },
          data: {
            siteId: siteData.siteId,
            concessionaire: siteData.concessionaire,
            landOwningAgency: siteData.landOwningAgency,
            address: siteData.address,
            latitude: siteData.latitude !== null ? siteData.latitude : existingByName.latitude,
            longitude: siteData.longitude !== null ? siteData.longitude : existingByName.longitude,
          },
        });
        createdSitesMap[siteData.siteId] = updated;
      } else {
        const created = await prisma.surveySite.create({
          data: {
            siteId: siteData.siteId,
            name: siteData.name,
            concessionaire: siteData.concessionaire,
            landOwningAgency: siteData.landOwningAgency,
            address: siteData.address,
            latitude: siteData.latitude,
            longitude: siteData.longitude,
            status: siteData.status || "PENDING",
          },
        });
        createdSitesMap[siteData.siteId] = created;
      }
    }
  }
  console.log(`Seeded ${allDefaultSites.length} Default Operational, Non-Operational and Hub Survey Sites`);

  // Assign sites to surveyors
  const surveyor1 = await prisma.user.findUnique({ where: { email: "surveyor@blusmart.com" } });
  const surveyor2 = await prisma.user.findUnique({ where: { email: "surveyor2@blusmart.com" } });

  if (surveyor1) {
    const assignedSiteIds1 = ["BSC002", "BSC004", "BSC005", "BSC008"];
    for (const siteCode of assignedSiteIds1) {
      const s = createdSitesMap[siteCode];
      if (s) {
        await prisma.surveyAssignment.upsert({
          where: { surveySiteId_surveyorId: { surveySiteId: s.id, surveyorId: surveyor1.id } },
          update: { status: "ASSIGNED" },
          create: { surveySiteId: s.id, surveyorId: surveyor1.id, status: "ASSIGNED" },
        });
      }
    }
  }

  if (surveyor2) {
    const assignedSiteIds2 = ["BSC006"];
    for (const siteCode of assignedSiteIds2) {
      const s = createdSitesMap[siteCode];
      if (s) {
        await prisma.surveyAssignment.upsert({
          where: { surveySiteId_surveyorId: { surveySiteId: s.id, surveyorId: surveyor2.id } },
          update: { status: "ASSIGNED" },
          create: { surveySiteId: s.id, surveyorId: surveyor2.id, status: "ASSIGNED" },
        });
      }
    }
  }
  console.log("Seeded Survey Site Assignments");

  // 7. Seed Initial Settings
  const settings = [
    { key: "COMPANY_NAME", value: "BluSmart Mobility" },
    { key: "SUPPORT_EMAIL", value: "survey-support@blusmart.com" },
    { key: "MIN_PHOTOS_REQUIRED", value: "5" },
  ];
  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("Seeded System Settings");

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
