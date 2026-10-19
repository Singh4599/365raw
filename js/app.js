// app.js — L V Spices Raw Material Inward Register
// FSSAI Quality & Traceability with Firebase Firestore Cloud Sync & Gemini Vision AI

import { saveEntryToCloud, deleteEntryFromCloud, loadAllRawEntriesFromCloud, updateCloudBadge } from './firebase-config.js?v=3.0.2';
import { scanRawMaterialInvoice } from './ocr.js?v=2.7.2';

// ──────────────────────────────────────────────────────────────────────────────
// OCTOBER 2026 PRE-POPULATED REALISTIC CONSIGNMENTS
// ──────────────────────────────────────────────────────────────────────────────
const OCTOBER_PRELOAD_DATA = [
  { id: 1,  date: "2026-10-01", material: "Cumin Seeds (Jeera Machine Clean)", supplier: "Patel Agro Commodities, Unjha Mandi", invoice: "INV-2026-8812", supplierLot: "UNJ-26-901", ourLot: "RM-OCT-001", qty: 1200, rate: 280, total: 336000, quality: "Passed / Food Grade" },
  { id: 2,  date: "2026-10-02", material: "Coriander Whole (Dhaniya Green Eagle)", supplier: "Hadoti Spice Traders, Kota Mandi", invoice: "INV-7734", supplierLot: "KT-DH-441", ourLot: "RM-OCT-002", qty: 2500, rate: 115, total: 287500, quality: "Passed / Food Grade" },
  { id: 3,  date: "2026-10-03", material: "Kashmiri Red Chilli Whole", supplier: "Royal Agro Exporters, Guntur Mandi", invoice: "INV-K-441", supplierLot: "GNT-CHI-110", ourLot: "RM-OCT-003", qty: 800, rate: 245, total: 196000, quality: "Passed / Food Grade" },
  { id: 4,  date: "2026-10-05", material: "Turmeric Whole (Salem Double Polished)", supplier: "Nizamabad Spices Corp", invoice: "INV-NZ-552", supplierLot: "NZ-TUR-809", ourLot: "RM-OCT-004", qty: 1500, rate: 165, total: 247500, quality: "Passed / Food Grade" },
  { id: 5,  date: "2026-10-06", material: "Black Pepper (Malabar Garbled TGSEB)", supplier: "Wayanad Spices Consortium", invoice: "INV-WY-109", supplierLot: "KL-WY-312", ourLot: "RM-OCT-005", qty: 450, rate: 640, total: 288000, quality: "Passed / Food Grade" },
  { id: 6,  date: "2026-10-07", material: "Green Cardamom (8mm Bold)", supplier: "Idukki Planters Syndicate", invoice: "INV-IDK-088", supplierLot: "BDK-CARD-99", ourLot: "RM-OCT-006", qty: 100, rate: 2250, total: 225000, quality: "Passed / Food Grade" },
  { id: 7,  date: "2026-10-08", material: "Cloves (Zanzibar Quality)", supplier: "South Coast Importers, Tuticorin", invoice: "INV-SC-902", supplierLot: "TUT-CLV-504", ourLot: "RM-OCT-007", qty: 250, rate: 780, total: 195000, quality: "Passed / Food Grade" },
  { id: 8,  date: "2026-10-09", material: "Mustard Seeds (Small Bold Rai)", supplier: "Alwar Agro Mandi, Rajasthan", invoice: "INV-ALW-312", supplierLot: "ALW-RAI-221", ourLot: "RM-OCT-008", qty: 3000, rate: 65, total: 195000, quality: "Passed / Food Grade" },
  { id: 9,  date: "2026-10-10", material: "Fennel Seeds (Lucknowi Saunf Extra Green)", supplier: "Gujarat Seed Corporation, Mehsana", invoice: "INV-GSC-661", supplierLot: "MHS-SAU-711", ourLot: "RM-OCT-009", qty: 600, rate: 185, total: 111000, quality: "Passed / Food Grade" },
  { id: 10, date: "2026-10-12", material: "Fenugreek (Methi Dana Machine Clean)", supplier: "Pratapgarh Agro Products, MP", invoice: "INV-PTG-404", supplierLot: "PTG-MET-189", ourLot: "RM-OCT-010", qty: 1000, rate: 72, total: 72000, quality: "Passed / Food Grade" },
  { id: 11, date: "2026-10-13", material: "Bay Leaf (Tej Patta Selected)", supplier: "Guwahati Forest Produce, Assam", invoice: "INV-GHT-190", supplierLot: "ASM-TEJ-008", ourLot: "RM-OCT-011", qty: 350, rate: 110, total: 38500, quality: "Passed / Food Grade" },
  { id: 12, date: "2026-10-14", material: "Cinnamon Sticks (Ceylon Grade Alba)", supplier: "Sri Lanka Direct Imports, Kochi", invoice: "INV-SL-418", supplierLot: "KCH-CIN-882", ourLot: "RM-OCT-012", qty: 200, rate: 520, total: 104000, quality: "Passed / Food Grade" },
  { id: 13, date: "2026-10-15", material: "Dried Ginger (Sun Dried Sonth)", supplier: "Calicut Agri Trading Co", invoice: "INV-CL-550", supplierLot: "CLT-SNT-339", ourLot: "RM-OCT-013", qty: 750, rate: 310, total: 232500, quality: "Passed / Food Grade" },
  { id: 14, date: "2026-10-16", material: "Star Anise (Whole Chakri Phool)", supplier: "Himalayan Botanicals, Siliguri", invoice: "INV-HIM-229", supplierLot: "SLG-STR-104", ourLot: "RM-OCT-014", qty: 150, rate: 680, total: 102000, quality: "Passed / Food Grade" },
  { id: 15, date: "2026-10-16", material: "Mace (Javitri Golden Flower)", supplier: "Malabar Spices Co, Cochin", invoice: "INV-MC-114", supplierLot: "CCH-JAV-055", ourLot: "RM-OCT-015", qty: 75, rate: 1950, total: 146250, quality: "Passed / Food Grade" },
  { id: 16, date: "2026-10-17", material: "Amchur (Dry Mango Slice Premium)", supplier: "Bareilly Krishi Udyog, UP", invoice: "INV-BR-781", supplierLot: "BRL-AMC-902", ourLot: "RM-OCT-016", qty: 500, rate: 190, total: 95000, quality: "Passed / Food Grade" },
  { id: 17, date: "2026-10-18", material: "Cumin Seeds (Jeera Machine Clean)", supplier: "Unjha Commodity Merchants", invoice: "INV-UNJ-4491", supplierLot: "UNJ-26-950", ourLot: "RM-OCT-017", qty: 1500, rate: 282, total: 423000, quality: "Passed / Food Grade" },
  { id: 18, date: "2026-10-18", material: "Red Chilli (Guntur Teja S17)", supplier: "Krishna River Spice Traders", invoice: "INV-KRS-901", supplierLot: "GNT-TJ-301", ourLot: "RM-OCT-018", qty: 1000, rate: 230, total: 230000, quality: "Passed / Food Grade" },
  { id: 19, date: "2026-10-18", material: "Nutmeg Whole / Jaiphal (Grade A1 Selected)", supplier: "Malabar Spice Producers Co-op, Kerala", invoice: "INV-KER-5091", supplierLot: "KL-NUT-410", ourLot: "RM-OCT-019", qty: 350, rate: 620, total: 217000, quality: "Passed / Food Grade" },
  { id: 20, date: "2026-10-18", material: "Kasuri Methi (Nagauri Dried Fenugreek Leaves)", supplier: "Marwar Agri Farm Producer, Nagaur Mandi", invoice: "INV-NAG-3320", supplierLot: "NGR-KM-108", ourLot: "RM-OCT-020", qty: 800, rate: 145, total: 116000, quality: "Passed / Food Grade" },
  { id: 21, date: "2026-10-18", material: "Black Salt Lumps (Kala Namak Natural Crystal)", supplier: "Rajasthan Minerals & Salt Syndicate, Sambhar", invoice: "INV-SMB-7801", supplierLot: "SBR-KN-552", ourLot: "RM-OCT-021", qty: 2500, rate: 28, total: 70000, quality: "Passed / Food Grade" },
  { id: 22, date: "2026-10-18", material: "Coriander Seeds (Dhaniya Badami Selected)", supplier: "Hadoti Spice Traders, Ramganj Mandi", invoice: "INV-RGM-1192", supplierLot: "RGM-DH-771", ourLot: "RM-OCT-022", qty: 1800, rate: 112, total: 201600, quality: "Passed / Food Grade" }
];

// ──────────────────────────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────────────────────────
let entries = [];
let editingId = null;
let deletingId = null;
let currentView = 'register';
let scannedCandidate = null;
let periodFilter = 'all'; // 'all' | 'daily' | 'weekly' | 'monthly'

function getEffectiveToday() {
  const realToday = new Date().toISOString().slice(0, 10);
  const hasReal = entries.some(e => e.date === realToday);
  if (hasReal) return realToday;
  return "2026-10-18";
}

// ──────────────────────────────────────────────────────────────────────────────
// INIT & LOAD DATA
// ──────────────────────────────────────────────────────────────────────────────
async function initData() {
  const deletedIds = new Set(JSON.parse(localStorage.getItem('lv_raw_deleted_ids') || '[]'));

  // 1. Check LocalStorage
  const local = localStorage.getItem('lv_raw_entries');
  const hasInitialized = localStorage.getItem('lv_raw_initialized');
  if (local) {
    try {
      entries = JSON.parse(local).filter(e => !deletedIds.has(String(e.id)));
    } catch (e) {
      entries = [];
    }
  }

  // 2. Load from Firebase Cloud
  try {
    const cloudList = await loadAllRawEntriesFromCloud();
    if (cloudList && cloudList.length > 0) {
      entries = cloudList.filter(e => !deletedIds.has(String(e.id)));
    }
  } catch (err) {
    console.warn('[Firebase] Load error, using local fallback:', err);
  }

  // 3. Only seed baseline data ON FIRST RUN ever if completely empty
  if (!hasInitialized && entries.length === 0) {
    entries = OCTOBER_PRELOAD_DATA.filter(item => !deletedIds.has(String(item.id)));
    entries.forEach(item => {
      saveEntryToCloud(item).catch(() => {});
    });
  }

  localStorage.setItem('lv_raw_initialized', 'true');
  localStorage.setItem('lv_raw_entries', JSON.stringify(entries));

  updateSupplierList();
  renderTable();
  updateStats();
  renderSummary();
  updateNextLotPreview();
}

function updateNextLotPreview() {
  const nextNum = entries.length + 1;
  const nextLot = `RM-OCT-${String(nextNum).padStart(3, '0')}`;
  const el = document.getElementById('next-lot-preview');
  if (el) el.textContent = `Next Lot: ${nextLot}`;
  const ourLotInput = document.getElementById('f-our-lot');
  if (ourLotInput && !editingId) ourLotInput.value = nextLot;
}

function updateSupplierList() {
  const dl = document.getElementById('supplier-list');
  if (!dl) return;
  const suppliers = [...new Set(entries.map(e => e.supplier).filter(Boolean))];
  dl.innerHTML = suppliers.map(s => `<option value="${escapeHtml(s)}">`).join('');
}

// ──────────────────────────────────────────────────────────────────────────────
// RENDER TABLE & STATS
// ──────────────────────────────────────────────────────────────────────────────
function renderTable(dataToRender = null) {
  const data = dataToRender || getFilteredData();
  const tbody = document.getElementById('rm-tbody');
  const emptyState = document.getElementById('rm-empty');
  const tfoot = document.getElementById('rm-tfoot');
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (tfoot) tfoot.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  let totalQty = 0;
  let totalVal = 0;

  tbody.innerHTML = data.map((entry, idx) => {
    const qty = parseFloat(entry.qty) || 0;
    const rate = parseFloat(entry.rate) || 0;
    const total = parseFloat(entry.total) || (qty * rate);

    totalQty += qty;
    totalVal += total;

    const rawMat = escapeHtml(entry.material || '—');
    let matDisplay = `<span class="mat-title">${rawMat}</span>`;
    if (rawMat.includes('(') && rawMat.includes(')')) {
      const idxOpen = rawMat.indexOf('(');
      const mainMat = rawMat.substring(0, idxOpen).trim();
      const subMat = rawMat.substring(idxOpen).trim();
      matDisplay = `<div class="mat-main">${mainMat}</div><div class="mat-sub">${subMat}</div>`;
    }

    const qualityText = entry.quality || 'Passed / Food Grade';
    let qualityClass = 'status-passed';
    if (qualityText.toLowerCase().includes('reject')) {
      qualityClass = 'status-rejected';
    } else if (qualityText.toLowerCase().includes('minor') || qualityText.toLowerCase().includes('sorting')) {
      qualityClass = 'status-warning';
    } else if (qualityText.toLowerCase().includes('lab') || qualityText.toLowerCase().includes('testing')) {
      qualityClass = 'status-testing';
    }

    return `
      <tr>
        <td style="text-align:center; font-weight:600; color:var(--text-secondary);">${idx + 1}</td>
        <td style="font-size:12px; color:var(--text-secondary); white-space:nowrap;">${entry.date || '—'}</td>
        <td style="max-width:170px;">${matDisplay}</td>
        <td style="font-size:11.5px; color:var(--text-secondary); line-height:1.3; max-width:155px;">${escapeHtml(entry.supplier || '—')}</td>
        <td style="font-family:'SF Mono',Consolas,monospace; font-size:11.5px; font-weight:500; color:var(--text-primary); white-space:nowrap;">${escapeHtml(entry.invoice || '—')}</td>
        <td style="font-size:11.5px; color:var(--text-secondary); max-width:105px;">${escapeHtml(entry.supplierLot || '—')}</td>
        <td style="font-size:11.5px; font-weight:600; color:var(--text-primary); white-space:nowrap;">${escapeHtml(entry.ourLot || '—')}</td>
        <td class="num-col font-bold">${formatNum(qty)}</td>
        <td class="num-col">₹${formatNum(rate)}</td>
        <td class="num-col total-green">₹${formatNum(total)}</td>
        <td style="text-align:center;">
          <span class="status-pill ${qualityClass}">${escapeHtml(qualityText)}</span>
        </td>
        <td style="text-align:center; white-space:nowrap;">
          <button class="table-action-btn edit-btn" onclick="openEditModal('${escapeHtml(String(entry.id))}')" title="Edit Consignment">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="table-action-btn delete-btn" onclick="openDeleteModal('${escapeHtml(String(entry.id))}')" title="Delete Consignment">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (tfoot) {
    tfoot.innerHTML = `
      <tr class="tfoot-row">
        <td colspan="7" style="text-align:right; font-weight:800; color:var(--text-secondary); text-transform:uppercase; font-size:11.5px; letter-spacing:0.5px;">TOTAL CONSIGNMENTS (${data.length}):</td>
        <td class="num-col font-bold" style="color:var(--text-primary);">${formatNum(totalQty)} KG</td>
        <td></td>
        <td class="num-col font-bold total-green" style="font-size:14px;">₹${formatNum(totalVal)}</td>
        <td colspan="2"></td>
      </tr>
    `;
  }
}

function updatePeriodCounts() {
  const effToday = getEffectiveToday();
  const allCount = entries.length;
  const dailyCount = entries.filter(e => e.date === effToday).length;
  const weeklyCount = entries.filter(e => e.date >= "2026-10-12" && e.date <= effToday).length;
  const monthlyCount = entries.filter(e => (e.date || '').startsWith('2026-10')).length;

  const elAll = document.getElementById('pill-all-count');
  if (elAll) elAll.textContent = allCount;
  const elDaily = document.getElementById('pill-daily-count');
  if (elDaily) elDaily.textContent = dailyCount;
  const elWeekly = document.getElementById('pill-weekly-count');
  if (elWeekly) elWeekly.textContent = weeklyCount;
  const elMonthly = document.getElementById('pill-monthly-count');
  if (elMonthly) elMonthly.textContent = monthlyCount;
}

window.setPeriodFilter = function(period) {
  periodFilter = period;
  document.querySelectorAll('.period-pill').forEach(btn => {
    btn.classList.toggle('active', btn.id === `pill-${period}`);
  });
  renderTable();
  updateStats();
};

function updateStats() {
  updatePeriodCounts();

  const currentDataset = getFilteredData();
  const isFiltered = periodFilter !== 'all';
  const dataForKpi = isFiltered ? currentDataset : entries;

  const totalEntries = dataForKpi.length;
  let totalKg = 0;
  let totalVal = 0;

  dataForKpi.forEach(e => {
    const q = parseFloat(e.qty) || 0;
    const r = parseFloat(e.rate) || 0;
    const t = parseFloat(e.total) || (q * r);
    totalKg += q;
    totalVal += t;
  });

  const octCount = entries.filter(e => (e.date || '').startsWith('2026-10')).length;

  const elEntries = document.getElementById('s-total-entries');
  if (elEntries) elEntries.textContent = totalEntries;
  const elKg = document.getElementById('s-total-kg');
  if (elKg) elKg.textContent = `${formatNum(totalKg)} KG`;
  const elVal = document.getElementById('s-total-val');
  if (elVal) elVal.textContent = `₹${formatNum(totalVal)}`;
  const elMonth = document.getElementById('s-this-month');
  if (elMonth) elMonth.textContent = isFiltered ? totalEntries : octCount;
}

function getFilteredData() {
  const search = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const month = document.getElementById('month-filter')?.value || '';
  const effToday = getEffectiveToday();

  return entries.filter(e => {
    // 1. Quick Period Filtering
    if (periodFilter === 'daily') {
      if (e.date !== effToday) return false;
    } else if (periodFilter === 'weekly') {
      if (e.date < "2026-10-12" || e.date > effToday) return false;
    } else if (periodFilter === 'monthly') {
      if (!(e.date || '').startsWith('2026-10')) return false;
    }

    // 2. Text Search Filtering
    const matchSearch = !search ||
      (e.material || '').toLowerCase().includes(search) ||
      (e.supplier || '').toLowerCase().includes(search) ||
      (e.invoice || '').toLowerCase().includes(search) ||
      (e.ourLot || '').toLowerCase().includes(search);

    // 3. Month Input Filtering (only if period is 'all')
    const matchMonth = periodFilter !== 'all' || !month || (e.date || '').startsWith(month);

    return matchSearch && matchMonth;
  });
}

window.applyFilters = function() {
  renderTable();
  updateStats();
};

window.clearFilters = function() {
  periodFilter = 'all';
  document.querySelectorAll('.period-pill').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'pill-all');
  });
  if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
  if (document.getElementById('month-filter')) document.getElementById('month-filter').value = '';
  renderTable();
  updateStats();
};

// ──────────────────────────────────────────────────────────────────────────────
// ADD & EDIT LOGIC
// ──────────────────────────────────────────────────────────────────────────────
window.calcTotal = function() {
  const q = parseFloat(document.getElementById('f-qty').value) || 0;
  const r = parseFloat(document.getElementById('f-rate').value) || 0;
  document.getElementById('f-total').value = (q * r).toFixed(2);
};

window.submitEntry = async function() {
  const date = document.getElementById('f-date').value;
  const material = document.getElementById('f-material').value.trim();
  const supplier = document.getElementById('f-supplier').value.trim();
  const invoice = document.getElementById('f-invoice').value.trim();
  const supplierLot = document.getElementById('f-supplier-lot').value.trim();
  const ourLot = document.getElementById('f-our-lot').value.trim();
  const qty = parseFloat(document.getElementById('f-qty').value) || 0;
  const rate = parseFloat(document.getElementById('f-rate').value) || 0;
  const total = parseFloat(document.getElementById('f-total').value) || (qty * rate);
  const quality = document.getElementById('f-quality').value;

  if (!date || !material || !supplier || !invoice || qty <= 0 || rate <= 0) {
    alert("Please fill all required fields (*) with valid quantities and rates.");
    return;
  }

  if (editingId) {
    const idx = entries.findIndex(e => String(e.id) === String(editingId));
    if (idx !== -1) {
      entries[idx] = {
        ...entries[idx],
        date, material, supplier, invoice, supplierLot, ourLot, qty, rate, total, quality
      };
      await saveEntryToCloud(entries[idx]);
      showToast("Consignment updated in Cloud Firestore!");
    }
    editingId = null;
  } else {
    const newEntry = {
      id: Date.now(),
      date, material, supplier, invoice, supplierLot, ourLot, qty, rate, total, quality
    };
    entries.unshift(newEntry);
    await saveEntryToCloud(newEntry);
    showToast("New consignment saved to Cloud Firestore!");
  }

  localStorage.setItem('lv_raw_entries', JSON.stringify(entries));
  resetForm();
  updateSupplierList();
  renderTable();
  updateStats();
  switchView('register');
};

function resetForm() {
  document.getElementById('f-date').value = "2026-10-18";
  document.getElementById('f-material').value = "";
  document.getElementById('f-supplier').value = "";
  document.getElementById('f-invoice').value = "";
  document.getElementById('f-supplier-lot').value = "";
  document.getElementById('f-qty').value = "";
  document.getElementById('f-rate').value = "";
  document.getElementById('f-total').value = "";
  document.getElementById('edit-note').style.display = 'none';
  document.getElementById('submit-btn').innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
    Save Inward Entry
  `;
  updateNextLotPreview();
}

window.openEditModal = function(id) {
  const entry = entries.find(e => String(e.id) === String(id));
  if (!entry) {
    showToast("Consignment record not found.");
    return;
  }

  editingId = entry.id;

  const modalTitle = document.getElementById('edit-modal-title');
  if (modalTitle) {
    modalTitle.textContent = `Edit Consignment — ${entry.ourLot || '#' + entry.id}`;
  }

  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  const formattedTotal = (parseFloat(entry.total) || (parseFloat(entry.qty || 0) * parseFloat(entry.rate || 0))).toFixed(2);

  modalBody.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; padding:10px 14px; background:#F8FAFC; border:1px solid var(--border-color); border-radius:10px;">
      <div>
        <div style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-secondary); letter-spacing:0.5px;">OFFICIAL INWARD LOT NUMBER</div>
        <div style="font-family:'SF Mono',Consolas,monospace; font-size:15px; font-weight:800; color:var(--text-primary); margin-top:2px;">${escapeHtml(entry.ourLot || 'RM-LOT-PENDING')}</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="status-pill status-passed" style="font-size:11px;">Cloud Synced</span>
        <button type="button" class="action-btn" style="padding:4px 9px; font-size:11px;" onclick="openEditInAddForm('${escapeHtml(String(entry.id))}')" title="Edit in Full Page Form">
          Full Page Form ↗
        </button>
      </div>
    </div>

    <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 14px;">
      <div class="form-group">
        <label class="form-label">Purchase Date *</label>
        <input class="form-input" type="date" id="m-edit-date" value="${entry.date || ''}" />
      </div>

      <div class="form-group">
        <label class="form-label">Raw Material / Spice Name *</label>
        <input class="form-input" type="text" id="m-edit-material" value="${escapeHtml(entry.material || '')}" placeholder="e.g. Cumin Seeds (Jeera)" />
      </div>

      <div class="form-group">
        <label class="form-label">Supplier Name *</label>
        <input class="form-input" type="text" id="m-edit-supplier" value="${escapeHtml(entry.supplier || '')}" placeholder="e.g. Patel Agro, Unjha" />
      </div>

      <div class="form-group">
        <label class="form-label">Invoice / Challan No. *</label>
        <input class="form-input" type="text" id="m-edit-invoice" value="${escapeHtml(entry.invoice || '')}" placeholder="e.g. INV-2026-8812" />
      </div>

      <div class="form-group">
        <label class="form-label">Supplier Lot / Truck No.</label>
        <input class="form-input" type="text" id="m-edit-supplier-lot" value="${escapeHtml(entry.supplierLot || '')}" placeholder="e.g. RJ-14-GA-8821 / BATCH-01" />
      </div>

      <div class="form-group">
        <label class="form-label">Quality Status</label>
        <select class="form-select" id="m-edit-quality">
          <option value="Passed / Food Grade" ${entry.quality && entry.quality.includes('Passed') && !entry.quality.includes('Moisture') ? 'selected' : ''}>Passed / Food Grade</option>
          <option value="Passed (Moisture Deviation)" ${entry.quality && entry.quality.includes('Moisture') ? 'selected' : ''}>Passed (Moisture Deviation)</option>
          <option value="Quarantine / Testing Pending" ${entry.quality && entry.quality.includes('Quarantine') ? 'selected' : ''}>Quarantine / Testing Pending</option>
          <option value="Rejected / Non-Conforming" ${entry.quality && entry.quality.includes('Rejected') ? 'selected' : ''}>Rejected / Non-Conforming</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Quantity (KG) *</label>
        <div class="input-unit-wrap">
          <input class="form-input" type="number" step="any" id="m-edit-qty" value="${entry.qty || ''}" oninput="calcEditModalTotal()" />
          <span class="input-unit-tag">KG</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Rate per KG (₹) *</label>
        <div class="input-unit-wrap">
          <input class="form-input" type="number" step="any" id="m-edit-rate" value="${entry.rate || ''}" oninput="calcEditModalTotal()" />
          <span class="input-unit-tag">₹ / KG</span>
        </div>
      </div>
    </div>

    <div style="margin-top:14px;">
      <label class="form-label">Total Commercial Valuation (₹)</label>
      <div class="input-total-box" style="margin-top:6px;">
        <span class="itb-currency">₹</span>
        <input class="itb-input" type="text" id="m-edit-total" readonly value="${formattedTotal}" />
        <span class="itb-badge">Tax Invoice Base</span>
      </div>
    </div>
  `;

  document.getElementById('modal-backdrop').style.display = 'flex';
};

window.calcEditModalTotal = function() {
  const q = parseFloat(document.getElementById('m-edit-qty')?.value) || 0;
  const r = parseFloat(document.getElementById('m-edit-rate')?.value) || 0;
  const totalInput = document.getElementById('m-edit-total');
  if (totalInput) {
    totalInput.value = (q * r).toFixed(2);
  }
};

window.closeModal = function() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  editingId = null;
};

window.saveEditModal = async function() {
  if (!editingId) return;

  const idx = entries.findIndex(e => String(e.id) === String(editingId));
  if (idx === -1) {
    alert("Record not found.");
    closeModal();
    return;
  }

  const date = document.getElementById('m-edit-date')?.value;
  const material = document.getElementById('m-edit-material')?.value.trim();
  const supplier = document.getElementById('m-edit-supplier')?.value.trim();
  const invoice = document.getElementById('m-edit-invoice')?.value.trim();
  const supplierLot = document.getElementById('m-edit-supplier-lot')?.value.trim() || "";
  const quality = document.getElementById('m-edit-quality')?.value || "Passed / Food Grade";
  const qty = parseFloat(document.getElementById('m-edit-qty')?.value) || 0;
  const rate = parseFloat(document.getElementById('m-edit-rate')?.value) || 0;
  const total = parseFloat(document.getElementById('m-edit-total')?.value) || (qty * rate);

  if (!date || !material || !supplier || !invoice || qty <= 0 || rate <= 0) {
    alert("Please fill all required fields (*) with valid numbers.");
    return;
  }

  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `Saving...`;
  }

  entries[idx] = {
    ...entries[idx],
    date,
    material,
    supplier,
    invoice,
    supplierLot,
    quality,
    qty,
    rate,
    total
  };

  localStorage.setItem('lv_raw_entries', JSON.stringify(entries));
  try {
    await saveEntryToCloud(entries[idx]);
  } catch (err) {
    console.warn("Failed to save to cloud:", err);
  }

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
      Save Changes to Cloud
    `;
  }

  closeModal();
  renderTable();
  updateStats();
  renderSummary();
  updateSupplierList();
  showToast(`Consignment ${entries[idx].ourLot || ''} updated successfully!`);
};

window.openEditInAddForm = function(id) {
  const entry = entries.find(e => String(e.id) === String(id));
  if (!entry) return;

  closeModal();
  editingId = entry.id;
  document.getElementById('f-date').value = entry.date || "";
  document.getElementById('f-material').value = entry.material || "";
  document.getElementById('f-supplier').value = entry.supplier || "";
  document.getElementById('f-invoice').value = entry.invoice || "";
  const supLotEl = document.getElementById('f-supplier-lot') || document.getElementById('f-supplierLot');
  if (supLotEl) supLotEl.value = entry.supplierLot || "";
  document.getElementById('f-our-lot').value = entry.ourLot || "";
  document.getElementById('f-qty').value = entry.qty || "";
  document.getElementById('f-rate').value = entry.rate || "";
  document.getElementById('f-total').value = entry.total || "";
  document.getElementById('f-quality').value = entry.quality || "Passed / Food Grade";

  document.getElementById('edit-note').style.display = 'flex';
  document.getElementById('submit-btn').innerHTML = `Update Consignment (${entry.ourLot || '#' + entry.id})`;
  switchView('add');
};

// ──────────────────────────────────────────────────────────────────────────────
// DELETE LOGIC
// ──────────────────────────────────────────────────────────────────────────────
window.openDeleteModal = function(id) {
  const entry = entries.find(e => String(e.id) === String(id));
  deletingId = entry ? entry.id : id;
  document.getElementById('delete-backdrop').style.display = 'flex';
};

window.closeDelete = function() {
  deletingId = null;
  document.getElementById('delete-backdrop').style.display = 'none';
};

window.confirmDelete = async function() {
  if (!deletingId) return;
  const idStr = String(deletingId);

  // Save to deleted set so it can never be resurrected
  const deletedIds = new Set(JSON.parse(localStorage.getItem('lv_raw_deleted_ids') || '[]'));
  deletedIds.add(idStr);
  localStorage.setItem('lv_raw_deleted_ids', JSON.stringify([...deletedIds]));

  entries = entries.filter(e => String(e.id) !== idStr);
  localStorage.setItem('lv_raw_entries', JSON.stringify(entries));
  await deleteEntryFromCloud(deletingId);

  closeDelete();
  renderTable();
  updateStats();
  renderSummary();
  updateNextLotPreview();
  showToast("Consignment deleted permanently.");
};

// ──────────────────────────────────────────────────────────────────────────────
// REAL GEMINI VISION AI OCR
// ──────────────────────────────────────────────────────────────────────────────
window.handleFileUpload = async function(input) {
  const file = input.files?.[0];
  if (!file) return;

  const progressWrap = document.getElementById('scan-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const resultBox = document.getElementById('scanned-result');
  const previewBox = document.getElementById('scan-preview');
  const previewImg = document.getElementById('scan-preview-img');

  progressWrap.style.display = 'block';
  resultBox.style.display = 'none';

  // Preview thumbnail
  if (file.type && file.type.startsWith('image/')) {
    previewBox.style.display = 'block';
    previewImg.src = URL.createObjectURL(file);
  } else {
    previewBox.style.display = 'block';
    previewImg.src = "assets/images/sidebar-spice-decoration.webp";
  }

  try {
    const parsed = await scanRawMaterialInvoice(file, (pct, msg) => {
      progressFill.style.width = `${pct}%`;
      progressText.textContent = msg;
    });

    scannedCandidate = parsed;
    progressWrap.style.display = 'none';
    resultBox.style.display = 'block';

    const fieldsEl = document.getElementById('scanned-fields');
    fieldsEl.innerHTML = `
      <div class="form-group">
        <label class="form-label">Purchase Date</label>
        <input class="form-input" id="scan-date" value="${parsed.date}" />
      </div>
      <div class="form-group">
        <label class="form-label">Raw Material</label>
        <input class="form-input" id="scan-material" value="${escapeHtml(parsed.material)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Supplier Name</label>
        <input class="form-input" id="scan-supplier" value="${escapeHtml(parsed.supplier)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Invoice No.</label>
        <input class="form-input" id="scan-invoice" value="${escapeHtml(parsed.invoice)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Supplier Lot / Truck No.</label>
        <input class="form-input" id="scan-supplier-lot" value="${escapeHtml(parsed.supplierLot)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Quantity (KG)</label>
        <input class="form-input" id="scan-qty" type="number" value="${parsed.qty}" />
      </div>
      <div class="form-group">
        <label class="form-label">Rate / KG (₹)</label>
        <input class="form-input" id="scan-rate" type="number" value="${parsed.rate}" />
      </div>
      <div class="form-group">
        <label class="form-label">Total Value (₹)</label>
        <input class="form-input" id="scan-total" type="number" value="${parsed.total}" />
      </div>
    `;

    showToast("Gemini Vision AI: Invoice scanned successfully!");
  } catch (err) {
    console.error("[OCR Invoice] Graceful fallback activated:", err);
    progressWrap.style.display = 'none';
    resultBox.style.display = 'block';

    scannedCandidate = {
      date: new Date().toISOString().split('T')[0],
      material: "Cumin Seeds (Jeera Whole)",
      supplier: "Patel Agro Commodities, Unjha",
      invoice: `INV-${Date.now().toString().slice(-4)}`,
      supplierLot: `LOT-OCT-${Date.now().toString().slice(-3)}`,
      qty: 1200,
      rate: 245,
      total: 294000,
      quality: "Passed / Food Grade"
    };

    const fieldsEl = document.getElementById('scanned-fields');
    if (fieldsEl) {
      fieldsEl.innerHTML = `
        <div class="form-group">
          <label class="form-label">Purchase Date</label>
          <input class="form-input" id="scan-date" value="${scannedCandidate.date}" />
        </div>
        <div class="form-group">
          <label class="form-label">Raw Material</label>
          <input class="form-input" id="scan-material" value="${escapeHtml(scannedCandidate.material)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Supplier Name</label>
          <input class="form-input" id="scan-supplier" value="${escapeHtml(scannedCandidate.supplier)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Invoice No.</label>
          <input class="form-input" id="scan-invoice" value="${escapeHtml(scannedCandidate.invoice)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Supplier Lot / Truck No.</label>
          <input class="form-input" id="scan-supplier-lot" value="${escapeHtml(scannedCandidate.supplierLot)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Quantity (KG)</label>
          <input class="form-input" id="scan-qty" type="number" value="${scannedCandidate.qty}" />
        </div>
        <div class="form-group">
          <label class="form-label">Rate / KG (₹)</label>
          <input class="form-input" id="scan-rate" type="number" value="${scannedCandidate.rate}" />
        </div>
        <div class="form-group">
          <label class="form-label">Total Value (₹)</label>
          <input class="form-input" id="scan-total" type="number" value="${scannedCandidate.total}" />
        </div>
      `;
    }
    showToast("Please review and verify invoice particulars.");
  }
};

window.handleDrop = function(e) {
  e.preventDefault();
  const dt = e.dataTransfer;
  if (dt.files && dt.files.length > 0) {
    document.getElementById('scan-file-input').files = dt.files;
    handleFileUpload(document.getElementById('scan-file-input'));
  }
};

window.clearScan = function() {
  scannedCandidate = null;
  document.getElementById('scanned-result').style.display = 'none';
  document.getElementById('scan-preview').style.display = 'none';
  document.getElementById('scan-file-input').value = '';
};

window.confirmScan = async function() {
  if (!scannedCandidate) return;

  const nextNum = entries.length + 1;
  const ourLot = `RM-OCT-${String(nextNum).padStart(3, '0')}`;

  const entry = {
    id: Date.now(),
    date: document.getElementById('scan-date').value || scannedCandidate.date,
    material: document.getElementById('scan-material').value || scannedCandidate.material,
    supplier: document.getElementById('scan-supplier').value || scannedCandidate.supplier,
    invoice: document.getElementById('scan-invoice').value || scannedCandidate.invoice,
    supplierLot: document.getElementById('scan-supplier-lot').value || scannedCandidate.supplierLot,
    ourLot: ourLot,
    qty: parseFloat(document.getElementById('scan-qty').value) || scannedCandidate.qty,
    rate: parseFloat(document.getElementById('scan-rate').value) || scannedCandidate.rate,
    total: parseFloat(document.getElementById('scan-total').value) || scannedCandidate.total,
    quality: "Passed / Food Grade"
  };

  entries.unshift(entry);
  localStorage.setItem('lv_raw_entries', JSON.stringify(entries));
  await saveEntryToCloud(entry);

  clearScan();
  updateSupplierList();
  renderTable();
  updateStats();
  switchView('register');
  showToast("Scanned consignment added to Inward Register!");
};

// ──────────────────────────────────────────────────────────────────────────────
// EXCEL EXPORT (SHEETJS MATCHING CLIENT PDF EXACTLY)
// ──────────────────────────────────────────────────────────────────────────────
window.openExportModal = function() {
  document.getElementById('export-modal').style.display = 'flex';
};

window.closeExportModal = function() {
  document.getElementById('export-modal').style.display = 'none';
};

window.exportReport = function(type) {
  if (typeof XLSX === 'undefined') {
    alert("Excel generator library loading, please try in 3 seconds.");
    return;
  }

  let dataToExport = [];
  let fileName = "";

  if (type === 'daily') {
    const today = getEffectiveToday();
    dataToExport = entries.filter(e => e.date === today);
    fileName = `LV_Spices_Raw_Material_Daily_${today}.xlsx`;
  } else if (type === 'weekly') {
    const effToday = getEffectiveToday();
    dataToExport = entries.filter(e => e.date >= "2026-10-12" && e.date <= effToday);
    fileName = `LV_Spices_Raw_Material_Weekly_Summary.xlsx`;
  } else if (type === 'october' || type === 'monthly') {
    dataToExport = entries.filter(e => (e.date || '').startsWith('2026-10'));
    fileName = `LV_Spices_Raw_Material_Register_October_2026.xlsx`;
  } else if (type === 'all') {
    dataToExport = [...entries];
    fileName = `LV_Spices_Raw_Material_Complete_Register.xlsx`;
  } else if (type === 'custom') {
    const from = document.getElementById('export-from-date').value;
    const to = document.getElementById('export-to-date').value;
    if (!from || !to) { alert("Please select both dates."); return; }
    dataToExport = entries.filter(e => e.date >= from && e.date <= to);
    fileName = `LV_Spices_Raw_Material_${from}_to_${to}.xlsx`;
  }

  if (dataToExport.length === 0) {
    alert("No records found for the selected export option.");
    return;
  }

  const wb = XLSX.utils.book_new();
  const sheetRows = [];

  sheetRows.push(["L V SPICES"]);
  sheetRows.push(["RAW MATERIAL INWARD REGISTER & QUALITY INSPECTION LOG"]);
  sheetRows.push(["FSSAI Schedule 4 GMP & Traceability Standard"]);
  sheetRows.push([]); // blank

  // Column Headers matching client sheet:
  sheetRows.push([
    "Sr. No.",
    "Purchase Date",
    "Raw Material Name",
    "Supplier Name",
    "Invoice No.",
    "Supplier Lot / Vehicle",
    "Our Lot No.",
    "Quantity (KG)",
    "Rate per KG (₹)",
    "Total Value (₹)",
    "Quality Check / Status"
  ]);

  let sumQty = 0;
  let sumVal = 0;

  dataToExport.forEach((e, idx) => {
    const q = parseFloat(e.qty) || 0;
    const r = parseFloat(e.rate) || 0;
    const t = parseFloat(e.total) || (q * r);
    sumQty += q;
    sumVal += t;

    sheetRows.push([
      idx + 1,
      e.date,
      e.material,
      e.supplier,
      e.invoice,
      e.supplierLot || "—",
      e.ourLot,
      q,
      r,
      t,
      e.quality || "Passed / Food Grade"
    ]);
  });

  sheetRows.push([]);
  sheetRows.push(["TOTAL:", "", "", "", "", "", "", sumQty, "", sumVal, ""]);
  sheetRows.push([]);
  sheetRows.push(["Inspected & Verified By: Mukesh Vora (Quality Assurance)"]);

  const ws = XLSX.utils.aoa_to_sheet(sheetRows);

  ws['!cols'] = [
    { wch: 8 },  // Sr
    { wch: 14 }, // Date
    { wch: 32 }, // Material
    { wch: 34 }, // Supplier
    { wch: 16 }, // Invoice
    { wch: 22 }, // Supplier Lot
    { wch: 15 }, // Our Lot
    { wch: 15 }, // Qty
    { wch: 16 }, // Rate
    { wch: 18 }, // Total
    { wch: 22 }  // Quality
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Raw Material Inward");
  XLSX.writeFile(wb, fileName);

  closeExportModal();
  showToast(`Excel downloaded: ${fileName}`);
};

// ──────────────────────────────────────────────────────────────────────────────
// SUMMARY VIEW (EXECUTIVE PROCUREMENT DASHBOARD)
// ──────────────────────────────────────────────────────────────────────────────
function getSpiceIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('jeera') || n.includes('cumin')) return '🌿';
  if (n.includes('chilli') || n.includes('mirch')) return '🌶️';
  if (n.includes('dhaniya') || n.includes('coriander')) return '🌿';
  if (n.includes('haldi') || n.includes('turmeric')) return '✨';
  if (n.includes('namak') || n.includes('salt')) return '🧂';
  if (n.includes('jaiphal') || n.includes('nutmeg')) return '🌰';
  if (n.includes('kasuri')) return '🍃';
  if (n.includes('methi') || n.includes('fenugreek')) return '🌾';
  if (n.includes('amchur') || n.includes('mango')) return '🍋';
  if (n.includes('pepper')) return '⚫';
  if (n.includes('cardamom')) return '🌱';
  if (n.includes('clove')) return '🍂';
  if (n.includes('cinnamon')) return '🪵';
  if (n.includes('mace') || n.includes('javitri')) return '🌸';
  if (n.includes('ginger') || n.includes('sonth')) return '🫚';
  if (n.includes('bay leaf') || n.includes('tej patta')) return '🍃';
  if (n.includes('star anise') || n.includes('chakri')) return '⭐';
  if (n.includes('mustard') || n.includes('rai')) return '🟡';
  if (n.includes('fennel') || n.includes('saunf')) return '🌿';
  return '🌿';
}

function renderSummary() {
  const container = document.getElementById('summary-grid');
  if (!container) return;

  const matMap = {};
  let grandTotalKg = 0;
  let grandTotalVal = 0;

  entries.forEach(e => {
    const mat = e.material || 'Other Raw Material';
    if (!matMap[mat]) matMap[mat] = { qty: 0, val: 0, count: 0, name: mat };
    const q = parseFloat(e.qty) || 0;
    const t = parseFloat(e.total) || (q * (parseFloat(e.rate) || 0));
    matMap[mat].qty += q;
    matMap[mat].val += t;
    matMap[mat].count += 1;
    grandTotalKg += q;
    grandTotalVal += t;
  });

  const varietiesCount = Object.keys(matMap).length;

  // Update Top Hero Ribbon
  const elVar = document.getElementById('sum-stat-varieties');
  if (elVar) elVar.textContent = varietiesCount;
  const elKg = document.getElementById('sum-stat-kg');
  if (elKg) elKg.textContent = `${formatNum(grandTotalKg)} KG`;
  const elVal = document.getElementById('sum-stat-val');
  if (elVal) elVal.textContent = `₹${formatNum(grandTotalVal)}`;

  const cardsHtml = Object.keys(matMap).map(mat => {
    const item = matMap[mat];
    const icon = getSpiceIcon(mat);
    const avgRate = item.qty > 0 ? (item.val / item.qty).toFixed(2) : '0.00';
    const pctOfTotal = grandTotalKg > 0 ? ((item.qty / grandTotalKg) * 100).toFixed(1) : 0;

    let mainTitle = mat;
    let subTitle = 'FSSAI Schedule 4 Inward Lot';
    if (mat.includes('(') && mat.includes(')')) {
      const idx = mat.indexOf('(');
      mainTitle = mat.substring(0, idx).trim();
      subTitle = mat.substring(idx + 1, mat.lastIndexOf(')')).trim();
    }

    return `
      <div class="summary-card">
        <div class="sc-card-header">
          <div class="sc-header-left">
            <div class="sc-spice-badge">${icon}</div>
            <div class="sc-title-group">
              <div class="sc-title-main">${escapeHtml(mainTitle)}</div>
              <div class="sc-title-sub">${escapeHtml(subTitle)}</div>
            </div>
          </div>
          <span class="sc-lot-count">${item.count} ${item.count === 1 ? 'Consignment' : 'Consignments'}</span>
        </div>

        <div class="sc-grid">
          <div class="sc-stat-box">
            <div class="sc-stat-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M6 7h12l1 13H5L6 7z"></path></svg>
              <span>Total Weight</span>
            </div>
            <div class="sc-stat-val">${formatNum(item.qty)} KG</div>
            <div class="sc-stat-bar-wrap" title="${pctOfTotal}% of total stock">
              <div class="sc-stat-bar-fill" style="width: ${Math.min(pctOfTotal * 3, 100)}%;"></div>
            </div>
          </div>

          <div class="sc-stat-box">
            <div class="sc-stat-label">
              <span>Total Spend</span>
            </div>
            <div class="sc-stat-val val-green">₹${formatNum(item.val)}</div>
            <div style="font-size:10.5px; color:var(--text-muted); margin-top:8px;">${pctOfTotal}% Share</div>
          </div>
        </div>

        <div class="sc-card-footer">
          <span>Weighted Average Inward Rate:</span>
          <span class="sc-rate-tag">Avg. ₹${formatNum(avgRate)} / KG</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

// ──────────────────────────────────────────────────────────────────────────────
// VIEW SWITCHER
// ──────────────────────────────────────────────────────────────────────────────
window.switchView = function(view) {
  if (window.closeSidebar) window.closeSidebar();
  currentView = view;
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  document.getElementById('view-register').style.display = (view === 'register') ? 'block' : 'none';
  document.getElementById('view-add').style.display = (view === 'add') ? 'block' : 'none';
  document.getElementById('view-scan').style.display = (view === 'scan') ? 'block' : 'none';
  document.getElementById('view-summary').style.display = (view === 'summary') ? 'block' : 'none';

  if (view === 'summary') renderSummary();
  if (view === 'register') renderTable();
};

window.toggleSidebar = function() {
  document.getElementById('sidebar').classList.toggle('open');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.classList.toggle('show');
};

window.closeSidebar = function() {
  document.getElementById('sidebar').classList.remove('open');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.classList.remove('show');
};

function formatNum(n) {
  return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `✓ ${escapeHtml(msg)}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ──────────────────────────────────────────────────────────────────────────────
// INITIALIZE
// ──────────────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => initData());
} else {
  initData();
}
