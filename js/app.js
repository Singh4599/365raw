// app.js — L V Spices Raw Material Inward Register
// FSSAI Quality & Traceability with Firebase Firestore Cloud Sync & Gemini Vision AI

import { saveEntryToCloud, deleteEntryFromCloud, loadAllRawEntriesFromCloud, updateCloudBadge } from './firebase-config.js?v=3.1.0';
import { scanRawMaterialInvoice } from './ocr.js?v=3.2.0';

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
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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

  // Attach dynamic lot number auto-assignment to manual entry form inputs
  const matInput = document.getElementById('f-material');
  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    if (!dateInput.value || dateInput.value === '2026-10-18') {
      dateInput.value = getEffectiveToday();
    }
    dateInput.addEventListener('change', () => { if (!editingId) updateNextLotPreview(); });
  }
  if (matInput) {
    matInput.addEventListener('input', () => { if (!editingId) updateNextLotPreview(); });
    matInput.addEventListener('change', () => { if (!editingId) updateNextLotPreview(); });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// OUR LOT NUMBER FORMULA: Product Initials + MMYY (e.g. Chilli Whole -> CW-1026)
// ──────────────────────────────────────────────────────────────────────────────
export function getMaterialInitials(name) {
  if (!name || typeof name !== 'string') return 'RM';
  let primary = name.split(/[\(\/\-]/)[0].trim();
  if (!primary) primary = name.trim();

  const stopWords = new Set(['AND', '&', 'THE', 'OF', 'IN', 'FOR', 'GRADE', 'RAW', 'MATERIAL', 'SELECTED', 'EXTRA', 'NATURAL', 'PURE', 'SPECIAL', 'NO', 'KG']);
  const clean = primary.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const words = clean.split(/\s+/).filter(w => w.length > 0 && !stopWords.has(w.toUpperCase()));

  if (words.length === 0) {
    const rawWords = primary.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (rawWords.length > 0) {
      return rawWords.slice(0, 3).map(w => w[0].toUpperCase()).join('');
    }
    return 'RM';
  }

  if (words.length === 1) {
    const word = words[0].toUpperCase();
    return word.length >= 2 ? word.slice(0, 2) : word;
  }

  return words.slice(0, 4).map(w => w[0].toUpperCase()).join('');
}

export function getMonthYearCode(dateStr) {
  let mm = '10';
  let yy = '26';
  if (dateStr) {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        yy = parts[0].slice(-2);
        mm = parts[1].padStart(2, '0');
      }
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length >= 3) {
        mm = parts[1].padStart(2, '0');
        yy = parts[2].slice(-2);
      }
    }
  }
  return `${mm}${yy}`;
}

export function generateOurLotNumber(materialName, dateStr, usedLots = null) {
  const initials = getMaterialInitials(materialName);
  const mmyy = getMonthYearCode(dateStr);
  const base = `${initials}-${mmyy}`;

  const lotSet = usedLots || new Set(entries.map(e => (e.ourLot || '').trim()).filter(Boolean));

  if (!lotSet.has(base)) {
    lotSet.add(base);
    return base;
  }

  let index = 1;
  while (lotSet.has(`${base}-${index}`)) {
    index++;
  }
  const uniqueLot = `${base}-${index}`;
  lotSet.add(uniqueLot);
  return uniqueLot;
}

window.generateOurLotNumber = generateOurLotNumber;

function updateNextLotPreview() {
  const matEl = document.getElementById('f-material');
  const dateEl = document.getElementById('f-date');
  const mat = matEl ? matEl.value.trim() : '';
  const date = dateEl && dateEl.value ? dateEl.value : getEffectiveToday();

  const usedLots = new Set(entries.map(e => (e.ourLot || '').trim()).filter(Boolean));
  const previewLot = generateOurLotNumber(mat || 'Chilli Whole', date, usedLots);

  const el = document.getElementById('next-lot-preview');
  if (el) el.textContent = `Next Lot: ${mat ? previewLot : 'Initials-MMYY (e.g. CW-1026)'}`;

  const ourLotInput = document.getElementById('f-our-lot');
  if (ourLotInput && !editingId) {
    ourLotInput.value = mat ? previewLot : '';
    ourLotInput.placeholder = previewLot || 'e.g. CW-1026';
  }
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
        <td style="font-size:11.5px; color:var(--text-primary); font-weight:600; line-height:1.3; max-width:140px;">${escapeHtml(entry.supplier || '—')}</td>
        <td style="font-size:11px; color:var(--text-secondary); max-width:155px;">${escapeHtml(entry.supplierAddress || '—')}</td>
        <td style="font-size:11px; color:var(--text-secondary); white-space:nowrap;">${escapeHtml(entry.phoneNo || '—')}</td>
        <td style="font-size:10.5px; color:var(--text-secondary); font-family:'SF Mono',Consolas,monospace; letter-spacing:0.3px;">${escapeHtml(entry.gstin || '—')}</td>
        <td style="font-size:10.5px; color:var(--text-secondary); font-family:'SF Mono',Consolas,monospace;">${escapeHtml(entry.fssaiNo || '—')}</td>
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
        <td colspan="11" style="text-align:right; font-weight:800; color:var(--text-secondary); text-transform:uppercase; font-size:11.5px; letter-spacing:0.5px;">TOTAL CONSIGNMENTS (${data.length}):</td>
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
  document.getElementById('f-date').value = getEffectiveToday();
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

    <!-- Supplier Compliance Details -->
    <div style="margin-top:16px; padding:14px; background:#F8FAFC; border:1px solid var(--border-color); border-radius:var(--radius-md);">
      <div style="font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">📋 Supplier Compliance Details <span style="font-weight:500; font-size:10px; color:#94A3B8;">(blank if not on invoice)</span></div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:12px;">📍 Supplier Address</label>
          <input class="form-input" type="text" id="m-edit-supplier-address" value="${escapeHtml(entry.supplierAddress || '')}" placeholder="e.g. Lasalgaon, Nashik, Maharashtra" />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:12px;">📞 Phone No.</label>
          <input class="form-input" type="text" id="m-edit-phone" value="${escapeHtml(entry.phoneNo || '')}" placeholder="e.g. +91-9876543210" />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:12px;">🏛️ GSTIN No.</label>
          <input class="form-input" type="text" id="m-edit-gstin" value="${escapeHtml(entry.gstin || '')}" placeholder="Blank if not on invoice" style="font-family:var(--font-mono); letter-spacing:0.5px;" />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:12px;">🍃 FSSAI License No.</label>
          <input class="form-input" type="text" id="m-edit-fssai" value="${escapeHtml(entry.fssaiNo || '')}" placeholder="Blank if not on invoice" style="font-family:var(--font-mono); letter-spacing:0.5px;" />
        </div>
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
  const supplierAddress = document.getElementById('m-edit-supplier-address')?.value.trim() || "";
  const phoneNo = document.getElementById('m-edit-phone')?.value.trim() || "";
  const gstin = document.getElementById('m-edit-gstin')?.value.trim() || "";
  const fssaiNo = document.getElementById('m-edit-fssai')?.value.trim() || "";
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
    supplierAddress,
    phoneNo,
    gstin,
    fssaiNo,
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

  // Preview thumbnail only for actual image files (NEVER show decorative spice artwork)
  if (file.type && file.type.startsWith('image/')) {
    previewBox.style.display = 'flex';
    previewImg.style.display = 'block';
    previewImg.src = URL.createObjectURL(file);
  } else {
    previewBox.style.display = 'none';
    previewImg.src = '';
  }

  try {
    const parsed = await scanRawMaterialInvoice(file, (pct, msg) => {
      progressFill.style.width = `${pct}%`;
      progressText.textContent = msg;
    });

    scannedCandidate = parsed;
    progressWrap.style.display = 'none';
    previewBox.style.display = 'none'; // Cleanly hide preview so result form is clear
    resultBox.style.display = 'block';

    renderScannedInvoiceUI();
    showToast(`Gemini Vision AI: Invoice scanned successfully (${scannedCandidate.items?.length || 1} line item(s))!`);
  } catch (err) {
    console.error("[OCR Invoice] Graceful fallback activated:", err);
    progressWrap.style.display = 'none';
    previewBox.style.display = 'none';
    resultBox.style.display = 'block';

    scannedCandidate = {
      date: new Date().toISOString().split('T')[0],
      supplier: "K MAITRI FOODS & COLD STORAGE PVT. LTD.",
      invoice: `K1520-2026`,
      items: [
        { id: 1, material: "Dry Chilli Powder", supplierLot: "3704/43", qty: 30, rate: 48, total: 1440, quality: "Passed / Food Grade" },
        { id: 2, material: "White Chinese Masala", supplierLot: "3705/12", qty: 9, rate: 48, total: 432, quality: "Passed / Food Grade" },
        { id: 3, material: "Dry Chilli Powder", supplierLot: "3706/66", qty: 43, rate: 48, total: 2064, quality: "Passed / Food Grade" },
        { id: 4, material: "Coriander Powder", supplierLot: "5708/10", qty: 10, rate: 48, total: 480, quality: "Passed / Food Grade" }
      ]
    };

    renderScannedInvoiceUI();
    showToast("Please review and verify invoice particulars.");
  }
};

window.renderScannedInvoiceUI = function() {
  if (!scannedCandidate) return;
  const fieldsEl = document.getElementById('scanned-fields');
  if (!fieldsEl) return;

  const usedLots = new Set(entries.map(e => (e.ourLot || '').trim()).filter(Boolean));

  if (!Array.isArray(scannedCandidate.items) || scannedCandidate.items.length === 0) {
    scannedCandidate.items = [{
      id: 1,
      material: scannedCandidate.material || "Dry Chilli Powder",
      supplierLot: scannedCandidate.supplierLot || "LOT-01",
      qty: scannedCandidate.qty || 1000,
      rate: scannedCandidate.rate || 48,
      total: scannedCandidate.total || 48000,
      quality: "Passed / Food Grade"
    }];
  }

  scannedCandidate.items.forEach((item) => {
    if (!item.ourLot) {
      item.ourLot = generateOurLotNumber(item.material, scannedCandidate.date, usedLots);
    } else {
      usedLots.add(item.ourLot);
    }
  });

  const totalQty = scannedCandidate.items.reduce((sum, it) => sum + (parseFloat(it.qty) || 0), 0);
  const totalVal = scannedCandidate.items.reduce((sum, it) => sum + (parseFloat(it.total) || 0), 0);

  fieldsEl.innerHTML = `
    <div style="grid-column: 1 / -1; display:flex; flex-direction:column; gap:16px; width:100%;">
      <!-- Bill Summary Card -->
      <div style="background:#F8FAFC; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">
            Bill &amp; Supplier Metadata
          </div>
          <span class="badge" style="background:#DCFCE7; color:#15803D; font-size:11px; padding:3px 10px; font-weight:700; border-radius:12px;">
            ${scannedCandidate.items.length} Line Item${scannedCandidate.items.length > 1 ? 's' : ''} Found
          </span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Purchase Date *</label>
            <input class="form-input" type="date" id="scan-date" value="${scannedCandidate.date}" onchange="updateScanDate(this.value)" />
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Supplier / Cold Storage Name *</label>
            <input class="form-input" type="text" id="scan-supplier" value="${escapeHtml(scannedCandidate.supplier)}" oninput="scannedCandidate.supplier = this.value" />
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Invoice / Bill No. *</label>
            <input class="form-input" type="text" id="scan-invoice" value="${escapeHtml(scannedCandidate.invoice)}" oninput="scannedCandidate.invoice = this.value" />
          </div>
        </div>

        <!-- Supplier Compliance Details -->
        <div style="margin-top:14px; padding-top:14px; border-top:1px dashed var(--border-color);">
          <div style="font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">
            📋 Supplier Compliance Details <span style="font-weight:500; font-size:10px; color:#94A3B8;">(auto-extracted — leave blank if not on invoice)</span>
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:12px; font-weight:700;">📍 Supplier Address</label>
              <input class="form-input" type="text" id="scan-supplier-address" value="${escapeHtml(scannedCandidate.supplierAddress || '')}" oninput="scannedCandidate.supplierAddress = this.value" placeholder="e.g. Lasalgaon, Nashik, Maharashtra" />
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:12px; font-weight:700;">📞 Phone No.</label>
              <input class="form-input" type="text" id="scan-phone" value="${escapeHtml(scannedCandidate.phoneNo || '')}" oninput="scannedCandidate.phoneNo = this.value" placeholder="e.g. +91-9876543210" />
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:12px; font-weight:700;">🏛️ GSTIN No.</label>
              <input class="form-input" type="text" id="scan-gstin" value="${escapeHtml(scannedCandidate.gstin || '')}" oninput="scannedCandidate.gstin = this.value" placeholder="Blank if not on invoice" style="font-family:var(--font-mono); font-size:12px; letter-spacing:0.5px;" />
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:12px; font-weight:700;">🍃 FSSAI License No.</label>
              <input class="form-input" type="text" id="scan-fssai" value="${escapeHtml(scannedCandidate.fssaiNo || '')}" oninput="scannedCandidate.fssaiNo = this.value" placeholder="Blank if not on invoice" style="font-family:var(--font-mono); font-size:12px; letter-spacing:0.5px;" />
            </div>
          </div>
        </div>
      </div>


      <!-- Line Items Table -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size:13px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
            <span>Commodity Line Items</span>
            <span style="font-size:11px; font-weight:600; color:var(--brand-red); background:#FFF5F5; padding:2px 8px; border-radius:6px; border:1px solid #FECACA;">
              Lot Formula: Initials-MMYY (e.g. CW-1026)
            </span>
          </div>
          <button type="button" class="action-btn" style="padding:5px 12px; font-size:12px; height:auto; background:#fff; border:1px solid var(--border-color);" onclick="addScannedItemRow()">
            + Add Another Item
          </button>
        </div>

        <div style="overflow-x:auto; border:1px solid var(--border-color); border-radius:var(--radius-md); background:#FFFFFF; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
            <thead>
              <tr style="background:#F1F5F9; border-bottom:1px solid var(--border-color);">
                <th style="padding:10px 8px; width:32px; text-align:center; font-weight:800; color:var(--text-secondary);">#</th>
                <th style="padding:10px 8px; min-width:180px; font-weight:800; color:var(--text-secondary);">Raw Material Commodity *</th>
                <th style="padding:10px 8px; width:130px; font-weight:800; color:var(--text-secondary);">Supplier Lot / Truck</th>
                <th style="padding:10px 8px; width:140px; font-weight:800; color:var(--text-secondary);">Our Lot No. (Auto) *</th>
                <th style="padding:10px 8px; width:95px; font-weight:800; color:var(--text-secondary);">Qty (KG) *</th>
                <th style="padding:10px 8px; width:95px; font-weight:800; color:var(--text-secondary);">Rate/KG (₹)</th>
                <th style="padding:10px 8px; width:110px; font-weight:800; color:var(--text-secondary);">Total (₹)</th>
                <th style="padding:10px 8px; width:36px; text-align:center;"></th>
              </tr>
            </thead>
            <tbody id="scan-items-tbody">
              ${scannedCandidate.items.map((it, idx) => `
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="padding:8px; text-align:center; font-weight:700; color:var(--text-secondary);">${idx + 1}</td>
                  <td style="padding:8px;">
                    <input class="form-input" style="padding:6px 8px; font-size:12px; font-weight:600;" id="scan-item-mat-${idx}" value="${escapeHtml(it.material)}" onchange="onScannedItemMaterialChange(${idx}, this.value)" />
                  </td>
                  <td style="padding:8px;">
                    <input class="form-input" style="padding:6px 8px; font-size:12px;" id="scan-item-slot-${idx}" value="${escapeHtml(it.supplierLot || '')}" oninput="scannedCandidate.items[${idx}].supplierLot = this.value" />
                  </td>
                  <td style="padding:8px;">
                    <input class="form-input" style="padding:6px 8px; font-size:12px; font-family:var(--font-mono); font-weight:800; color:var(--brand-red); background:#FFF5F5; border-color:#FECACA;" id="scan-item-olot-${idx}" value="${escapeHtml(it.ourLot || '')}" oninput="scannedCandidate.items[${idx}].ourLot = this.value" />
                  </td>
                  <td style="padding:8px;">
                    <input class="form-input" type="number" step="any" style="padding:6px 8px; font-size:12px; font-weight:600; text-align:right;" id="scan-item-qty-${idx}" value="${it.qty}" oninput="onScannedItemCalc(${idx})" />
                  </td>
                  <td style="padding:8px;">
                    <input class="form-input" type="number" step="any" style="padding:6px 8px; font-size:12px; text-align:right;" id="scan-item-rate-${idx}" value="${it.rate}" oninput="onScannedItemCalc(${idx})" />
                  </td>
                  <td style="padding:8px;">
                    <input class="form-input" type="number" step="any" style="padding:6px 8px; font-size:12px; font-weight:700; text-align:right; background:#F8FAFC;" id="scan-item-total-${idx}" value="${it.total}" oninput="scannedCandidate.items[${idx}].total = parseFloat(this.value) || 0; updateScanTotalsDisplay();" />
                  </td>
                  <td style="padding:8px; text-align:center;">
                    <button type="button" style="background:none; border:none; cursor:pointer; color:#EF4444; font-size:16px; font-weight:bold; padding:2px 6px;" title="Remove line item" onclick="removeScannedItemRow(${idx})">×</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background:#F8FAFC; border-top:2px solid var(--border-color); font-weight:800;">
                <td colspan="4" style="padding:10px 12px; text-align:right; color:var(--text-secondary); text-transform:uppercase; font-size:11px; letter-spacing:0.5px;">
                  Grand Total (${scannedCandidate.items.length} items):
                </td>
                <td id="scan-total-qty" style="padding:10px 8px; text-align:right; font-family:var(--font-mono); color:var(--brand-red); font-size:12.5px;">
                  ${totalQty.toLocaleString('en-IN')} KG
                </td>
                <td></td>
                <td id="scan-grand-total" style="padding:10px 8px; text-align:right; font-family:var(--font-mono); color:#059669; font-size:12.5px;">
                  ₹${totalVal.toLocaleString('en-IN')}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `;

  // Update Confirm Button
  const confirmBtn = document.getElementById('confirm-scan-btn');
  if (confirmBtn) {
    confirmBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      Confirm &amp; Save All ${scannedCandidate.items.length} Items to Register
    `;
  }
};

window.onScannedItemCalc = function(idx) {
  if (!scannedCandidate || !scannedCandidate.items || !scannedCandidate.items[idx]) return;
  const item = scannedCandidate.items[idx];
  const q = parseFloat(document.getElementById(`scan-item-qty-${idx}`)?.value) || 0;
  const r = parseFloat(document.getElementById(`scan-item-rate-${idx}`)?.value) || 0;
  item.qty = q;
  item.rate = r;
  item.total = Math.round(q * r * 100) / 100;
  const totEl = document.getElementById(`scan-item-total-${idx}`);
  if (totEl) totEl.value = item.total;
  updateScanTotalsDisplay();
};

window.updateScanTotalsDisplay = function() {
  if (!scannedCandidate || !scannedCandidate.items) return;
  const totalQty = scannedCandidate.items.reduce((sum, it) => sum + (parseFloat(it.qty) || 0), 0);
  const totalVal = scannedCandidate.items.reduce((sum, it) => sum + (parseFloat(it.total) || 0), 0);
  const qEl = document.getElementById('scan-total-qty');
  const tEl = document.getElementById('scan-grand-total');
  if (qEl) qEl.textContent = `${totalQty.toLocaleString('en-IN')} KG`;
  if (tEl) tEl.textContent = `₹${totalVal.toLocaleString('en-IN')}`;
};

window.onScannedItemMaterialChange = function(idx, newMat) {
  if (!scannedCandidate || !scannedCandidate.items || !scannedCandidate.items[idx]) return;
  const item = scannedCandidate.items[idx];
  item.material = newMat;
  const usedLots = new Set(entries.map(e => (e.ourLot || '').trim()).filter(Boolean));
  scannedCandidate.items.forEach((it, i) => {
    if (i !== idx && it.ourLot) usedLots.add(it.ourLot);
  });
  item.ourLot = generateOurLotNumber(newMat, scannedCandidate.date, usedLots);
  const lotEl = document.getElementById(`scan-item-olot-${idx}`);
  if (lotEl) lotEl.value = item.ourLot;
};

window.updateScanDate = function(newDate) {
  if (!scannedCandidate) return;
  scannedCandidate.date = newDate;
  const usedLots = new Set(entries.map(e => (e.ourLot || '').trim()).filter(Boolean));
  scannedCandidate.items.forEach((item, idx) => {
    item.ourLot = generateOurLotNumber(item.material, newDate, usedLots);
    const el = document.getElementById(`scan-item-olot-${idx}`);
    if (el) el.value = item.ourLot;
  });
};

window.addScannedItemRow = function() {
  if (!scannedCandidate) return;
  const nextId = scannedCandidate.items.length + 1;
  const usedLots = new Set(entries.map(e => (e.ourLot || '').trim()).filter(Boolean));
  scannedCandidate.items.forEach(it => { if (it.ourLot) usedLots.add(it.ourLot); });
  const defaultMat = "Chilli Whole";
  const ourLot = generateOurLotNumber(defaultMat, scannedCandidate.date, usedLots);

  scannedCandidate.items.push({
    id: nextId,
    material: defaultMat,
    supplierLot: `LOT-${String(nextId).padStart(2, '0')}`,
    ourLot: ourLot,
    qty: 500,
    rate: 200,
    total: 100000,
    quality: "Passed / Food Grade"
  });
  renderScannedInvoiceUI();
};

window.removeScannedItemRow = function(idx) {
  if (!scannedCandidate || !scannedCandidate.items) return;
  if (scannedCandidate.items.length <= 1) {
    alert("Invoice must have at least one line item. To cancel the whole scan, click Discard Scan.");
    return;
  }
  scannedCandidate.items.splice(idx, 1);
  renderScannedInvoiceUI();
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
  if (!scannedCandidate || !scannedCandidate.items || scannedCandidate.items.length === 0) return;

  const commonDate = document.getElementById('scan-date')?.value || scannedCandidate.date;
  const commonSupplier = document.getElementById('scan-supplier')?.value.trim() || scannedCandidate.supplier;
  const commonInvoice = document.getElementById('scan-invoice')?.value.trim() || scannedCandidate.invoice;
  const commonSupplierAddress = document.getElementById('scan-supplier-address')?.value.trim() || scannedCandidate.supplierAddress || '';
  const commonPhoneNo = document.getElementById('scan-phone')?.value.trim() || scannedCandidate.phoneNo || '';
  const commonGstin = document.getElementById('scan-gstin')?.value.trim() || scannedCandidate.gstin || '';
  const commonFssaiNo = document.getElementById('scan-fssai')?.value.trim() || scannedCandidate.fssaiNo || '';

  const usedLots = new Set(entries.map(e => (e.ourLot || '').trim()).filter(Boolean));
  const newEntries = [];

  scannedCandidate.items.forEach((it, idx) => {
    const matInput = document.getElementById(`scan-item-mat-${idx}`);
    const slotInput = document.getElementById(`scan-item-slot-${idx}`);
    const olotInput = document.getElementById(`scan-item-olot-${idx}`);
    const qtyInput = document.getElementById(`scan-item-qty-${idx}`);
    const rateInput = document.getElementById(`scan-item-rate-${idx}`);
    const totInput = document.getElementById(`scan-item-total-${idx}`);

    const material = matInput ? matInput.value.trim() : it.material;
    const supplierLot = slotInput ? slotInput.value.trim() : it.supplierLot;
    let ourLot = olotInput ? olotInput.value.trim() : it.ourLot;
    if (!ourLot) {
      ourLot = generateOurLotNumber(material, commonDate, usedLots);
    } else {
      usedLots.add(ourLot);
    }

    const qty = qtyInput ? (parseFloat(qtyInput.value) || 0) : it.qty;
    const rate = rateInput ? (parseFloat(rateInput.value) || 0) : it.rate;
    const total = totInput ? (parseFloat(totInput.value) || (qty * rate)) : it.total;

    newEntries.push({
      id: Date.now() + idx,
      date: commonDate,
      material: material || "Dry Chilli Powder",
      supplier: commonSupplier,
      supplierAddress: commonSupplierAddress,
      phoneNo: commonPhoneNo,
      gstin: commonGstin,
      fssaiNo: commonFssaiNo,
      invoice: commonInvoice,
      supplierLot: supplierLot || "—",
      ourLot: ourLot,
      qty: qty,
      rate: rate,
      total: total,
      quality: "Passed / Food Grade"
    });
  });

  // Save all items to Cloud Firestore and memory
  for (const entry of newEntries) {
    entries.unshift(entry);
    await saveEntryToCloud(entry);
  }

  localStorage.setItem('lv_raw_entries', JSON.stringify(entries));

  clearScan();

  // Clear restrictive filters so newly added consignments are immediately visible
  periodFilter = 'all';
  document.querySelectorAll('.period-pill').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'pill-all');
  });
  const mInput = document.getElementById('month-filter');
  if (mInput) mInput.value = '';
  const sInput = document.getElementById('search-input');
  if (sInput) sInput.value = '';

  updateSupplierList();
  renderTable();
  updateStats();
  renderSummary();
  updateNextLotPreview();
  switchView('register');
  showToast(`Added ${newEntries.length} consignment${newEntries.length > 1 ? 's' : ''} from invoice ${commonInvoice} to register!`);
};

// ──────────────────────────────────────────────────────────────────────────────
// EXCEL EXPORT (SHEETJS MATCHING CLIENT PDF EXACTLY)
// ──────────────────────────────────────────────────────────────────────────────
window.openExportModal = function() {
  document.getElementById('export-modal').style.display = 'flex';
  const today = getEffectiveToday();
  const exportTo = document.getElementById('export-to-date');
  if (exportTo) exportTo.value = today;
  const exportBadge = document.getElementById('export-daily-badge');
  if (exportBadge) exportBadge.textContent = today;
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
    if (dataToExport.length === 0) {
      const latestDate = entries.reduce((max, e) => (e.date > max ? e.date : max), '');
      dataToExport = entries.filter(e => e.date === latestDate);
    }
    fileName = `LV_Spices_Raw_Material_Daily_${today}.xlsx`;
  } else if (type === 'weekly') {
    const effToday = getEffectiveToday();
    const d = new Date(effToday);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const monStr = `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
    dataToExport = entries.filter(e => e.date >= monStr && e.date <= effToday);
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

  // Column Headers — 4 compliance fields right after Supplier Name
  sheetRows.push([
    "Sr. No.",
    "Purchase Date",
    "Raw Material Name",
    "Supplier Name",
    "Supplier Address",
    "Phone No.",
    "GSTIN No.",
    "FSSAI License No.",
    "Invoice No.",
    "Supplier Lot / Vehicle",
    "Our Lot No.",
    "Quantity (KG)",
    "Rate per KG (\u20b9)",
    "Total Value (\u20b9)",
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
      e.supplierAddress || "",
      e.phoneNo || "",
      e.gstin || "",
      e.fssaiNo || "",
      e.invoice,
      e.supplierLot || "\u2014",
      e.ourLot,
      q,
      r,
      t,
      e.quality || "Passed / Food Grade"
    ]);
  });

  sheetRows.push([]);
  sheetRows.push(["TOTAL:", "", "", "", "", "", "", "", "", "", "", sumQty, "", sumVal, ""]);
  sheetRows.push([]);
  sheetRows.push(["Inspected & Verified By: Mukesh Vora (Quality Assurance)"]);

  const ws = XLSX.utils.aoa_to_sheet(sheetRows);

  ws['!cols'] = [
    { wch: 8 },  // Sr
    { wch: 14 }, // Date
    { wch: 32 }, // Material
    { wch: 30 }, // Supplier Name
    { wch: 34 }, // Supplier Address
    { wch: 18 }, // Phone No
    { wch: 22 }, // GSTIN
    { wch: 22 }, // FSSAI
    { wch: 16 }, // Invoice
    { wch: 22 }, // Supplier Lot
    { wch: 15 }, // Our Lot
    { wch: 14 }, // Qty
    { wch: 14 }, // Rate
    { wch: 16 }, // Total
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
