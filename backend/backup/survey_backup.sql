--
-- PostgreSQL database dump
--

\restrict itFNoBcvRJF456XkNIvCMV8GHuf1fZ1yOhEi3ocQawfJQTsc1EE7AG3xRNcReM8

-- Dumped from database version 14.23
-- Dumped by pg_dump version 14.23

-- Started on 2026-07-24 00:15:11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 24911)
-- Name: Charger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Charger" (
    id text NOT NULL,
    "surveyId" text NOT NULL,
    "assetIndex" integer DEFAULT 1 NOT NULL,
    "manufacturerId" text,
    "modelId" text,
    "connectorId" text,
    "serialNumber" text,
    "powerRating" text,
    mccb4p text,
    mcb2p text,
    mcb4p text,
    voltage text,
    "chargerType" text,
    "chargerCategory" text,
    "currentStatus" text,
    "displayWorking" text,
    "cableCondition" text,
    "earthingStatus" text,
    "fireSafety" text,
    "lightingStatus" text,
    remarks text,
    latitude double precision,
    longitude double precision,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    "lockedByUserId" text,
    "lockedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "mcbMakerId" text,
    "mccbMakerId" text
);


ALTER TABLE public."Charger" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24966)
-- Name: ChargerManufacturer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChargerManufacturer" (
    id text NOT NULL,
    name text NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ChargerManufacturer" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24975)
-- Name: ChargerModel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChargerModel" (
    id text NOT NULL,
    "manufacturerId" text NOT NULL,
    name text NOT NULL,
    "powerRating" text NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ChargerModel" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24984)
-- Name: Connector; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Connector" (
    id text NOT NULL,
    type text NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Connector" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24945)
-- Name: DG; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DG" (
    id text NOT NULL,
    "surveyId" text NOT NULL,
    "assetIndex" integer DEFAULT 1 NOT NULL,
    "capacityKVA" double precision,
    "fuelTankLitres" double precision,
    "amfPanelPresent" boolean DEFAULT false NOT NULL,
    "earthingStatus" text,
    latitude double precision,
    longitude double precision,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    "lockedByUserId" text,
    "lockedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DG" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24993)
-- Name: Equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Equipment" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Equipment" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 24922)
-- Name: Panel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Panel" (
    id text NOT NULL,
    "surveyId" text NOT NULL,
    "assetIndex" integer DEFAULT 1 NOT NULL,
    name text,
    capacity text,
    "incomingSource" text,
    "breakerRating" text,
    "cableSize" text,
    latitude double precision,
    longitude double precision,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    "lockedByUserId" text,
    "lockedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Panel" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 24957)
-- Name: Photo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Photo" (
    id text NOT NULL,
    "surveyId" text NOT NULL,
    "categoryId" text NOT NULL,
    "filePath" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    latitude double precision,
    longitude double precision,
    "capturedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Photo" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 25002)
-- Name: PhotoCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PhotoCategory" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."PhotoCategory" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 25011)
-- Name: Settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Settings" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Settings" OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 24897)
-- Name: Survey; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Survey" (
    id text NOT NULL,
    "surveySiteId" text NOT NULL,
    "createdById" text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "reviewRemarks" text,
    "reviewedById" text,
    "reviewedAt" timestamp(3) without time zone,
    "totalChargers" integer DEFAULT 0 NOT NULL,
    "totalPanels" integer DEFAULT 0 NOT NULL,
    "totalTransformers" integer DEFAULT 0 NOT NULL,
    "totalDG" integer DEFAULT 0 NOT NULL,
    "surveyDate" text,
    "surveyTime" text,
    "buildingName" text,
    operator text,
    city text,
    pincode text,
    latitude double precision,
    longitude double precision,
    "accessPersonName" text,
    "accessPersonMobile" text,
    "parkingArea" text,
    "internetAvailability" text,
    remarks text,
    "submittedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Survey" OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 24886)
-- Name: SurveyAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SurveyAssignment" (
    id text NOT NULL,
    "surveySiteId" text NOT NULL,
    "surveyorId" text NOT NULL,
    "assignedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'ASSIGNED'::text NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SurveyAssignment" OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 24876)
-- Name: SurveySite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SurveySite" (
    id text NOT NULL,
    "siteId" text,
    name text NOT NULL,
    concessionaire text,
    "landOwningAgency" text,
    address text NOT NULL,
    latitude double precision,
    longitude double precision,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SurveySite" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 24933)
-- Name: Transformer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transformer" (
    id text NOT NULL,
    "surveyId" text NOT NULL,
    "assetIndex" integer DEFAULT 1 NOT NULL,
    "capacityKVA" double precision,
    "voltageRatio" text,
    "currentRating" text,
    "oilLevelOk" boolean DEFAULT true NOT NULL,
    "earthingStatus" text,
    latitude double precision,
    longitude double precision,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    "lockedByUserId" text,
    "lockedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Transformer" OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 24865)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'SURVEY_PERSON'::text NOT NULL,
    phone text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 24854)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 3485 (class 0 OID 24911)
-- Dependencies: 214
-- Data for Name: Charger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Charger" (id, "surveyId", "assetIndex", "manufacturerId", "modelId", "connectorId", "serialNumber", "powerRating", mccb4p, mcb2p, mcb4p, voltage, "chargerType", "chargerCategory", "currentStatus", "displayWorking", "cableCondition", "earthingStatus", "fireSafety", "lightingStatus", remarks, latitude, longitude, status, "lockedByUserId", "lockedAt", "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt", "mcbMakerId", "mccbMakerId") FROM stdin;
e700e860-8a57-4aac-8acf-09c0b72be312	4e319db4-c301-4c48-bd89-db3cb827d491	1	bb6413ee-4ed1-4c5f-8154-6ee3bcea4f2a	e1239594-aea0-4f0a-bae6-fcad124b0edb	4522cc10-0f82-4d68-bf52-2f696879092d	SN-D0001	60kW DC	{"count":2,"types":["MCCB 1250A 4P","MCCB 1000A 4P"]}	{"count":3,"types":["MCB 10A 2P","MCB 10A 2P","MCB 16A 2P"]}	{"count":1,"types":["MCB 10A 4P"]}	415V AC 3-Phase / 750V DC	DC Fast Charger	Fast	Operational	Yes	Good / Intact	Dual Earthing OK	Extinguisher Present & Valid	Sufficient Canopy Lighting	\N	28.41358383130028	77.04262745780514	COMPLETED	\N	\N	t	2026-07-23 10:49:13.015	\N	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-23 10:32:54.43	2026-07-23 10:49:13.018	\N	\N
b9e23250-f844-401d-bd87-a9027c0368d3	4e319db4-c301-4c48-bd89-db3cb827d491	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	IN_PROGRESS	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-23 10:51:17.89	t	2026-07-23 12:28:52.263	\N	\N	2026-07-23 10:51:14.026	2026-07-23 12:28:52.267	\N	\N
b6bd701f-ed1c-418d-8415-64b65a8cc361	06105082-96da-47ff-837c-5f8648e5829e	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 04:56:58.353	2026-07-24 04:56:58.353	\N	\N
c8d802b7-e33b-4ad8-a932-297a420f83d6	4e319db4-c301-4c48-bd89-db3cb827d491	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	IN_PROGRESS	01a9edac-e8b5-41a7-81d8-6dd115a2e834	2026-07-24 05:30:01.529	f	\N	\N	\N	2026-07-24 05:17:56.048	2026-07-24 05:30:01.532	\N	\N
4242418c-d493-4d66-b265-08450a83bd31	0f445b73-105a-4fd3-a8e6-58a41980a5e8	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	IN_PROGRESS	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-24 05:33:47.21	f	\N	\N	\N	2026-07-24 05:33:42.118	2026-07-24 05:33:47.211	\N	\N
bbc51478-6fca-4720-99db-fb7612339b30	8ba8ff22-83e7-4664-8de6-3708384d2fb1	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 05:50:37.733	2026-07-24 05:50:37.733	\N	\N
9eae4dc4-ad8b-44a3-8cef-034f660a20cd	a99c0db0-646c-487e-a5b5-843efa03ad32	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 05:52:04.699	2026-07-24 05:52:04.699	\N	\N
b657cc32-f430-445f-a235-6fe88a6f4eb9	24257cc6-df6c-40c2-8675-bfd6c75d8924	1	bb6413ee-4ed1-4c5f-8154-6ee3bcea4f2a	8803d92c-fcd5-4edb-93b7-4926634848eb	b777f78c-e593-4076-b309-72c437e829e5	SN-D0001	60	{"count":0,"types":[]}	{"count":0,"types":[]}	{"count":0,"types":[]}	415V AC 3-Phase / 750V DC	DC Fast Charger	Fast	Operational	Yes	Good / Intact	Dual Earthing OK	Extinguisher Present & Valid	Sufficient Canopy Lighting	\N	28.41359325747393	77.042655110247	COMPLETED	\N	\N	f	\N	\N	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-24 05:56:01.225	2026-07-24 05:57:30.429	\N	\N
\.


--
-- TOC entry 3490 (class 0 OID 24966)
-- Dependencies: 219
-- Data for Name: ChargerManufacturer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChargerManufacturer" (id, name, "isDeleted", "createdAt", "updatedAt", "isActive") FROM stdin;
482fca51-f78a-4154-bad7-5826ac4f1679	Delta Electronics	f	2026-07-23 10:00:20.529	2026-07-23 10:00:20.529	t
bb6413ee-4ed1-4c5f-8154-6ee3bcea4f2a	ABB	f	2026-07-23 10:00:20.544	2026-07-23 10:00:20.544	t
f09387e1-f69a-4981-87ca-804afd2e4da3	Exicom	f	2026-07-23 10:00:20.551	2026-07-23 10:00:20.551	t
\.


--
-- TOC entry 3491 (class 0 OID 24975)
-- Dependencies: 220
-- Data for Name: ChargerModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChargerModel" (id, "manufacturerId", name, "powerRating", "isDeleted", "createdAt", "updatedAt", "isActive") FROM stdin;
591bd87b-dc82-485f-a9fe-643d534e1ad8	482fca51-f78a-4154-bad7-5826ac4f1679	Delta DC Wallbox 25kW	25kW	f	2026-07-23 10:00:20.536	2026-07-23 10:27:45.357	t
c74fbd67-f84e-483e-acc9-ea2edfe8d48a	482fca51-f78a-4154-bad7-5826ac4f1679	Delta Ultra Fast 150kW	150kW	f	2026-07-23 10:00:20.542	2026-07-23 10:27:45.362	t
8803d92c-fcd5-4edb-93b7-4926634848eb	bb6413ee-4ed1-4c5f-8154-6ee3bcea4f2a	Terra 54 CJT 50kW	50kW	f	2026-07-23 10:00:20.547	2026-07-23 10:27:45.368	t
e1239594-aea0-4f0a-bae6-fcad124b0edb	bb6413ee-4ed1-4c5f-8154-6ee3bcea4f2a	Terra 24 Type 2 AC 22kW	22kW	f	2026-07-23 10:00:20.549	2026-07-23 10:27:45.37	t
280c759b-59df-449a-a415-d7b715aa1ca7	f09387e1-f69a-4981-87ca-804afd2e4da3	Exicom Spin 7.4kW AC	7.4kW	f	2026-07-23 10:00:20.555	2026-07-23 10:27:45.377	t
d0a781c4-7bee-4251-8562-fe83c9c6f1b6	f09387e1-f69a-4981-87ca-804afd2e4da3	Exicom Harmony 120kW DC	120kW	f	2026-07-23 10:00:20.557	2026-07-23 10:27:45.379	t
\.


--
-- TOC entry 3492 (class 0 OID 24984)
-- Dependencies: 221
-- Data for Name: Connector; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Connector" (id, type, "isDeleted", "createdAt", "updatedAt", "isActive") FROM stdin;
4522cc10-0f82-4d68-bf52-2f696879092d	CCS2	f	2026-07-23 10:00:20.333	2026-07-23 10:00:20.333	t
2c18b491-e43c-4b87-8df8-925819902515	Type 2	f	2026-07-23 10:00:20.346	2026-07-23 10:00:20.346	t
9ca06324-ac81-4c5b-8b8e-9ed49c504786	GB/T	f	2026-07-23 10:00:20.35	2026-07-23 10:00:20.35	t
f704e4a1-bd57-4217-96aa-0967b1b0b5a1	CHAdeMO	f	2026-07-23 10:00:20.353	2026-07-23 10:00:20.353	t
b777f78c-e593-4076-b309-72c437e829e5	DC001	f	2026-07-23 10:00:20.357	2026-07-23 10:00:20.357	t
\.


--
-- TOC entry 3488 (class 0 OID 24945)
-- Dependencies: 217
-- Data for Name: DG; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DG" (id, "surveyId", "assetIndex", "capacityKVA", "fuelTankLitres", "amfPanelPresent", "earthingStatus", latitude, longitude, status, "lockedByUserId", "lockedAt", "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
7f4c3aa0-ea91-4102-8684-65afc5fb3219	4e319db4-c301-4c48-bd89-db3cb827d491	1	\N	\N	f	\N	\N	\N	AVAILABLE	\N	\N	t	2026-07-23 10:49:13.036	\N	\N	2026-07-23 10:32:54.472	2026-07-23 10:49:13.038
2dd2eb64-62b3-4cdb-86d7-555d2fb50cd9	4e319db4-c301-4c48-bd89-db3cb827d491	1	\N	\N	f	\N	\N	\N	AVAILABLE	\N	\N	t	2026-07-23 12:28:52.3	\N	\N	2026-07-23 10:51:14.049	2026-07-23 12:28:52.302
ed6bfae3-ac23-431d-981c-6624c91c27b4	06105082-96da-47ff-837c-5f8648e5829e	1	\N	\N	f	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 04:56:58.395	2026-07-24 04:56:58.395
a8a82f1a-3519-4efe-831b-d691a4f1d7a2	0f445b73-105a-4fd3-a8e6-58a41980a5e8	1	125	200	f	zczczczc	28.41359328473401	77.04264828104422	COMPLETED	\N	\N	t	2026-07-24 05:33:42.133	\N	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-23 12:34:09.133	2026-07-24 05:33:42.134
1ad47684-6470-4d67-a1f7-96033904000c	8ba8ff22-83e7-4664-8de6-3708384d2fb1	1	\N	\N	f	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 05:50:37.772	2026-07-24 05:50:37.772
5e03b956-7be2-4281-a81a-cb329c4308d9	a99c0db0-646c-487e-a5b5-843efa03ad32	1	\N	\N	f	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 05:52:04.721	2026-07-24 05:52:04.721
\.


--
-- TOC entry 3493 (class 0 OID 24993)
-- Dependencies: 222
-- Data for Name: Equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Equipment" (id, name, description, "isDeleted", "createdAt", "updatedAt", "isActive") FROM stdin;
0f6fe910-bde1-4be0-8e2f-c45e8b29c32b	Servotech Power Systems	Charger Brand	f	2026-07-23 10:00:20.67	2026-07-23 10:27:45.455	t
17f32d66-3a45-4f46-b169-c227dc70db43	3.3 kW AC	Charger Capacity - AC	f	2026-07-23 10:00:20.609	2026-07-23 10:27:45.382	t
8c24e6cf-b090-409b-ba93-4a97441a926a	ABB	MCB MAKE	f	2026-07-23 10:00:20.665	2026-07-23 10:27:45.608	t
7347a609-e0fb-483d-af3d-9d630a0f02f4	6.6 kW AC	Charger Capacity - AC	f	2026-07-23 10:00:20.625	2026-07-23 10:27:45.386	t
177638ab-8e74-4df0-8aa3-935d8ae23933	7.4 kW AC	Charger Capacity - AC	f	2026-07-23 10:00:20.626	2026-07-23 10:27:45.388	t
8db87fbd-3508-497c-ae70-035366c8f8c9	7.5 kW AC	Charger Capacity - AC	f	2026-07-23 10:00:20.628	2026-07-23 10:27:45.39	t
37248e90-7aba-4399-987d-d84b3ba2c1d1	9.9 kW AC	Charger Capacity - AC	f	2026-07-23 10:00:20.63	2026-07-23 10:27:45.392	t
0f365a9a-d642-47fd-994a-45560e28e3e0	11 kW AC	Charger Capacity - AC	f	2026-07-23 10:00:20.632	2026-07-23 10:27:45.394	t
91181c8f-fe57-41ec-b0e2-0439f52788d1	22 kW AC	Charger Capacity - AC	f	2026-07-23 10:00:20.634	2026-07-23 10:27:45.396	t
eb03f164-99bf-4811-b316-f21cda51ebfa	20 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.636	2026-07-23 10:27:45.398	t
b3b17765-bf67-422a-bd7a-61fd8b2c669e	24 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.638	2026-07-23 10:27:45.4	t
e46d5e2b-43b0-497f-96d8-468225a14182	30 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.641	2026-07-23 10:27:45.42	t
b6f84971-06ea-43a6-8c09-ccde3917cdff	40 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.643	2026-07-23 10:27:45.422	t
edccb3ca-45d9-4628-aa9b-936660130c35	50 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.645	2026-07-23 10:27:45.424	t
baaa5b33-cc8b-4513-9673-81e318718882	60 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.646	2026-07-23 10:27:45.426	t
1108137f-2515-4290-9091-541a4c7557dc	100 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.648	2026-07-23 10:27:45.428	t
9c40e5ef-386c-44ee-8660-4913ddaca773	120 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.65	2026-07-23 10:27:45.43	t
999b30cf-074c-4a81-95ef-4bbe26a29463	150 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.652	2026-07-23 10:27:45.433	t
293a0955-99e6-44b0-ae1e-0a457271e36d	160 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.654	2026-07-23 10:27:45.435	t
cc59f816-f0c5-43c0-bd0e-92d280023da6	180 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.655	2026-07-23 10:27:45.437	t
d5bf1ed8-3e05-48a4-8294-1af2af291549	200 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.657	2026-07-23 10:27:45.438	t
6352b2e0-ca39-4e11-90ca-97aec8e1f57a	300 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.658	2026-07-23 10:27:45.44	t
30335a92-fb48-4c4f-b83d-643f88bcfa9b	360 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.66	2026-07-23 10:27:45.442	t
d28eb8a1-3877-4a99-a6ea-6859894273f1	Exicom	Charger Brand	f	2026-07-23 10:00:20.662	2026-07-23 10:27:45.444	t
8e55ab02-8fe3-4f05-a0c2-9ddd8475fcf8	Delta Electronics	Charger Brand	f	2026-07-23 10:00:20.663	2026-07-23 10:27:45.447	t
e44cfd18-5927-4baa-8432-26b351b92e32	Okaya EV	Charger Brand	f	2026-07-23 10:00:20.671	2026-07-23 10:27:45.457	t
988be43d-eff3-4d8e-964c-ecbebeee1bb5	Tirex EV	Charger Brand	f	2026-07-23 10:00:20.673	2026-07-23 10:27:45.459	t
91d6908e-bac9-49ab-be58-44b66f66b57f	Statiq	Charger Brand	f	2026-07-23 10:00:20.675	2026-07-23 10:27:45.461	t
83f34654-ad2c-4d22-aae9-0faf319a35d1	ChargeZone	Charger Brand	f	2026-07-23 10:00:20.676	2026-07-23 10:27:45.463	t
f53cb8a6-97b8-4754-9c8a-7ebe76d07f78	Tata Power EZ Charge	Charger Brand	f	2026-07-23 10:00:20.678	2026-07-23 10:27:45.466	t
74ce98a5-6811-48cb-8dd1-5976e8a3611e	Livguard	Charger Brand	f	2026-07-23 10:00:20.68	2026-07-23 10:27:45.468	t
68d7863b-edf4-4ff1-b9b2-838de1b44341	EVRE	Charger Brand	f	2026-07-23 10:00:20.682	2026-07-23 10:27:45.47	t
4eb4f315-e146-48c5-80d3-8def84ddde1a	Quench Chargers	Charger Brand	f	2026-07-23 10:00:20.683	2026-07-23 10:27:45.472	t
5f67d44d-acd2-4feb-b75c-764f055c02aa	Numocity	Charger Brand	f	2026-07-23 10:00:20.685	2026-07-23 10:27:45.474	t
65e142d0-6963-43fa-b339-6fb4efdc56de	VNT	Charger Brand	f	2026-07-23 10:00:20.686	2026-07-23 10:27:45.476	t
5bf81cc8-af06-48a3-b6d0-25707c6711c9	Ryze	Charger Brand	f	2026-07-23 10:00:20.688	2026-07-23 10:27:45.478	t
2763c530-b4ed-42d8-9453-8a09d48d05ed	Mindra	Charger Brand	f	2026-07-23 10:00:20.69	2026-07-23 10:27:45.481	t
ac29d008-b2ee-4f03-86e0-b8ee6fc19eaa	Conquerent	Charger Brand	f	2026-07-23 10:00:20.693	2026-07-23 10:27:45.485	t
720c0d3e-4149-4460-b7bd-70855a35f161	GLIDA	Charger Brand	f	2026-07-23 10:00:20.695	2026-07-23 10:27:45.487	t
966a9254-fecf-4476-bf3f-3a40b562b2e6	Pulse Energy	Charger Brand	f	2026-07-23 10:00:20.696	2026-07-23 10:27:45.489	t
f9629c69-cede-425f-8f77-2450d3377ce5	Etrio	Charger Brand	f	2026-07-23 10:00:20.698	2026-07-23 10:27:45.491	t
c2b6f57e-7728-41b2-b0f8-66831a1a1ab0	Magenta ChargeGrid	Charger Brand	f	2026-07-23 10:00:20.7	2026-07-23 10:27:45.494	t
6cae2d3d-b9a4-4800-9895-08225a835673	Kazam	Charger Brand	f	2026-07-23 10:00:20.702	2026-07-23 10:27:45.496	t
00379046-b2c8-472b-a123-8dd965549839	Relux Electric	Charger Brand	f	2026-07-23 10:00:20.703	2026-07-23 10:27:45.5	t
fd4eb807-0f03-4492-8acc-19ca71847691	PlugNGo	Charger Brand	f	2026-07-23 10:00:20.705	2026-07-23 10:27:45.502	t
61bd2b20-8b0a-43f3-a15f-682086419924	Livwize	Charger Brand	f	2026-07-23 10:00:20.706	2026-07-23 10:27:45.505	t
3db0458f-66f4-4106-a493-d981b616ae10	MCB 6A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.708	2026-07-23 10:27:45.508	t
66792957-a32a-4dee-9602-0b177bf14b68	MCB 10A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.71	2026-07-23 10:27:45.51	t
533aaabc-f6cb-4ac5-b25c-b770cd228e85	MCB 16A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.711	2026-07-23 10:27:45.512	t
062b33df-f2b7-41e6-b395-d780bc258898	MCB 20A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.713	2026-07-23 10:27:45.516	t
36b1ff80-d4d5-4fb6-837b-e8621a7006af	MCB 25A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.714	2026-07-23 10:27:45.519	t
01f285be-6939-4ef6-a42b-5b1c2087e198	MCB 32A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.716	2026-07-23 10:27:45.521	t
db199cb8-1aad-46f3-9223-343c9f2c4d3e	MCB 40A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.718	2026-07-23 10:27:45.523	t
c2389002-5b1c-4dfa-87ef-41367a52c141	MCB 50A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.72	2026-07-23 10:27:45.525	t
57300cc3-3fff-4994-b6f6-2126ebf7eba3	MCB 63A 2P	MCB 2P Rating	f	2026-07-23 10:00:20.722	2026-07-23 10:27:45.527	t
ddf97d83-04eb-40d9-a121-5c6a7a0d215e	MCB 6A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.723	2026-07-23 10:27:45.529	t
7694149f-7bf4-4868-a941-c94b20c1fa93	MCB 10A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.725	2026-07-23 10:27:45.532	t
2fabe907-2aed-46c7-a6a3-9490a6a4f267	MCB 16A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.727	2026-07-23 10:27:45.534	t
44e7b6b9-3c21-4ec6-979e-57d590526cc8	MCB 20A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.728	2026-07-23 10:27:45.535	t
91b0a6c6-2c80-48ff-afba-9da18cadd710	MCB 25A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.73	2026-07-23 10:27:45.537	t
b5741b1c-8763-4e03-a357-e4d2ab1d82ae	MCB 32A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.732	2026-07-23 10:27:45.539	t
2a4e22a4-bcd3-4fa3-800c-3f373acb2f2d	MCB 40A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.734	2026-07-23 10:27:45.541	t
f9afdbb1-de41-4921-a14a-819cf403065b	MCB 50A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.735	2026-07-23 10:27:45.543	t
d4604999-732e-4100-9351-108e26106f21	MCB 63A 4P	MCB 4P Rating	f	2026-07-23 10:00:20.737	2026-07-23 10:27:45.545	t
0fe20c99-c0af-4f22-bf61-28134333e8e2	MCCB 63A 4P	MCCB Rating	f	2026-07-23 10:00:20.738	2026-07-23 10:27:45.547	t
f0ced225-e049-4cac-b212-4ab5057026c0	MCCB 80A 4P	MCCB Rating	f	2026-07-23 10:00:20.74	2026-07-23 10:27:45.55	t
57215046-f064-4993-abba-af0462bb3d2a	MCCB 125A 4P	MCCB Rating	f	2026-07-23 10:00:20.743	2026-07-23 10:27:45.554	t
31c7d840-2327-4413-baf6-02389d1d27f0	MCCB 160A 4P	MCCB Rating	f	2026-07-23 10:00:20.745	2026-07-23 10:27:45.556	t
487b860f-fa40-4c99-8beb-2087f92e2496	Siemens	MCB MAKE	f	2026-07-23 10:00:20.668	2026-07-23 10:27:45.622	t
9ec88735-d806-44a6-864c-3bb028aeeae7	25 kW DC	Charger Capacity - DC	f	2026-07-23 10:00:20.64	2026-07-23 10:27:45.402	t
b38d644d-b55c-4c2e-8214-b5849e89d71a	Anup EVCQNNECT	Charger Brand	f	2026-07-23 10:00:20.691	2026-07-23 10:27:45.483	t
3a3969d7-7c06-4112-8db5-4237f14b0cce	MCCB 100A 4P	MCCB Rating	f	2026-07-23 10:00:20.742	2026-07-23 10:27:45.552	t
dd74c2dc-0e8d-4a50-85eb-610994198f97	MCCB 200A 4P	MCCB Rating	f	2026-07-23 10:00:20.746	2026-07-23 10:27:45.558	t
2c3c6841-3b92-45a6-bc41-db236323da51	MCCB 250A 4P	MCCB Rating	f	2026-07-23 10:00:20.749	2026-07-23 10:27:45.56	t
6335deca-8dc4-4565-8258-c12882463301	MCCB 300A 4P	MCCB Rating	f	2026-07-23 10:00:20.751	2026-07-23 10:27:45.562	t
6e8502bc-6cb6-43bc-a678-08554962e6b1	MCCB 315A 4P	MCCB Rating	f	2026-07-23 10:00:20.752	2026-07-23 10:27:45.565	t
aa37ff83-cee7-4ce4-8680-77f38825bfeb	MCCB 350A 4P	MCCB Rating	f	2026-07-23 10:00:20.754	2026-07-23 10:27:45.567	t
d953b058-8ffa-4f7b-9d30-0996909ebe0e	MCCB 400A 4P	MCCB Rating	f	2026-07-23 10:00:20.756	2026-07-23 10:27:45.569	t
1f97ca6f-9aaf-47f0-ab80-02457a6b65f8	MCCB 500A 4P	MCCB Rating	f	2026-07-23 10:00:20.757	2026-07-23 10:27:45.571	t
4e3bb1da-0cd6-41c1-a336-747f1faa7e4f	MCCB 630A 4P	MCCB Rating	f	2026-07-23 10:00:20.758	2026-07-23 10:27:45.573	t
68c0e952-0bcb-4933-9f35-df15cc7cdad9	MCCB 800A 4P	MCCB Rating	f	2026-07-23 10:00:20.76	2026-07-23 10:27:45.575	t
d675f0cd-544f-42a1-9658-004261d7ccfd	MCCB 1000A 4P	MCCB Rating	f	2026-07-23 10:00:20.762	2026-07-23 10:27:45.577	t
ebdccbf0-9368-40fc-8988-3597cfb924f5	MCCB 1250A 4P	MCCB Rating	f	2026-07-23 10:00:20.764	2026-07-23 10:27:45.579	t
f8db5cf8-9a8a-4016-8f25-c7491a4d91b7	MCCB 1600A 4P	MCCB Rating	f	2026-07-23 10:00:20.765	2026-07-23 10:27:45.582	t
183b44eb-4a4e-4e2a-99ca-a0e1a653e433	L&T	MCB MAKE	f	2026-07-23 10:00:20.767	2026-07-23 10:27:45.602	t
d654c1c5-4299-45ee-9712-b57d6aa3de4c	Schneider Electric	MCB MAKE	f	2026-07-23 10:00:20.666	2026-07-23 10:27:45.604	t
942c6374-27e1-4d6b-b1ea-820e56bbd075	Havells	MCB MAKE	f	2026-07-23 10:00:20.772	2026-07-23 10:27:45.606	t
426ac9c0-369c-48f3-ba8f-1a4b8d0515ba	C&S	MCB MAKE	f	2026-07-23 10:00:20.777	2026-07-23 10:27:45.61	t
3e410011-d808-4c82-aa1c-b499d8b17be4	Polycab	MCB MAKE	f	2026-07-23 10:00:20.801	2026-07-23 10:27:45.612	t
2b186ca2-2617-4c28-ad7c-09454d8b7b86	Hager	MCB MAKE	f	2026-07-23 10:00:20.803	2026-07-23 10:27:45.614	t
965501e6-0d40-48ae-80c1-359943475350	Eaton	MCB MAKE	f	2026-07-23 10:00:20.776	2026-07-23 10:27:45.616	t
d0a72065-30e2-4ecd-9153-5eb70aebc581	Anchor	MCB MAKE	f	2026-07-23 10:00:20.806	2026-07-23 10:27:45.618	t
599c15b9-bce9-48b6-8885-5f108e61cad5	Legrand	MCB MAKE	f	2026-07-23 10:00:20.774	2026-07-23 10:27:45.62	t
d7687499-b541-46b7-a9c1-e91ab4a75d94	Finolex	MCB MAKE	f	2026-07-23 10:00:20.811	2026-07-23 10:27:45.624	t
34326840-558d-424e-967e-84615ff7aec7	CHINT	MCB MAKE	f	2026-07-23 10:00:20.779	2026-07-23 10:27:45.626	t
9c2bf05e-c730-4121-9be0-541a80df0a4c	Mitsubishi Electric	MCB MAKE	f	2026-07-23 10:00:20.814	2026-07-23 10:27:45.628	t
c8c226f9-8d90-402e-a874-c1e1f09e1f00	Fuji Electric	MCB MAKE	f	2026-07-23 10:00:20.816	2026-07-23 10:27:45.63	t
ee6a9360-415b-48e0-bfce-df0455ad33e5	Sid	MCCB MAKE	f	2026-07-24 05:32:15.095	2026-07-24 05:32:15.095	t
\.


--
-- TOC entry 3486 (class 0 OID 24922)
-- Dependencies: 215
-- Data for Name: Panel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Panel" (id, "surveyId", "assetIndex", name, capacity, "incomingSource", "breakerRating", "cableSize", latitude, longitude, status, "lockedByUserId", "lockedAt", "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
03cfb853-c0da-4767-8fde-ed69b23f3cef	4e319db4-c301-4c48-bd89-db3cb827d491	2	Panel Board #2	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	t	2026-07-23 10:49:13.023	\N	\N	2026-07-23 10:32:54.449	2026-07-23 10:49:13.025
79c55843-e55a-410c-8305-cb82f5276c2e	4e319db4-c301-4c48-bd89-db3cb827d491	1	Panel Board #1	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	t	2026-07-23 10:49:13.026	\N	\N	2026-07-23 10:32:54.442	2026-07-23 10:49:13.028
dfe3ba7b-1e56-4721-bca9-8fa87f20fc31	4e319db4-c301-4c48-bd89-db3cb827d491	1	Panel Board #1	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	t	2026-07-23 12:28:52.278	\N	\N	2026-07-23 10:51:14.035	2026-07-23 12:28:52.28
b149d6c2-74d9-40ea-9f0b-b6627117fbc6	06105082-96da-47ff-837c-5f8648e5829e	1	Panel Board #1	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 04:56:58.369	2026-07-24 04:56:58.369
da821b24-16fe-4357-aea6-0185b69b2bb7	8ba8ff22-83e7-4664-8de6-3708384d2fb1	1	Panel Board #1	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 05:50:37.749	2026-07-24 05:50:37.749
2f2ec5a9-0305-4cfb-ba58-05a50ce9de9d	a99c0db0-646c-487e-a5b5-843efa03ad32	1	Panel Board #1	\N	\N	\N	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 05:52:04.706	2026-07-24 05:52:04.706
\.


--
-- TOC entry 3489 (class 0 OID 24957)
-- Dependencies: 218
-- Data for Name: Photo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Photo" (id, "surveyId", "categoryId", "filePath", "fileName", "fileSize", latitude, longitude, "capturedAt", "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
e7eb1be2-d0b6-4b2a-8cd0-5b2c1666f91c	4e319db4-c301-4c48-bd89-db3cb827d491	a223f5ce-7f8f-44f9-a6fb-8004e1e789a2	charger #1 - right view/photo-1784803678281-343148703.jpg	charger_1_Right_View-1784803678271.jpg	0	28.41358383130028	77.04262745780514	\N	f	\N	\N	\N	2026-07-23 10:47:58.299	2026-07-23 10:47:58.299
706f8852-c929-4f89-ae16-dac699692c37	4e319db4-c301-4c48-bd89-db3cb827d491	cc1dbfd3-7b3f-41c3-a6d7-460b840d3d1f	charger #1 - front view/photo-1784803950522-833464656.jpg	charger_1_Front_View-1784803950502.jpg	0	\N	\N	\N	f	\N	\N	\N	2026-07-23 10:52:30.548	2026-07-23 10:52:30.548
c8bf1b73-1dc0-46a0-ade0-3a28dbebb90c	4e319db4-c301-4c48-bd89-db3cb827d491	daf4bf57-bf99-4f10-aa1f-878d16c7110d	charger #1 - left view/photo-1784803959335-301048852.jpg	charger_1_Left_View-1784803959323.jpg	0	\N	\N	\N	f	\N	\N	\N	2026-07-23 10:52:39.362	2026-07-23 10:52:39.362
51b85073-068b-4d7f-a81d-f1ef454231cb	0f445b73-105a-4fd3-a8e6-58a41980a5e8	229fd2c8-37f8-4f7a-8bf4-8f367c647e0f	dg #1 - front view/photo-1784810074766-73540884.jpg	dg_1_Front_View-1784810074707.jpg	0	28.41359328473401	77.04264828104422	\N	f	\N	\N	\N	2026-07-23 12:34:34.845	2026-07-23 12:34:34.845
7ed7bf0d-f02d-4a37-84e8-4008027a07b7	0f445b73-105a-4fd3-a8e6-58a41980a5e8	5873ddff-d520-4faa-92c8-571e16dadd7a	dg #1 - left view/photo-1784810078833-307504952.jpg	dg_1_Left_View-1784810078823.jpg	0	28.41359328473401	77.04264828104422	\N	f	\N	\N	\N	2026-07-23 12:34:38.884	2026-07-23 12:34:38.884
e732a349-5c06-456f-9602-78be6be50d9b	0f445b73-105a-4fd3-a8e6-58a41980a5e8	0555ef21-6f6e-4dc9-b275-632d97268281	dg #1 - right view/photo-1784810082374-69562948.jpg	dg_1_Right_View-1784810082363.jpg	0	28.41359328473401	77.04264828104422	\N	f	\N	\N	\N	2026-07-23 12:34:42.426	2026-07-23 12:34:42.426
3d6f83c2-c674-4d23-8c1b-2f1c8fc0ebb3	24257cc6-df6c-40c2-8675-bfd6c75d8924	cc1dbfd3-7b3f-41c3-a6d7-460b840d3d1f	charger__1_-_front_view/1784872638772-838894347.jpg	charger_1_Front_View-1784872638719.jpg	0	28.41359325747393	77.042655110247	2026-07-24 05:57:18.781	f	\N	\N	\N	2026-07-24 05:57:18.782	2026-07-24 05:57:18.782
74fb95d5-5e51-4088-a4e5-11540f2df52b	24257cc6-df6c-40c2-8675-bfd6c75d8924	daf4bf57-bf99-4f10-aa1f-878d16c7110d	charger__1_-_left_view/1784872643574-105753368.jpg	charger_1_Left_View-1784872643558.jpg	21800	28.41359325747393	77.042655110247	2026-07-24 05:57:23.677	f	\N	\N	\N	2026-07-24 05:57:23.679	2026-07-24 05:57:23.679
18f6ab1b-2752-4fda-83d3-1c6cc2e18f1b	24257cc6-df6c-40c2-8675-bfd6c75d8924	a223f5ce-7f8f-44f9-a6fb-8004e1e789a2	charger__1_-_right_view/1784872648384-45550355.jpg	charger_1_Right_View-1784872648369.jpg	0	28.41359325747393	77.042655110247	2026-07-24 05:57:28.388	f	\N	\N	\N	2026-07-24 05:57:28.392	2026-07-24 05:57:28.392
\.


--
-- TOC entry 3494 (class 0 OID 25002)
-- Dependencies: 223
-- Data for Name: PhotoCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PhotoCategory" (id, name, description, "isDeleted", "createdAt", "updatedAt", "isActive") FROM stdin;
96397388-059e-44c5-8615-d67a6e4e8537	SITE_ENTRANCE	Main entry point of the site	f	2026-07-23 10:00:20.362	2026-07-23 10:27:45.317	t
bf29cebb-b8ff-4b01-a02f-f6981a097350	PANEL_BOARD	Electrical Panel Boards and breakers	f	2026-07-23 10:00:20.4	2026-07-23 10:27:45.335	t
ac500e9c-70c6-4570-b093-84878ed7057b	TRANSFORMER	Distribution transformer area	f	2026-07-23 10:00:20.412	2026-07-23 10:27:45.337	t
778cabc3-be29-4ac1-baa0-4f66a767e9d0	DG_SET	Diesel Generator set	f	2026-07-23 10:00:20.442	2026-07-23 10:27:45.34	t
b1c2de41-ddb1-42c1-9117-809e91c7339f	CHARGER_LOCATION	Proposed EV charger installation area	f	2026-07-23 10:00:20.468	2026-07-23 10:27:45.342	t
d019915a-043d-4964-b84f-6d4e125e9b2e	EARTHING_PIT	Earthing pit points	f	2026-07-23 10:00:20.506	2026-07-23 10:27:45.344	t
ce60f66d-f5cf-478b-9cfe-ba6644cc9e7e	SIGNATURE	Surveyor and site supervisor signatures	f	2026-07-23 10:00:20.525	2026-07-23 10:27:45.347	t
39f0f1e0-605d-4413-a076-26e72aea8c1e	OTHER	Other general photos	f	2026-07-23 10:00:20.527	2026-07-23 10:27:45.35	t
cc1dbfd3-7b3f-41c3-a6d7-460b840d3d1f	Charger #1 - Front View	Charger #1 - Front View	f	2026-07-23 10:47:49.014	2026-07-23 10:47:49.014	t
daf4bf57-bf99-4f10-aa1f-878d16c7110d	Charger #1 - Left View	Charger #1 - Left View	f	2026-07-23 10:47:53.964	2026-07-23 10:47:53.964	t
a223f5ce-7f8f-44f9-a6fb-8004e1e789a2	Charger #1 - Right View	Charger #1 - Right View	f	2026-07-23 10:47:58.288	2026-07-23 10:47:58.288	t
229fd2c8-37f8-4f7a-8bf4-8f367c647e0f	DG #1 - Front View	DG #1 - Front View	f	2026-07-23 12:34:34.818	2026-07-23 12:34:34.818	t
5873ddff-d520-4faa-92c8-571e16dadd7a	DG #1 - Left View	DG #1 - Left View	f	2026-07-23 12:34:38.857	2026-07-23 12:34:38.857	t
0555ef21-6f6e-4dc9-b275-632d97268281	DG #1 - Right View	DG #1 - Right View	f	2026-07-23 12:34:42.407	2026-07-23 12:34:42.407	t
\.


--
-- TOC entry 3495 (class 0 OID 25011)
-- Dependencies: 224
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settings" (id, key, value, "createdAt", "updatedAt") FROM stdin;
5896ad89-557c-4c83-b4c8-f65521f22bc2	COMPANY_NAME	BluSmart Mobility	2026-07-23 10:00:21.226	2026-07-23 10:00:21.226
23cc020b-e129-4cb9-9a03-71cd94a6e9da	SUPPORT_EMAIL	survey-support@blusmart.com	2026-07-23 10:00:21.232	2026-07-23 10:00:21.232
b8e89ef8-eb23-4a2d-ae5d-e26dc865dd14	MIN_PHOTOS_REQUIRED	5	2026-07-23 10:00:21.236	2026-07-23 10:00:21.236
\.


--
-- TOC entry 3484 (class 0 OID 24897)
-- Dependencies: 213
-- Data for Name: Survey; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Survey" (id, "surveySiteId", "createdById", status, "reviewRemarks", "reviewedById", "reviewedAt", "totalChargers", "totalPanels", "totalTransformers", "totalDG", "surveyDate", "surveyTime", "buildingName", operator, city, pincode, latitude, longitude, "accessPersonName", "accessPersonMobile", "parkingArea", "internetAvailability", remarks, "submittedAt", "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
0f445b73-105a-4fd3-a8e6-58a41980a5e8	db4bc8bf-70c4-43d7-a117-547a52535995	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	APPROVED		\N	\N	1	0	0	0	2026-07-23	06:33	\N	BluSmart Fleet	Noida	201301	28.62	77.37	\N	\N	Basement / Ground	4G / 5G + Wi-Fi	\N	2026-07-23 12:34:53.964	f	\N	\N	6de67b24-10a7-4e1f-95aa-a386d50bde2d	2026-07-23 12:33:53.438	2026-07-24 05:45:19.841
4e319db4-c301-4c48-bd89-db3cb827d491	e711f20e-ef58-479a-8e43-2464c348668b	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	SUBMITTED		\N	\N	1	0	0	0	2026-07-23	04:32	\N	BluSmart Fleet	Noida	201301	28.62	77.37	\N	\N	Basement / Ground	4G / 5G + Wi-Fi	\N	2026-07-23 12:29:05.237	f	\N	\N	01a9edac-e8b5-41a7-81d8-6dd115a2e834	2026-07-23 10:32:54.409	2026-07-24 05:46:44.749
8ba8ff22-83e7-4664-8de6-3708384d2fb1	c6fac302-fda9-4eb3-8669-5da1f906a350	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	DRAFT	\N	\N	\N	1	1	1	1	2026-07-24	23:50	\N	BluSmart Fleet	DLF Cyber City, Building 10, Sector 24, Gurugram	110001	\N	\N	\N	\N	Basement / Ground	4G / 5G + Wi-Fi	\N	\N	f	\N	\N	\N	2026-07-24 05:50:37.71	2026-07-24 05:50:37.71
a99c0db0-646c-487e-a5b5-843efa03ad32	c4de392b-f68d-46c1-9565-6b2c3f58c609	6de67b24-10a7-4e1f-95aa-a386d50bde2d	DRAFT	\N	\N	\N	1	1	1	1	2026-07-24	23:52	\N	BluSmart Fleet	Bus Terminal Road, Nehru Place, New Delhi 110019	110001	\N	\N	\N	\N	Basement / Ground	4G / 5G + Wi-Fi	\N	\N	f	\N	\N	\N	2026-07-24 05:52:04.689	2026-07-24 05:52:04.689
24257cc6-df6c-40c2-8675-bfd6c75d8924	e2d64be8-4b3e-41ff-aa54-cf1fa35580d7	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	SUBMITTED	\N	\N	\N	1	0	0	0	2026-07-24	23:55	\N	BluSmart Fleet	Noida	201301	28.62	77.37	Modi	9123456789	Basement / Ground	4G / 5G + Wi-Fi	\N	2026-07-24 05:57:46.404	f	\N	\N	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-24 05:56:01.211	2026-07-24 05:57:46.405
06105082-96da-47ff-837c-5f8648e5829e	1ad5bebd-da34-4d0d-bb1f-9a57d3826946	01a9edac-e8b5-41a7-81d8-6dd115a2e834	DRAFT	\N	\N	\N	1	1	1	1	2026-07-24	22:56	\N	BluSmart Fleet	Block B, Sector 62, Noida, Uttar Pradesh 201309	110001	\N	\N	\N	\N	Basement / Ground	4G / 5G + Wi-Fi	\N	\N	f	\N	\N	\N	2026-07-24 04:56:58.332	2026-07-24 04:56:58.332
\.


--
-- TOC entry 3483 (class 0 OID 24886)
-- Dependencies: 212
-- Data for Name: SurveyAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SurveyAssignment" (id, "surveySiteId", "surveyorId", "assignedDate", status, "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
1f872dbd-887f-4df5-8a29-8f230a3fc2dd	1ad5bebd-da34-4d0d-bb1f-9a57d3826946	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-23 10:27:46.059	ASSIGNED	f	\N	\N	\N	2026-07-23 10:27:46.059	2026-07-23 10:27:46.059
94561788-e8ab-4065-9142-beb9edec96b4	48b5c1d2-48c0-433d-a774-6877bf0098e8	71d282d4-a391-42fc-8145-53387860bd25	2026-07-23 10:27:46.068	ASSIGNED	f	\N	\N	\N	2026-07-23 10:27:46.068	2026-07-23 10:45:08.323
629ef559-d473-4007-89ca-872d06a42383	db4bc8bf-70c4-43d7-a117-547a52535995	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-23 10:27:46.062	IN_PROGRESS	f	\N	\N	\N	2026-07-23 10:27:46.062	2026-07-24 05:33:42.097
dc04d9eb-2f9b-4d90-8e6f-af868bbb3f3d	e711f20e-ef58-479a-8e43-2464c348668b	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-23 10:27:46.065	IN_PROGRESS	f	\N	\N	\N	2026-07-23 10:27:46.065	2026-07-24 05:46:44.741
4df704ce-3e25-43c1-a88e-66de6896eae5	c6fac302-fda9-4eb3-8669-5da1f906a350	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-23 10:27:46.05	IN_PROGRESS	f	\N	\N	\N	2026-07-23 10:27:46.05	2026-07-24 05:50:37.697
f555e87d-0452-420d-96da-09b0e56b0d52	c4de392b-f68d-46c1-9565-6b2c3f58c609	71d282d4-a391-42fc-8145-53387860bd25	2026-07-24 05:52:43.206	ASSIGNED	f	\N	6de67b24-10a7-4e1f-95aa-a386d50bde2d	\N	2026-07-24 05:52:43.206	2026-07-24 05:52:43.206
29cccb36-c4ba-443c-a6f2-f40912a33e24	e2d64be8-4b3e-41ff-aa54-cf1fa35580d7	3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	2026-07-24 05:55:12.306	IN_PROGRESS	f	\N	6de67b24-10a7-4e1f-95aa-a386d50bde2d	\N	2026-07-24 05:55:12.306	2026-07-24 05:56:01.194
\.


--
-- TOC entry 3482 (class 0 OID 24876)
-- Dependencies: 211
-- Data for Name: SurveySite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SurveySite" (id, "siteId", name, concessionaire, "landOwningAgency", address, latitude, longitude, status, "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
1ad5bebd-da34-4d0d-bb1f-9a57d3826946	BSC004	Noida Sector 62 EV Charging Station	BluSmart Charge Network	Noida Industrial Development Authority (NOIDA)	Block B, Sector 62, Noida, Uttar Pradesh 201309	28.6271	77.3725	IN_PROGRESS	f	\N	\N	\N	2026-07-23 10:27:46.02	2026-07-24 04:56:58.316
88f8987c-7d0e-47df-8779-a58c4ada4e44	BSC001	Connaught Place Hub 1	BluSmart Mobility Pvt Ltd	New Delhi Municipal Council (NDMC)	Inner Circle, Block A, Connaught Place, New Delhi	28.6328	77.2197	PENDING	f	\N	\N	\N	2026-07-23 10:00:21.215	2026-07-23 10:27:46.003
41152c88-9d3d-4d46-b17f-ac24a617c211	BSC003	Aerocity Charging Plaza	Jio-bp Pulse Hub	Delhi International Airport Limited (DIAL)	Hospitality District, Aerocity, IGI Airport, New Delhi	28.5562	77.12	COMPLETED	f	\N	\N	\N	2026-07-23 10:00:21.223	2026-07-23 10:27:46.015
493d99cc-ff05-4b3d-b7b4-dc10c018caf6	BSC007	Vasant Kunj Promenade EV Park	Exicom Power Solutions	Delhi Development Authority (DDA)	Nelson Mandela Marg, Vasant Kunj, New Delhi 110070	28.5422	77.1558	PENDING	f	\N	\N	\N	2026-07-23 10:27:46.032	2026-07-23 10:27:46.032
db4bc8bf-70c4-43d7-a117-547a52535995	BSC005	Gurugram Sector 44 Smart Station	Delta Electronics Charging Infrastructure	Municipal Corporation of Gurugram (MCG)	Plot 14, Institutional Area, Sector 44, Gurugram, Haryana 122003	28.4502	77.0718	COMPLETED	f	\N	\N	\N	2026-07-23 10:27:46.024	2026-07-24 05:45:19.852
48b5c1d2-48c0-433d-a774-6877bf0098e8	BSC006	South Extension Part 2 Hub	BluSmart Mobility Pvt Ltd	Municipal Corporation of Delhi (MCD)	Main Market, Block E, South Extension II, New Delhi 110049	28.5684	77.2215	ASSIGNED	f	\N	\N	\N	2026-07-23 10:27:46.027	2026-07-23 10:45:08.326
e711f20e-ef58-479a-8e43-2464c348668b	BSC008	Dwarka Sector 21 Metro Plaza Hub	BluSmart Mobility Pvt Ltd	Delhi Metro Rail Corporation (DMRC)	Metro Station Complex, Sector 21, Dwarka, New Delhi 110077	28.5521	77.0583	IN_PROGRESS	f	\N	\N	\N	2026-07-23 10:27:46.035	2026-07-24 05:46:44.743
c6fac302-fda9-4eb3-8669-5da1f906a350	BSC002	Cyber City EV Hub	Tata Power EV Charging Solutions	Haryana State Industrial & Infrastructure Development Corporation (HSIIDC)	DLF Cyber City, Building 10, Sector 24, Gurugram	28.495	77.0895	IN_PROGRESS	f	\N	\N	\N	2026-07-23 10:00:21.22	2026-07-24 05:50:37.701
c4de392b-f68d-46c1-9565-6b2c3f58c609	BSC010	Nehru Place Terminal Charging Hub	Tata Power EZ Charge	DTC / DDA	Bus Terminal Road, Nehru Place, New Delhi 110019	28.5494	77.2519	ASSIGNED	f	\N	\N	\N	2026-07-23 10:27:46.041	2026-07-24 05:52:43.218
e2d64be8-4b3e-41ff-aa54-cf1fa35580d7	BSC009	Okhla Industrial Area Phase 3 Station	ABB E-mobility India	DSIIDC	Phase III, Okhla Industrial Estate, New Delhi 110020	28.5477	77.2736	IN_PROGRESS	f	\N	\N	\N	2026-07-23 10:27:46.038	2026-07-24 05:56:01.198
\.


--
-- TOC entry 3487 (class 0 OID 24933)
-- Dependencies: 216
-- Data for Name: Transformer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transformer" (id, "surveyId", "assetIndex", "capacityKVA", "voltageRatio", "currentRating", "oilLevelOk", "earthingStatus", latitude, longitude, status, "lockedByUserId", "lockedAt", "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
423fa389-f3c3-4634-84ee-6079cafc5ad6	4e319db4-c301-4c48-bd89-db3cb827d491	1	\N	\N	\N	t	\N	\N	\N	AVAILABLE	\N	\N	t	2026-07-23 10:49:13.031	\N	\N	2026-07-23 10:32:54.459	2026-07-23 10:49:13.033
e2d4c2b7-7adf-44f1-83e2-d64b879d119b	4e319db4-c301-4c48-bd89-db3cb827d491	1	\N	\N	\N	t	\N	\N	\N	AVAILABLE	\N	\N	t	2026-07-23 12:28:52.289	\N	\N	2026-07-23 10:51:14.042	2026-07-23 12:28:52.291
da76f82b-bf5d-409e-b519-49595fa6399e	06105082-96da-47ff-837c-5f8648e5829e	1	\N	\N	\N	t	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 04:56:58.382	2026-07-24 04:56:58.382
64cb2b31-0b99-47c4-8b7b-ce18c9732bcb	8ba8ff22-83e7-4664-8de6-3708384d2fb1	1	\N	\N	\N	t	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 05:50:37.762	2026-07-24 05:50:37.762
c42ca386-4e02-493e-8cb8-fab53c5c932a	a99c0db0-646c-487e-a5b5-843efa03ad32	1	\N	\N	\N	t	\N	\N	\N	AVAILABLE	\N	\N	f	\N	\N	\N	2026-07-24 05:52:04.713	2026-07-24 05:52:04.713
\.


--
-- TOC entry 3481 (class 0 OID 24865)
-- Dependencies: 210
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, name, password, role, phone, "isActive", "isDeleted", "deletedAt", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
6de67b24-10a7-4e1f-95aa-a386d50bde2d	admin@blusmart.com	System Admin	$2a$10$cf7HkLByt9ze3jK0moMGt.ZfUA0CgVM8VVa3JDzoJdjKvg.7cJq9O	ADMIN	\N	t	f	\N	\N	\N	2026-07-23 10:00:21.198	2026-07-23 10:27:45.983
01a9edac-e8b5-41a7-81d8-6dd115a2e834	subadmin@blusmart.com	Survey Auditor	$2a$10$cf7HkLByt9ze3jK0moMGt.H2CoQnSI9naEO6cdttZb0mSTZpnLyFG	SUB_ADMIN	\N	t	f	\N	\N	\N	2026-07-23 10:00:21.204	2026-07-23 10:27:45.99
3a989e29-9c65-45a2-8561-f0b4e9eaa4a1	surveyor@blusmart.com	Field Surveyor 1	$2a$10$cf7HkLByt9ze3jK0moMGt.zhV1i.9Im.SYFraG4cRhWpgztKXeGZ2	SURVEY_PERSON	\N	t	f	\N	\N	\N	2026-07-23 10:00:21.206	2026-07-23 10:27:45.993
71d282d4-a391-42fc-8145-53387860bd25	surveyor2@blusmart.com	Field Surveyor	$2a$10$cf7HkLByt9ze3jK0moMGt.zhV1i.9Im.SYFraG4cRhWpgztKXeGZ2	SURVEY_PERSON	9650293606	t	f	\N	\N	\N	2026-07-23 10:00:21.209	2026-07-23 10:45:08.31
\.


--
-- TOC entry 3480 (class 0 OID 24854)
-- Dependencies: 209
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
702f3055-2621-494d-8862-79a3b64f15d7	b8ad28c8b5e63d6d79e1d7f6e8262fab6e96d6518031c80a97a6f8e7eee4dad8	2026-07-23 03:59:47.312862-06	20260723095946_init	\N	\N	2026-07-23 03:59:46.948436-06	1
\.


--
-- TOC entry 3304 (class 2606 OID 24974)
-- Name: ChargerManufacturer ChargerManufacturer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChargerManufacturer"
    ADD CONSTRAINT "ChargerManufacturer_pkey" PRIMARY KEY (id);


--
-- TOC entry 3307 (class 2606 OID 24983)
-- Name: ChargerModel ChargerModel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChargerModel"
    ADD CONSTRAINT "ChargerModel_pkey" PRIMARY KEY (id);


--
-- TOC entry 3293 (class 2606 OID 24921)
-- Name: Charger Charger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Charger"
    ADD CONSTRAINT "Charger_pkey" PRIMARY KEY (id);


--
-- TOC entry 3309 (class 2606 OID 24992)
-- Name: Connector Connector_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Connector"
    ADD CONSTRAINT "Connector_pkey" PRIMARY KEY (id);


--
-- TOC entry 3299 (class 2606 OID 24956)
-- Name: DG DG_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DG"
    ADD CONSTRAINT "DG_pkey" PRIMARY KEY (id);


--
-- TOC entry 3313 (class 2606 OID 25001)
-- Name: Equipment Equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY (id);


--
-- TOC entry 3295 (class 2606 OID 24932)
-- Name: Panel Panel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Panel"
    ADD CONSTRAINT "Panel_pkey" PRIMARY KEY (id);


--
-- TOC entry 3316 (class 2606 OID 25010)
-- Name: PhotoCategory PhotoCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PhotoCategory"
    ADD CONSTRAINT "PhotoCategory_pkey" PRIMARY KEY (id);


--
-- TOC entry 3301 (class 2606 OID 24965)
-- Name: Photo Photo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Photo"
    ADD CONSTRAINT "Photo_pkey" PRIMARY KEY (id);


--
-- TOC entry 3319 (class 2606 OID 25018)
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (id);


--
-- TOC entry 3288 (class 2606 OID 24896)
-- Name: SurveyAssignment SurveyAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SurveyAssignment"
    ADD CONSTRAINT "SurveyAssignment_pkey" PRIMARY KEY (id);


--
-- TOC entry 3285 (class 2606 OID 24885)
-- Name: SurveySite SurveySite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SurveySite"
    ADD CONSTRAINT "SurveySite_pkey" PRIMARY KEY (id);


--
-- TOC entry 3291 (class 2606 OID 24910)
-- Name: Survey Survey_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Survey"
    ADD CONSTRAINT "Survey_pkey" PRIMARY KEY (id);


--
-- TOC entry 3297 (class 2606 OID 24944)
-- Name: Transformer Transformer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transformer"
    ADD CONSTRAINT "Transformer_pkey" PRIMARY KEY (id);


--
-- TOC entry 3283 (class 2606 OID 24875)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3280 (class 2606 OID 24862)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3302 (class 1259 OID 25022)
-- Name: ChargerManufacturer_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ChargerManufacturer_name_key" ON public."ChargerManufacturer" USING btree (name);


--
-- TOC entry 3305 (class 1259 OID 25023)
-- Name: ChargerModel_manufacturerId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ChargerModel_manufacturerId_name_key" ON public."ChargerModel" USING btree ("manufacturerId", name);


--
-- TOC entry 3310 (class 1259 OID 25024)
-- Name: Connector_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Connector_type_key" ON public."Connector" USING btree (type);


--
-- TOC entry 3311 (class 1259 OID 25025)
-- Name: Equipment_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Equipment_name_key" ON public."Equipment" USING btree (name);


--
-- TOC entry 3314 (class 1259 OID 25026)
-- Name: PhotoCategory_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PhotoCategory_name_key" ON public."PhotoCategory" USING btree (name);


--
-- TOC entry 3317 (class 1259 OID 25027)
-- Name: Settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Settings_key_key" ON public."Settings" USING btree (key);


--
-- TOC entry 3289 (class 1259 OID 25021)
-- Name: SurveyAssignment_surveySiteId_surveyorId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SurveyAssignment_surveySiteId_surveyorId_key" ON public."SurveyAssignment" USING btree ("surveySiteId", "surveyorId");


--
-- TOC entry 3286 (class 1259 OID 25020)
-- Name: SurveySite_siteId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SurveySite_siteId_key" ON public."SurveySite" USING btree ("siteId");


--
-- TOC entry 3281 (class 1259 OID 25019)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3340 (class 2606 OID 25118)
-- Name: ChargerModel ChargerModel_manufacturerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChargerModel"
    ADD CONSTRAINT "ChargerModel_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES public."ChargerManufacturer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3328 (class 2606 OID 25068)
-- Name: Charger Charger_connectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Charger"
    ADD CONSTRAINT "Charger_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES public."Connector"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3329 (class 2606 OID 25073)
-- Name: Charger Charger_lockedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Charger"
    ADD CONSTRAINT "Charger_lockedByUserId_fkey" FOREIGN KEY ("lockedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3326 (class 2606 OID 25058)
-- Name: Charger Charger_manufacturerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Charger"
    ADD CONSTRAINT "Charger_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES public."ChargerManufacturer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3331 (class 2606 OID 25136)
-- Name: Charger Charger_mcbMakerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Charger"
    ADD CONSTRAINT "Charger_mcbMakerId_fkey" FOREIGN KEY ("mcbMakerId") REFERENCES public."Equipment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3330 (class 2606 OID 25131)
-- Name: Charger Charger_mccbMakerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Charger"
    ADD CONSTRAINT "Charger_mccbMakerId_fkey" FOREIGN KEY ("mccbMakerId") REFERENCES public."Equipment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3327 (class 2606 OID 25063)
-- Name: Charger Charger_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Charger"
    ADD CONSTRAINT "Charger_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."ChargerModel"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3325 (class 2606 OID 25053)
-- Name: Charger Charger_surveyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Charger"
    ADD CONSTRAINT "Charger_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES public."Survey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3337 (class 2606 OID 25103)
-- Name: DG DG_lockedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DG"
    ADD CONSTRAINT "DG_lockedByUserId_fkey" FOREIGN KEY ("lockedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3336 (class 2606 OID 25098)
-- Name: DG DG_surveyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DG"
    ADD CONSTRAINT "DG_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES public."Survey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3333 (class 2606 OID 25083)
-- Name: Panel Panel_lockedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Panel"
    ADD CONSTRAINT "Panel_lockedByUserId_fkey" FOREIGN KEY ("lockedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3332 (class 2606 OID 25078)
-- Name: Panel Panel_surveyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Panel"
    ADD CONSTRAINT "Panel_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES public."Survey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3339 (class 2606 OID 25113)
-- Name: Photo Photo_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Photo"
    ADD CONSTRAINT "Photo_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."PhotoCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3338 (class 2606 OID 25108)
-- Name: Photo Photo_surveyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Photo"
    ADD CONSTRAINT "Photo_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES public."Survey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3320 (class 2606 OID 25028)
-- Name: SurveyAssignment SurveyAssignment_surveySiteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SurveyAssignment"
    ADD CONSTRAINT "SurveyAssignment_surveySiteId_fkey" FOREIGN KEY ("surveySiteId") REFERENCES public."SurveySite"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3321 (class 2606 OID 25033)
-- Name: SurveyAssignment SurveyAssignment_surveyorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SurveyAssignment"
    ADD CONSTRAINT "SurveyAssignment_surveyorId_fkey" FOREIGN KEY ("surveyorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3323 (class 2606 OID 25043)
-- Name: Survey Survey_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Survey"
    ADD CONSTRAINT "Survey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3324 (class 2606 OID 25048)
-- Name: Survey Survey_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Survey"
    ADD CONSTRAINT "Survey_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3322 (class 2606 OID 25038)
-- Name: Survey Survey_surveySiteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Survey"
    ADD CONSTRAINT "Survey_surveySiteId_fkey" FOREIGN KEY ("surveySiteId") REFERENCES public."SurveySite"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3335 (class 2606 OID 25093)
-- Name: Transformer Transformer_lockedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transformer"
    ADD CONSTRAINT "Transformer_lockedByUserId_fkey" FOREIGN KEY ("lockedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3334 (class 2606 OID 25088)
-- Name: Transformer Transformer_surveyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transformer"
    ADD CONSTRAINT "Transformer_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES public."Survey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-07-24 00:15:12

--
-- PostgreSQL database dump complete
--

\unrestrict itFNoBcvRJF456XkNIvCMV8GHuf1fZ1yOhEi3ocQawfJQTsc1EE7AG3xRNcReM8

