import { 
  CPSE, 
  CanonicalMaterial, 
  MatchCandidate, 
  HarmonizationTask, 
  RationalizationAction, 
  AuditLog 
} from '../types/material';

export const mockCPSEs: CPSE[] = [
  {
    id: 'ONGC',
    name: 'ONGC',
    fullName: 'Oil and Natural Gas Corporation Limited',
    sector: 'Oil & Gas Exploration & Production',
    sourceSystem: 'SAP S/4HANA (Cluster West)',
    totalRecords: 4820300,
    mappedRecords: 4338270,
    pendingRecords: 482030,
    coveragePercentage: 90.0,
    status: 'HEALTHY',
    lastSync: '12 mins ago'
  },
  {
    id: 'IOCL',
    name: 'IOCL',
    fullName: 'Indian Oil Corporation Limited',
    sector: 'Refining & Marketing',
    sourceSystem: 'Oracle ERP Cloud',
    totalRecords: 3950200,
    mappedRecords: 2962650,
    pendingRecords: 987550,
    coveragePercentage: 75.0,
    status: 'HEALTHY',
    lastSync: '45 mins ago'
  },
  {
    id: 'NTPC',
    name: 'NTPC',
    fullName: 'NTPC Limited',
    sector: 'Thermal & Renewable Power Generation',
    sourceSystem: 'SAP ECC 6.0 EHP8',
    totalRecords: 2640100,
    mappedRecords: 1716065,
    pendingRecords: 924035,
    coveragePercentage: 65.0,
    status: 'ATTENTION',
    lastSync: '2 hours ago'
  },
  {
    id: 'SAIL',
    name: 'SAIL',
    fullName: 'Steel Authority of India Limited',
    sector: 'Iron & Steel Manufacturing',
    sourceSystem: 'IBM Maximo + SAP',
    totalRecords: 1620500,
    mappedRecords: 1377425,
    pendingRecords: 243075,
    coveragePercentage: 85.0,
    status: 'HEALTHY',
    lastSync: '30 mins ago'
  },
  {
    id: 'BHEL',
    name: 'BHEL',
    fullName: 'Bharat Heavy Electricals Limited',
    sector: 'Heavy Engineering & Power Equipment',
    sourceSystem: 'SAP ECC 6.0 Enterprise',
    totalRecords: 910400,
    mappedRecords: 364160,
    pendingRecords: 546240,
    coveragePercentage: 40.0,
    status: 'ATTENTION',
    lastSync: '3 hours ago'
  },
  {
    id: 'GAIL',
    name: 'GAIL',
    fullName: 'GAIL (India) Limited',
    sector: 'Natural Gas Processing & Transmission',
    sourceSystem: 'SAP S/4HANA Enterprise',
    totalRecords: 344402,
    mappedRecords: 316850,
    pendingRecords: 27552,
    coveragePercentage: 92.0,
    status: 'HEALTHY',
    lastSync: '10 mins ago'
  }
];

export const mockDashboardKPIs = {
  totalSourceCodes: '14,285,902',
  totalSourceChange: '+12.4% (YTD)',
  canonicalMaterialsCount: '3,102,445',
  canonicalSubtitle: 'Approved Masters',
  mappingCoveragePct: 78.4,
  reviewBacklogCount: 12450,
  backlogStatus: 'Requires Action'
};

export const mockMappingHealthTrend = [
  { label: 'W1', duplicateCandidatesPct: 60, approvedCnmcsPct: 40, duplicateVal: '14.2k', approvedVal: '9.5k' },
  { label: 'W2', duplicateCandidatesPct: 70, approvedCnmcsPct: 45, duplicateVal: '16.8k', approvedVal: '10.8k' },
  { label: 'W3', duplicateCandidatesPct: 50, approvedCnmcsPct: 65, duplicateVal: '11.9k', approvedVal: '15.6k' },
  { label: 'W4', duplicateCandidatesPct: 40, approvedCnmcsPct: 85, duplicateVal: '9.4k', approvedVal: '20.2k' },
  { label: 'W5', duplicateCandidatesPct: 35, approvedCnmcsPct: 90, duplicateVal: '8.1k', approvedVal: '21.5k' },
  { label: 'W6', duplicateCandidatesPct: 28, approvedCnmcsPct: 94, duplicateVal: '6.5k', approvedVal: '22.8k' }
];

export const mockRationalizationActions: RationalizationAction[] = [
  {
    id: 'map',
    actionType: 'MAP',
    title: 'MAP to Existing CNMC',
    percentage: 65,
    recordCount: '4.5M records',
    targetCount: 4500000,
    description: 'Associates legacy CPSE codes with established national standards without altering physical inventory.'
  },
  {
    id: 'merge',
    actionType: 'MERGE',
    title: 'MERGE Duplicates',
    percentage: 42,
    recordCount: '1.2M records',
    targetCount: 1200000,
    description: 'Consolidates redundant intra-CPSE and inter-CPSE codes into unified canonical specifications.'
  },
  {
    id: 'retire',
    actionType: 'RETIRE',
    title: 'RETIRE Obsolete',
    percentage: 88,
    recordCount: '800k records',
    targetCount: 800000,
    description: 'Deprecates discontinued OEM parts, redundant specifications, and zero-inventory legacy master items.'
  }
];

export const mockDuplicateCandidatesTable = [
  { groupCode: 'MG-4022', description: 'Valves, Gate, Flanged', candidates: 1204, confidence: 98, status: 'success' },
  { groupCode: 'MG-8810', description: 'Bearings, Roller, Tapered', candidates: 856, confidence: 94, status: 'success' },
  { groupCode: 'MG-1105', description: 'Pumps, Centrifugal, H-Stage', candidates: 622, confidence: 72, status: 'warning' },
  { groupCode: 'MG-7742', description: 'Cable, Copper, Armored', candidates: 410, confidence: 91, status: 'success' },
  { groupCode: 'MG-3040', description: 'Fasteners, Hex Bolt SS304', candidates: 384, confidence: 89, status: 'success' },
  { groupCode: 'MG-5521', description: 'Pressure Transmitters 4-20mA', candidates: 295, confidence: 68, status: 'warning' }
];

export const mockReviewQueueItems: MatchCandidate[] = [
  {
    id: 'REV-001',
    priority: 'CRITICAL',
    sourceCpse: 'ONGC',
    sourceCode: 'ONGC-M-9021',
    sourceDescription: 'GATE VALVE 4 IN 150# RF FLG CS BODY WCB',
    candidateCnmc: 'CNMC-104928',
    candidateDescription: 'VALVE, GATE, 4IN, 150LB, RF, WCB, TRIM 8',
    relationship: 'IDENTICAL',
    confidence: 99,
    conflicts: undefined,
    age: '2h',
    status: 'PENDING',
    attributeAgreement: 99.4,
    sourceAttributes: {
      materialGroup: 'Valves',
      baseMaterial: 'Carbon Steel WCB',
      nominalSize: '4 IN',
      pressureClass: 'Class 150',
      endConnection: 'Raised Face Flanged',
      baseUOM: 'EA'
    },
    candidateAttributes: {
      materialGroup: 'Valves',
      baseMaterial: 'Carbon Steel WCB',
      nominalSize: '4 IN',
      pressureClass: 'Class 150',
      endConnection: 'Raised Face Flanged',
      baseUOM: 'EA'
    },
    explanation: 'Strict attribute equivalence verified across ASTM A216 WCB casting, ASME B16.34 wall thickness, and API 600 dimensions.'
  },
  {
    id: 'REV-002',
    priority: 'HIGH',
    sourceCpse: 'IOCL',
    sourceCode: 'IOCL-P-441',
    sourceDescription: 'CENTRIFUGAL PUMP 50M3/HR 120M HEAD CS CASING',
    candidateCnmc: 'CNMC-883210',
    candidateDescription: 'PUMP, CENTRIFUGAL, 50M3/HR, 120M HD, CS',
    relationship: 'DUPLICATE',
    confidence: 94,
    conflicts: 'UOM Mismatch: Source (EA) vs Canonical (NOS)',
    conflictDetails: [
      {
        field: 'Base UOM',
        sourceValue: 'EA (Each)',
        canonicalValue: 'NOS (Numbers)',
        message: 'Non-fatal semantic UOM divergence. Mapping rule converts EA <-> NOS 1:1.'
      }
    ],
    age: '1d 4h',
    status: 'PENDING',
    attributeAgreement: 94.2,
    sourceAttributes: {
      materialGroup: 'Rotating Equipment',
      baseMaterial: 'Carbon Steel',
      capacity: '50 m3/hr',
      head: '120 m',
      baseUOM: 'EA'
    },
    candidateAttributes: {
      materialGroup: 'Rotating Equipment',
      baseMaterial: 'Carbon Steel',
      capacity: '50 m3/hr',
      head: '120 m',
      baseUOM: 'NOS'
    },
    explanation: 'Hydraulic duties, flow rate, dynamic head, and casing material align with ISO 5199 / API 610 standards.'
  },
  {
    id: 'REV-003',
    priority: 'MEDIUM',
    sourceCpse: 'NTPC',
    sourceCode: 'NTPC-E-112',
    sourceDescription: '3-PHASE INDUCTION MOTOR 55KW 415V 4-POLE 1500RPM',
    candidateCnmc: 'CNMC-339011',
    candidateDescription: 'MOTOR, INDUCTION, 3PH, 415V, 55KW, 4P',
    relationship: 'NEAR-DUPLICATE',
    confidence: 82,
    conflicts: 'Attribute Missing: Frame Size (inferred 250M)',
    conflictDetails: [
      {
        field: 'Frame Size',
        sourceValue: 'Not explicitly defined',
        canonicalValue: 'IEC 250M Foot Mount',
        message: 'Source specification lacks standard IEC frame designation.'
      }
    ],
    age: '3d',
    status: 'PENDING',
    attributeAgreement: 82.0,
    sourceAttributes: {
      materialGroup: 'Electrical Machinery',
      voltageRating: '415V',
      powerRating: '55KW',
      frequency: '50 Hz',
      poles: '4P',
      baseUOM: 'NOS'
    },
    candidateAttributes: {
      materialGroup: 'Electrical Machinery',
      voltageRating: '415V',
      powerRating: '55KW',
      frequency: '50 Hz',
      poles: '4P',
      frameSize: 'IEC 250M',
      baseUOM: 'NOS'
    },
    explanation: 'High electrical compatibility. AI recommends confirming footprint/shaft dimension before full mechanical consolidation.'
  },
  {
    id: 'REV-004',
    priority: 'HIGH',
    sourceCpse: 'SAIL',
    sourceCode: 'SAIL-ST-771',
    sourceDescription: 'HIGH TENSILE FASTENER M16 X 75 GR 8.8 GALV',
    candidateCnmc: 'CNMC-110482',
    candidateDescription: 'BOLT, HEX, M16 X 75MM, GRADE 8.8, HOT DIP GALV',
    relationship: 'IDENTICAL',
    confidence: 96,
    conflicts: undefined,
    age: '5h',
    status: 'PENDING',
    attributeAgreement: 97.1,
    sourceAttributes: {
      materialGroup: 'Hardware & Fasteners',
      baseMaterial: 'Carbon Alloy Steel',
      grade: 'ISO 898-1 Class 8.8',
      nominalSize: 'M16 x 75mm',
      finish: 'Hot Dip Galvanized',
      baseUOM: 'NOS'
    },
    candidateAttributes: {
      materialGroup: 'Hardware & Fasteners',
      baseMaterial: 'Carbon Alloy Steel',
      grade: 'ISO 898-1 Class 8.8',
      nominalSize: 'M16 x 75mm',
      finish: 'Hot Dip Galvanized',
      baseUOM: 'NOS'
    },
    explanation: 'Exact metallurgical tensile strength match (800 MPa proof load) and protective coating standard IS 4759.'
  },
  {
    id: 'REV-005',
    priority: 'LOW',
    sourceCpse: 'GAIL',
    sourceCode: 'GAIL-INST-209',
    sourceDescription: 'DIFFERENTIAL PRESSURE TRANSMITTER SMART HART 0-10 BAR',
    candidateCnmc: 'CNMC-660144',
    candidateDescription: 'TRANSMITTER, DP, 4-20MA HART, 0-10 BAR, SS316L DIAPHRAGM',
    relationship: 'FUNCTIONALLY EQUIVALENT',
    confidence: 88,
    conflicts: 'Wetted Part Alloy Variance: SS316 vs Hastelloy C-276',
    conflictDetails: [
      {
        field: 'Diaphragm Material',
        sourceValue: 'Hastelloy C-276',
        canonicalValue: 'AISI 316L',
        message: 'GAIL unit has enhanced sour service (NACE MR0175) corrosion resistance.'
      }
    ],
    age: '2d',
    status: 'PENDING',
    attributeAgreement: 88.5,
    sourceAttributes: {
      materialGroup: 'Instrumentation',
      outputSignal: '4-20mA HART',
      range: '0-10 Bar',
      diaphragm: 'Hastelloy C-276',
      baseUOM: 'NOS'
    },
    candidateAttributes: {
      materialGroup: 'Instrumentation',
      outputSignal: '4-20mA HART',
      range: '0-10 Bar',
      diaphragm: 'AISI 316L',
      baseUOM: 'NOS'
    },
    explanation: 'Identical process range and calibration protocol. Functional substitute with superior wetted parts.'
  }
];

export const mockCanonicalDetail: CanonicalMaterial = {
  cnmc: 'CNMC-00018427',
  canonicalDescription: 'VALVE, BALL: TRUNNION MOUNTED, 6 IN, Class 300, RF, FLANGED, CARBON STEEL A105, PTFE SEAT',
  materialGroup: '40141600',
  materialGroupName: 'Valves & Actuators',
  version: 'v2.1.4',
  lifecycleStatus: 'Active',
  confidenceScore: 98.4,
  attributes: {
    materialGroup: '40141600 (Valves)',
    baseMaterial: 'Carbon Steel',
    grade: 'ASTM A105',
    standard: 'API 6D / ASME B16.34',
    nominalSize: '6 IN (150 mm)',
    pressureClass: 'Class 300 (PN 50)',
    endConnection: 'RF Flanged (Raised Face)',
    baseUOM: 'EA (Each)',
    seatMaterial: 'PTFE (Polytetrafluoroethylene)',
    temperatureRange: '-29°C to +200°C',
    fireSafeRating: 'API 607 / ISO 10497'
  },
  mappings: [
    {
      cpse: 'ONGC',
      localCode: 'MAT-441-002',
      localDescription: 'VALVE BALL TRUNNION 6IN 300# CS',
      relationship: 'IDENTICAL',
      status: 'Harmonized',
      lastUpdated: '2023-10-12',
      mappedBy: 'S. Gupta (Data Steward)'
    },
    {
      cpse: 'ONGC',
      localCode: 'VLV-BAL-009',
      localDescription: '6 IN BALL VALVE CLASS 300 A105',
      relationship: 'DUPLICATE',
      status: 'Archived',
      lastUpdated: '2023-10-14',
      mappedBy: 'System AI'
    },
    {
      cpse: 'IOCL',
      localCode: '10098422',
      localDescription: "VALVE, BALL, 6'', 300#, CS, WCB",
      relationship: 'NEAR-DUPLICATE',
      status: 'Pending Review',
      lastUpdated: '2023-11-01',
      mappedBy: 'System AI (Auto-flag)'
    },
    {
      cpse: 'GAIL',
      localCode: 'G-V-300-6',
      localDescription: 'TRUNNION BALL VALVE 6 inch 300 RF',
      relationship: 'IDENTICAL',
      status: 'Harmonized',
      lastUpdated: '2023-09-22',
      mappedBy: 'Harmonization Engine v4'
    },
    {
      cpse: 'NTPC',
      localCode: '55439901',
      localDescription: 'VALVE BALL 150NB CL300 FLG CS',
      relationship: 'IDENTICAL',
      status: 'Harmonized',
      lastUpdated: '2023-10-05',
      mappedBy: 'P. Verma (Lead Engineer)'
    },
    {
      cpse: 'SAIL',
      localCode: 'SL-VLV-88',
      localDescription: '6 INCH 300LB FLANGED BALL VALVE TRUNNION',
      relationship: 'IDENTICAL',
      status: 'Harmonized',
      lastUpdated: '2023-08-19',
      mappedBy: 'M. Sen (Procurement)'
    },
    {
      cpse: 'BHEL',
      localCode: 'BH-VALVE-01',
      localDescription: 'VALVE BALL TRUNNION FLG 150 CL300 ASTM A105',
      relationship: 'IDENTICAL',
      status: 'Harmonized',
      lastUpdated: '2023-08-25',
      mappedBy: 'K. Raman (Cataloger)'
    },
    {
      cpse: 'GAIL',
      localCode: 'G-V-300-6B',
      localDescription: 'BALL VALVE TRUNNION MOUNTED 6 IN 300# CS/PTFE',
      relationship: 'DUPLICATE',
      status: 'Archived',
      lastUpdated: '2023-09-30',
      mappedBy: 'System AI'
    }
  ],
  functionalEquivalents: [
    {
      cnmc: 'CNMC-00018428',
      description: 'VALVE, BALL: 6 IN, Class 300, RF, CS A105, PEEK SEAT',
      varianceType: 'Seat Material',
      varianceDetails: 'Seat: PEEK (High Temp +250°C) vs PTFE (+200°C)'
    },
    {
      cnmc: 'CNMC-00021005',
      description: 'VALVE, BALL: 6 IN, Class 300, RTJ, CS A105, PTFE SEAT',
      varianceType: 'End Connection',
      varianceDetails: 'End: RTJ Ring Joint (vs RF Raised Face)'
    }
  ],
  governanceTrail: [
    {
      id: 'AUD-001',
      timestamp: 'Today, 14:32',
      action: 'Relationship Confirmed',
      description: 'IOCL local code 10098422 marked for review as Near-Duplicate due to body casting designation WCB vs forging A105.',
      user: {
        name: 'System AI (Auto-flag)',
        role: 'Semantic Pipeline v4.2',
        isAi: true
      },
      targetEntity: 'IOCL-10098422'
    },
    {
      id: 'AUD-002',
      timestamp: 'Oct 12, 2023, 09:15',
      action: 'Material Harmonized',
      description: 'ONGC code MAT-441-002 approved as Identical mapping after verification of technical attributes.',
      user: {
        name: 'S. Gupta',
        role: 'Senior Data Steward (MoPNG)',
        initials: 'SG'
      },
      targetEntity: 'ONGC-MAT-441-002'
    },
    {
      id: 'AUD-003',
      timestamp: 'Oct 10, 2023, 11:45',
      action: 'Version Updated',
      description: 'Canonical description updated. Standardized API 6D fire safe parameters added. Version incremented from v2.1.3 to v2.1.4.',
      user: {
        name: 'A. Kumar',
        role: 'National Master Administrator',
        initials: 'AK'
      },
      targetEntity: 'CNMC-00018427'
    },
    {
      id: 'AUD-004',
      timestamp: 'Sep 22, 2023, 16:20',
      action: 'Record Created',
      description: 'Initial canonical record synthesized from GAIL primary source data with 98.4% automated attribute extraction score.',
      user: {
        name: 'Harmonization Engine v4',
        role: 'Deep Learning Cluster 01',
        isAi: true
      },
      targetEntity: 'CNMC-00018427'
    }
  ],
  createdDate: '2023-09-22',
  lastUpdated: '2023-11-01'
};

export const mockHarmonizationTasks: HarmonizationTask[] = [
  {
    taskId: 'TSK-8921-HRM',
    queueName: 'Fasteners & Hardware',
    remainingCount: 12,
    totalCount: 150,
    source: {
      cpse: 'Northern Grid Corp (PGCIL)',
      localCode: 'MAT-10482',
      rawDescription: 'HEX BOLT M10 X 50 SS304',
      extractedSpecs: {
        material: 'SS304',
        size: 'M10 x 50',
        type: 'Hex Bolt',
        grade: 'AISI 304 / A2-70',
        standard: 'DIN 933 / ISO 4017'
      },
      uom: 'NOS'
    },
    aiAnalysis: {
      confidence: 98,
      normalizedMapping: {
        noun: 'Bolt',
        modifier: 'Hex Head',
        size: 'M10 x 50mm',
        material: 'Stainless Steel 304'
      },
      conflict: {
        title: 'Attribute Conflict Detected',
        description: 'Thread pitch not explicitly defined in source. AI inferred standard metric coarse pitch (1.5mm) based on historical CPSE cataloging rules.',
        inferredField: 'Inferred Pitch:',
        inferredValue: '1.5mm (Standard ISO Metric)'
      },
      evidenceNotes: [
        'Noun-modifier syntax normalized with 99.1% semantic alignment score.',
        'Material Grade SS304 mapped to UNS S30400 austenitic stainless steel.',
        'Standard DIN 933 fully-threaded fastener profile confirmed.'
      ]
    },
    candidate: {
      proposedCnmc: '3116.1504.8920',
      canonicalDescription: 'Bolt, Hex Head, M10 x 50mm, Pitch 1.5mm, Stainless Steel 304, Fully Threaded',
      matchType: 'Exact Match',
      mappingImpact: {
        linkedCpseCodesCount: 4,
        sampleCodes: ['MAT-10482 (Current)', 'NGC-BLT-004', 'WCG-992-HX', 'SAIL-FST-1050']
      }
    }
  },
  {
    taskId: 'TSK-8922-HRM',
    queueName: 'Pumping Systems & Hydraulics',
    remainingCount: 11,
    totalCount: 150,
    source: {
      cpse: 'ONGC (Western Offshore)',
      localCode: 'ONGC-PMP-9102',
      rawDescription: 'IMPELLER CENTRIFUGAL PUMP BRONZE DIA 210MM',
      extractedSpecs: {
        material: 'Phosphor Bronze',
        size: 'OD 210mm',
        type: 'Enclosed Impeller',
        grade: 'ASTM B584 C90500',
        standard: 'API 610 11th Ed'
      },
      uom: 'EA'
    },
    aiAnalysis: {
      confidence: 94,
      normalizedMapping: {
        noun: 'Impeller',
        modifier: 'Centrifugal, Enclosed',
        size: '210mm OD, Bore 32mm',
        material: 'Phosphor Bronze (C90500)'
      },
      conflict: {
        title: 'Bore Keyway Tolerance Verification',
        description: 'Keyway dimensions inferred from pump model reference (Sulzer MSD 8x10). Requires physical clearance check.',
        inferredField: 'Keyway Width:',
        inferredValue: '10mm x 3.3mm Depth'
      },
      evidenceNotes: [
        'Matched against Sulzer multi-stage offshore boiler feed pump assemblies.',
        'Corrosion resistance rating compatible with produced water applications.'
      ]
    },
    candidate: {
      proposedCnmc: '4320.1009.4412',
      canonicalDescription: 'Impeller, Pump: Centrifugal, Enclosed, 210mm OD, 32mm Bore, Phosphor Bronze ASTM B584 C90500',
      matchType: 'Exact Match',
      mappingImpact: {
        linkedCpseCodesCount: 3,
        sampleCodes: ['ONGC-PMP-9102', 'IOCL-ROT-449', 'GAIL-PMP-009']
      }
    }
  },
  {
    taskId: 'TSK-8923-HRM',
    queueName: 'Electrical Power Cables',
    remainingCount: 10,
    totalCount: 150,
    source: {
      cpse: 'NTPC (Singrauli STPS)',
      localCode: 'NTPC-CBL-4099',
      rawDescription: 'CABLE 3.5C X 185 SQMM XLPE ARMOURED AL 1.1KV',
      extractedSpecs: {
        material: 'Aluminum Conductor',
        size: '3.5 Core x 185 sq mm',
        type: 'Armoured Power Cable',
        grade: 'IS 7098 Part 1',
        standard: 'Class 2 Stranded'
      },
      uom: 'MTR'
    },
    aiAnalysis: {
      confidence: 96,
      normalizedMapping: {
        noun: 'Cable, Power',
        modifier: 'Armoured, XLPE Insulated',
        size: '3.5 Core x 185 sq mm',
        material: 'Aluminium Conductor, 1.1kV'
      },
      evidenceNotes: [
        'Full compliance with IS 7098 Part 1 voltage grade 1100V.',
        'Galvanized steel flat strip armouring recognized.'
      ]
    },
    candidate: {
      proposedCnmc: '2612.1601.7742',
      canonicalDescription: 'Cable, Power: 1.1kV, XLPE Insulated, 3.5 Core x 185 sq mm, Stranded Aluminium Conductor, Galvanized Strip Armoured, PVC Outer Sheath',
      matchType: 'Exact Match',
      mappingImpact: {
        linkedCpseCodesCount: 6,
        sampleCodes: ['NTPC-CBL-4099', 'BHEL-CAB-001', 'SAIL-EL-99', 'IOCL-ELC-7801']
      }
    }
  }
];

export const mockCatalogueMaterials: CanonicalMaterial[] = [
  mockCanonicalDetail,
  {
    cnmc: 'CNMC-00018428',
    canonicalDescription: 'VALVE, BALL: 6 IN, Class 300, RF, CS A105, PEEK SEAT',
    materialGroup: '40141600',
    materialGroupName: 'Valves & Actuators',
    version: 'v1.4.0',
    lifecycleStatus: 'Active',
    confidenceScore: 97.2,
    attributes: {
      materialGroup: '40141600 (Valves)',
      baseMaterial: 'Carbon Steel',
      grade: 'ASTM A105',
      nominalSize: '6 IN',
      pressureClass: 'Class 300',
      seatMaterial: 'PEEK',
      baseUOM: 'EA'
    },
    mappings: [
      { cpse: 'ONGC', localCode: 'ONGC-V-882', localDescription: 'VALVE 6IN 300# PEEK', relationship: 'IDENTICAL', status: 'Harmonized', lastUpdated: '2023-09-10' },
      { cpse: 'IOCL', localCode: 'IOCL-V-401', localDescription: '6 IN BALL VALVE PEEK SEAT', relationship: 'IDENTICAL', status: 'Harmonized', lastUpdated: '2023-09-15' }
    ],
    functionalEquivalents: [],
    governanceTrail: [],
    createdDate: '2023-09-10',
    lastUpdated: '2023-09-15'
  },
  {
    cnmc: 'CNMC-104928',
    canonicalDescription: 'VALVE, GATE, 4IN, 150LB, RF, WCB, TRIM 8',
    materialGroup: '40141600',
    materialGroupName: 'Valves & Actuators',
    version: 'v2.0.1',
    lifecycleStatus: 'Active',
    confidenceScore: 99.1,
    attributes: {
      materialGroup: '40141600 (Valves)',
      baseMaterial: 'Cast Steel WCB',
      grade: 'ASTM A216 WCB',
      nominalSize: '4 IN',
      pressureClass: 'Class 150',
      trim: 'Trim 8 (Stellite / 13Cr)',
      baseUOM: 'EA'
    },
    mappings: [
      { cpse: 'ONGC', localCode: 'ONGC-M-9021', localDescription: 'GATE VALVE 4 IN 150# RF FLG CS BODY WCB', relationship: 'IDENTICAL', status: 'Pending Review', lastUpdated: '2023-11-02' },
      { cpse: 'IOCL', localCode: 'IOCL-GT-114', localDescription: '4 IN 150# GATE VALVE WCB', relationship: 'IDENTICAL', status: 'Harmonized', lastUpdated: '2023-08-20' }
    ],
    functionalEquivalents: [],
    governanceTrail: [],
    createdDate: '2023-08-20',
    lastUpdated: '2023-11-02'
  },
  {
    cnmc: 'CNMC-883210',
    canonicalDescription: 'PUMP, CENTRIFUGAL, 50M3/HR, 120M HD, CS',
    materialGroup: '43201500',
    materialGroupName: 'Pumps & Compressors',
    version: 'v1.1.0',
    lifecycleStatus: 'Active',
    confidenceScore: 94.2,
    attributes: {
      materialGroup: '43201500 (Pumps)',
      baseMaterial: 'Carbon Steel',
      capacity: '50 m3/hr',
      head: '120 m',
      standard: 'API 610',
      baseUOM: 'NOS'
    },
    mappings: [
      { cpse: 'IOCL', localCode: 'IOCL-P-441', localDescription: 'CENTRIFUGAL PUMP 50M3/HR 120M HEAD CS CASING', relationship: 'DUPLICATE', status: 'Pending Review', lastUpdated: '2023-11-01' }
    ],
    functionalEquivalents: [],
    governanceTrail: [],
    createdDate: '2023-07-15',
    lastUpdated: '2023-11-01'
  },
  {
    cnmc: 'CNMC-339011',
    canonicalDescription: 'MOTOR, INDUCTION, 3PH, 415V, 55KW, 4P',
    materialGroup: '26101100',
    materialGroupName: 'Electric Motors',
    version: 'v3.0.0',
    lifecycleStatus: 'Active',
    confidenceScore: 91.5,
    attributes: {
      materialGroup: '26101100 (Motors)',
      voltageRating: '415V',
      powerRating: '55KW',
      poles: '4P',
      frequency: '50Hz',
      baseUOM: 'NOS'
    },
    mappings: [
      { cpse: 'NTPC', localCode: 'NTPC-E-112', localDescription: '3-PHASE INDUCTION MOTOR 55KW 415V 4-POLE 1500RPM', relationship: 'NEAR-DUPLICATE', status: 'Pending Review', lastUpdated: '2023-10-29' }
    ],
    functionalEquivalents: [],
    governanceTrail: [],
    createdDate: '2023-06-12',
    lastUpdated: '2023-10-29'
  }
];
