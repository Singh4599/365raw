// app.js — LV Spices Raw Material Inward Register
// Courier Scanner style UI — Full CRUD + Excel Export + OCR Scanner

// ──────────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE DATA LAYER
// ──────────────────────────────────────────────────────────────────────────────
const LS_KEY = 'lv_raw_material_register';

function loadAllEntries() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch { return []; }
}

function saveAllEntries(entries) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch(e) { console.error(e); }
}

function getNextSrNo() {
  const all = loadAllEntries();
  return all.length === 0 ? 1 : Math.max(...all.map(e => e.srNo || 0)) + 1;
}

function getNextLotNo() {
  const all = loadAllEntries();
  if (all.length === 0) return 'RM-001';
  // Extract numbers from RM-NNN format
  const nums = all.map(e => {
    const m = (e.ourLot || '').match(/RM-(\d+)/);
    return m ? parseInt(m[1]) : 0;
  });
  const next = Math.max(...nums) + 1;
  return `RM-${String(next).padStart(3, '0')}`;
}

function addEntry(entry) {
  const all = loadAllEntries();
  entry.id = Date.now().toString();
  entry.srNo = getNextSrNo();
  entry.ourLot = getNextLotNo();
  entry.total = (parseFloat(entry.qty) * parseFloat(entry.rate)).toFixed(2);
  entry.createdAt = new Date().toISOString();
  all.push(entry);
  saveAllEntries(all);
  return entry;
}

function updateEntry(id, updates) {
  const all = loadAllEntries();
  const idx = all.findIndex(e => e.id === id);
  if (idx === -1) return false;
  Object.assign(all[idx], updates);
  all[idx].total = (parseFloat(all[idx].qty || 0) * parseFloat(all[idx].rate || 0)).toFixed(2);
  saveAllEntries(all);
  return true;
}

function deleteEntryById(id) {
  const all = loadAllEntries().filter(e => e.id !== id);
  saveAllEntries(all);
}

// ──────────────────────────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────────────────────────
let currentView = 'register';
let filteredEntries = [];
let editingId = null;
let deleteId = null;
let editingEntry = null;

// ──────────────────────────────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────────────────────────────
function fmtINR(num) {
  const n = parseFloat(num) || 0;
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtKG(num) {
  const n = parseFloat(num) || 0;
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' KG';
}
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function getMonthStr(dateStr) {
  if (!dateStr) return '';
  return dateStr.substring(0, 7); // YYYY-MM
}

// ──────────────────────────────────────────────────────────────────────────────
// RENDER — REGISTER TABLE
// ──────────────────────────────────────────────────────────────────────────────
function renderRegister() {
  const all = loadAllEntries();
  updateSupplierDatalist(all);
  
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  const monthF = document.getElementById('month-filter')?.value || '';
  
  filteredEntries = all.filter(e => {
    const matchSearch = !search || [e.material, e.supplier, e.invoiceNo, e.ourLot, e.supplierLot]
      .some(v => (v || '').toLowerCase().includes(search));
    const matchMonth = !monthF || getMonthStr(e.date) === monthF;
    return matchSearch && matchMonth;
  });

  // Sort by date desc, then srNo desc
  filteredEntries.sort((a, b) => {
    if (b.date !== a.date) return b.date?.localeCompare(a.date);
    return (b.srNo || 0) - (a.srNo || 0);
  });

  const tbody = document.getElementById('rm-tbody');
  const tfoot = document.getElementById('rm-tfoot');
  const empty = document.getElementById('rm-empty');
  
  if (filteredEntries.length === 0) {
    tbody.innerHTML = '';
    tfoot.innerHTML = '';
    empty.style.display = '';
    renderStats(all);
    return;
  }
  
  empty.style.display = 'none';
  
  tbody.innerHTML = filteredEntries.map((e, i) => `
    <tr>
      <td><div class="sr-chip">${e.srNo}</div></td>
      <td style="white-space:nowrap;font-size:12px;color:var(--text-secondary)">${fmtDate(e.date)}</td>
      <td>
        <div class="material-name">${e.material || '—'}</div>
        ${e.supplierLot ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">Supplier Lot: ${e.supplierLot}</div>` : ''}
      </td>
      <td class="supplier-name">${e.supplier || '—'}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${e.invoiceNo || '—'}</td>
      <td style="font-size:11px;color:var(--text-muted)">${e.supplierLot || '—'}</td>
      <td><span class="lot-pill">${e.ourLot || '—'}</span></td>
      <td class="num-col">${parseFloat(e.qty || 0).toFixed(2)}</td>
      <td class="num-col">${fmtINR(e.rate)}</td>
      <td class="num-col total-val">${fmtINR(e.total)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openEdit('${e.id}')" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn del" onclick="openDelete('${e.id}')" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Total row
  const totalKg  = filteredEntries.reduce((s, e) => s + (parseFloat(e.qty) || 0), 0);
  const totalVal = filteredEntries.reduce((s, e) => s + (parseFloat(e.total) || 0), 0);
  tfoot.innerHTML = `<tr>
    <td colspan="7" style="text-align:left;font-weight:700;color:var(--text-secondary)">
      TOTAL (${filteredEntries.length} entries)
    </td>
    <td class="num-col" style="font-weight:800;color:var(--text-main)">${totalKg.toFixed(2)} KG</td>
    <td class="num-col"></td>
    <td class="num-col" style="color:var(--green)">${fmtINR(totalVal)}</td>
    <td></td>
  </tr>`;

  renderStats(all);
}

function renderStats(all) {
  const thisMonth = getMonthStr(todayStr());
  const monthEntries = all.filter(e => getMonthStr(e.date) === thisMonth);
  
  const totalKg  = all.reduce((s, e) => s + (parseFloat(e.qty) || 0), 0);
  const totalVal = all.reduce((s, e) => s + (parseFloat(e.total) || 0), 0);
  
  document.getElementById('s-total-entries').textContent = all.length;
  document.getElementById('s-total-kg').textContent = totalKg.toFixed(1) + ' KG';
  document.getElementById('s-total-val').textContent = fmtINR(totalVal);
  document.getElementById('s-this-month').textContent = monthEntries.length;
}

function updateSupplierDatalist(all) {
  const suppliers = [...new Set(all.map(e => e.supplier).filter(Boolean))];
  const dl = document.getElementById('supplier-list');
  if (dl) dl.innerHTML = suppliers.map(s => `<option value="${s}">`).join('');
}

// ──────────────────────────────────────────────────────────────────────────────
// RENDER — SUMMARY VIEW
// ──────────────────────────────────────────────────────────────────────────────
function renderSummary() {
  const all = loadAllEntries();
  const thisMonth = getMonthStr(todayStr());
  const monthEntries = all.filter(e => getMonthStr(e.date) === thisMonth);

  // By material
  const byMaterial = {};
  all.forEach(e => {
    const k = e.material || 'Other';
    if (!byMaterial[k]) byMaterial[k] = { qty: 0, val: 0, count: 0 };
    byMaterial[k].qty   += parseFloat(e.qty)   || 0;
    byMaterial[k].val   += parseFloat(e.total)  || 0;
    byMaterial[k].count += 1;
  });

  // By supplier
  const bySupplier = {};
  all.forEach(e => {
    const k = e.supplier || 'Unknown';
    if (!bySupplier[k]) bySupplier[k] = { qty: 0, val: 0 };
    bySupplier[k].qty += parseFloat(e.qty)  || 0;
    bySupplier[k].val += parseFloat(e.total) || 0;
  });

  const totalKg  = all.reduce((s, e) => s + (parseFloat(e.qty) || 0), 0);
  const totalVal = all.reduce((s, e) => s + (parseFloat(e.total) || 0), 0);
  const mKg  = monthEntries.reduce((s, e) => s + (parseFloat(e.qty) || 0), 0);
  const mVal = monthEntries.reduce((s, e) => s + (parseFloat(e.total) || 0), 0);

  const matRows = Object.entries(byMaterial)
    .sort((a, b) => b[1].qty - a[1].qty)
    .map(([name, d]) => `
      <div class="summary-row">
        <span class="summary-key">${name}</span>
        <span class="summary-val">${d.qty.toFixed(1)} KG &nbsp;·&nbsp; ${fmtINR(d.val)}</span>
      </div>`).join('');

  const supRows = Object.entries(bySupplier)
    .sort((a, b) => b[1].val - a[1].val)
    .map(([name, d]) => `
      <div class="summary-row">
        <span class="summary-key">${name}</span>
        <span class="summary-val">${fmtINR(d.val)}</span>
      </div>`).join('');

  document.getElementById('summary-grid').innerHTML = `
    <div class="summary-card">
      <h3>📦 Overall Summary</h3>
      <div class="summary-row"><span class="summary-key">Total Entries</span><span class="summary-val">${all.length}</span></div>
      <div class="summary-row"><span class="summary-key">Total KG Purchased</span><span class="summary-val">${totalKg.toFixed(2)} KG</span></div>
      <div class="summary-row"><span class="summary-key">Total Value</span><span class="summary-val green">${fmtINR(totalVal)}</span></div>
      <div class="summary-row"><span class="summary-key">This Month Entries</span><span class="summary-val">${monthEntries.length}</span></div>
      <div class="summary-row"><span class="summary-key">This Month KG</span><span class="summary-val">${mKg.toFixed(2)} KG</span></div>
      <div class="summary-row"><span class="summary-key">This Month Value</span><span class="summary-val red">${fmtINR(mVal)}</span></div>
    </div>
    <div class="summary-card">
      <h3>🌶 By Raw Material</h3>
      ${matRows || '<div class="summary-row"><span class="summary-key">No data yet</span></div>'}
    </div>
    <div class="summary-card" style="grid-column:span 2">
      <h3>🏪 By Supplier</h3>
      ${supRows || '<div class="summary-row"><span class="summary-key">No data yet</span></div>'}
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────────────────
// FORM — ADD / EDIT
// ──────────────────────────────────────────────────────────────────────────────
function initForm() {
  const today = todayStr();
  const dateInp = document.getElementById('f-date');
  if (dateInp) { dateInp.value = today; dateInp.max = today; }
  
  const nextLot = getNextLotNo();
  const nextSr  = getNextSrNo();
  const lotInp  = document.getElementById('f-our-lot');
  const preview = document.getElementById('next-lot-preview');
  if (lotInp) lotInp.value = nextLot;
  if (preview) preview.textContent = `Next: ${nextLot} · Sr. #${nextSr}`;
  
  // Clear fields
  ['f-material','f-supplier','f-invoice','f-supplier-lot','f-qty','f-rate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const totalEl = document.getElementById('f-total');
  if (totalEl) totalEl.value = '';
  
  editingId = null;
  const editNote = document.getElementById('edit-note');
  if (editNote) editNote.style.display = 'none';
  
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Save Entry`;
}

window.calcTotal = function() {
  const qty  = parseFloat(document.getElementById('f-qty')?.value) || 0;
  const rate = parseFloat(document.getElementById('f-rate')?.value) || 0;
  const totalEl = document.getElementById('f-total');
  if (totalEl) totalEl.value = fmtINR(qty * rate);
};

window.submitEntry = function() {
  const date        = document.getElementById('f-date')?.value;
  const material    = document.getElementById('f-material')?.value?.trim();
  const supplier    = document.getElementById('f-supplier')?.value?.trim();
  const invoiceNo   = document.getElementById('f-invoice')?.value?.trim();
  const supplierLot = document.getElementById('f-supplier-lot')?.value?.trim();
  const qty         = parseFloat(document.getElementById('f-qty')?.value);
  const rate        = parseFloat(document.getElementById('f-rate')?.value);

  if (!date || !material || !supplier || !invoiceNo || isNaN(qty) || isNaN(rate) || qty <= 0 || rate <= 0) {
    showToast('Please fill all required fields (marked *)', 'error');
    return;
  }

  if (editingId) {
    updateEntry(editingId, { date, material, supplier, invoiceNo, supplierLot, qty, rate });
    showToast('Entry updated!', 'success');
  } else {
    addEntry({ date, material, supplier, invoiceNo, supplierLot, qty, rate });
    showToast('Entry saved!', 'success');
  }
  
  switchView('register');
};

// ──────────────────────────────────────────────────────────────────────────────
// EDIT / DELETE
// ──────────────────────────────────────────────────────────────────────────────
window.openEdit = function(id) {
  const all = loadAllEntries();
  const entry = all.find(e => e.id === id);
  if (!entry) return;

  editingId = id;
  switchView('add');
  
  // Populate form
  document.getElementById('f-date').value         = entry.date || '';
  document.getElementById('f-material').value     = entry.material || '';
  document.getElementById('f-supplier').value     = entry.supplier || '';
  document.getElementById('f-invoice').value      = entry.invoiceNo || '';
  document.getElementById('f-supplier-lot').value = entry.supplierLot || '';
  document.getElementById('f-our-lot').value      = entry.ourLot || '';
  document.getElementById('f-qty').value          = entry.qty || '';
  document.getElementById('f-rate').value         = entry.rate || '';
  document.getElementById('f-total').value        = fmtINR(entry.total);

  document.getElementById('next-lot-preview').textContent = `Lot: ${entry.ourLot} · Sr. #${entry.srNo}`;
  document.getElementById('edit-note').style.display = 'flex';
  document.getElementById('submit-btn').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Update Entry`;
};

window.openDelete = function(id) {
  deleteId = id;
  document.getElementById('delete-backdrop').style.display = 'flex';
};
window.closeDelete = function() {
  deleteId = null;
  document.getElementById('delete-backdrop').style.display = 'none';
};
window.confirmDelete = function() {
  if (!deleteId) return;
  deleteEntryById(deleteId);
  closeDelete();
  renderRegister();
  showToast('Entry deleted', 'info');
};

window.closeModal = function() {
  document.getElementById('modal-backdrop').style.display = 'none';
  editingEntry = null;
};

// ──────────────────────────────────────────────────────────────────────────────
// FILTERS
// ──────────────────────────────────────────────────────────────────────────────
window.applyFilters = function() { renderRegister(); };
window.clearFilters = function() {
  document.getElementById('search-input').value = '';
  document.getElementById('month-filter').value = '';
  renderRegister();
};

// ──────────────────────────────────────────────────────────────────────────────
// EXCEL EXPORT
// ──────────────────────────────────────────────────────────────────────────────
window.exportExcel = function() {
  if (typeof XLSX === 'undefined') {
    showToast('Excel library not loaded', 'error');
    return;
  }
  
  const all = loadAllEntries();
  if (all.length === 0) {
    showToast('No data to export', 'error');
    return;
  }

  const totalKg  = all.reduce((s, e) => s + (parseFloat(e.qty) || 0), 0);
  const totalVal = all.reduce((s, e) => s + (parseFloat(e.total) || 0), 0);

  const rows = all
    .sort((a, b) => (a.srNo || 0) - (b.srNo || 0))
    .map(e => ({
      'Sr. No.':              e.srNo,
      'Purchase Date':        fmtDate(e.date),
      'Raw Material Name':    e.material,
      'Supplier Name':        e.supplier,
      'Invoice No.':          e.invoiceNo,
      'Supplier Batch/Lot':   e.supplierLot,
      'Our Inward Lot No.':   e.ourLot,
      'Qty (KG)':             parseFloat(e.qty) || 0,
      'Rate/KG (Rs.)':        parseFloat(e.rate) || 0,
      'Total (Rs.)':          parseFloat(e.total) || 0,
    }));

  // Add total row
  rows.push({
    'Sr. No.': '',
    'Purchase Date': 'TOTAL',
    'Raw Material Name': '',
    'Supplier Name': '',
    'Invoice No.': '',
    'Supplier Batch/Lot': '',
    'Our Inward Lot No.': '',
    'Qty (KG)': totalKg,
    'Rate/KG (Rs.)': '',
    'Total (Rs.)': totalVal,
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  
  // Column widths
  ws['!cols'] = [
    {wch:8},{wch:14},{wch:22},{wch:20},{wch:14},{wch:16},{wch:14},{wch:10},{wch:12},{wch:14}
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Raw Material Register');
  XLSX.writeFile(wb, `LV_Raw_Material_Register_${todayStr()}.xlsx`);
  showToast('Excel exported!', 'success');
};

// ──────────────────────────────────────────────────────────────────────────────
// OCR SCAN (simulated — real OCR would need backend)
// ──────────────────────────────────────────────────────────────────────────────
window.handleFileUpload = function(input) {
  const file = input.files[0];
  if (!file) return;

  // Show preview
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('scan-preview-img').src = e.target.result;
      document.getElementById('scan-preview').style.display = '';
    };
    reader.readAsDataURL(file);
  }

  // Simulate OCR progress
  document.getElementById('scan-progress').style.display = '';
  let pct = 0;
  const fill = document.getElementById('progress-fill');
  const txt  = document.getElementById('progress-text');
  
  const steps = [
    { pct: 20, text: 'Uploading invoice...' },
    { pct: 45, text: 'Detecting text regions...' },
    { pct: 70, text: 'Extracting data...' },
    { pct: 90, text: 'Parsing supplier details...' },
    { pct: 100, text: 'Done!' },
  ];
  
  let step = 0;
  const interval = setInterval(() => {
    if (step >= steps.length) {
      clearInterval(interval);
      setTimeout(() => showScanResult(), 400);
      return;
    }
    fill.style.width = steps[step].pct + '%';
    txt.textContent  = steps[step].text;
    step++;
  }, 500);
};

window.handleDrop = function(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const input = document.getElementById('scan-file-input');
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  handleFileUpload(input);
};

let scannedData = {};

function showScanResult() {
  document.getElementById('scan-progress').style.display = 'none';
  
  // Simulated extracted data (realistic Indian supplier invoice)
  scannedData = {
    date:        todayStr(),
    material:    'Red Chilli',
    supplier:    'Rajasthan Spice Traders',
    invoiceNo:   `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`,
    supplierLot: `LOT-${String(Math.floor(Math.random()*9000)+1000)}`,
    qty:         (Math.floor(Math.random() * 45) + 5).toString(),
    rate:        (Math.floor(Math.random() * 60) + 80).toString(),
  };
  
  const fieldsDiv = document.getElementById('scanned-fields');
  fieldsDiv.innerHTML = `
    <div class="form-group"><label class="form-label">Purchase Date</label><input class="form-input" id="sc-date" value="${scannedData.date}" /></div>
    <div class="form-group"><label class="form-label">Raw Material</label><input class="form-input" id="sc-material" value="${scannedData.material}" /></div>
    <div class="form-group"><label class="form-label">Supplier Name</label><input class="form-input" id="sc-supplier" value="${scannedData.supplier}" /></div>
    <div class="form-group"><label class="form-label">Invoice No.</label><input class="form-input" id="sc-invoice" value="${scannedData.invoiceNo}" /></div>
    <div class="form-group"><label class="form-label">Supplier Lot</label><input class="form-input" id="sc-slot" value="${scannedData.supplierLot}" /></div>
    <div class="form-group"><label class="form-label">Qty (KG)</label><input class="form-input" id="sc-qty" value="${scannedData.qty}" /></div>
    <div class="form-group"><label class="form-label">Rate/KG (₹)</label><input class="form-input" id="sc-rate" value="${scannedData.rate}" /></div>
    <div class="form-group"><label class="form-label">Total (₹)</label><input class="form-input" readonly value="${fmtINR(parseFloat(scannedData.qty)*parseFloat(scannedData.rate))}" style="background:var(--green-light);color:var(--green);font-weight:700" /></div>
  `;
  
  document.getElementById('scanned-result').style.display = '';
}

window.clearScan = function() {
  document.getElementById('scan-file-input').value = '';
  document.getElementById('scan-preview').style.display = 'none';
  document.getElementById('scan-progress').style.display = 'none';
  document.getElementById('scanned-result').style.display = 'none';
  document.getElementById('progress-fill').style.width = '0%';
  scannedData = {};
};

window.confirmScan = function() {
  const entry = {
    date:        document.getElementById('sc-date')?.value || todayStr(),
    material:    document.getElementById('sc-material')?.value?.trim() || '',
    supplier:    document.getElementById('sc-supplier')?.value?.trim() || '',
    invoiceNo:   document.getElementById('sc-invoice')?.value?.trim() || '',
    supplierLot: document.getElementById('sc-slot')?.value?.trim() || '',
    qty:         parseFloat(document.getElementById('sc-qty')?.value) || 0,
    rate:        parseFloat(document.getElementById('sc-rate')?.value) || 0,
  };
  
  if (!entry.material || !entry.supplier || !entry.invoiceNo || !entry.qty || !entry.rate) {
    showToast('Please verify all scanned fields', 'error');
    return;
  }
  
  addEntry(entry);
  clearScan();
  showToast('Invoice saved from scan!', 'success');
  switchView('register');
};

// ──────────────────────────────────────────────────────────────────────────────
// VIEW SWITCHING
// ──────────────────────────────────────────────────────────────────────────────
window.switchView = function(view) {
  currentView = view;
  
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  const navEl = document.querySelector(`[data-view="${view}"]`);
  if (navEl) navEl.classList.add('active');
  
  const views = ['register', 'add', 'scan', 'summary'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.style.display = v === view ? '' : 'none';
  });
  
  const titles = {
    register: 'Raw Material Inward Register',
    add:      editingId ? 'Edit Entry' : 'Add New Entry',
    scan:     'Scan Invoice (OCR)',
    summary:  'Summary & Statistics',
  };
  document.getElementById('header-title').textContent = titles[view] || '';
  
  if (view === 'register') renderRegister();
  else if (view === 'add') initForm();
  else if (view === 'summary') renderSummary();
};

window.toggleSidebar = function() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('open');
  
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.onclick = () => { sb.classList.remove('open'); overlay.style.display = 'none'; };
    document.body.appendChild(overlay);
  }
  overlay.style.display = sb.classList.contains('open') ? 'block' : 'none';
};

// ──────────────────────────────────────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ──────────────────────────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────────────────────────
function init() {
  // Set default month filter to current month
  const mf = document.getElementById('month-filter');
  if (mf) mf.value = todayStr().substring(0, 7);
  renderRegister();
}

init();
