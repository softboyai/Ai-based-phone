/**
 * KT Phones — Admin Panel JavaScript
 * Handles all admin dashboard logic: stats, phones, sellers, customers,
 * recommendations, charts, reports, edit/delete phone.
 */

const API = '/api';
let allPhones = [], allUsers = [], allRecs = [];

// ── Auth guard + init ───────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    const res  = await fetch(API + '/auth/session');
    const data = await res.json();
    if (!data.loggedIn || data.user.role !== 'admin') {
        window.location.href = '/login';
        return;
    }
    await loadAll();
    setupEditForm();
});

// ── Panel switching ─────────────────────────────────────────
function switchPanel(name, el) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('show'));
    document.getElementById('p-' + name).classList.add('show');
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
    const titles = {
        dashboard : '📊 Dashboard',
        phones    : '📱 All Phone Listings',
        sellers   : '🛒 Sellers',
        users     : '👥 Customers',
        recs      : '🤖 AI Recommendations',
        reports   : '📈 Reports'
    };
    document.getElementById('page-title').textContent = titles[name] || '';
}

// ── Load all data ───────────────────────────────────────────
async function loadAll() {
    try {
        const [pRes, uRes, rRes] = await Promise.all([
            fetch(API + '/phones'),
            fetch(API + '/auth/users'),
            fetch(API + '/recommend/all')
        ]);
        allPhones = await pRes.json();
        if (uRes.ok) allUsers = await uRes.json();
        if (rRes.ok) allRecs  = await rRes.json();

        updateDashboardStats();
        renderPhones();
        renderSellers();
        renderCustomers();
        renderRecs();
        renderCharts();
        updateReports();
    } catch (e) {
        console.error('Admin load error:', e);
    }
}

// ── Dashboard stats ─────────────────────────────────────────
function updateDashboardStats() {
    const customers = allUsers.filter(u => u.role === 'customer');
    const sellers   = allUsers.filter(u => u.role === 'seller');
    document.getElementById('s-phones').textContent   = allPhones.length;
    document.getElementById('s-recs').textContent     = allRecs.length;
    document.getElementById('s-users').textContent    = customers.length;
    document.getElementById('s-sellers').textContent  = sellers.length;
    document.getElementById('s-featured').textContent = allPhones.filter(p => p.featured).length;
}

// ── Phones table ────────────────────────────────────────────
function renderPhones() {
    const tb = document.getElementById('tb-phones');
    if (!allPhones.length) {
        tb.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:20px;color:#888;">No phones in the system yet.</td></tr>';
        return;
    }
    tb.innerHTML = allPhones.map(p => {
        const seller   = allUsers.find(u => u._id === (p.addedBy?._id || p.addedBy));
        const listedBy = seller
            ? `<span style="font-size:0.78rem;color:#ff6f00;">${seller.fullName}</span>`
            : '<span style="font-size:0.78rem;color:#aaa;">—</span>';
        return `<tr>
            <td><img src="/images/${p.image}" onerror="this.src='/images/default-phone.svg'" alt="${p.name}"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.brand}</td>
            <td>${fmtPrice(p.price)} RWF</td>
            <td>${p.ram}GB</td><td>${p.storage}GB</td>
            <td>${p.battery}mAh</td><td>${p.camera}MP</td>
            <td>${listedBy}</td>
            <td>${p.inStock ? '<span style="color:#2e7d32">✅</span>' : '<span style="color:#c62828">❌</span>'}</td>
            <td>
                <button class="abtn abtn-edit" onclick="openEdit('${p._id}')">Edit</button>
                <button class="abtn abtn-del"  onclick="delPhone('${p._id}')">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

// ── Sellers panel ────────────────────────────────────────────
function renderSellers() {
    const sellers = allUsers.filter(u => u.role === 'seller');
    document.getElementById('ss-total').textContent    = sellers.length;
    const sellerPhones = allPhones.filter(p => p.addedBy);
    document.getElementById('ss-listings').textContent = sellerPhones.length;
    document.getElementById('ss-instock').textContent  = sellerPhones.filter(p => p.inStock).length;

    const tb = document.getElementById('tb-sellers');
    if (!sellers.length) {
        tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No sellers registered yet.</td></tr>';
        return;
    }
    tb.innerHTML = sellers.map(s => {
        const sPhones  = allPhones.filter(p => (p.addedBy?._id || p.addedBy) === s._id);
        const sInStock = sPhones.filter(p => p.inStock).length;
        return `<tr>
            <td><strong>${s.fullName}</strong></td>
            <td>${s.email}</td>
            <td>${sPhones.length}</td>
            <td>${sInStock}</td>
            <td>${new Date(s.createdAt).toLocaleDateString()}</td>
        </tr>`;
    }).join('');
}

// ── Customers table ──────────────────────────────────────────
// Only shows users with role === 'customer'. Sellers have their own dedicated panel.
function renderCustomers() {
    const customers = allUsers.filter(u => u.role === 'customer');
    const tb = document.getElementById('tb-users');
    if (!customers.length) {
        tb.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#888;">No customers registered yet.</td></tr>';
        return;
    }
    tb.innerHTML = customers.map(u => `<tr>
        <td>${u.fullName}</td>
        <td>${u.email}</td>
        <td><span class="role-badge" style="background:#1a237e;">customer</span></td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
    </tr>`).join('');
}

// ── Recommendations table ────────────────────────────────────
function renderRecs() {
    const tb = document.getElementById('tb-recs');
    if (!allRecs.length) {
        tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No recommendations yet.</td></tr>';
        return;
    }
    tb.innerHTML = allRecs.map(r => `<tr>
        <td>${r.userId ? r.userId.fullName : 'Unknown'}</td>
        <td>${r.preferences.budget}</td>
        <td>${r.preferences.brand}</td>
        <td>${(r.preferences.usage || []).join(', ')}</td>
        <td>${r.recommendedPhones.map(rp => rp.phone ? rp.phone.name : 'N/A').join(', ')}</td>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
    </tr>`).join('');
}

// ── Charts ───────────────────────────────────────────────────
function renderCharts() {
    // Brand bar chart
    const brands = {};
    allPhones.forEach(p => { brands[p.brand] = (brands[p.brand] || 0) + 1; });
    const maxB   = Math.max(...Object.values(brands), 1);
    const colors = ['#1a237e', '#ff6f00', '#2e7d32', '#c62828', '#6a1b9a', '#00838f'];
    const brandEl = document.getElementById('chart-brand');
    brandEl.innerHTML = Object.entries(brands).map(([b, c], i) =>
        `<div class="bar" style="height:${(c / maxB) * 140}px;background:${colors[i % colors.length]};">
            <span class="bar-lbl">${b} (${c})</span>
         </div>`
    ).join('') || '<p style="color:#aaa;margin:auto;font-size:0.85rem;">No data yet</p>';

    // Price distribution chart
    const ranges = { '<50K': 0, '50-150K': 0, '150-300K': 0, '300-500K': 0, '500K+': 0 };
    allPhones.forEach(p => {
        if      (p.price < 50000)  ranges['<50K']++;
        else if (p.price < 150000) ranges['50-150K']++;
        else if (p.price < 300000) ranges['150-300K']++;
        else if (p.price < 500000) ranges['300-500K']++;
        else                       ranges['500K+']++;
    });
    const maxP    = Math.max(...Object.values(ranges), 1);
    const priceEl = document.getElementById('chart-price');
    priceEl.innerHTML = Object.entries(ranges).map(([r, c]) =>
        `<div class="bar" style="height:${Math.max((c / maxP) * 140, 8)}px;background:#ff6f00;">
            <span class="bar-lbl">${r} (${c})</span>
         </div>`
    ).join('');
}

// ── Reports summary ──────────────────────────────────────────
function updateReports() {
    const inStock   = allPhones.filter(p => p.inStock).length;
    const customers = allUsers.filter(u => u.role === 'customer').length;
    const sellers   = allUsers.filter(u => u.role === 'seller').length;

    document.getElementById('r-phones').textContent   = allPhones.length;
    document.getElementById('r-recs').textContent     = allRecs.length;
    document.getElementById('r-instock').textContent  = inStock;
    document.getElementById('r-outstock').textContent = allPhones.length - inStock;

    document.getElementById('sm-phones').textContent    = allPhones.length;
    document.getElementById('sm-customers').textContent = customers;
    document.getElementById('sm-sellers').textContent   = sellers;
    document.getElementById('sm-recs').textContent      = allRecs.length;
    document.getElementById('sm-featured').textContent  = allPhones.filter(p => p.featured).length;
    document.getElementById('sm-instock').textContent   = inStock;
    document.getElementById('sm-outstock').textContent  = allPhones.length - inStock;

    if (allPhones.length > 0) {
        const avg = Math.round(allPhones.reduce((s, p) => s + p.price, 0) / allPhones.length);
        document.getElementById('sm-avg').textContent = fmtPrice(avg) + ' RWF';
    }
    const brandCount = {};
    allPhones.forEach(p => { brandCount[p.brand] = (brandCount[p.brand] || 0) + 1; });
    const top = Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0];
    if (top) document.getElementById('sm-brand').textContent = `${top[0]} (${top[1]} phones)`;
}

// ── Edit phone modal ─────────────────────────────────────────
function openEdit(id) {
    const phone = allPhones.find(p => p._id === id);
    if (!phone) return;
    document.getElementById('ed-id').value      = phone._id;
    document.getElementById('ed-name').value    = phone.name;
    document.getElementById('ed-brand').value   = phone.brand;
    document.getElementById('ed-price').value   = phone.price;
    document.getElementById('ed-ram').value     = phone.ram;
    document.getElementById('ed-storage').value = phone.storage;
    document.getElementById('ed-battery').value = phone.battery;
    document.getElementById('ed-camera').value  = phone.camera;
    document.getElementById('ed-desc').value    = phone.description || '';
    document.getElementById('ed-stock').checked = phone.inStock;
    document.querySelectorAll('#ed-usage input[type="checkbox"]').forEach(cb => {
        cb.checked = phone.usageType && phone.usageType.includes(cb.value);
    });
    document.getElementById('edit-modal').classList.add('open');
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('open');
}

function setupEditForm() {
    document.getElementById('frm-edit').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id  = document.getElementById('ed-id').value;
        const fd  = new FormData(e.target);
        const usages = [];
        e.target.querySelectorAll('input[name="usageType"]:checked').forEach(cb => usages.push(cb.value));
        fd.delete('usageType');
        fd.append('usageType', usages.join(','));
        fd.append('inStock', document.getElementById('ed-stock').checked);
        try {
            const res  = await fetch(`${API}/phones/${id}`, { method: 'PUT', body: fd });
            const data = await res.json();
            if (res.ok) { showMsg('Phone updated!', 'ok'); closeModal(); loadAll(); }
            else        { showMsg(data.message || 'Update failed', 'err'); }
        } catch (e) { showMsg('Network error', 'err'); }
    });
}

// ── Delete phone ─────────────────────────────────────────────
async function delPhone(id) {
    if (!confirm('Delete this phone permanently? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API}/phones/${id}`, { method: 'DELETE' });
        if (res.ok) { showMsg('Phone deleted', 'ok'); loadAll(); }
        else        { showMsg('Error deleting phone', 'err'); }
    } catch (e) { showMsg('Network error', 'err'); }
}

// ── Utilities ─────────────────────────────────────────────────
function fmtPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showMsg(text, type) {
    const el = document.getElementById('admin-msg');
    el.textContent   = text;
    el.className     = 'msg ' + (type === 'ok' ? 'msg-ok' : 'msg-err');
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}
