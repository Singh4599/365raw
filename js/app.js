// app.js — L V Spices Raw Material Inward Register
// FSSAI Quality & Traceability with Firebase Firestore Cloud Sync & Gemini Vision AI

import { saveEntryToCloud, deleteEntryFromCloud, loadAllRawEntriesFromCloud, updateCloudBadge } from './firebase-config.js';
import { scanRawMaterialInvoice } from './ocr.js';

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
  { id: 18, date: "2026-10-18", material: "Red Chilli (Guntur Teja S17)", supplier: "Krishna River Spice Traders", invoice: "INV-KRS-901", supplierLot: "GNT-TJ-301", ourLot: "RM-OCT-018", qty: 1000, rate: 230, total: 230000, quality: "Passed / Food Grade" }
];

// ──────────────────────────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────────────────────────
let entries = [];
let editingId = null;
let deletingId = null;
let currentView = 'register';
let scannedCandidate = null;

// ──────────────────────────────────────────────────────────────────────────────
// INIT & LOAD DATA
// ──────────────────────────────────────────────────────────────────────────────
async function initData() {
  // 1. Check LocalStorage
  const local = localStorage.getItem('lv_raw_entries');
  if (local) {
    try {
      entries = JSON.parse(local);
    } catch (e) {
      entries = [];
    }
  }

  // 2. Load from Firebase Cloud
  const cloudList = await loadAllRawEntriesFromCloud();
  if (cloudList && cloudList.length > 0) {
    entries = cloudList;
    localStorage.setItem('lv_raw_entries', JSON.stringify(entries));
  }

  // 3. If empty, seed October 2026 records!
  if (entries.length === 0) {
    entries = [...OCTOBER_PRELOAD_DATA];
    localStorage.setItem('lv_raw_entries', JSON.stringify(entries));

    // Async upload to Firestore Cloud
    entries.forEach(item => {
      saveEntryToCloud(item).catch(() => {});
    });
  }

  updateSupplierList();
  renderTable();
  updateStats();
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

    return `
      <tr>
        <td style="text-align:center; font-weight:700; color:var(--text-muted);">${idx + 1}</td>
        <td style="font-size:12.5px;">${entry.date || '—'}</td>
        <td><strong>${escapeHtml(entry.material)}</strong></td>
        <td style="font-size:12.5px; color:var(--text-secondary);">${escapeHtml(entry.supplier)}</td>
        <td style="font-family:monospace; font-size:12px;">${escapeHtml(entry.invoice)}</td>
        <td style="font-size:12px; color:var(--text-muted);">${escapeHtml(entry.supplierLot || '—')}</td>
        <td><span class="badge badge-brand">${escapeHtml(entry.ourLot)}</span></td>
        <td class="num-col font-bold">${formatNum(qty)}</td>
        <td class="num-col">₹${formatNum(rate)}</td>
        <td class="num-col font-bold" style="color:#065F46;">₹${formatNum(total)}</td>
        <td style="text-align:center;"><span class="badge badge-green">${escapeHtml(entry.quality || 'Passed')}</span></td>
        <td style="text-align:center;">
          <button class="action-icon-btn" onclick="openEditModal(${entry.id})" title="Edit Inward">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-icon-btn danger" onclick="openDeleteModal(${entry.id})" title="Delete Inward">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (tfoot) {
    tfoot.innerHTML = `
      <tr class="tfoot-row">
        <td colspan="7" style="text-align:right; font-weight:800;">TOTAL CONSIGNMENTS (${data.length}):</td>
        <td class="num-col font-bold">${formatNum(totalQty)} KG</td>
        <td></td>
        <td class="num-col font-bold" style="color:#065F46;">₹${formatNum(totalVal)}</td>
        <td colspan="2"></td>
      </tr>
    `;
  }
}

function updateStats() {
  const totalEntries = entries.length;
  let totalKg = 0;
  let totalVal = 0;

  entries.forEach(e => {
    const q = parseFloat(e.qty) || 0;
    const r = parseFloat(e.rate) || 0;
    const t = parseFloat(e.total) || (q * r);
    totalKg += q;
    totalVal += t;
  });

  const octCount = entries.filter(e => (e.date || '').startsWith('2026-10')).length;

  document.getElementById('s-total-entries').textContent = totalEntries;
  document.getElementById('s-total-kg').textContent = `${formatNum(totalKg)} KG`;
  document.getElementById('s-total-val').textContent = `₹${formatNum(totalVal)}`;
  document.getElementById('s-this-month').textContent = octCount;
}

function getFilteredData() {
  const search = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const month = document.getElementById('month-filter')?.value || '';

  return entries.filter(e => {
    const matchSearch = !search ||
      (e.material || '').toLowerCase().includes(search) ||
      (e.supplier || '').toLowerCase().includes(search) ||
      (e.invoice || '').toLowerCase().includes(search) ||
      (e.ourLot || '').toLowerCase().includes(search);

    const matchMonth = !month || (e.date || '').startsWith(month);
    return matchSearch && matchMonth;
  });
}

window.applyFilters = function() {
  renderTable();
};

window.clearFilters = function() {
  if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
  if (document.getElementById('month-filter')) document.getElementById('month-filter').value = '';
  renderTable();
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
    const idx = entries.findIndex(e => e.id === editingId);
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
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  editingId = id;
  document.getElementById('f-date').value = entry.date || "";
  document.getElementById('f-material').value = entry.material || "";
  document.getElementById('f-supplier').value = entry.supplier || "";
  document.getElementById('f-invoice').value = entry.invoice || "";
  document.getElementById('f-supplierLot' || 'f-supplier-lot').value = entry.supplierLot || "";
  document.getElementById('f-our-lot').value = entry.ourLot || "";
  document.getElementById('f-qty').value = entry.qty || "";
  document.getElementById('f-rate').value = entry.rate || "";
  document.getElementById('f-total').value = entry.total || "";
  document.getElementById('f-quality').value = entry.quality || "Passed / Food Grade";

  document.getElementById('edit-note').style.display = 'flex';
  document.getElementById('submit-btn').innerHTML = `Update Entry (#${entry.id})`;
  switchView('add');
};

// ──────────────────────────────────────────────────────────────────────────────
// DELETE LOGIC
// ──────────────────────────────────────────────────────────────────────────────
window.openDeleteModal = function(id) {
  deletingId = id;
  document.getElementById('delete-backdrop').style.display = 'flex';
};

window.closeDelete = function() {
  deletingId = null;
  document.getElementById('delete-backdrop').style.display = 'none';
};

window.confirmDelete = async function() {
  if (!deletingId) return;
  entries = entries.filter(e => e.id !== deletingId);
  localStorage.setItem('lv_raw_entries', JSON.stringify(entries));
  await deleteEntryFromCloud(deletingId);

  closeDelete();
  renderTable();
  updateStats();
  updateNextLotPreview();
  showToast("Consignment deleted from cloud.");
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
  if (file.type.startsWith('image/')) {
    previewBox.style.display = 'block';
    previewImg.src = URL.createObjectURL(file);
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
    progressWrap.style.display = 'none';
    alert(err.message || "Failed to parse invoice with AI.");
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
    const today = "2026-10-18";
    dataToExport = entries.filter(e => e.date === today);
    fileName = `LV_Spices_Raw_Material_Daily_${today}.xlsx`;
  } else if (type === 'weekly') {
    dataToExport = entries.slice(0, 10);
    fileName = `LV_Spices_Raw_Material_Weekly_Summary.xlsx`;
  } else if (type === 'october') {
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
// SUMMARY VIEW
// ──────────────────────────────────────────────────────────────────────────────
function renderSummary() {
  const container = document.getElementById('summary-grid');
  if (!container) return;

  const matMap = {};
  entries.forEach(e => {
    const mat = e.material || 'Other';
    if (!matMap[mat]) matMap[mat] = { qty: 0, val: 0, count: 0 };
    const q = parseFloat(e.qty) || 0;
    const t = parseFloat(e.total) || (q * (parseFloat(e.rate) || 0));
    matMap[mat].qty += q;
    matMap[mat].val += t;
    matMap[mat].count += 1;
  });

  const cardsHtml = Object.keys(matMap).map(mat => {
    const item = matMap[mat];
    return `
      <div class="summary-card">
        <div class="sc-title">${escapeHtml(mat)}</div>
        <div class="sc-grid">
          <div>
            <div class="sc-num">${formatNum(item.qty)} KG</div>
            <div class="sc-lbl">Total Stock Inward</div>
          </div>
          <div>
            <div class="sc-num" style="color:#065F46;">₹${formatNum(item.val)}</div>
            <div class="sc-lbl">Total Spend</div>
          </div>
        </div>
        <div class="sc-sub">${item.count} Inward Consignments Received</div>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

// ──────────────────────────────────────────────────────────────────────────────
// VIEW SWITCHER
// ──────────────────────────────────────────────────────────────────────────────
window.switchView = function(view) {
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
window.addEventListener('DOMContentLoaded', () => {
  initData();
});
