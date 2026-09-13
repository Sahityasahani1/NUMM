const API_BASE = '/api';

const state = {
  currentTab: 'dashboard',
  selectedFile: null,
  activeReviewGroupId: null,
  equivalenceGroups: [],
  canonicalMaterials: []
};

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

// Navigation Tabs
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const targetBtn = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
  const targetPane = document.getElementById(`tab-${tabName}`);

  if (targetBtn && targetPane) {
    targetBtn.classList.add('active');
    targetPane.classList.add('active');
    state.currentTab = tabName;
    document.getElementById('current-section-title').textContent = targetBtn.textContent.trim();
    loadTabData(tabName);
  }
}

function loadTabData(tabName) {
  if (tabName === 'dashboard') loadDashboard();
  else if (tabName === 'ingestion') loadMaterials();
  else if (tabName === 'workbench') loadEquivalenceGroups();
  else if (tabName === 'canonical') loadCanonicalMaterials();
  else if (tabName === 'audit') loadAuditLogs();
  else if (tabName === 'erp') loadERPExportPreview();
}

document.getElementById('refresh-btn').addEventListener('click', () => {
  loadTabData(state.currentTab);
  showToast('Refreshed data view', 'info');
});

// Load Dashboard Analytics
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/analytics/national`);
    if (!res.ok) throw new Error('Failed to load national analytics');
    const data = await res.json();

    document.getElementById('kpi-cpse-count').textContent = data.total_cpse_count;
    document.getElementById('kpi-source-records').textContent = data.total_source_materials;
    document.getElementById('kpi-cnmc-count').textContent = data.total_canonical_cnmcs;
    document.getElementById('kpi-dedup-ratio').textContent = `${data.deduplication_ratio_pct}%`;
    document.getElementById('kpi-pending-reviews').textContent = data.pending_reviews_count;
    document.getElementById('kpi-approved-mappings').textContent = data.approved_mappings_count;

    // Render Estimated Synergy Savings
    const savingsEl = document.getElementById('kpi-synergy-savings');
    if (savingsEl && data.estimated_synergy_savings_crores !== undefined) {
      savingsEl.textContent = `₹${data.estimated_synergy_savings_crores} Cr`;
    }

    // Render Confidence Distribution Bands
    if (data.confidence_bands) {
      const highEl = document.getElementById('band-high-count');
      const medEl = document.getElementById('band-medium-count');
      const lowEl = document.getElementById('band-low-count');
      if (highEl) highEl.textContent = `${data.confidence_bands.high_confidence_ge_85} groups`;
      if (medEl) medEl.textContent = `${data.confidence_bands.medium_confidence_65_85} groups`;
      if (lowEl) lowEl.textContent = `${data.confidence_bands.low_confidence_lt_65} groups`;
    }

    // Render CPSE Distribution
    const cpseList = document.getElementById('cpse-distribution-list');
    if (!data.cpse_breakdown || Object.keys(data.cpse_breakdown).length === 0) {
      cpseList.innerHTML = '<p class="empty-state">No CPSE catalogs imported yet.</p>';
    } else {
      cpseList.innerHTML = Object.entries(data.cpse_breakdown).map(([cpse, count]) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;">
          <strong>${cpse}</strong>
          <span>${count} materials</span>
        </div>
      `).join('');
    }

    // Render Actions Breakdown
    const actionsList = document.getElementById('actions-breakdown-list');
    if (!data.actions_breakdown || Object.keys(data.actions_breakdown).length === 0) {
      actionsList.innerHTML = '<p class="empty-state">No rationalization actions recorded yet.</p>';
    } else {
      actionsList.innerHTML = Object.entries(data.actions_breakdown).map(([action, count]) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;">
          <span class="badge">${action}</span>
          <strong>${count} mappings</strong>
        </div>
      `).join('');
    }
    // Also update FAISS vector status
    updateVectorStatus();
  } catch (err) {
    console.error(err);
  }
}

async function updateVectorStatus() {
  try {
    const res = await fetch(`${API_BASE}/matching/vector-index-status`);
    if (res.ok) {
      const status = await res.json();
      const countEl = document.getElementById('sidebar-vector-count');
      if (countEl) countEl.textContent = status.total_indexed_vectors;
    }
  } catch (err) {
    console.error('Failed to fetch vector status:', err);
  }
}

// Ingestion Drag-and-Drop & File Handling
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const selectedFileName = document.getElementById('selected-file-name');

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = 'var(--accent)';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.borderColor = '#cbd5e1';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '#cbd5e1';
  if (e.dataTransfer.files.length > 0) {
    handleFileSelect(e.dataTransfer.files[0]);
  }
});

function handleFileSelect(file) {
  if (!file) return;
  state.selectedFile = file;
  selectedFileName.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  uploadBtn.disabled = false;
}

// Upload Form Submit
document.getElementById('ingestion-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!state.selectedFile) return;

  const cpseId = document.getElementById('cpse-select').value;
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading & Harmonizing...';

  const formData = new FormData();
  formData.append('file', state.selectedFile);

  try {
    const res = await fetch(`${API_BASE}/cpse/${cpseId}/imports`, {
      method: 'POST',
      body: formData
    });

    const report = await res.json();
    if (!res.ok) throw new Error(report.detail || 'Upload failed');

    showToast(`Successfully ingested ${report.successful_rows} materials for ${cpseId}`, 'success');
    renderIngestionReport(report);
    loadMaterials();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload & Validate Catalog';
  }
});

function renderIngestionReport(report) {
  document.getElementById('ingestion-result-placeholder').style.display = 'none';
  const details = document.getElementById('ingestion-result-details');
  details.style.display = 'block';

  document.getElementById('report-success').textContent = `${report.successful_rows} Ingested`;
  document.getElementById('report-failed').textContent = `${report.failed_rows} Failed`;
  document.getElementById('report-batch-id').textContent = `Batch: ${report.batch_id.slice(0, 8)}...`;

  const tbody = document.getElementById('report-error-tbody');
  if (report.errors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="color:var(--success);">Zero row errors detected! All records validated.</td></tr>';
  } else {
    tbody.innerHTML = report.errors.map(err => `
      <tr>
        <td><strong>${err.row_number}</strong></td>
        <td><code>${err.field}</code></td>
        <td style="color:var(--danger);">${err.message}</td>
      </tr>
    `).join('');
  }
}

// Load Benchmark Data (ONGC, IOCL, GAIL Sample Catalogs)
document.getElementById('load-sample-btn').addEventListener('click', async () => {
  const btn = document.getElementById('load-sample-btn');
  btn.disabled = true;
  btn.textContent = 'Ingesting Benchmark Catalogs...';

  const samples = [
    {
      cpse: 'ONGC',
      csv: `source_material_code,description,uom,specifications,source_system
ONGC-VAL-001,BALL VALVE 2IN 150# CS BODY ASTM A216 WCB RF FLANGED,NOS,API 6D LEVER OPERATED,SAP_ONGC
ONGC-FLG-002,WELD NECK FLANGE 2" 150# ASTM A105 SCH 40 RF,NOS,ASME B16.5 SERRATED FINISH,SAP_ONGC
ONGC-GSK-003,SPIRAL WOUND GASKET 2" 150# SS316L WINDINGS WITH GRAPHITE FILLER,NOS,ASME B16.20 INNER OUTER RINGS,SAP_ONGC
ONGC-PIP-004,SEAMLESS PIPE 2" SCH 40 ASTM A106 GRADE B,MTR,BEVELED ENDS 6 METER LENGTH,SAP_ONGC
ONGC-BLT-005,STUD BOLT 5/8" X 3.5" ASTM A193 B7 WITH 2 NUTS A194 2H,SET,HEAVY HEX ZINC PLATED,SAP_ONGC
ONGC-VAL-006,GATE VALVE 2" 600# CS ASTM A216 WCB RF,NOS,API 600 RISING STEM,SAP_ONGC`
    },
    {
      cpse: 'IOCL',
      csv: `material_code,material_description,unit_of_measure,technical_specs,source_system
IOCL-VLV-901,VLV BALL 2" 150 LB WCB FLG RF,EA,API 6D STANDARD LEVER OP,SAP_IOCL
IOCL-FLG-902,FLG WN 2 INCH CLASS 150 A105 RF SCH40,EA,ASME B16.5 STD FACING,SAP_IOCL
IOCL-GSK-903,GSKT SPWD 2IN 150# SS316 GRAPHITE,EA,ASME B16.20 WITH CS OUTER RING,SAP_IOCL
IOCL-PIP-904,PIPE SMLS 2INCH SCH40 ASTM A106 GR B,MTR,PLAIN/BEVELED 6M LENGTH,SAP_IOCL
IOCL-BLT-905,STUD BLT 5/8IN X 3.5IN A193-B7 W/ 2 HEX NUTS A194-2H,SET,ELECTRO GALVANIZED,SAP_IOCL`
    },
    {
      cpse: 'GAIL',
      csv: `source_material_code,description,uom,specifications,source_system
GAIL-VAL-101,BALL VALVE 2" 600# CS BODY ASTM A216 WCB RF FLANGED,EA,API 6D HIGH PRESSURE 600#,SAP_GAIL
GAIL-FLG-102,FLANGE WELD NECK 2 INCH CLASS 600 A105 RF,EA,ASME B16.5 CLASS 600 HIGH RATING,SAP_GAIL
GAIL-VAL-103,BALL VALVE 2" 150# STAINLESS STEEL 316L RF,EA,API 6D FULL BORE SS316L,SAP_GAIL`
    }
  ];

  try {
    for (const s of samples) {
      const blob = new Blob([s.csv], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', blob, `${s.cpse.toLowerCase()}_catalog.csv`);

      await fetch(`${API_BASE}/cpse/${s.cpse}/imports`, {
        method: 'POST',
        body: formData
      });
    }

    showToast('Ingested benchmark catalogs for ONGC, IOCL, and GAIL!', 'success');
    loadMaterials();
    loadDashboard();
  } catch (err) {
    showToast('Failed to load benchmark data: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Load 3-CPSE Sample Catalogs';
  }
});

// Load 500-Row Industrial Benchmark (v2 Strategy)
document.getElementById('load-500-btn').addEventListener('click', async () => {
  const btn = document.getElementById('load-500-btn');
  btn.disabled = true;
  btn.textContent = 'Loading 500-Row Industrial Benchmark...';

  try {
    const res = await fetch(`${API_BASE}/dataset/benchmark/load-500`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to load benchmark dataset');

    showToast(`Successfully loaded & indexed ${data.rows_loaded} industrial MRO materials into FAISS!`, 'success');
    loadMaterials();
    loadDashboard();
    updateVectorStatus();
  } catch (err) {
    showToast('Failed to load benchmark dataset: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Load 500-Row Industrial Benchmark (v2 Strategy)';
  }
});

// Load Ingested Materials
async function loadMaterials() {
  const tbody = document.getElementById('materials-tbody');
  try {
    const cpses = ['ONGC', 'IOCL', 'GAIL', 'BPCL', 'HPCL'];
    let allMaterials = [];
    for (const c of cpses) {
      const res = await fetch(`${API_BASE}/cpse/${c}/materials?limit=50`);
      if (res.ok) {
        const mats = await res.json();
        allMaterials = allMaterials.concat(mats);
      }
    }

    document.getElementById('source-table-count').textContent = `${allMaterials.length} records`;

    if (allMaterials.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center">No materials ingested yet.</td></tr>';
      return;
    }

    tbody.innerHTML = allMaterials.map(m => `
      <tr>
        <td><strong>${m.cpse_id}</strong></td>
        <td><code>${m.source_material_code}</code></td>
        <td>${m.source_description}</td>
        <td><span class="badge">${m.source_uom}</span></td>
        <td><strong>${m.material_noun || '-'}</strong></td>
        <td>${m.dimensions || '-'}</td>
        <td>${m.material_grade || '-'}</td>
        <td>${m.pressure_rating || '-'}</td>
        <td style="color:var(--primary); font-weight:500;">${m.standardized_description || '-'}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// AI Matching & Equivalence Workbench
document.getElementById('run-matching-btn').addEventListener('click', async () => {
  const btn = document.getElementById('run-matching-btn');
  btn.disabled = true;
  btn.textContent = 'Running Local AI Matcher...';

  try {
    const res = await fetch(`${API_BASE}/matching/run`, { method: 'POST' });
    const data = await res.json();
    showToast(data.message, 'success');
    loadEquivalenceGroups();
    loadDashboard();
  } catch (err) {
    showToast('Matching failed: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Run Cross-CPSE AI Matching';
  }
});

document.getElementById('group-status-filter').addEventListener('change', () => {
  loadEquivalenceGroups();
});

const confFilterEl = document.getElementById('workbench-confidence-filter');
if (confFilterEl) {
  confFilterEl.addEventListener('change', () => {
    renderEquivalenceGroups();
  });
}

const searchInputEl = document.getElementById('workbench-search-input');
if (searchInputEl) {
  searchInputEl.addEventListener('input', () => {
    renderEquivalenceGroups();
  });
}

async function loadEquivalenceGroups() {
  const statusFilter = document.getElementById('group-status-filter').value;
  let url = `${API_BASE}/matching/groups`;
  if (statusFilter) url += `?status_filter=${statusFilter}`;

  try {
    const res = await fetch(url);
    const groups = await res.json();
    state.equivalenceGroups = groups;
    renderEquivalenceGroups();
  } catch (err) {
    console.error(err);
  }
}

function renderEquivalenceGroups() {
  const container = document.getElementById('equivalence-groups-container');
  const confFilter = document.getElementById('workbench-confidence-filter')?.value || '';
  const searchTxt = (document.getElementById('workbench-search-input')?.value || '').toLowerCase().trim();

  let filtered = state.equivalenceGroups || [];

  if (confFilter === 'HIGH') {
    filtered = filtered.filter(g => (g.confidence_score || 0) >= 0.85);
  } else if (confFilter === 'MEDIUM') {
    filtered = filtered.filter(g => (g.confidence_score || 0) >= 0.65 && (g.confidence_score || 0) < 0.85);
  } else if (confFilter === 'LOW') {
    filtered = filtered.filter(g => (g.confidence_score || 0) < 0.65);
  }

  if (searchTxt) {
    filtered = filtered.filter(g => {
      const cnmc = (g.proposed_cnmc || '').toLowerCase();
      const status = (g.status || '').toLowerCase();
      const rel = (g.relationship_type || '').toLowerCase();
      const membersMatch = (g.members || []).some(m => 
        (m.source_description || '').toLowerCase().includes(searchTxt) ||
        (m.cpse_id || '').toLowerCase().includes(searchTxt) ||
        (m.source_material_code || '').toLowerCase().includes(searchTxt) ||
        (m.material_noun || '').toLowerCase().includes(searchTxt) ||
        (m.material_grade || '').toLowerCase().includes(searchTxt) ||
        (m.pressure_rating || '').toLowerCase().includes(searchTxt)
      );
      return cnmc.includes(searchTxt) || status.includes(searchTxt) || rel.includes(searchTxt) || membersMatch;
    });
  }

  document.getElementById('group-count-badge').textContent = `${filtered.length} Groups (${state.equivalenceGroups.length} total)`;

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">No equivalence groups match the current search or filter criteria.</div>';
    return;
  }

  container.innerHTML = filtered.map(g => {
    const isCritical = g.evidence_payload && g.evidence_payload.conflicts && 
                       g.evidence_payload.conflicts.some(c => c.includes('CRITICAL CONFLICT'));
    
    const relClass = g.relationship_type === 'IDENTICAL' ? 'badge-success' : 
                     (g.relationship_type === 'NEAR_DUPLICATE' ? 'badge-warning' : 'badge-outline');

    return `
      <div class="group-card">
        <div class="group-card-header">
          <div class="group-title-area">
            <h4>
              <span>Proposed CNMC: <code>${g.proposed_cnmc || 'PENDING'}</code></span>
              <span class="badge ${relClass}">${g.relationship_type}</span>
              <span class="badge">Status: ${g.status}</span>
            </h4>
          </div>
          <div class="score-badge">
            Confidence: ${(g.confidence_score * 100).toFixed(1)}%
          </div>
        </div>

        <div class="evidence-metrics-bar" style="display:flex; flex-wrap:wrap; gap:16px; margin: 6px 0 14px 0; font-size:12px; background:#f8fafc; border:1px solid var(--border); padding:8px 12px; border-radius:6px;">
          <span>🤖 <strong>Vector Cosine (all-MiniLM-L6-v2):</strong> ${( (g.semantic_score || 0) * 100 ).toFixed(1)}%</span>
          <span>📝 <strong>Lexical Jaccard:</strong> ${( (g.lexical_score || 0) * 100 ).toFixed(1)}%</span>
          <span>⚙️ <strong>Attribute Match:</strong> ${( (g.attribute_score || 0) * 100 ).toFixed(1)}%</span>
        </div>

        ${isCritical ? `
          <div class="conflict-alert">
            ⚠️ <strong>Critical Contradiction Detected:</strong> Automatic identical mapping blocked. Human review required.
            <ul style="margin-left: 20px; margin-top: 4px;">
              ${g.evidence_payload.conflicts.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="comparison-grid">
          ${g.members.map(m => `
            <div class="comparison-item ${m.is_anchor ? 'anchor' : ''}">
              <div class="item-badge-header">
                <span class="badge">${m.cpse_id}</span>
                <code>${m.source_material_code}</code>
              </div>
              <div style="font-size:13px; font-weight:600; margin-bottom:8px;">${m.source_description}</div>
              <div style="font-size:12px; color:var(--text-muted);">
                <div>Noun: <strong>${m.material_noun || '-'}</strong> | Dim: <strong>${m.dimensions || '-'}</strong></div>
                <div>Grade: <strong>${m.material_grade || '-'}</strong> | Rating: <strong>${m.pressure_rating || '-'}</strong></div>
                <div>UOM: <strong>${m.source_uom}</strong></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="group-actions-footer">
          <button class="btn btn-primary btn-sm" onclick="openReviewModal('${g.id}', 'MERGE', '${g.proposed_cnmc}')">
            ✓ Approve & Mint CNMC
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openReviewModal('${g.id}', 'RETAIN')">
            Retain Separate
          </button>
          <button class="btn btn-outline btn-sm" onclick="openReviewModal('${g.id}', 'SPLIT')">
            Split Group
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Governance Review Modal
window.openReviewModal = function(groupId, defaultAction = 'MERGE', proposedCnmc = '') {
  state.activeReviewGroupId = groupId;
  document.getElementById('review-action-select').value = defaultAction;
  document.getElementById('review-reason-input').value = '';
  document.getElementById('modal-group-summary').textContent = `Reviewing Equivalence Group: ${groupId.slice(0, 8)}... (Proposed CNMC: ${proposedCnmc || 'N/A'})`;
  document.getElementById('review-modal').classList.add('show');
};

document.getElementById('modal-close-btn').addEventListener('click', () => {
  document.getElementById('review-modal').classList.remove('show');
});

document.getElementById('modal-cancel-btn').addEventListener('click', () => {
  document.getElementById('review-modal').classList.remove('show');
});

document.getElementById('modal-submit-btn').addEventListener('click', async () => {
  const action = document.getElementById('review-action-select').value;
  const reason = document.getElementById('review-reason-input').value.trim();
  const actor = document.getElementById('actor-role').value;

  if (!reason) {
    alert('Please enter a technical justification/rationale for this stewardship decision.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/governance/equivalence-groups/${state.activeReviewGroupId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor: actor,
        action: action,
        reason: reason
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Review action failed');

    showToast(`Decision committed: ${action} under CNMC ${data.cnmc}`, 'success');
    document.getElementById('review-modal').classList.remove('show');
    loadEquivalenceGroups();
    loadDashboard();
    loadAuditLogs();
  } catch (err) {
    showToast('Failed to record review: ' + err.message, 'error');
  }
});

// National Canonical Materials
async function loadCanonicalMaterials(query = '') {
  const tbody = document.getElementById('cnmc-tbody');
  let url = `${API_BASE}/canonical`;
  if (query) url += `?q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    const materials = await res.json();
    state.canonicalMaterials = materials;

    document.getElementById('cnmc-count-badge').textContent = `${materials.length} CNMCs`;

    if (materials.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No canonical materials minted yet. Review and approve equivalence groups in the workbench.</td></tr>';
      return;
    }

    tbody.innerHTML = materials.map(c => `
      <tr>
        <td><strong><code>${c.cnmc}</code></strong></td>
        <td><strong>${c.canonical_description}</strong></td>
        <td><code>${c.unspsc_code || '40141600'}</code></td>
        <td><span class="badge badge-success">${c.status}</span></td>
        <td>v${c.version}</td>
        <td>${c.approved_by || 'STEWARD'}</td>
        <td>${new Date(c.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('cnmc-search-btn').addEventListener('click', () => {
  const q = document.getElementById('cnmc-search-input').value.trim();
  loadCanonicalMaterials(q);
});

// Audit Trail
async function loadAuditLogs() {
  const tbody = document.getElementById('audit-tbody');
  if (!tbody) return;
  try {
    const res = await fetch(`${API_BASE}/governance/audit-logs?limit=50`);
    const logs = await res.json();

    if (!Array.isArray(logs) || logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No audit events recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => {
      let detailContent = '-';
      if (l.details) {
        try {
          const parsed = typeof l.details === 'string' ? JSON.parse(l.details) : l.details;
          if (parsed.reason) {
            detailContent = `<strong>Rationale:</strong> ${parsed.reason}`;
            if (parsed.cnmc) {
              detailContent += ` <span class="badge badge-success">Target: ${parsed.cnmc}</span>`;
            }
          } else if (parsed.description) {
            detailContent = parsed.description;
          } else {
            detailContent = typeof l.details === 'string' ? l.details : JSON.stringify(l.details);
          }
        } catch {
          detailContent = l.details;
        }
      }

      const objId = l.object_id ? String(l.object_id).slice(0, 8) : 'N/A';
      const isApproved = (l.action || '').includes('MERGE') || (l.action || '').includes('APPROVE') || (l.action || '').includes('MAP');
      const badgeClass = isApproved ? 'badge-success' : 'badge-outline';

      return `
        <tr>
          <td>${new Date(l.timestamp).toLocaleString()}</td>
          <td><strong>${l.actor || 'SYSTEM'}</strong></td>
          <td><span class="badge ${badgeClass}">${l.action}</span></td>
          <td><code>${l.object_type}:${objId}</code></td>
          <td>${l.rule_version || 'v4.0.0'}</td>
          <td>${detailContent}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load audit logs:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:var(--danger)">Failed to load audit logs: ${err.message}</td></tr>`;
  }
}

// ERP Export Preview & Download
async function loadERPExportPreview() {
  const tbody = document.getElementById('erp-tbody');
  try {
    const res = await fetch(`${API_BASE}/erp/export/migration?format=json`);
    const rows = await res.json();

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center">No approved mappings ready for export. Approve equivalence groups in the workbench first.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td><strong>${r.CPSE_ID}</strong></td>
        <td>${r.SOURCE_SYSTEM}</td>
        <td><code>${r.SOURCE_MATERIAL_CODE}</code></td>
        <td><strong><code>${r.CNMC}</code></strong></td>
        <td>${r.CANONICAL_DESCRIPTION}</td>
        <td><code>${r.CLASSIFICATION}</code></td>
        <td><span class="badge badge-success">${r.MAPPING_STATUS}</span></td>
        <td><span class="badge">${r.RATIONALIZATION_ACTION}</span></td>
        <td>${r.EFFECTIVE_DATE}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('export-csv-btn').addEventListener('click', () => {
  window.open(`${API_BASE}/erp/export/migration?format=csv`, '_blank');
});

document.getElementById('export-excel-btn').addEventListener('click', () => {
  window.open(`${API_BASE}/erp/export/migration?format=excel`, '_blank');
});

document.getElementById('export-json-btn').addEventListener('click', () => {
  window.open(`${API_BASE}/erp/export/migration?format=json`, '_blank');
});

// How It Works Sandboxes
function initHowItWorksSandboxes() {
  // Preset buttons for Extraction Sandbox
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.dataset.input;
      const inputEl = document.getElementById('live-extract-input');
      if (inputEl && input) {
        inputEl.value = input;
        runLiveExtraction();
      }
    });
  });

  const extractBtn = document.getElementById('live-extract-btn');
  if (extractBtn) {
    extractBtn.addEventListener('click', runLiveExtraction);
  }

  // Preset buttons for Compare Sandbox
  document.querySelectorAll('.compare-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const desc1 = btn.dataset.desc1;
      const desc2 = btn.dataset.desc2;
      const uom1 = btn.dataset.uom1 || 'EA';
      const uom2 = btn.dataset.uom2 || 'EA';

      const descAEl = document.getElementById('compare-desc-a');
      const descBEl = document.getElementById('compare-desc-b');
      const uomAEl = document.getElementById('compare-uom-a');
      const uomBEl = document.getElementById('compare-uom-b');

      if (descAEl && descBEl) {
        descAEl.value = desc1;
        descBEl.value = desc2;
        if (uomAEl) uomAEl.value = uom1;
        if (uomBEl) uomBEl.value = uom2;
        runLiveComparison();
      }
    });
  });

  const compareBtn = document.getElementById('live-compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', runLiveComparison);
  }

  // Active Learning Sync button
  const syncBtn = document.getElementById('sync-active-learning-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', syncActiveLearningCycle);
  }
  loadActiveLearningStats();
}

async function loadActiveLearningStats() {
  const countEl = document.getElementById('active-triplet-count');
  if (!countEl) return;
  try {
    const res = await fetch(`${API_BASE}/active-learning/stats`);
    if (!res.ok) return;
    const data = await res.json();
    countEl.textContent = `${data.buffered_triplets_count} triplets (${data.unprocessed_triplets_count} pending sync)`;
  } catch (e) {
    countEl.textContent = "0 triplets active";
  }
}

async function syncActiveLearningCycle() {
  const syncBtn = document.getElementById('sync-active-learning-btn');
  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.textContent = 'Syncing PyTorch Weights...';
  }
  try {
    const res = await fetch(`${API_BASE}/active-learning/trigger-cycle`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger cycle');
    const data = await res.json();
    showToast(`Active Learning Synced: ${data.total_corpus_pairs} pairs evaluated. Pearson ${ (data.pearson_correlation * 100).toFixed(2) }%`, 'success');
    loadActiveLearningStats();
  } catch (err) {
    showToast('Error syncing active learning: ' + err.message, 'error');
  } finally {
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.textContent = '🔄 Trigger Fine-Tuning Sync';
    }
  }
}

async function runLiveExtraction() {
  const inputEl = document.getElementById('live-extract-input');
  const btn = document.getElementById('live-extract-btn');
  const outputBox = document.getElementById('live-extract-output');
  if (!inputEl) return;

  const text = (inputEl.value || '').trim();
  if (!text) {
    showToast('Please enter a material description to analyze', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Extracting...';

  try {
    const res = await fetch(`${API_BASE}/cpse/materials/harmonize-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_description: text })
    });
    if (!res.ok) throw new Error('Live extraction endpoint returned an error');
    const data = await res.json();

    document.getElementById('live-norm-desc').textContent = data.normalized_description || '-';
    document.getElementById('live-canonical-desc').textContent = data.standardized_description || data.canonical_description || '-';

    const attrsContainer = document.getElementById('live-attrs-container');
    const attrs = data.extracted_attributes || data.attributes || {};
    attrsContainer.innerHTML = `
      <div class="attribute-pill"><strong>Noun:</strong> ${attrs.noun || '<span class="text-muted">None</span>'}</div>
      <div class="attribute-pill"><strong>Modifier:</strong> ${attrs.modifier || '<span class="text-muted">None</span>'}</div>
      <div class="attribute-pill"><strong>Dimensions:</strong> ${attrs.dimensions || '<span class="text-muted">None</span>'}</div>
      <div class="attribute-pill"><strong>Grade:</strong> ${attrs.material_grade || '<span class="text-muted">None</span>'}</div>
      <div class="attribute-pill"><strong>Pressure:</strong> ${attrs.pressure_rating || '<span class="text-muted">None</span>'}</div>
      <div class="attribute-pill"><strong>Standard:</strong> ${attrs.standard || '<span class="text-muted">None</span>'}</div>
    `;

    document.getElementById('live-tax-segment').textContent = 'Segment: Industrial Production & Processing';
    document.getElementById('live-tax-family').textContent = 'Family: Piping, Valves & Fluid Fittings';
    document.getElementById('live-tax-class').textContent = `Class: ${data.category_name || 'Industrial Equipment'}`;
    document.getElementById('live-tax-code').textContent = data.unspsc_code || '40141600';

    outputBox.style.display = 'block';
    showToast('Attributes & classification generated successfully!', 'success');
  } catch (err) {
    showToast('Extraction error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔍 Extract & Harmonize';
  }
}

async function runLiveComparison() {
  const descA = document.getElementById('compare-desc-a')?.value.trim();
  const uomA = document.getElementById('compare-uom-a')?.value.trim() || 'EA';
  const descB = document.getElementById('compare-desc-b')?.value.trim();
  const uomB = document.getElementById('compare-uom-b')?.value.trim() || 'EA';
  const btn = document.getElementById('live-compare-btn');
  const outputBox = document.getElementById('live-compare-output');

  if (!descA || !descB) {
    showToast('Please provide descriptions for both Record A and Record B', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Comparing Signals...';

  try {
    const res = await fetch(`${API_BASE}/matching/compare-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        record_a: { source_description: descA, source_uom: uomA },
        record_b: { source_description: descB, source_uom: uomB }
      })
    });
    if (!res.ok) throw new Error('Live comparison failed');
    const data = await res.json();

    const isHazard = data.deterministic_safety_hazard || data.has_critical_conflict;
    const relClass = data.relationship_type === 'IDENTICAL' ? 'badge-success' : 
                     (data.relationship_type === 'NEAR_DUPLICATE' ? 'badge-warning' : 'badge-outline');

    outputBox.innerHTML = `
      ${isHazard ? `
        <div class="contradiction-alert-banner danger">
          <div class="alert-icon">🛑</div>
          <div>
            <h5>Deterministic Safety Hazard: Zero-Rupture Physics Blocker Active</h5>
            <p><strong>Fatal Industrial Hazard Prevented:</strong> Critical physical parameters (pressure rating, metallurgy, or size) contradict. In high-pressure energy systems, merging these would cause fatal pipeline rupture or sour gas blowout.</p>
            <p style="margin-top:4px; font-size:12px; color:#b91c1c;"><strong>Physics Penalty Applied:</strong> Confidence score slashed by 25% and hard-capped at &le; 0.60. Automated merging strictly blocked.</p>
            <ul style="margin-left: 20px; margin-top: 6px;">
              ${data.conflicts.map(c => `<li><strong>${c}</strong></li>`).join('')}
            </ul>
          </div>
        </div>
      ` : `
        <div class="contradiction-alert-banner success">
          <div class="alert-icon">✅</div>
          <div>
            <h5>100% Physics Capped &amp; Safe for Consolidation</h5>
            <p>No critical engineering contradictions detected. Attribute values, pressure ratings, and metallurgical standards are verified compatible.</p>
          </div>
        </div>
      `}

      <div style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">
        ⚖️ Stage 4: The 4-Judge Tribunal Multi-Signal Scoring
      </div>

      <div class="score-summary-grid">
        <div class="score-mini-card composite">
          <div class="score-label">Composite Confidence</div>
          <div class="score-val">${((data.composite_confidence_score ?? data.confidence_score ?? 0) * 100).toFixed(1)}%</div>
          ${data.raw_composite_score && data.raw_composite_score !== data.composite_confidence_score ? `
            <div style="font-size:10px; color:#dc2626; text-decoration:line-through;">Raw: ${(data.raw_composite_score * 100).toFixed(1)}%</div>
          ` : ''}
        </div>
        <div class="score-mini-card">
          <div class="score-label">Judge 1: Semantic (35%)</div>
          <div class="score-val">${((data.semantic_vector_cosine_score ?? 0) * 100).toFixed(1)}%</div>
          <div class="band-desc">Dense 384-d Cosine</div>
        </div>
        <div class="score-mini-card">
          <div class="score-label">Judge 2: Lexical (25%)</div>
          <div class="score-val">${((data.lexical_jaccard_score ?? 0) * 100).toFixed(1)}%</div>
          <div class="band-desc">Token Jaccard Overlap</div>
        </div>
        <div class="score-mini-card">
          <div class="score-label">Judge 3: Attribute (30%)</div>
          <div class="score-val">${((data.attribute_match_score ?? 0) * 100).toFixed(1)}%</div>
          <div class="band-desc">Physical Spec Parity</div>
        </div>
        <div class="score-mini-card">
          <div class="score-label">Judge 4: UOM (10%)</div>
          <div class="score-val">${(((data.uom_compatibility_score ?? 1.0)) * 100).toFixed(0)}%</div>
          <div class="band-desc">Unit Compatibility</div>
        </div>
      </div>

      <div class="output-grid">
        <div class="output-col">
          <h4 style="font-size:13px; color:var(--success); margin-bottom:8px;">✓ Agreed Attribute Matches</h4>
          ${(data.agreed_attributes || data.matches || []).length > 0 ? `
            <div class="attribute-pill-container">
              ${(data.agreed_attributes || data.matches || []).map(m => `<div class="attribute-pill" style="border-color:#86efac; background:#f0fdf4;">✓ ${m}</div>`).join('')}
            </div>
          ` : '<p class="text-muted" style="font-size:12px;">No overlapping attributes recorded.</p>'}
        </div>
        <div class="output-col">
          <h4 style="font-size:13px; color:var(--danger); margin-bottom:8px;">⚠️ Discrepancies &amp; Conflicts</h4>
          ${(data.conflicts || []).length > 0 ? `
            <div class="attribute-pill-container">
              ${(data.conflicts || []).map(c => `<div class="attribute-pill" style="border-color:#fca5a5; background:#fef2f2; color:#991b1b;">⚠️ ${c}</div>`).join('')}
            </div>
          ` : '<p class="text-muted" style="font-size:12px;">Zero technical conflicts found.</p>'}
        </div>
      </div>
    `;

    outputBox.style.display = 'block';
    showToast(`Comparison complete: ${((data.composite_confidence_score ?? data.confidence_score ?? 0) * 100).toFixed(1)}% confidence`, isCritical ? 'info' : 'success');
  } catch (err) {
    showToast('Comparison error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Run Multi-Signal AI Comparison';
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  initHowItWorksSandboxes();
});
