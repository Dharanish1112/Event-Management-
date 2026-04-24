// ============================================
// WINNER MANAGEMENT — Connected to backend
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { showToast, navigate } from '../main.js';

const API = 'https://event-management-nroc.onrender.com/api';

function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

export function renderWinnerManagement(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user || user.role !== 'admin') { navigate('login'); return; }

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, 'admin', 'winner-management');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, { showSearch: false });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <div class="overline">Admin Panel</div>
      <h1>Winner Management</h1>
      <p>Select an event, pick registered students, assign positions and declare winners.</p>
    </div>

    <!-- STATS -->
    <div class="winner-stats" id="winner-stats">
      <div class="winner-stat-card">
        <div class="stat-icon">${icons.trophy}</div>
        <div>
          <div class="stat-value" id="stat-total-winners">—</div>
          <div class="stat-label">Total Winners Declared</div>
        </div>
      </div>
      <div class="winner-stat-card">
        <div class="stat-icon">${icons.calendar}</div>
        <div>
          <div class="stat-value" id="stat-total-events">—</div>
          <div class="stat-label">Events with Winners</div>
        </div>
      </div>
      <div class="winner-stat-card highlight">
        <div class="stat-icon">${icons.zap}</div>
        <div>
          <div class="stat-value">Live</div>
          <div class="stat-label" style="color:rgba(255,255,255,0.8);">Winner Declaration Active</div>
        </div>
      </div>
    </div>

    <!-- EVENT SELECTOR -->
    <div class="wm-event-selector">
      <div class="wm-selector-label">Select Event to Manage Winners</div>
      <div class="wm-selector-row">
        <select id="wm-event-select" class="form-input" style="flex:1;max-width:480px;">
          <option value="">— Choose an event —</option>
        </select>
        <button class="btn btn-primary" id="wm-load-btn" disabled>
          ${icons.users} Load Participants
        </button>
      </div>
    </div>

    <!-- PARTICIPANTS + DECLARE WINNER SECTION -->
    <div id="wm-main-section" style="display:none;">

      <div class="wm-two-col">

        <!-- LEFT: Registered Students -->
        <div class="card">
          <div class="card-body">
            <div class="section-header">
              <h2>Registered Students</h2>
              <span class="badge badge-primary" id="participant-count">0 students</span>
            </div>
            <div id="participants-list">
              <div class="loading-state">Loading...</div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Declare Winner Form + Current Winners -->
        <div style="display:flex;flex-direction:column;gap:var(--space-6);">

          <!-- Declare Winner Form -->
          <div class="card">
            <div class="card-body">
              <div class="section-header">
                <h2>Declare Winner</h2>
              </div>
              <form id="declare-winner-form" novalidate>
                <div class="form-group">
                  <label class="form-label">SELECT STUDENT <span class="req">*</span></label>
                  <select id="wm-student-select" class="form-input" required>
                    <option value="">— Select a student —</option>
                  </select>
                  <span class="field-error" id="wm-student-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label">POSITION <span class="req">*</span></label>
                  <select id="wm-position-select" class="form-input" required>
                    <option value="">— Select position —</option>
                    <option value="1st">🥇 1st Place</option>
                    <option value="2nd">🥈 2nd Place</option>
                    <option value="3rd">🥉 3rd Place</option>
                    <option value="participant">🎖️ Special Participant</option>
                  </select>
                  <span class="field-error" id="wm-position-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label">PRIZE AMOUNT (Optional)</label>
                  <input type="text" id="wm-prize" class="form-input" placeholder="e.g. ₹50,000 or Trophy" />
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;" id="declare-btn">
                  ${icons.trophy} Declare Winner
                </button>
              </form>
            </div>
          </div>

          <!-- Current Winners -->
          <div class="card">
            <div class="card-body">
              <div class="section-header">
                <h2>Current Winners</h2>
                <button class="btn btn-secondary btn-sm" id="export-winners-btn">
                  ${icons.download} Export
                </button>
              </div>
              <div id="current-winners-list">
                <div class="empty-state" style="padding:var(--space-6);">No winners declared yet.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Declare Winner Modal -->
    <div id="wm-modal" style="display:none;">
      <div class="modal-overlay" id="wm-modal-overlay"></div>
      <div class="modal-content" id="wm-modal-content" style="max-width:500px;"></div>
    </div>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    loadWinnerStats(main);
    loadEvents(main);
    attachHandlers(main);
}

// ---- Load stats ----
async function loadWinnerStats(main) {
    try {
        const res  = await fetch(`${API}/analytics/admin`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        const data = await res.json();
        if (data.success) {
            main.querySelector('#stat-total-winners').textContent = data.stats.totalWinners;
            main.querySelector('#stat-total-events').textContent  = data.stats.totalEvents;
        }
    } catch {}
}

// ---- Load admin's events into dropdown ----
async function loadEvents(main) {
    try {
        const user = getUser();
        const res  = await fetch(`${API}/events`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        const data = await res.json();
        if (!data.success) return;

        const myEvents = data.events.filter(e => e.college === user.college);
        const select   = main.querySelector('#wm-event-select');

        myEvents.forEach(ev => {
            const opt = document.createElement('option');
            opt.value = ev._id;
            opt.textContent = `${ev.title} (${ev.status})`;
            opt.dataset.title = ev.title;
            select.appendChild(opt);
        });
    } catch {}
}

// ---- Attach handlers ----
function attachHandlers(main) {
    const eventSelect = main.querySelector('#wm-event-select');
    const loadBtn     = main.querySelector('#wm-load-btn');

    eventSelect.addEventListener('change', () => {
        loadBtn.disabled = !eventSelect.value;
    });

    loadBtn.addEventListener('click', () => {
        const eventId = eventSelect.value;
        if (!eventId) return;
        main.querySelector('#wm-main-section').style.display = 'block';
        loadParticipants(main, eventId);
        loadCurrentWinners(main, eventId);
    });

    // Declare winner form
    main.querySelector('#declare-winner-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventId   = main.querySelector('#wm-event-select').value;
        const studentId = main.querySelector('#wm-student-select').value;
        const position  = main.querySelector('#wm-position-select').value;
        const prize     = main.querySelector('#wm-prize').value.trim();

        // Clear errors
        ['wm-student-err','wm-position-err'].forEach(id => {
            const el = main.querySelector(`#${id}`);
            if (el) { el.textContent = ''; el.style.display = 'none'; }
        });

        let valid = true;
        const showErr = (id, msg) => {
            const el = main.querySelector(`#${id}`);
            if (el) { el.textContent = msg; el.style.display = 'block'; }
            valid = false;
        };

        if (!studentId) showErr('wm-student-err', 'Select a student');
        if (!position)  showErr('wm-position-err', 'Select a position');
        if (!valid) return;

        const btn = main.querySelector('#declare-btn');
        btn.disabled = true;
        btn.textContent = 'Declaring...';

        try {
            const res  = await fetch(`${API}/winners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ eventId, studentId, position, prize }),
            });
            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || 'Failed to declare winner', 'error');
                btn.disabled = false;
                btn.innerHTML = `${icons.trophy} Declare Winner`;
                return;
            }

            showToast(`Winner declared! 🏆`, 'success');
            // Reset form
            main.querySelector('#wm-student-select').value  = '';
            main.querySelector('#wm-position-select').value = '';
            main.querySelector('#wm-prize').value           = '';
            btn.disabled = false;
            btn.innerHTML = `${icons.trophy} Declare Winner`;

            // Reload winners + stats
            loadCurrentWinners(main, eventId);
            loadWinnerStats(main);

        } catch (err) {
            showToast('Network error. Is backend running?', 'error');
            btn.disabled = false;
            btn.innerHTML = `${icons.trophy} Declare Winner`;
        }
    });
}

// ---- Load participants for selected event ----
async function loadParticipants(main, eventId) {
    const list          = main.querySelector('#participants-list');
    const studentSelect = main.querySelector('#wm-student-select');
    list.innerHTML = '<div class="loading-state">Loading...</div>';

    // Reset student dropdown
    studentSelect.innerHTML = '<option value="">— Select a student —</option>';

    try {
        const res  = await fetch(`${API}/registrations/event/${eventId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        const data = await res.json();

        if (!res.ok || !data.success || !data.registrations.length) {
            list.innerHTML = '<div class="empty-state" style="padding:var(--space-6);">No students registered for this event.</div>';
            main.querySelector('#participant-count').textContent = '0 students';
            return;
        }

        main.querySelector('#participant-count').textContent = `${data.registrations.length} student${data.registrations.length !== 1 ? 's' : ''}`;

        // Populate student dropdown
        data.registrations.forEach(reg => {
            const s   = reg.student || {};
            const opt = document.createElement('option');
            opt.value = s._id;
            opt.textContent = `${s.name} — ${s.college} (${s.department || 'N/A'})`;
            studentSelect.appendChild(opt);
        });

        // Render participant cards
        list.innerHTML = data.registrations.map(reg => {
            const s    = reg.student || {};
            const init = (s.name || 'S').charAt(0).toUpperCase();
            const statusClass = reg.status === 'attended' ? 'badge-success' : reg.status === 'absent' ? 'badge-danger' : 'badge-warning';

            return `
            <div class="wm-participant-row">
              <div class="user-cell">
                <div class="wm-avatar">${init}</div>
                <div>
                  <div class="wm-student-name">${s.name || '—'}</div>
                  <div class="wm-student-meta">${s.college || '—'} · ${s.department || '—'} · ${s.year ? `Year ${s.year}` : ''}</div>
                  <div class="wm-student-email">${s.email || ''}</div>
                </div>
              </div>
              <span class="badge ${statusClass}">${reg.status}</span>
            </div>`;
        }).join('');

    } catch (err) {
        list.innerHTML = '<div class="empty-state" style="padding:var(--space-6);">Failed to load participants.</div>';
    }
}

// ---- Load current winners for selected event ----
async function loadCurrentWinners(main, eventId) {
    const list = main.querySelector('#current-winners-list');
    list.innerHTML = '<div class="loading-state">Loading...</div>';

    try {
        const res  = await fetch(`${API}/winners/event/${eventId}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.winners.length) {
            list.innerHTML = '<div class="empty-state" style="padding:var(--space-6);">No winners declared yet.</div>';
            return;
        }

        const positionEmoji = { '1st': '🥇', '2nd': '🥈', '3rd': '🥉', 'participant': '🎖️' };

        list.innerHTML = data.winners.map(w => {
            const s    = w.student || {};
            const init = (s.name || 'W').charAt(0).toUpperCase();

            return `
            <div class="wm-winner-row">
              <div class="wm-winner-pos">${positionEmoji[w.position] || '🏅'}</div>
              <div class="user-cell" style="flex:1;">
                <div class="wm-avatar" style="background:linear-gradient(135deg,#F59E0B,#D97706);">${init}</div>
                <div>
                  <div class="wm-student-name">${s.name || '—'}</div>
                  <div class="wm-student-meta">${s.college || '—'} · ${s.department || '—'}</div>
                </div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div class="wm-position-badge">${w.position} Place</div>
                ${w.prize ? `<div class="wm-prize-text">${w.prize}</div>` : ''}
              </div>
              <button class="btn btn-danger btn-sm wm-remove-btn" data-winner-id="${w._id}" title="Remove winner">✕</button>
            </div>`;
        }).join('');

        // Remove winner
        list.querySelectorAll('.wm-remove-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Remove this winner declaration?')) return;
                try {
                    const res = await fetch(`${API}/winners/${btn.dataset.winnerId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${getToken()}` },
                    });
                    const data = await res.json();
                    if (data.success) {
                        showToast('Winner removed', 'info');
                        loadCurrentWinners(main, eventId);
                        loadWinnerStats(main);
                    }
                } catch {}
            });
        });

        // Export winners
        main.querySelector('#export-winners-btn').onclick = () => exportWinners(data.winners, main.querySelector('#wm-event-select').options[main.querySelector('#wm-event-select').selectedIndex]?.dataset.title || 'Event');

    } catch (err) {
        list.innerHTML = '<div class="empty-state" style="padding:var(--space-6);">Failed to load winners.</div>';
    }
}

// ---- Export winners as CSV ----
function exportWinners(winners, eventTitle) {
    const headers = ['Position', 'Student Name', 'Email', 'College', 'Department', 'Prize'];
    const rows = winners.map(w => {
        const s = w.student || {};
        return [w.position, s.name || '—', s.email || '—', s.college || '—', s.department || '—', w.prize || '—'];
    });

    const escape = val => `"${String(val).replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Winners_${eventTitle.replace(/\s+/g,'_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Winners exported! 📊', 'success');
}
