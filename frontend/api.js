// ── API CONFIG ──
const API = 'https://studenthub-api-htpo.onrender.com/api/students';
const PAGE_SIZE = 5;
const COLORS = ['#6c63ff','#22d3a0','#ff5f7e','#ffb347','#60a5fa','#f472b6','#34d399','#fb923c'];
const DEPT_COLORS = ['#6c63ff','#22d3a0','#ffb347','#60a5fa','#ff5f7e','#34d399'];

// ── HELPERS ──
const getColor = n => COLORS[n.charCodeAt(0) % COLORS.length];
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// ── API CALLS ──
async function apiGetStudents() {
  const r = await fetch(API);
  if (!r.ok) throw new Error('Failed to fetch students');
  return r.json();
}

async function apiGetStats() {
  const r = await fetch(API + '/stats');
  if (!r.ok) throw new Error('Failed to fetch stats');
  return r.json();
}

async function apiCreateStudent(student) {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || 'Error creating student');
  return data;
}

async function apiUpdateStudent(id, student) {
  const r = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || 'Error updating student');
  return data;
}

async function apiDeleteStudent(id) {
  const r = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Error deleting student');
  return r.json();
}

// ── TOAST ──
function toast(msg, type = 'success') {
  const wrap = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} ${msg}`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
