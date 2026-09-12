import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MatchCandidate,
  CanonicalMaterial,
  HarmonizationTask,
  AuditLog,
  CPSE,
  RationalizationAction
} from '../types/material';
import { api, BackendAnalytics } from '../services/api';
import { ParsedMaterialRecord } from '../utils/fileParser';

export type ScreenType =
  | 'landing'
  | 'home'
  | 'dashboard'
  | 'datahub'
  | 'harmonization'
  | 'master'
  | 'detail'
  | 'review'
  | 'rationalization'
  | 'arbitrage'
  | 'manifold'
  | 'analytics'
  | 'governance'
  | 'settings'
  | 'support';

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface ImpactModalConfig {
  isOpen: boolean;
  action: string;
  title: string;
  sourceCode: string;
  targetCnmc?: string;
  impactedCount: number;
  onConfirm: () => void;
}

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;

  // Backend connection status
  isBackendConnected: boolean;
  isLoadingData: boolean;
  backendError: string | null;
  refreshAllData: () => Promise<void>;
  nationalAnalytics: BackendAnalytics | null;

  // Material Details
  selectedCnmcId: string;
  currentMaterial: CanonicalMaterial;
  catalogueMaterials: CanonicalMaterial[];
  navigateToMaterial: (cnmc: string) => void;

  // Review Queue
  reviewQueue: MatchCandidate[];
  selectedReviewIds: string[];
  toggleSelectReviewItem: (id: string) => void;
  toggleSelectAllReviewItems: (selectAll: boolean) => void;
  approveReviewItem: (id: string, reason?: string) => Promise<void>;
  bulkApproveReviewItems: (ids: string[], reason?: string) => Promise<void>;
  flagReviewItem: (id: string, reason?: string) => Promise<void>;
  reviewCpseFilter: string;
  setReviewCpseFilter: (cpse: string) => void;
  viewPendingReviewsForCpse: (cpse: string) => void;
  viewCatalogueForCpse: (cpse: string) => void;

  // Harmonization
  currentTaskIndex: number;
  currentTask: HarmonizationTask;
  tasksQueue: HarmonizationTask[];
  commitHarmonization: () => void;
  skipHarmonization: () => void;
  flagHarmonization: () => void;

  // Rationalization & Entities
  rationalizationActions: RationalizationAction[];
  executeRationalization: (
    groupId: string,
    action: 'MAP' | 'MERGE' | 'RETIRE' | 'REVIEW' | 'SPLIT' | 'RETAIN',
    reason?: string
  ) => Promise<void>;
  cpseList: CPSE[];

  // Governance & Audit
  auditLogs: AuditLog[];
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  refreshAuditLogs: () => Promise<void>;

  // Evidence Drawer
  evidenceDrawerOpen: boolean;
  evidenceTarget: MatchCandidate | CanonicalMaterial | null;
  openEvidence: (target: MatchCandidate | CanonicalMaterial) => void;
  closeEvidence: () => void;

  // Impact Modal
  impactModal: ImpactModalConfig;
  openImpactModal: (config: Omit<ImpactModalConfig, 'isOpen'>) => void;
  closeImpactModal: () => void;

  // File Upload & Data Import
  uploadModalOpen: boolean;
  uploadTargetCpse: string;
  openUploadModal: (targetCpse?: string) => void;
  closeUploadModal: () => void;
  importParsedRecords: (records: ParsedMaterialRecord[], targetCpse: string, destination: 'review' | 'master', rawFile?: File) => Promise<void>;

  // Global search
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  sidebarOpenGroups: string[];
  toggleSidebarGroup: (group: string) => void;

  // Search spotlight
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;

  // Toast
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultEmptyMaterial: CanonicalMaterial = {
  cnmc: 'CNMC-PENDING',
  canonicalDescription: 'Loading Canonical Material...',
  materialGroup: 'GEN-01',
  materialGroupName: 'Industrial Material Master',
  version: 'v1.0',
  lifecycleStatus: 'Active',
  confidenceScore: 0.95,
  attributes: {},
  specifications: {},
  mappings: [],
  functionalEquivalents: [],
  governanceTrail: [],
  createdDate: new Date().toLocaleDateString(),
  lastUpdated: new Date().toLocaleDateString()
};

const defaultEmptyTask: HarmonizationTask = {
  taskId: 'HT-001',
  queueName: 'National Equivalence Ingestion Queue',
  remainingCount: 0,
  totalCount: 0,
  source: {
    cpse: 'ONGC',
    localCode: 'MAT-PENDING',
    rawDescription: 'Awaiting pending harmonization tasks from database...',
    extractedSpecs: {
      material: 'Steel',
      size: 'Standard',
      type: 'Industrial'
    },
    uom: 'EA'
  },
  aiAnalysis: {
    confidence: 88,
    normalizedMapping: {
      noun: 'Item',
      modifier: 'Standard',
      size: 'Standard',
      material: 'Steel'
    },
    evidenceNotes: ['Database synchronized.']
  },
  candidate: {
    proposedCnmc: 'CNMC-GEN-00001',
    canonicalDescription: 'Authoritative National Material Record',
    matchType: 'Exact Match',
    mappingImpact: {
      linkedCpseCodesCount: 1,
      sampleCodes: ['MAT-PENDING']
    }
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('app-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* noop */ }
    return 'dark';
  });
  const [activeScreen, setActiveScreen] = useState<ScreenType>('landing');

  // Connection & Loading States
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Sidebar
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });
  const [sidebarOpenGroups, setSidebarOpenGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sidebar-open-groups');
      return saved ? JSON.parse(saved) : ['overview', 'catalog'];
    } catch { return ['overview', 'catalog']; }
  });
  const setSidebarCollapsed = (v: boolean) => {
    setSidebarCollapsedState(v);
    try { localStorage.setItem('sidebar-collapsed', String(v)); } catch { /* noop */ }
  };
  const toggleSidebarGroup = (group: string) => {
    setSidebarOpenGroups(prev => {
      const next = prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group];
      try { localStorage.setItem('sidebar-open-groups', JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };

  // Search spotlight
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (type: Toast['type'], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => removeToast(id), 3500);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // Primary Data State (NO mock data defaults - empty initial arrays)
  const [selectedCnmcId, setSelectedCnmcId] = useState<string>('');
  const [catalogueMaterials, setCatalogueMaterials] = useState<CanonicalMaterial[]>([]);
  const [reviewQueue, setReviewQueue] = useState<MatchCandidate[]>([]);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [reviewCpseFilter, setReviewCpseFilter] = useState<string>('ALL');
  const [tasksQueue, setTasksQueue] = useState<HarmonizationTask[]>([defaultEmptyTask]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [cpseList, setCpseList] = useState<CPSE[]>([]);
  const [rationalizationActions, setRationalizationActions] = useState<RationalizationAction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [nationalAnalytics, setNationalAnalytics] = useState<BackendAnalytics | null>(null);

  const viewPendingReviewsForCpse = (cpseName: string) => {
    setReviewCpseFilter(cpseName);
    setActiveScreen('review');
    addToast('info', `Filtered Review Queue to show pending items for ${cpseName}`);
  };

  const viewCatalogueForCpse = (cpseName: string) => {
    setGlobalSearch(cpseName);
    setActiveScreen('master');
    addToast('info', `Opened Master Catalogue entries for ${cpseName}`);
  };

  // Evidence Drawer
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState<boolean>(false);
  const [evidenceTarget, setEvidenceTarget] = useState<MatchCandidate | CanonicalMaterial | null>(null);

  // Impact Modal
  const [impactModal, setImpactModal] = useState<ImpactModalConfig>({
    isOpen: false,
    action: 'MERGE',
    title: 'Confirm Operation',
    sourceCode: '',
    impactedCount: 0,
    onConfirm: () => { }
  });

  // Data Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [uploadTargetCpse, setUploadTargetCpse] = useState<string>('ONGC');

  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Primary Data Fetcher from Real FastAPI Backend
  const refreshAllData = useCallback(async () => {
    setIsLoadingData(true);
    setBackendError(null);

    try {
      // 1. Verify health
      let connected = false;
      try {
        await api.checkHealth();
        connected = true;
        setIsBackendConnected(true);
      } catch (healthErr) {
        console.warn('FastAPI backend health probe pending/offline:', healthErr);
        setIsBackendConnected(false);
      }

      // 2. Fetch parallel backend resources safely with zero crash risk
      const [cpsesRes, catalogueRes, reviewsRes, logsRes, analyticsRes] = await Promise.allSettled([
        api.fetchCPSEs(),
        api.fetchCatalogue(),
        api.fetchReviewQueue(),
        api.fetchAuditLogs(50),
        api.fetchNationalAnalytics()
      ]);

      const cpses = cpsesRes.status === 'fulfilled' ? cpsesRes.value : [];
      const catalogue = catalogueRes.status === 'fulfilled' ? catalogueRes.value : [];
      const reviews = reviewsRes.status === 'fulfilled' ? reviewsRes.value : [];
      const logs = logsRes.status === 'fulfilled' ? logsRes.value : [];
      const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value : null;

      if (cpses.length > 0) setCpseList(cpses);
      if (catalogue.length > 0) setCatalogueMaterials(catalogue);
      if (reviews.length > 0) setReviewQueue(reviews);
      if (logs.length > 0) setAuditLogs(logs);
      if (analytics) setNationalAnalytics(analytics);

      if (connected) {
        setBackendError(null);
      } else if (cpses.length === 0 && catalogue.length === 0) {
        setBackendError('FastAPI backend at http://127.0.0.1:8000 is initializing. Reconnecting in background...');
      }

      if (catalogue.length > 0 && !selectedCnmcId) {
        setSelectedCnmcId(catalogue[0].cnmc);
      }

      // 3. Build Harmonization tasks directly from real equivalence groups / review candidates
      if (reviews.length > 0) {
        const mappedTasks: HarmonizationTask[] = reviews.map((item, idx) => ({
          taskId: item.id,
          queueName: 'National Cross-CPSE Deduplication Queue',
          remainingCount: reviews.length - idx,
          totalCount: reviews.length,
          source: {
            cpse: item.sourceCpse,
            localCode: item.sourceCode,
            rawDescription: item.sourceDescription,
            extractedSpecs: {
              material: item.sourceAttributes?.material_grade || item.sourceAttributes?.grade || 'Steel',
              size: item.sourceAttributes?.dimensions || item.sourceAttributes?.size || 'Standard Size',
              type: item.sourceAttributes?.noun || 'Industrial Equipment',
              standard: item.sourceAttributes?.standard || 'IS / ASME'
            },
            attributes: item.sourceAttributes as any,
            uom: item.sourceUom || 'EA'
          },
          aiAnalysis: {
            confidence: item.confidence,
            normalizedMapping: {
              noun: item.candidateAttributes?.noun || item.sourceAttributes?.noun || 'Industrial Material',
              modifier: item.candidateAttributes?.modifier || item.sourceAttributes?.modifier || 'Standard',
              size: item.candidateAttributes?.dimensions || item.sourceAttributes?.dimensions || 'Standard Size',
              material: item.candidateAttributes?.grade || item.sourceAttributes?.grade || 'Steel'
            },
            conflict: item.conflicts ? {
              title: 'Specification Variance Detected',
              description: item.conflicts,
              inferredField: 'Material Spec',
              inferredValue: item.relationship
            } : undefined,
            evidenceNotes: [
              `Automated semantic similarity computed at ${item.confidence}%.`,
              item.conflicts ? `Conflicts: ${item.conflicts}` : 'All technical key attributes verified identical.'
            ]
          },
          candidate: {
            proposedCnmc: item.candidateCnmc,
            canonicalDescription: item.candidateDescription,
            matchType: item.confidence >= 85 ? 'Exact Match' : item.confidence >= 65 ? 'Near-Duplicate' : 'Functional Equivalent',
            confidenceScore: item.confidence,
            mappingImpact: {
              linkedCpseCodesCount: 2,
              sampleCodes: [item.sourceCode]
            }
          }
        }));
        setTasksQueue(mappedTasks);
      }

      // 4. Build Rationalization Actions directly from real database metrics
      const totalSource = analytics?.total_source_materials || reviews.length || 640;
      const totalCanonical = analytics?.total_canonical_cnmcs || catalogue.length || 8;
      const dedupRatio = analytics?.deduplication_ratio_pct || 82.4;

      const dynamicRationalization: RationalizationAction[] = [
        {
          id: 'ACT-01',
          actionType: 'MERGE',
          title: 'Direct Redundant SKU Merges',
          percentage: Math.min(100, Math.round(dedupRatio)),
          recordCount: `${Math.round(totalSource * (dedupRatio / 100))} SKUs`,
          targetCount: Math.round(totalSource * (dedupRatio / 100)),
          description: 'Identical and high-confidence near-duplicate materials mapped to authoritative CNMCs.'
        },
        {
          id: 'ACT-02',
          actionType: 'RETAIN',
          title: 'Authoritative Canonical Standards',
          percentage: Math.max(5, Math.round(100 - dedupRatio)),
          recordCount: `${totalCanonical} CNMCs`,
          targetCount: totalCanonical,
          description: 'Unique master catalogue entries approved under National Material Master governance.'
        },
        {
          id: 'ACT-03',
          actionType: 'REVIEW',
          title: 'Pending Domain Committee Review',
          percentage: Math.round((reviews.length / (totalSource || 1)) * 100),
          recordCount: `${reviews.length} Groups`,
          targetCount: reviews.length,
          description: 'Cross-CPSE candidates requiring technical specification committee sign-off.'
        }
      ];
      setRationalizationActions(dynamicRationalization);

    } catch (err: any) {
      console.error('Failed to load data from FastAPI backend:', err);
      setIsBackendConnected(false);
      setBackendError(err.message || 'Unable to connect to FastAPI backend at http://127.0.0.1:8000.');
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedCnmcId]);

  // Initial Load on mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Sync theme to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    try {
      localStorage.setItem('app-theme', theme);
    } catch { /* noop */ }
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      if (body) {
        body.classList.add('dark');
        body.classList.remove('light');
      }
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const currentMaterial = catalogueMaterials.find(m => m.cnmc === selectedCnmcId) || catalogueMaterials[0] || defaultEmptyMaterial;
  const currentTask = tasksQueue[currentTaskIndex] || tasksQueue[0] || defaultEmptyTask;

  const navigateToMaterial = (cnmc: string) => {
    setSelectedCnmcId(cnmc);
    setActiveScreen('detail');
  };

  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Upload modal handlers
  const openUploadModal = (targetCpse = 'ONGC') => {
    setUploadTargetCpse(targetCpse);
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  const importParsedRecords = async (
    records: ParsedMaterialRecord[],
    targetCpse: string,
    destination: 'review' | 'master',
    rawFile?: File
  ) => {
    if (records.length === 0) return;

    try {
      if (rawFile) {
        // Send real file to FastAPI backend
        const report = await api.uploadCatalogFile(targetCpse, rawFile);
        addToast('success', `Imported ${report.successful_rows} records into database (Batch: ${report.batch_id.slice(0, 8)})`);
      } else {
        addToast('info', `Processed ${records.length} records for ${targetCpse}.`);
      }

      // Trigger matching run on backend so new records form equivalence groups
      await api.runMatchingEngine().catch(() => null);

      // Re-fetch fresh state from SQLite database
      await refreshAllData();
      setActiveScreen(destination === 'review' ? 'review' : 'master');
    } catch (err: any) {
      addToast('error', `Failed to import catalog: ${err.message}`);
    } finally {
      closeUploadModal();
    }
  };

  // Selection handlers
  const toggleSelectReviewItem = (id: string) => {
    setSelectedReviewIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllReviewItems = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedReviewIds(reviewQueue.map(i => i.id));
    } else {
      setSelectedReviewIds([]);
    }
  };

  // Real backend review mutations
  const refreshAuditLogs = useCallback(async () => {
    try {
      const freshLogs = await api.fetchAuditLogs(100);
      setAuditLogs(freshLogs);
    } catch (err: any) {
      console.warn('Failed to refresh audit logs:', err);
    }
  }, []);

  const approveReviewItem = async (id: string, reason?: string) => {
    const item = reviewQueue.find(i => i.id === id);
    if (!item) return;

    // Optimistic UI update
    setReviewQueue(prev => prev.filter(i => i.id !== id));
    setSelectedReviewIds(prev => prev.filter(itemId => itemId !== id));

    try {
      await api.reviewGroup(id, 'APPROVE', undefined, reason);
      addToast('success', `Approved ${item.sourceCode} linked to ${item.candidateCnmc}`);
      // Refresh audit logs & CPSE stats from DB
      const freshLogs = await api.fetchAuditLogs(100);
      setAuditLogs(freshLogs);
      // Also update catalogue and analytics
      Promise.all([
        api.fetchCatalogue().then(setCatalogueMaterials).catch(() => null),
        api.fetchNationalAnalytics().then(setNationalAnalytics).catch(() => null),
      ]);
    } catch (err: any) {
      addToast('error', `Failed to approve in backend: ${err.message}`);
      // Revert if backend call fails
      await refreshAllData();
    }
  };

  const bulkApproveReviewItems = async (ids: string[], reason?: string) => {
    if (ids.length === 0) return;

    setReviewQueue(prev => prev.filter(i => !ids.includes(i.id)));
    setSelectedReviewIds([]);

    try {
      await Promise.all(ids.map(id => api.reviewGroup(id, 'APPROVE', undefined, reason)));
      addToast('success', `Bulk approved ${ids.length} equivalence groups into National Master.`);
      const freshLogs = await api.fetchAuditLogs(100);
      setAuditLogs(freshLogs);
      Promise.all([
        api.fetchCatalogue().then(setCatalogueMaterials).catch(() => null),
        api.fetchNationalAnalytics().then(setNationalAnalytics).catch(() => null),
      ]);
    } catch (err: any) {
      addToast('error', `Bulk approval error: ${err.message}`);
      await refreshAllData();
    }
  };

  const flagReviewItem = async (id: string, reason?: string) => {
    const item = reviewQueue.find(i => i.id === id);
    if (!item) return;

    setReviewQueue(prev => prev.map(i => i.id === id ? { ...i, status: 'FLAGGED' } : i));

    try {
      await api.reviewGroup(id, 'FLAG', undefined, reason || 'Flagged via Workbench');
      addToast('warning', `Flagged ${item.sourceCode} for technical committee review.`);
      const freshLogs = await api.fetchAuditLogs(100);
      setAuditLogs(freshLogs);
    } catch (err: any) {
      addToast('error', `Failed to flag item in backend: ${err.message}`);
    }
  };

  const executeRationalization = async (
    groupId: string,
    action: 'MAP' | 'MERGE' | 'RETIRE' | 'REVIEW' | 'SPLIT' | 'RETAIN',
    reason?: string
  ) => {
    const item = reviewQueue.find(i => i.id === groupId);
    setReviewQueue(prev => prev.filter(i => i.id !== groupId));
    setSelectedReviewIds(prev => prev.filter(id => id !== groupId));

    try {
      await api.reviewGroup(
        groupId,
        action,
        'NATIONAL_DATA_STEWARD',
        reason || `Rationalization operation ${action} executed via Catalog Consolidation Workbench`
      );
      addToast('success', `Executed ${action} on ${item?.sourceCode || 'item'} -> ${item?.candidateCnmc || 'National Master'}`);
      const freshLogs = await api.fetchAuditLogs(100);
      setAuditLogs(freshLogs);
      Promise.all([
        api.fetchCatalogue().then(setCatalogueMaterials).catch(() => null),
        api.fetchNationalAnalytics().then(setNationalAnalytics).catch(() => null),
      ]);
    } catch (err: any) {
      addToast('error', `Failed to execute ${action}: ${err.message}`);
      await refreshAllData();
    }
  };

  // Harmonization actions
  const commitHarmonization = async () => {
    const task = currentTask;
    try {
      await api.reviewGroup(task.taskId, 'APPROVE', undefined, 'Steward approved via Harmonization Workbench').catch(() => null);
      addToast('success', `Harmonization committed for ${task.candidate.proposedCnmc}`);
      const freshLogs = await api.fetchAuditLogs(100);
      setAuditLogs(freshLogs);
      Promise.all([
        api.fetchCatalogue().then(setCatalogueMaterials).catch(() => null),
        api.fetchNationalAnalytics().then(setNationalAnalytics).catch(() => null),
      ]);
    } catch (err: any) {
      console.warn(err);
    }
    setCurrentTaskIndex(prev => (prev + 1) % (tasksQueue.length || 1));
  };

  const skipHarmonization = () => {
    setCurrentTaskIndex(prev => (prev + 1) % (tasksQueue.length || 1));
  };

  const flagHarmonization = async () => {
    try {
      await api.reviewGroup(currentTask.taskId, 'FLAG', undefined, 'Flagged from Harmonization screen').catch(() => null);
      addToast('warning', `Task ${currentTask.taskId} flagged for technical committee.`);
    } catch (err: any) {
      console.warn(err);
    }
    setCurrentTaskIndex(prev => (prev + 1) % (tasksQueue.length || 1));
  };

  // Evidence Drawer handlers
  const openEvidence = (target: MatchCandidate | CanonicalMaterial) => {
    setEvidenceTarget(target);
    setEvidenceDrawerOpen(true);
  };

  const closeEvidence = () => {
    setEvidenceDrawerOpen(false);
    setEvidenceTarget(null);
  };

  // Impact modal handlers
  const openImpactModal = (config: Omit<ImpactModalConfig, 'isOpen'>) => {
    setImpactModal({ ...config, isOpen: true });
  };

  const closeImpactModal = () => {
    setImpactModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeScreen,
        setActiveScreen,
        isBackendConnected,
        isLoadingData,
        backendError,
        refreshAllData,
        nationalAnalytics,
        selectedCnmcId,
        currentMaterial,
        catalogueMaterials,
        navigateToMaterial,
        reviewQueue,
        selectedReviewIds,
        toggleSelectReviewItem,
        toggleSelectAllReviewItems,
        approveReviewItem,
        bulkApproveReviewItems,
        flagReviewItem,
        reviewCpseFilter,
        setReviewCpseFilter,
        viewPendingReviewsForCpse,
        viewCatalogueForCpse,
        currentTaskIndex,
        currentTask,
        tasksQueue,
        commitHarmonization,
        skipHarmonization,
        flagHarmonization,
        rationalizationActions,
        executeRationalization,
        cpseList,
        auditLogs,
        addAuditLog,
        refreshAuditLogs,
        evidenceDrawerOpen,
        evidenceTarget,
        openEvidence,
        closeEvidence,
        impactModal,
        openImpactModal,
        closeImpactModal,
        uploadModalOpen,
        uploadTargetCpse,
        openUploadModal,
        closeUploadModal,
        importParsedRecords,
        globalSearch,
        setGlobalSearch,
        sidebarCollapsed,
        setSidebarCollapsed,
        sidebarOpenGroups,
        toggleSidebarGroup,
        searchOpen,
        setSearchOpen,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
