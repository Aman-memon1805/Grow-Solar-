/* ══════════════════════════════════════════════════════════
   SOLARVOLT — app.js
   Single-page app: routing, API, auth, admin panel
══════════════════════════════════════════════════════════ */

const API = '/api';

/* ══════════════════════════════════════
   UTILITY HELPERS
══════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function toast(msg, type = 'success') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3500);
}

function getToken()        { return localStorage.getItem('sv_token'); }
function getUser()         { const u = localStorage.getItem('sv_user'); return u ? JSON.parse(u) : null; }
function setAuth(data)     { localStorage.setItem('sv_token', data.token); localStorage.setItem('sv_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role })); }
function clearAuth()       { localStorage.removeItem('sv_token'); localStorage.removeItem('sv_user'); }
function isLoggedIn()      { return !!getToken(); }
function isAdmin()         { const u = getUser(); return u && u.role === 'admin'; }
function fmtPrice(n)       { return '₹' + Number(n).toLocaleString('en-IN'); }
function fmtDate(d)        { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const res = await fetch(API + url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

/* ══════════════════════════════════════
   SINGLE-PAGE ROUTER
══════════════════════════════════════ */
const routes = {
  home:     renderHome,
  products: renderProducts,
  contact:  renderContact,
  admin:    renderAdmin,
  profile:  renderProfile,
};

let currentPage = null;

function navigate(page) {
  // Guard admin/profile routes
  if (page === 'admin' && !isAdmin())   { navigate('home'); return; }
  if (page === 'profile' && !isLoggedIn()) { openModal('login'); return; }

  $$('.page').forEach(p => p.classList.remove('active'));
  const el = $(`#page-${page}`);
  if (el) el.classList.add('active');

  currentPage = page;
  updateNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  routes[page]?.();
}

function updateNav() {
  const user = getUser();
  const menu = $('#nav-user-menu');
  const mobileMenu = $('#nav-user-menu-mobile');

  let desktopHTML, mobileHTML;

  if (user) {
    desktopHTML = `
      <a class="nav-links-item" onclick="toggleDropdown()">👤 ${user.name.split(' ')[0]} ▾</a>
      <div class="user-dropdown" id="user-dd">
        ${user.role === 'admin' ? `<a onclick="navigate('admin'); closeDropdown()">⚙ Admin Panel</a>` : ''}
        <a onclick="navigate('profile'); closeDropdown()">My Profile</a>
        <a onclick="logout()">Logout</a>
      </div>`;
    mobileHTML = `
      ${user.role === 'admin' ? `<a onclick="navigate('admin')">⚙ Admin Panel</a>` : ''}
      <a onclick="navigate('profile')">My Profile</a>
      <a onclick="logout()">Logout</a>`;
  } else {
    desktopHTML = `<a class="nav-links-item" onclick="openModal('login')" style="font-family:'Syne',sans-serif;font-size:0.82rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text);cursor:pointer;">Login</a>`;
    mobileHTML = `<a onclick="openModal('login')">Login</a>`;
  }

  if (menu) menu.innerHTML = desktopHTML;
  if (mobileMenu) mobileMenu.innerHTML = mobileHTML;
}

function toggleDropdown() { $('#user-dd')?.classList.toggle('open'); }
function closeDropdown()  { $('#user-dd')?.classList.remove('open'); }
document.addEventListener('click', (e) => {
  if (!e.target.closest('#nav-user-menu')) closeDropdown();
});

/* ══════════════════════════════════════
   AUTH MODAL
══════════════════════════════════════ */
function openModal(mode = 'login') {
  const overlay = $('#auth-modal');
  overlay.classList.add('open');
  renderAuthForm(mode);
}
function closeModal() { $('#auth-modal').classList.remove('open'); }

function renderAuthForm(mode) {
  const box = $('#modal-box');
  if (mode === 'login') {
    box.innerHTML = `
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h2>Welcome Back</h2>
      <p>Log in to your SolarVolt account</p>
      <div class="form-group"><label>Email</label><input id="m-email" type="email" placeholder="you@example.com"/></div>
      <div class="form-group"><label>Password</label><input id="m-pass" type="password" placeholder="••••••••"/></div>
      <button class="btn-primary btn-block" style="margin-top:0.5rem" onclick="handleLogin()">Login</button>
      <p class="modal-switch">No account? <a onclick="renderAuthForm('register')">Register here</a></p>`;
  } else {
    box.innerHTML = `
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h2>Create Account</h2>
      <p>Join Grow Energy Solar to track your quotes</p>
      <div class="form-group"><label>Full Name</label><input id="m-name" type="text" placeholder="Rahul Sharma"/></div>
      <div class="form-group"><label>Email</label><input id="m-email" type="email" placeholder="you@example.com"/></div>
      <div class="form-group"><label>Phone</label><input id="m-phone" type="tel" placeholder="+91 98765 43210"/></div>
      <div class="form-group"><label>Password</label><input id="m-pass" type="password" placeholder="Min 6 characters"/></div>
      <button class="btn-primary btn-block" style="margin-top:0.5rem" onclick="handleRegister()">Create Account</button>
      <p class="modal-switch">Already have an account? <a onclick="renderAuthForm('login')">Login</a></p>`;
  }
}

async function handleLogin() {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: $('#m-email').value.trim(), password: $('#m-pass').value }),
    });
    setAuth(data);
    closeModal();
    toast(`Welcome back, ${data.name}! ☀️`);
    updateNav();
    if (data.role === 'admin') navigate('admin');
  } catch (err) { toast(err.message, 'error'); }
}

async function handleRegister() {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: $('#m-name').value.trim(),
        email: $('#m-email').value.trim(),
        phone: $('#m-phone').value.trim(),
        password: $('#m-pass').value,
      }),
    });
    setAuth(data);
    closeModal();
    toast('Account created! Welcome to SolarVolt ☀️');
    updateNav();
  } catch (err) { toast(err.message, 'error'); }
}

function logout() {
  clearAuth();
  updateNav();
  navigate('home');
  toast('Logged out successfully');
}

/* ══════════════════════════════════════
   HOME PAGE
══════════════════════════════════════ */
function renderHome() {
  // Scroll reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  $$('.reveal').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   PRODUCTS PAGE
══════════════════════════════════════ */
let allProducts = [];
let activeFilter = 'All';

async function renderProducts() {
  const grid = $('#products-grid');
  grid.innerHTML = '<div class="spinner"></div>';
  try {
    allProducts = await apiFetch('/products');
    renderProductGrid();
  } catch {
    grid.innerHTML = '<div class="empty-state"><div class="es-icon">⚠️</div><h3>Could not load products</h3></div>';
  }
}

function renderProductGrid() {
  const grid = $('#products-grid');
  const filtered = activeFilter === 'All'
    ? allProducts
    : allProducts.filter(p => p.category === activeFilter);

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state"><div class="es-icon">🔍</div><h3>No products in this category</h3></div>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card ${p.featured ? 'featured' : ''} ${!p.inStock ? 'out-of-stock' : ''}">
      ${p.featured ? '<div class="product-badge">Most Popular</div>' : ''}
      <div class="product-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}"/>` : categoryEmoji(p.category)}
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-specs">
          ${p.wattage ? `<span class="spec">${(p.wattage/1000).toFixed(0)}kW</span>` : ''}
          ${p.type    ? `<span class="spec">${p.type}</span>` : ''}
          ${p.panels  ? `<span class="spec">${p.panels} Panels</span>` : ''}
        </div>
        <span class="stock-badge ${p.inStock ? 'in' : 'out'}">${p.inStock ? '✓ In Stock' : '✗ Out of Stock'}</span>
        <div class="product-price">${fmtPrice(p.price)} <span>onwards</span></div>
        <button class="btn-primary btn-block" onclick="navigate('contact')">Get Quote</button>
      </div>
    </div>`).join('');
}

function filterProducts(cat) {
  activeFilter = cat;
  $$('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  renderProductGrid();
}

function categoryEmoji(cat) {
  return { Residential: '🏡', Commercial: '🏢', Industrial: '🏭', Accessories: '🔧' }[cat] || '☀️';
}

/* ══════════════════════════════════════
   CONTACT PAGE
══════════════════════════════════════ */
function renderContact() {}

async function submitQuote() {
  const btn = $('#quote-btn');
  btn.disabled = true; btn.textContent = 'Sending...';
  try {
    const user = getUser();
    await apiFetch('/quotes', {
      method: 'POST',
      body: JSON.stringify({
        name:         ($('#q-fname').value + ' ' + $('#q-lname').value).trim(),
        email:        $('#q-email').value.trim(),
        phone:        $('#q-phone').value.trim(),
        propertyType: $('#q-property').value,
        billRange:    $('#q-bill').value,
        message:      $('#q-message').value.trim(),
        userId:       user?._id,
      }),
    });
    toast('Quote submitted! We\'ll contact you within 24 hours ☀️');
    ['q-fname','q-lname','q-email','q-phone','q-property','q-bill','q-message'].forEach(id => {
      const el = $(`#${id}`); if (el) el.value = '';
    });
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = '☀ Get My Free Quote';
  }
}

/* ══════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════ */
async function renderProfile() {
  if (!isLoggedIn()) { navigate('home'); return; }
  const container = $('#profile-content');
  container.innerHTML = '<div class="spinner"></div>';
  try {
    const [user, quotes] = await Promise.all([
      apiFetch('/auth/profile'),
      apiFetch('/quotes/my'),
    ]);

    container.innerHTML = `
      <div class="profile-card">
        <h3>Account Details</h3>
        <div class="form-group"><label>Full Name</label><input id="p-name" value="${user.name}"/></div>
        <div class="form-group"><label>Email</label><input value="${user.email}" disabled style="opacity:0.5"/></div>
        <div class="form-group"><label>Phone</label><input id="p-phone" value="${user.phone || ''}"/></div>
        <div class="form-group"><label>New Password <span style="color:var(--muted);font-size:0.8em">(leave blank to keep)</span></label><input id="p-pass" type="password" placeholder="••••••"/></div>
        <button class="btn-primary" onclick="saveProfile()">Save Changes</button>
      </div>

      <div class="profile-card">
        <h3>My Quote Requests</h3>
        ${!quotes.length
          ? '<p style="color:var(--muted);font-size:0.88rem">No quotes yet. <a style="color:var(--sun);cursor:pointer" onclick="navigate(\'contact\')">Request one →</a></p>'
          : `<div class="table-wrap"><table>
              <thead><tr><th>Date</th><th>Property</th><th>Bill Range</th><th>Status</th></tr></thead>
              <tbody>
                ${quotes.map(q => `
                  <tr>
                    <td>${fmtDate(q.createdAt)}</td>
                    <td>${q.propertyType}</td>
                    <td>${q.billRange}</td>
                    <td><span class="badge ${statusClass(q.status)}">${q.status}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table></div>`
        }
      </div>`;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--error)">${err.message}</p>`;
  }
}

async function saveProfile() {
  try {
    const body = { name: $('#p-name').value.trim(), phone: $('#p-phone').value.trim() };
    if ($('#p-pass').value) body.password = $('#p-pass').value;
    const data = await apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(body) });
    setAuth(data); updateNav();
    toast('Profile updated successfully');
  } catch (err) { toast(err.message, 'error'); }
}

/* ══════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════ */
let adminTab = 'dashboard';

function renderAdmin() {
  if (!isAdmin()) { navigate('home'); return; }
  switchAdminTab(adminTab);
}

function switchAdminTab(tab) {
  adminTab = tab;
  $$('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.tab === tab));
  const content = $('#admin-main');
  content.innerHTML = '<div class="spinner"></div>';
  const fns = { dashboard: adminDashboard, products: adminProducts, quotes: adminQuotes, users: adminUsers };
  fns[tab]?.();
}

/* ── Dashboard ── */
async function adminDashboard() {
  try {
    const s = await apiFetch('/admin/stats');
    $('#admin-main').innerHTML = `
      <h2>Dashboard</h2>
      <div class="stats-grid">
        <div class="stat-card"><div class="s-num">${s.totalProducts}</div><div class="s-lbl">Products</div></div>
        <div class="stat-card"><div class="s-num">${s.totalUsers}</div><div class="s-lbl">Users</div></div>
        <div class="stat-card"><div class="s-num">${s.totalQuotes}</div><div class="s-lbl">Total Quotes</div></div>
        <div class="stat-card"><div class="s-num" style="color:#ef4444">${s.newQuotes}</div><div class="s-lbl">New Quotes</div></div>
      </div>
      <p style="color:var(--muted);font-size:0.88rem">Welcome back, Admin! Use the sidebar to manage your website.</p>`;
  } catch (err) { $('#admin-main').innerHTML = `<p style="color:var(--error)">${err.message}</p>`; }
}

/* ── Products (admin) ── */
async function adminProducts() {
  try {
    const products = await apiFetch('/products');
    $('#admin-main').innerHTML = `
      <h2>Products</h2>
      <div class="action-bar">
        <span style="color:var(--muted);font-size:0.88rem">${products.length} products</span>
        <button class="btn-primary btn-sm" onclick="showProductForm()">+ Add Product</button>
      </div>
      <div id="product-form-area"></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Featured</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>${fmtPrice(p.price)}</td>
                <td>${p.featured ? '⭐' : '—'}</td>
                <td><span class="badge ${p.inStock ? 'badge-res' : 'badge-new'}">${p.inStock ? 'In Stock' : 'Out'}</span></td>
                <td style="display:flex;gap:0.5rem;flex-wrap:wrap">
                  <button class="btn-primary btn-sm" onclick="showProductForm('${p._id}')">Edit</button>
                  <button class="btn-primary btn-sm btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { $('#admin-main').innerHTML = `<p style="color:var(--error)">${err.message}</p>`; }
}

async function showProductForm(id = null) {
  let p = {};
  if (id) {
    try { p = await apiFetch(`/products/${id}`); } catch {}
  }
  const formArea = $('#product-form-area');
  formArea.innerHTML = `
    <div class="admin-form" style="margin-bottom:2rem">
      <h3>${id ? 'Edit Product' : 'Add New Product'}</h3>
      <input type="hidden" id="pf-id" value="${id || ''}"/>
      <div class="form-row">
        <div class="form-group"><label>Product Name</label><input id="pf-name" value="${p.name||''}"/></div>
        <div class="form-group"><label>Price (₹)</label><input id="pf-price" type="number" value="${p.price||''}"/></div>
      </div>
      <div class="form-group"><label>Description</label><textarea id="pf-desc">${p.description||''}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Category</label>
          <select id="pf-cat">
            ${['Residential','Commercial','Industrial','Accessories'].map(c => `<option ${p.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Type (e.g. On-Grid)</label><input id="pf-type" value="${p.type||''}"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Wattage (W)</label><input id="pf-watt" type="number" value="${p.wattage||''}"/></div>
        <div class="form-group"><label>No. of Panels</label><input id="pf-panels" type="number" value="${p.panels||''}"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Featured?</label>
          <select id="pf-feat"><option value="false" ${!p.featured?'selected':''}>No</option><option value="true" ${p.featured?'selected':''}>Yes</option></select>
        </div>
        <div class="form-group"><label>In Stock?</label>
          <select id="pf-stock"><option value="true" ${p.inStock!==false?'selected':''}>Yes</option><option value="false" ${p.inStock===false?'selected':''}>No</option></select>
        </div>
      </div>
      <div class="form-group"><label>Product Image</label><input id="pf-img" type="file" accept="image/*" style="padding:0.6rem"/></div>
      <div style="display:flex;gap:1rem;margin-top:0.5rem">
        <button class="btn-primary" onclick="saveProduct()">💾 Save Product</button>
        <button class="btn-outline btn-sm" onclick="this.closest('.admin-form').remove()">Cancel</button>
      </div>
    </div>`;
  formArea.scrollIntoView({ behavior: 'smooth' });
}

async function saveProduct() {
  const id = $('#pf-id').value;
  const fd = new FormData();
  fd.append('name',        $('#pf-name').value.trim());
  fd.append('price',       $('#pf-price').value);
  fd.append('description', $('#pf-desc').value.trim());
  fd.append('category',    $('#pf-cat').value);
  fd.append('type',        $('#pf-type').value.trim());
  fd.append('wattage',     $('#pf-watt').value);
  fd.append('panels',      $('#pf-panels').value);
  fd.append('featured',    $('#pf-feat').value);
  fd.append('inStock',     $('#pf-stock').value);
  const imgFile = $('#pf-img').files[0];
  if (imgFile) fd.append('image', imgFile);

  try {
    const token = getToken();
    const res = await fetch(API + (id ? `/products/${id}` : '/products'), {
      method: id ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    toast(`Product ${id ? 'updated' : 'created'} successfully`);
    adminProducts();
  } catch (err) { toast(err.message, 'error'); }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    toast('Product deleted');
    adminProducts();
  } catch (err) { toast(err.message, 'error'); }
}

/* ── Quotes (admin) ── */
async function adminQuotes() {
  try {
    const quotes = await apiFetch('/quotes');
    $('#admin-main').innerHTML = `
      <h2>Quote Requests</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Property</th><th>Bill</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${quotes.map(q => `
              <tr>
                <td>${fmtDate(q.createdAt)}</td>
                <td><strong>${q.name}</strong><br><small style="color:var(--muted)">${q.phone}</small></td>
                <td>${q.email}</td>
                <td>${q.propertyType}</td>
                <td>${q.billRange}</td>
                <td>
                  <select onchange="updateQuoteStatus('${q._id}', this.value)" style="background:var(--dark4);border:1px solid var(--dark4);color:var(--text);padding:0.3rem 0.6rem;border-radius:4px;font-size:0.8rem">
                    ${['New','In Progress','Resolved'].map(s => `<option ${q.status===s?'selected':''}>${s}</option>`).join('')}
                  </select>
                </td>
                <td><button class="btn-primary btn-sm btn-danger" onclick="deleteQuote('${q._id}')">Delete</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { $('#admin-main').innerHTML = `<p style="color:var(--error)">${err.message}</p>`; }
}

async function updateQuoteStatus(id, status) {
  try {
    await apiFetch(`/quotes/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    toast('Status updated');
  } catch (err) { toast(err.message, 'error'); }
}

async function deleteQuote(id) {
  if (!confirm('Delete this quote?')) return;
  try {
    await apiFetch(`/quotes/${id}`, { method: 'DELETE' });
    toast('Quote deleted');
    adminQuotes();
  } catch (err) { toast(err.message, 'error'); }
}

/* ── Users (admin) ── */
async function adminUsers() {
  try {
    const users = await apiFetch('/admin/users');
    $('#admin-main').innerHTML = `
      <h2>Registered Users</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${u.phone || '—'}</td>
                <td>${fmtDate(u.createdAt)}</td>
                <td><button class="btn-primary btn-sm btn-danger" onclick="deleteUser('${u._id}')">Delete</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) { $('#admin-main').innerHTML = `<p style="color:var(--error)">${err.message}</p>`; }
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  try {
    await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    toast('User deleted');
    adminUsers();
  } catch (err) { toast(err.message, 'error'); }
}

/* ── Helpers ── */
function statusClass(s) {
  return { 'New': 'badge-new', 'In Progress': 'badge-prog', 'Resolved': 'badge-res' }[s] || '';
}

/* ══════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  $('#hamburger')?.addEventListener('click', () => {
    $('#main-nav-links').classList.toggle('open');
  });

  // Kick off with home page
  updateNav();
  navigate('home');
});
