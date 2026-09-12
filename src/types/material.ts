export type RelationshipType =
  | 'IDENTICAL'
  | 'DUPLICATE'
  | 'NEAR-DUPLICATE'
  | 'FUNCTIONALLY EQUIVALENT'
  | 'RELATED';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type HarmonizationStatus = 'Harmonized' | 'Pending Review' | 'Archived' | 'Draft' | 'Flagged';

export interface CPSE {
  id: string;
  name: string;
  fullName: string;
  sector: string;
  sourceSystem: string;
  totalRecords: number;
  mappedRecords: number;
  pendingRecords: number;
  coveragePercentage: number;
  status: 'HEALTHY' | 'SYNCING' | 'ATTENTION' | 'OFFLINE';
  lastSync: string;
}

export interface TechnicalAttributes {
  materialGroup?: string;
  baseMaterial?: string;
  grade?: string;
  standard?: string;
  nominalSize?: string;
  pressureClass?: string;
  endConnection?: string;
  baseUOM?: string;
  seatMaterial?: string;
  temperatureRange?: string;
  voltageRating?: string;
  powerRating?: string;
  fireSafeRating?: string;
  frequency?: string;
  poles?: string;
  frameSize?: string;
  capacity?: string;
  head?: string;
  finish?: string;
  outputSignal?: string;
  range?: string;
  diaphragm?: string;
  [key: string]: string | undefined;
}

export interface CPSEMaterial {
  localCode: string;
  cpse: string;
  description: string;
  uom: string;
  category: string;
  specifications: TechnicalAttributes;
  status: HarmonizationStatus;
  lastUpdated: string;
}

export interface FunctionalEquivalent {
  cnmc: string;
  description: string;
  varianceType: string;
  varianceDetails: string;
}

export interface CPSEMapping {
  cpse: string;
  localCode: string;
  localDescription: string;
  relationship: RelationshipType;
  status: HarmonizationStatus;
  lastUpdated: string;
  mappedBy?: string;
}

export interface CanonicalMaterial {
  cnmc: string;
  canonicalDescription: string;
  materialGroup: string;
  materialGroupName: string;
  version: string;
  lifecycleStatus: 'Active' | 'Under Review' | 'Deprecated' | 'Draft';
  status?: HarmonizationStatus | 'Active' | 'Under Review' | 'Deprecated';
  confidenceScore: number;
  attributes: TechnicalAttributes;
  specifications?: TechnicalAttributes;
  standardUOM?: string;
  leadCataloger?: string;
  mappings: CPSEMapping[];
  functionalEquivalents: FunctionalEquivalent[];
  governanceTrail: AuditLog[];
  createdDate: string;
  lastUpdated: string;
}

export interface MatchCandidate {
  id: string;
  priority: PriorityLevel;
  sourceCpse: string;
  sourceCode: string;
  sourceDescription: string;
  sourceUom?: string;
  candidateCnmc: string;
  candidateDescription: string;
  relationship: RelationshipType;
  confidence: number;
  conflicts?: string;
  conflictDetails?: {
    field: string;
    sourceValue: string;
    canonicalValue: string;
    message: string;
  }[];
  age: string;
  status: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED';
  attributeAgreement: number;
  sourceAttributes: TechnicalAttributes;
  candidateAttributes: TechnicalAttributes;
  explanation: string;
  ingestedAt?: string;
}

export interface HarmonizationTask {
  taskId: string;
  queueName: string;
  remainingCount: number;
  totalCount: number;
  source: {
    cpse: string;
    localCode: string;
    rawDescription: string;
    extractedSpecs: {
      material: string;
      size: string;
      type: string;
      grade?: string;
      standard?: string;
      [key: string]: string | undefined;
    };
    attributes?: Record<string, string>;
    systemMetadata?: {
      legacySystemId: string;
      plantLocation: string;
      lastModified: string;
    };
    uom: string;
  };
  aiAnalysis: {
    confidence: number;
    normalizedMapping: {
      noun: string;
      modifier: string;
      size: string;
      material: string;
    };
    conflict?: {
      title: string;
      description: string;
      inferredField: string;
      inferredValue: string;
    };
    evidenceNotes: string[];
  };
  candidate: {
    proposedCnmc: string;
    canonicalDescription: string;
    matchType: 'Exact Match' | 'Near-Duplicate' | 'Functional Equivalent';
    confidenceScore?: number;
    harmonizedAttributes?: Record<string, string>;
    rationale?: string;
    mappingImpact: {
      linkedCpseCodesCount: number;
      sampleCodes: string[];
    };
  };
  crossCpseEquivalents?: {
    code: string;
    cpse: string;
    description: string;
    uom: string;
    relationship: string;
  }[];
}

export interface RationalizationAction {
  id: string;
  actionType: 'MAP' | 'MERGE' | 'RETIRE' | 'REVIEW' | 'SPLIT' | 'RETAIN';
  title: string;
  percentage: number;
  recordCount: string;
  targetCount: number;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  user: {
    name: string;
    role: string;
    avatarUrl?: string;
    initials?: string;
    isAi?: boolean;
  };
  targetEntity: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}
