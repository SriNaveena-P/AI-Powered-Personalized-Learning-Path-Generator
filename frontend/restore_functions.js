const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');

const insertAfter = '// Language: English only';
const insertion = `// Language: English only

    // ==================== API HELPER ====================
    const H = () => ({ 'Content-Type': 'application/json', Authorization: \`Bearer \${TOKEN}\` });

    async function api(method, path, body) {
      const opts = { method, headers: H() };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(API + path, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    }

    // ==================== AUTH ====================
    // FIX #2: Accept \`tabBtn\` param instead of relying on implicit global \`event\`
    function switchTab(tab, tabBtn) {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      if (tabBtn) tabBtn.classList.add('active');
      document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
      document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    }

    function showErr(id, msg) {
      document.getElementById(id).innerHTML = \`<div class="alert alert-danger">\${msg}</div>\`;
    }

    async function doLogin() {
      const btn = document.getElementById('loginBtn');
      btn.disabled = true; btn.textContent = 'Signing in...';
      document.getElementById('loginErr').innerHTML = '';
      try {
        const data = await api('POST', '/auth/login', {
          email: document.getElementById('loginEmail').value,
          password: document.getElementById('loginPass').value
        });
        TOKEN = data.token;
        localStorage.setItem('token', TOKEN);
        currentUser = data.user;
        showApp();
      } catch (e) { showErr('loginErr', e.message); }
      finally { btn.disabled = false; btn.textContent = 'Sign In'; }
    }
`;

h = h.replace(insertAfter, insertion);
fs.writeFileSync('index.html', h, 'utf8');
console.log('Done! Restored missing functions.');
console.log('Has api():', h.includes('async function api('));
console.log('Has doLogin():', h.includes('async function doLogin('));
console.log('Has switchTab():', h.includes('function switchTab('));
console.log('Has showErr():', h.includes('function showErr('));
