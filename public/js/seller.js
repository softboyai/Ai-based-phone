/**
 * KT Phones — Seller Dashboard JavaScript
 * Handles seller panel: listings, add phone, edit phone, delete phone.
 */

const API = '/api';

// ── Auth guard + init ───────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    const res  = await fetch(API + '/auth/session');
    const data = await res.json();
    if (!data.loggedIn || (data.user.role !== 'seller' && data.user.role !== 'admin')) {
        window.location.href = '/login';
        return;
    }
    // Greeting
    const greet = document.getElementById('seller-greeting');
    if (greet) greet.textContent = `📦 Welcome, ${data.user.fullName}`;

    await loadSellerListings();
    setupAddForm();
    setupEditForm();
});

// ── Panel switching ─────────────────────────────────────────
function switchPanel(name, el) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('show');
    if (el) el.classList.add('active');
    if (name === 'listings') loadSellerListings();
}

// ── Load seller's listings ───────────────────────────────────
async function loadSellerListings() {
    const tb = document.getElementById('seller-phones-body');
    if (!tb) return;
    try {
        const res = await fetch(API + '/phones/my-listings');
        if (!res.ok) throw new Error('Failed');
        const phones = await res.json();

        // Stats
        const s = document.getElementById('seller-stat-listings');
        const i = document.getElementById('seller-stat-instock');
        const o = document.getElementById('seller-stat-outstock');
        if (s) s.textContent = phones.length;
        if (i) i.textContent = phones.filter(p => p.inStock).length;
        if (o) o.textContent = phones.filter(p => !p.inStock).length;

        if (!phones.length) {
            tb.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#888;">No listings yet. Add your first phone above.</td></tr>';
            return;
        }
        tb.innerHTML = phones.map(p => `
            <tr>
                <td><img src="/images/${p.image}" onerror="this.src='/images/default-phone.svg'"
                    style="width:42px;height:42px;object-fit:cover;border-radius:6px;" alt="${p.name}"></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.brand}</td>
                <td>${fmtPrice(p.price)} RWF</td>
                <td>${p.ram}GB / ${p.storage}GB</td>
                <td>${p.inStock
                    ? '<span style="color:#2e7d32;">✅ In Stock</span>'
                    : '<span style="color:#c62828;">❌ Out</span>'}</td>
                <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="abtn abtn-edit" onclick="openSellerEdit('${p._id}')">Edit</button>
                    <button class="abtn abtn-del"  onclick="delSellerPhone('${p._id}')">Delete</button>
                </td>
            </tr>`).join('');
    } catch (e) {
        tb.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#c62828;">Error loading listings.</td></tr>';
    }
}

// ── Add Phone form ───────────────────────────────────────────
function setupAddForm() {
    const form = document.getElementById('seller-add-phone-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd     = new FormData(form);
        const usages = [...form.querySelectorAll('input[name="usageType"]:checked')].map(cb => cb.value);
        fd.delete('usageType');
        fd.append('usageType', usages.join(','));
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Listing...'; }
        try {
            const res  = await fetch(API + '/phones', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok) {
                showSellerMsg('Phone listed successfully!', 'ok');
                form.reset();
                loadSellerListings();
            } else {
                showSellerMsg(data.message || 'Error adding phone', 'err');
            }
        } catch (e) {
            showSellerMsg('Network error. Please try again.', 'err');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '📱 Add Phone to Catalog'; }
        }
    });
}

// ── Edit Phone modal ─────────────────────────────────────────
async function openSellerEdit(id) {
    try {
        const res   = await fetch(API + '/phones/' + id);
        const phone = await res.json();
        document.getElementById('sedit-id').value      = phone._id;
        document.getElementById('sedit-name').value    = phone.name;
        document.getElementById('sedit-brand').value   = phone.brand;
        document.getElementById('sedit-price').value   = phone.price;
        document.getElementById('sedit-ram').value     = phone.ram;
        document.getElementById('sedit-storage').value = phone.storage;
        document.getElementById('sedit-battery').value = phone.battery;
        document.getElementById('sedit-camera').value  = phone.camera;
        document.getElementById('sedit-desc').value    = phone.description || '';
        document.getElementById('sedit-stock').checked = phone.inStock;
        document.querySelectorAll('#sedit-usage input[type="checkbox"]').forEach(cb => {
            cb.checked = phone.usageType && phone.usageType.includes(cb.value);
        });
        document.getElementById('seller-edit-modal').classList.add('open');
    } catch (e) {
        showSellerMsg('Error loading phone data', 'err');
    }
}

function closeSellerEditModal() {
    document.getElementById('seller-edit-modal').classList.remove('open');
}

function setupEditForm() {
    const form = document.getElementById('seller-edit-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id  = document.getElementById('sedit-id').value;
        const fd  = new FormData(form);
        const usages = [...form.querySelectorAll('input[name="usageType"]:checked')].map(cb => cb.value);
        fd.delete('usageType');
        fd.append('usageType', usages.join(','));
        fd.append('inStock', document.getElementById('sedit-stock').checked);
        try {
            const res  = await fetch(`${API}/phones/${id}`, { method: 'PUT', body: fd });
            const data = await res.json();
            if (res.ok) {
                showSellerMsg('Listing updated!', 'ok');
                closeSellerEditModal();
                loadSellerListings();
            } else {
                showSellerMsg(data.message || 'Update failed', 'err');
            }
        } catch (e) { showSellerMsg('Network error', 'err'); }
    });
}

// ── Delete phone ─────────────────────────────────────────────
async function delSellerPhone(id) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API}/phones/${id}`, { method: 'DELETE' });
        if (res.ok) { showSellerMsg('Listing deleted.', 'ok'); loadSellerListings(); }
        else        { showSellerMsg('Error deleting listing', 'err'); }
    } catch (e) { showSellerMsg('Network error', 'err'); }
}

// ── Utilities ─────────────────────────────────────────────────
function fmtPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showSellerMsg(text, type) {
    const el = document.getElementById('seller-msg');
    if (!el) return;
    el.textContent   = text;
    el.className     = 'msg ' + (type === 'ok' ? 'msg-ok' : 'msg-err');
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}
