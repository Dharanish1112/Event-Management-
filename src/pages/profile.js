// ============================================
// PROFILE PAGE — Editable, connected to backend
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { navigate, showToast } from '../main.js';

const API = 'http://localhost:5001/api';

function getUser() {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
}
function getToken() {
    return localStorage.getItem('token') || '';
}

export function renderProfile(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user) { navigate('login'); return; }

    const role = user.role || 'student';

    const layout = document.createElement('div');
    layout.className = 'app-layout';

    renderSidebar(layout, role, 'profile');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';

    renderTopbar(mainWrapper, { showSearch: false });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = buildProfileHTML(user);
    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    attachProfileEvents(main, user);
}

// ---- Build HTML ----
function buildProfileHTML(user) {
    const initial = (user.name || 'U').charAt(0).toUpperCase();
    const isStudent = user.role === 'student';

    return `
    <div class="page-header">
      <div class="overline">Account Settings</div>
      <h1>My Profile</h1>
      <p>Manage your personal information and account details.</p>
    </div>

    <div class="profile-layout">

      <!-- LEFT — Avatar card -->
      <div class="profile-left">
        <div class="profile-avatar-card">
          <div class="profile-avatar-circle" id="avatar-circle">
            ${initial}
          </div>
          <div class="profile-avatar-name" id="avatar-name">${user.name || ''}</div>
          <div class="profile-avatar-role">${user.role === 'admin' ? 'College Admin' : 'Student'}</div>
          <div class="profile-avatar-college" id="avatar-college">${user.college || ''}</div>

          <div class="profile-meta-list">
            <div class="profile-meta-item">
              ${icons.mail}
              <span id="meta-email">${user.email || '—'}</span>
            </div>
            ${user.role === 'student' ? `
            <div class="profile-meta-item">
              ${icons.book}
              <span id="meta-dept">${user.department || '—'}</span>
            </div>
            <div class="profile-meta-item">
              ${icons.calendar}
              <span id="meta-year">${user.year ? `Year ${user.year}` : '—'}</span>
            </div>
            ` : `
            <div class="profile-meta-item">
              ${icons.badge}
              <span id="meta-dept">${user.department || '—'}</span>
            </div>
            `}
          </div>

          <button class="btn btn-danger btn-sm profile-logout-btn" id="logout-btn">
            ${icons.arrowRight} Sign Out
          </button>
        </div>
      </div>

      <!-- RIGHT — Edit forms -->
      <div class="profile-right">

        <!-- Personal Info -->
        <div class="profile-section-card">
          <div class="profile-section-head">
            <div class="profile-section-icon purple">${icons.user}</div>
            <div>
              <h3>Personal Information</h3>
              <p>Update your name and contact details</p>
            </div>
          </div>

          <form id="personal-form" novalidate>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">FULL NAME</label>
                <div class="form-input-icon">
                  ${icons.user}
                  <input type="text" id="p-name" class="form-input" value="${user.name || ''}" placeholder="Your full name" />
                </div>
                <span class="field-error" id="p-name-err"></span>
              </div>
              <div class="form-group">
                <label class="form-label">EMAIL ADDRESS</label>
                <div class="form-input-icon">
                  ${icons.mail}
                  <input type="email" id="p-email" class="form-input" value="${user.email || ''}" placeholder="you@gmail.com" />
                </div>
                <span class="field-error" id="p-email-err"></span>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">COLLEGE NAME</label>
                <div class="form-input-icon">
                  ${icons.building}
                  <input type="text" id="p-college" class="form-input" value="${user.college || ''}" placeholder="Your college" />
                </div>
              </div>
              ${user.role === 'student' ? `
              <div class="form-group">
                <label class="form-label">DEPARTMENT</label>
                <div class="form-input-icon">
                  ${icons.book}
                  <input type="text" id="p-dept" class="form-input" value="${user.department || ''}" placeholder="e.g. CSE, ECE" />
                </div>
              </div>
              ` : `
              <div class="form-group">
                <label class="form-label">DESIGNATION</label>
                <div class="form-input-icon">
                  ${icons.badge}
                  <input type="text" id="p-dept" class="form-input" value="${user.department || ''}" placeholder="e.g. Event Coordinator" />
                </div>
              </div>
              `}
            </div>

            ${user.role === 'student' ? `
            <div class="form-group" style="max-width:260px;">
              <label class="form-label">YEAR OF STUDY</label>
              <select id="p-year" class="form-input">
                <option value="">Select year</option>
                ${[1,2,3,4,5].map(y => `<option value="${y}" ${Number(user.year) === y ? 'selected' : ''}>${y}${['st','nd','rd','th','th'][y-1]} Year</option>`).join('')}
              </select>
            </div>
            ` : ''}

            <div class="profile-form-actions">
              <button type="submit" class="btn btn-primary" id="save-personal-btn">
                ${icons.check} Save Changes
              </button>
              <span class="save-status" id="personal-status"></span>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="profile-section-card">
          <div class="profile-section-head">
            <div class="profile-section-icon blue">${icons.lock}</div>
            <div>
              <h3>Change Password</h3>
              <p>Update your password to keep your account secure</p>
            </div>
          </div>

          <form id="password-form" novalidate>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">NEW PASSWORD</label>
                <div class="form-input-icon">
                  ${icons.lock}
                  <input type="password" id="p-newpw" class="form-input" placeholder="Min 6 characters" />
                  <button type="button" class="toggle-pw" tabindex="-1">${icons.eye}</button>
                </div>
                <span class="field-error" id="p-newpw-err"></span>
              </div>
              <div class="form-group">
                <label class="form-label">CONFIRM NEW PASSWORD</label>
                <div class="form-input-icon">
                  ${icons.lock}
                  <input type="password" id="p-confirmpw" class="form-input" placeholder="Re-enter new password" />
                </div>
                <span class="field-error" id="p-confirmpw-err"></span>
              </div>
            </div>

            <div class="profile-form-actions">
              <button type="submit" class="btn btn-primary" id="save-pw-btn">
                ${icons.check} Update Password
              </button>
              <span class="save-status" id="pw-status"></span>
            </div>
          </form>
        </div>

        <!-- Account Info (read-only) -->
        <div class="profile-section-card">
          <div class="profile-section-head">
            <div class="profile-section-icon green">${icons.shield}</div>
            <div>
              <h3>Account Details</h3>
              <p>Your account information</p>
            </div>
          </div>
          <div class="profile-info-grid">
            <div class="profile-info-item">
              <span class="info-label">Account Type</span>
              <span class="info-value">
                <span class="badge ${user.role === 'admin' ? 'badge-warning' : 'badge-primary'}">
                  ${user.role === 'admin' ? 'College Admin' : 'Student'}
                </span>
              </span>
            </div>
            <div class="profile-info-item">
              <span class="info-label">User ID</span>
              <span class="info-value info-mono">${user.id || '—'}</span>
            </div>
            <div class="profile-info-item">
              <span class="info-label">Email</span>
              <span class="info-value">${user.email || '—'}</span>
            </div>
            <div class="profile-info-item">
              <span class="info-label">College</span>
              <span class="info-value">${user.college || '—'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>`;
}

// ---- Attach Events ----
function attachProfileEvents(main, user) {
    // Password toggle
    main.querySelectorAll('.toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });

    // Logout
    main.querySelector('#logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Signed out successfully', 'info');
        setTimeout(() => navigate('login'), 500);
    });

    // ---- Save Personal Info ----
    main.querySelector('#personal-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name    = main.querySelector('#p-name').value.trim();
        const email   = main.querySelector('#p-email').value.trim();
        const college = main.querySelector('#p-college').value.trim();
        const dept    = main.querySelector('#p-dept')?.value.trim();
        const year    = main.querySelector('#p-year')?.value;

        // Validate
        let valid = true;
        if (!name) { showFieldErr(main, 'p-name-err', 'Name is required'); valid = false; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldErr(main, 'p-email-err', 'Enter a valid email'); valid = false;
        }
        if (!valid) return;

        const btn = main.querySelector('#save-personal-btn');
        setLoading(btn, true);

        try {
            const body = { name, email, college, department: dept };
            if (year) body.year = Number(year);

            const res = await fetch(`${API}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || 'Update failed', 'error');
                setLoading(btn, false);
                return;
            }

            // Update localStorage
            const updated = { ...user, ...data.user };
            localStorage.setItem('user', JSON.stringify(updated));

            // Update avatar/sidebar display
            main.querySelector('#avatar-name').textContent = name;
            main.querySelector('#avatar-college').textContent = college;
            main.querySelector('#avatar-circle').textContent = name.charAt(0).toUpperCase();
            main.querySelector('#meta-email').textContent = email;
            if (main.querySelector('#meta-dept')) main.querySelector('#meta-dept').textContent = dept || '—';
            if (main.querySelector('#meta-year') && year) main.querySelector('#meta-year').textContent = `Year ${year}`;

            showStatus(main, 'personal-status', '✓ Saved!');
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            showToast('Network error. Is backend running?', 'error');
        }
        setLoading(btn, false);
    });

    // ---- Change Password ----
    main.querySelector('#password-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newpw    = main.querySelector('#p-newpw').value;
        const confirmpw = main.querySelector('#p-confirmpw').value;

        let valid = true;
        clearFieldErr(main, 'p-newpw-err');
        clearFieldErr(main, 'p-confirmpw-err');

        if (!newpw || newpw.length < 6) {
            showFieldErr(main, 'p-newpw-err', 'Password must be at least 6 characters'); valid = false;
        }
        if (newpw !== confirmpw) {
            showFieldErr(main, 'p-confirmpw-err', 'Passwords do not match'); valid = false;
        }
        if (!valid) return;

        const btn = main.querySelector('#save-pw-btn');
        setLoading(btn, true);

        try {
            const res = await fetch(`${API}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ password: newpw }),
            });

            const data = await res.json();
            if (!res.ok) {
                showToast(data.message || 'Password update failed', 'error');
                setLoading(btn, false);
                return;
            }

            main.querySelector('#p-newpw').value = '';
            main.querySelector('#p-confirmpw').value = '';
            showStatus(main, 'pw-status', '✓ Password updated!');
            showToast('Password changed successfully!', 'success');
        } catch (err) {
            showToast('Network error. Is backend running?', 'error');
        }
        setLoading(btn, false);
    });
}

// ---- Helpers ----
function showFieldErr(main, id, msg) {
    const el = main.querySelector(`#${id}`);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearFieldErr(main, id) {
    const el = main.querySelector(`#${id}`);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
        btn.dataset.label = btn.dataset.label || btn.innerHTML;
        btn.textContent = 'Saving...';
    } else {
        btn.innerHTML = btn.dataset.label || btn.innerHTML;
    }
}
function showStatus(main, id, msg) {
    const el = main.querySelector(`#${id}`);
    if (!el) return;
    el.textContent = msg;
    el.style.color = 'var(--success)';
    setTimeout(() => { el.textContent = ''; }, 3000);
}
