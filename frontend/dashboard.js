// ── STATE ──
let allStudents = [], filtered = [], selected = new Set();
let currentFilter = 'All', currentDept = '', searchQuery = '';
let sortField = '', sortDir = 1, currentPage = 1;
let editingId = null, deleteId = null, profileId = null;
let isDark = true, realtimeInterval = null, lastCount = -1;

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  const user = sessionStorage.getItem('user');
  if (!user) { window.location.href = 'index.html'; return; }

  const u = JSON.parse(user);
  document.getElementById('user-av').textContent = u.username[0].toUpperCase();
  document.getElementById('user-name').textContent = u.username.charAt(0).toUpperCase() + u.username.slice(1);
  document.getElementById('user-role').textContent = u.role;

  fetchStudents();

  // Real-time polling every 3 seconds
  realtimeInterval = setInterval(async () => {
    try {
      const fresh = await apiGetStudents();
      if (fresh.length !== lastCount) {
        const added = fresh.length > lastCount && lastCount !== -1;
        const removed = fresh.length < lastCount && lastCount !== -1;
        allStudents = fresh; lastCount = fresh.length;
        document.getElementById('nav-count').textContent = fresh.length;
        applyFilters(); loadStats(); updateChart(fresh);
        if (added) toast('New student added — table updated', 'info');
        if (removed) toast('Student removed — table updated', 'info');
      } else { allStudents = fresh; lastCount = fresh.length; }
    } catch {}
  }, 3000);
});

// ── LOGOUT ──
function doLogout() {
  sessionStorage.removeItem('user');
  if (realtimeInterval) clearInterval(realtimeInterval);
  window.location.href = 'index.html';
}

// ── THEME ──
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-label').textContent = isDark ? 'Light mode' : 'Dark mode';
  document.getElementById('ttrack').classList.toggle('on', !isDark);
  if (allStudents.length) updateChart(allStudents);
}

// ── FETCH ──
async function fetchStudents() {
  try {
    allStudents = await apiGetStudents();
    lastCount = allStudents.length;
    document.getElementById('nav-count').textContent = allStudents.length;
    applyFilters(); loadStats(); updateChart(allStudents);
  } catch {
    document.getElementById('students-table').innerHTML =
      `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⚠️</div><p>Cannot connect to backend</p></div></td></tr>`;
    setStats('—', '—', '—', '—');
  }
}

async function loadStats() {
  try {
    const s = await apiGetStats();
    setStats(s.total, s.active, s.inactive, s.graduated);
  } catch {
    setStats(
      allStudents.length,
      allStudents.filter(s => s.status === 'Active').length,
      allStudents.filter(s => s.status === 'Inactive').length,
      allStudents.filter(s => s.status === 'Graduated').length
    );
  }
}

function setStats(t, a, i, g) {
  document.getElementById('st-total').textContent = t;
  document.getElementById('st-active').textContent = a;
  document.getElementById('st-inactive').textContent = i;
  document.getElementById('st-graduated').textContent = g;
}

// ── FILTER + SORT ──
function applyFilters() {
  let list = [...allStudents];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q));
  }
  if (currentDept) list = list.filter(s => s.department === currentDept);
  if (currentFilter !== 'All') list = list.filter(s => s.status === currentFilter);
  if (sortField) {
    list.sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      return typeof va === 'string' ? va.localeCompare(vb) * sortDir : (va - vb) * sortDir;
    });
  }
  filtered = list;
  currentPage = 1;
  renderTable();
}

function sortBy(field) {
  if (sortField === field) sortDir *= -1; else { sortField = field; sortDir = 1; }
  document.querySelectorAll('.sort-icon').forEach(e => e.textContent = '↕');
  const el = document.getElementById('sort-' + field);
  if (el) el.textContent = sortDir === 1 ? '↑' : '↓';
  document.querySelectorAll('th').forEach(t => t.classList.remove('sorted'));
  event.currentTarget.classList.add('sorted');
  applyFilters();
}

function handleSearch(q) { searchQuery = q; applyFilters(); }
function handleDeptDrop(v) { currentDept = v; document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); applyFilters(); }
function setDeptFilter(d, el) { currentDept = d; document.getElementById('dept-filter').value = d; document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); if (el) el.classList.add('active'); applyFilters(); }
function setFilter(f, el) { currentFilter = f; document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active')); el.classList.add('active'); applyFilters(); }

// ── RENDER + PAGINATION ──
function renderTable() {
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE, end = Math.min(start + PAGE_SIZE, total);
  const page = filtered.slice(start, end);
  const tb = document.getElementById('students-table');

  if (!page.length) {
    tb.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🔍</div><p>No students found</p></div></td></tr>`;
    document.getElementById('pagination').style.display = 'none';
    return;
  }

  tb.innerHTML = page.map(s => `
    <tr class="${selected.has(s.id) ? 'selected' : ''}">
      <td><input type="checkbox" class="chk" ${selected.has(s.id) ? 'checked' : ''} onchange="toggleSelect(${s.id},this.checked)" onclick="event.stopPropagation()"/></td>
      <td onclick="showProfile(${s.id})"><div class="cell-name"><div class="avatar" style="background:${getColor(s.name)}">${initials(s.name)}</div><div><div class="cntext">${s.name}</div><div class="cnsub">${s.email}</div></div></div></td>
      <td onclick="showProfile(${s.id})">${s.department}</td>
      <td onclick="showProfile(${s.id})">${s.age}</td>
      <td onclick="showProfile(${s.id})">${s.enrollmentYear}</td>
      <td onclick="showProfile(${s.id})"><span class="badge badge-${s.status.toLowerCase()}">${s.status}</span></td>
      <td><div class="row-actions">
        <button class="iBtn view" title="Profile" onclick="showProfile(${s.id})"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="iBtn idc" title="ID Card" onclick="showIdCard(${s.id})"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10h2M16 14h2"/></svg></button>
        <button class="iBtn edit" title="Edit" onclick="openModal(${s.id})"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="iBtn del" title="Delete" onclick="askDelete(${s.id},'${s.name}')"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></button>
      </div></td>
    </tr>`).join('');

  const pg = document.getElementById('pagination');
  pg.style.display = 'flex';
  document.getElementById('page-info').textContent = `Showing ${start + 1}–${end} of ${total}`;
  const btns = document.getElementById('page-btns');
  let html = `<button class="pg-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages <= 7 || i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1)
      html += `<button class="pg-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    else if (Math.abs(i - currentPage) === 2) html += `<span style="padding:0 4px;color:var(--muted)">…</span>`;
  }
  html += `<button class="pg-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
  btns.innerHTML = html;
}

function goPage(p) {
  const total = Math.ceil(filtered.length / PAGE_SIZE);
  if (p < 1 || p > total) return;
  currentPage = p; renderTable();
}

// ── SELECTION ──
function toggleSelect(id, checked) { checked ? selected.add(id) : selected.delete(id); updateBulkBar(); renderTable(); }
function toggleSelectAll(checked) {
  const page = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  page.forEach(s => checked ? selected.add(s.id) : selected.delete(s.id));
  updateBulkBar(); renderTable();
}
function clearSelection() { selected.clear(); updateBulkBar(); renderTable(); }
function updateBulkBar() {
  document.getElementById('bulk-bar').classList.toggle('show', selected.size > 0);
  document.getElementById('bulk-count').textContent = selected.size;
}
function bulkDelete() {
  if (!selected.size) return;
  document.getElementById('bulk-confirm-text').textContent = `Delete ${selected.size} selected student${selected.size > 1 ? 's' : ''}? This cannot be undone.`;
  document.getElementById('bulk-modal').style.display = 'flex';
}
async function confirmBulkDelete() {
  document.getElementById('bulk-modal').style.display = 'none';
  let count = 0;
  for (const id of selected) {
    try { await apiDeleteStudent(id); count++; } catch {}
  }
  selected.clear(); updateBulkBar();
  await fetchStudents();
  toast(`${count} student${count > 1 ? 's' : ''} deleted`, 'info');
}

// ── PROFILE ──
function showProfile(id) {
  const s = allStudents.find(x => x.id === id); if (!s) return;
  profileId = id;
  document.getElementById('pf-avatar').style.background = getColor(s.name);
  document.getElementById('pf-avatar').textContent = initials(s.name);
  document.getElementById('pf-name').textContent = s.name;
  document.getElementById('pf-dept').textContent = s.department;
  document.getElementById('pf-email').textContent = s.email;
  document.getElementById('pf-phone').textContent = s.phone;
  document.getElementById('pf-age').textContent = s.age + ' years';
  document.getElementById('pf-year').textContent = s.enrollmentYear;
  document.getElementById('pf-status').textContent = s.status;
  document.getElementById('pf-id').textContent = 'SH-' + String(s.id).padStart(4, '0');
  document.getElementById('pf-dept2').textContent = s.department;
  document.getElementById('profile-modal').style.display = 'flex';
}
function closeProfile() { document.getElementById('profile-modal').style.display = 'none'; }
function editFromProfile() { closeProfile(); openModal(profileId); }
function showIdFromProfile() { closeProfile(); showIdCard(profileId); }

// ── ID CARD ──
function showIdCard(id) {
  const s = allStudents.find(x => x.id === id); if (!s) return;
  document.getElementById('ic-avatar').style.background = getColor(s.name);
  document.getElementById('ic-avatar').textContent = initials(s.name);
  document.getElementById('ic-name').textContent = s.name;
  document.getElementById('ic-dept').textContent = s.department;
  document.getElementById('ic-email').textContent = s.email;
  document.getElementById('ic-phone').textContent = s.phone;
  document.getElementById('ic-age').textContent = s.age + ' yrs';
  document.getElementById('ic-year').textContent = s.enrollmentYear;
  document.getElementById('ic-status').textContent = s.status;
  document.getElementById('ic-id').textContent = 'SH-' + String(s.id).padStart(4, '0');
  document.getElementById('ic-barcode').innerHTML = Array.from({ length: 16 }, () =>
    `<span style="height:${8 + Math.random() * 14}px;opacity:${0.3 + Math.random() * 0.5}"></span>`).join('');
  document.getElementById('id-modal').style.display = 'flex';
}
function closeIdModal() { document.getElementById('id-modal').style.display = 'none'; }
function printIdCard() {
  const card = document.getElementById('id-card-content').outerHTML;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><style>body{margin:0;background:#0a0a0f;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif}.id-card{background:linear-gradient(135deg,#1a1040,#0d0d1a);border-radius:14px;padding:24px;color:#fff;max-width:340px;width:100%;position:relative;overflow:hidden}.id-card::before{content:'';position:absolute;top:-40px;right:-40px;width:150px;height:150px;background:rgba(108,99,255,.15);border-radius:50%}.icc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.icc-logo{font-weight:800;font-size:13px;color:#9d97ff}.icc-tag{font-size:10px;background:rgba(108,99,255,.3);padding:3px 8px;border-radius:20px;color:#c4c0ff}.icc-avatar{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px;color:#fff;margin:0 auto 12px;border:3px solid rgba(255,255,255,.2)}.icc-name{font-weight:700;font-size:18px;text-align:center;margin-bottom:3px}.icc-dept{font-size:12px;color:#9d97ff;text-align:center;margin-bottom:16px}.icc-details{display:grid;grid-template-columns:1fr 1fr;gap:10px}.icc-field{background:rgba(255,255,255,.06);border-radius:7px;padding:9px 11px}.icc-field-label{font-size:9px;color:#8884a8;text-transform:uppercase;margin-bottom:2px}.icc-field-value{font-size:12px;font-weight:500;color:#f0eff8}.icc-footer{margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:space-between}.icc-id{font-family:monospace;font-size:11px;color:#5c5a75}.icc-barcode{display:flex;gap:2px;align-items:flex-end}.icc-barcode span{width:3px;background:rgba(255,255,255,.3);border-radius:1px;display:inline-block}</style></head><body>${card}<script>window.onload=()=>window.print()<\/script></body></html>`);
}

// ── ADD/EDIT MODAL ──
function openModal(id) {
  editingId = id || null;
  if (id) {
    const s = allStudents.find(x => x.id === id); if (!s) return;
    document.getElementById('modal-title').textContent = 'Edit Student';
    document.getElementById('modal-btn').innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> Update`;
    document.getElementById('f-name').value = s.name;
    document.getElementById('f-email').value = s.email;
    document.getElementById('f-phone').value = s.phone;
    document.getElementById('f-dept').value = s.department;
    document.getElementById('f-age').value = s.age;
    document.getElementById('f-year').value = s.enrollmentYear;
    document.getElementById('f-status').value = s.status;
  } else {
    document.getElementById('modal-title').textContent = 'Add New Student';
    document.getElementById('modal-btn').innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> Save Student`;
    ['f-name', 'f-email', 'f-phone', 'f-age', 'f-year'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-dept').value = '';
    document.getElementById('f-status').value = 'Active';
  }
  document.getElementById('modal').style.display = 'flex';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }

async function submitForm() {
  const student = {
    name: document.getElementById('f-name').value.trim(),
    email: document.getElementById('f-email').value.trim(),
    phone: document.getElementById('f-phone').value.trim(),
    department: document.getElementById('f-dept').value,
    age: parseInt(document.getElementById('f-age').value),
    enrollmentYear: parseInt(document.getElementById('f-year').value),
    status: document.getElementById('f-status').value
  };
  if (!student.name || !student.email || !student.department || !student.phone || !student.age || !student.enrollmentYear) {
    toast('Please fill all fields', 'error'); return;
  }
  try {
    if (editingId) {
      await apiUpdateStudent(editingId, student);
      toast(`${student.name} updated`, 'success');
    } else {
      await apiCreateStudent(student);
      toast(`${student.name} added`, 'success');
    }
    closeModal(); await fetchStudents();
  } catch (e) { toast(e.message || 'Error', 'error'); }
}

// ── DELETE ──
function askDelete(id, name) {
  deleteId = id;
  document.getElementById('del-text').textContent = `Delete "${name}"? This cannot be undone.`;
  document.getElementById('del-modal').style.display = 'flex';
}
function closeDelModal() { document.getElementById('del-modal').style.display = 'none'; deleteId = null; }
async function confirmDelete() {
  if (!deleteId) return;
  try {
    await apiDeleteStudent(deleteId);
    closeDelModal(); await fetchStudents(); toast('Deleted', 'info');
  } catch { toast('Error deleting', 'error'); }
}
