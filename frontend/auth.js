// ── USERS ──
const USERS = {
  admin: { pass: 'admin123', role: 'Administrator' },
  staff: { pass: 'staff123', role: 'Staff Member' }
};

// ── LOGIN ──
function doLogin() {
  const u = document.getElementById('l-user').value.trim();
  const p = document.getElementById('l-pass').value;
  const err = document.getElementById('login-error');

  if (USERS[u] && USERS[u].pass === p) {
    sessionStorage.setItem('user', JSON.stringify({ username: u, ...USERS[u] }));
    window.location.href = 'dashboard.html';
  } else {
    err.style.display = 'block';
    document.getElementById('l-pass').value = '';
  }
}

// ── SHOW/HIDE PASSWORD ──
function togglePass() {
  const inp = document.getElementById('l-pass');
  const icon = document.getElementById('eye-icon');
  const isHidden = inp.type === 'password';
  inp.type = isHidden ? 'text' : 'password';
  icon.innerHTML = isHidden
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
}

// ── ENTER KEY ──
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

// ── REDIRECT IF ALREADY LOGGED IN ──
if (sessionStorage.getItem('user')) {
  window.location.href = 'dashboard.html';
}
