// ============================================
// PARTICIPANT TRACKING PAGE — Admin
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { navigate, showToast } from '../main.js';

const API = 'http://localhost:5001/api';
function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

export function renderParticipantTracking(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user || user.role !== 'admin') { navigate('login'); return; }

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, 'admin', 'participant-tracking');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, { showSearch: false });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <div class="overline">Admin Panel</div>
      <h1>Participant Tracking</h1>
      <p>Track all student registrations across your events. View details, update attendance, and export data.</p>
    </div>

    <!-- STATS -->
    <div class="analytics-grid" style="margin-bottom:var(--space-8);">
      <div class="analytics-card">
        <div class="card-icon purple">${icons.calendar}</div>
        <div class="card-info">
          <div class="card-label">Total Events</div>
          <div class="card-value" id="pt-events">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon blue">${icons.users}</div>
        <div class="card-info">
          <div class="card-label">Total Registrations</div>
          <div class="card-value" id="pt-regs">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon green">${icons.check}</div>
        <div class="card-info">
          <div class="card-label">Attended</div>
          <div class="card-value" id="pt-attended">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon orange">${icons.clock}</div>
        <div class="card-info">
          <div class="card-label">Pending</div>
          <div class="card-value" id="pt-pending">—</div>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="pt-filter-bar">
      <div class="search-input" style="flex:1;min-width:200px;">
        ${icons.search}
        <input type="text" id="pt-search" placeholder="Search by student name, email, college..." />
      </div>
      <select id="pt-event-filter" class="form-input" style="width:auto;min-width:220px;">
        <option value="">All Events</option>
      </select>
      <select id="pt-status-filter" class="form-input" style="width:auto;">
        <option value="">All Status</option>
        <option value="registered">Registered</option>
        <option value="attended">Attended</option>
        <option value="absent">Absent</option>
      </select>
      <button class="btn btn-primary btn-sm" id="pt-filter-btn">${icons.search} Filter</button>
      <button class="btn btn-secondary btn-sm" id="pt-export-btn">${icons.download} Export Excel</button>
    </div>

    <!-- TABLE -->
    <div id="pt-table-section">
      <div class="loading-state">Loading participants...</div>
    </div>

    <!-- DETAIL MODAL -->
    <div id="pt-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;align-items:center;justify-content:center;padding:var(--space-6);">
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);" id="pt-modal-overlay"></div>
      <div style="position:relative;z-index:1;background:var(--bg-card);border-radius:var(--radius-2xl);max-width:580px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,0.35);animation:slideUp 0.3s ease-out;" id="pt-modal-content"></div>
    </div>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    loadAll(main, user);
}

// ---- Load everything ----
async function loadAll(main, user) {
    try {
        const [statsRes, eventsRes, regsRes] = await Promise.all([
            fetch(`${API}/analytics/admin`,       { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API}/events`,                { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API}/registrations/all-admin`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
        ]);

        const statsData = await statsRes.json();
        const eventsData = await eventsRes.json();
        const regsData   = await regsRes.json();

        // Stats
        if (statsData.success) {
            const s = statsData.stats;
            main.querySelector('#pt-events').textContent   = s.totalEvents;
            main.querySelector('#pt-regs').textContent     = s.totalRegistrations;
        }

        const allRegs = regsData.success ? regsData.registrations : [];

        // Attended / pending counts
        const attended = allRegs.filter(r => r.status === 'attended').length;
        const pending  = allRegs.filter(r => r.status === 'registered').length;
        main.querySelector('#pt-attended').textContent = attended;
        main.querySelector('#pt-pending').textContent  = pending;

        // Populate event filter
        const myEvents = eventsData.success
            ? eventsData.events.filter(e => e.college === user.college)
            : [];

        const eventSelect = main.querySelector('#pt-event-filter');
        myEvents.forEach(ev => {
            const opt = document.createElement('option');
            opt.value = ev._id;
            opt.textContent = ev.title.length > 35 ? ev.title.slice(0,35) + '…' : ev.title;
            eventSelect.appendChild(opt);
        });

        // Render table
        renderTable(main, allRegs, allRegs);

        // Filter logic
        const applyFilters = () => {
            const search  = main.querySelector('#pt-search').value.trim().toLowerCase();
            const eventId = main.querySelector('#pt-event-filter').value;
            const status  = main.querySelector('#pt-status-filter').value;

            const filtered = allRegs.filter(reg => {
                const s = reg.student || {};
                const e = reg.event   || {};
                const matchSearch = !search ||
                    (s.name  || '').toLowerCase().includes(search) ||
                    (s.email || '').toLowerCase().includes(search) ||
                    (s.college || '').toLowerCase().includes(search);
                const matchEvent  = !eventId || e._id === eventId;
                const matchStatus = !status  || reg.status === status;
                return matchSearch && matchEvent && matchStatus;
            });

            renderTable(main, filtered, allRegs);
        };

        main.querySelector('#pt-filter-btn').addEventListener('click', applyFilters);
        main.querySelector('#pt-search').addEventListener('keyup', e => { if (e.key === 'Enter') applyFilters(); });
        main.querySelector('#pt-event-filter').addEventListener('change', applyFilters);
        main.querySelector('#pt-status-filter').addEventListener('change', applyFilters);

        // Export
        main.querySelector('#pt-export-btn').addEventListener('click', () => {
            const search  = main.querySelector('#pt-search').value.trim().toLowerCase();
            const eventId = main.querySelector('#pt-event-filter').value;
            const status  = main.querySelector('#pt-status-filter').value;
            const filtered = allRegs.filter(reg => {
                const s = reg.student || {};
                const e = reg.event   || {};
                const matchSearch = !search || (s.name||'').toLowerCase().includes(search) || (s.email||'').toLowerCase().includes(search);
                const matchEvent  = !eventId || e._id === eventId;
                const matchStatus = !status  || reg.status === status;
                return matchSearch && matchEvent && matchStatus;
            });
            exportExcel(filtered);
        });

    } catch (err) {
        main.querySelector('#pt-table-section').innerHTML = '<div class="empty-state">Network error. Is backend running?</div>';
    }
}

// ---- Render table ----
function renderTable(main, registrations, allRegs) {
    const section = main.querySelector('#pt-table-section');

    if (!registrations.length) {
        section.innerHTML = '<div class="empty-state" style="padding:var(--space-12);">No participants found.</div>';
        return;
    }

    section.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
      <span style="font-size:var(--text-sm);color:var(--text-muted);">Showing <strong style="color:var(--text-primary);">${registrations.length}</strong> of ${allRegs.length} registrations</span>
    </div>
    <div class="table-wrapper">
      <table id="pt-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>College</th>
            <th>Department</th>
            <th>Year</th>
            <th>Event</th>
            <th>Reg. Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${registrations.map((reg, i) => {
            const s    = reg.student || {};
            const ev   = reg.event   || {};
            const date = new Date(reg.registeredAt || reg.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
            const init = (s.name || 'S').charAt(0).toUpperCase();
            const statusClass = reg.status === 'attended' ? 'badge-success' : reg.status === 'absent' ? 'badge-danger' : 'badge-warning';

            return `
            <tr>
              <td style="color:var(--text-muted);font-size:var(--text-xs);">${i+1}</td>
              <td>
                <div class="user-cell">
                  <div style="width:34px;height:34px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0;">${init}</div>
                  <div>
                    <div style="font-weight:600;color:var(--text-primary);font-size:var(--text-sm);">${s.name || '—'}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-muted);">${s.email || ''}</div>
                  </div>
                </div>
              </td>
              <td style="font-size:var(--text-sm);">${s.college || '—'}</td>
              <td style="font-size:var(--text-sm);">${s.department || '—'}</td>
              <td style="font-size:var(--text-sm);">${s.year ? `Year ${s.year}` : '—'}</td>
              <td style="font-size:var(--text-sm);max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${ev.title||''}">${ev.title || '—'}</td>
              <td style="font-size:var(--text-sm);white-space:nowrap;">${date}</td>
              <td>
                <select class="status-update-select" data-reg-id="${reg._id}" style="padding:4px 8px;border:1px solid var(--border-primary);border-radius:var(--radius-md);background:var(--bg-input);font-size:var(--text-xs);color:var(--text-primary);cursor:pointer;">
                  <option value="registered" ${reg.status==='registered'?'selected':''}>Registered</option>
                  <option value="attended"   ${reg.status==='attended'  ?'selected':''}>Attended</option>
                  <option value="absent"     ${reg.status==='absent'    ?'selected':''}>Absent</option>
                </select>
              </td>
              <td>
                <button class="btn btn-secondary btn-sm pt-view-btn"
                  data-reg='${JSON.stringify({
                    id: reg._id,
                    studentName: s.name||'—', studentEmail: s.email||'—',
                    college: s.college||'—', department: s.department||'—',
                    year: s.year||'—', phone: s.phone||'—',
                    eventTitle: ev.title||'—',
                    eventDate: ev.date ? new Date(ev.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—',
                    eventVenue: ev.venue||'TBA', eventCollege: ev.college||'—',
                    eventCategory: ev.category||'—', eventStatus: ev.status||'—',
                    status: reg.status, registeredOn: date,
                  }).replace(/'/g,"&#39;")}'>
                  View
                </button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

    // Status update
    section.querySelectorAll('.status-update-select').forEach(sel => {
        sel.addEventListener('change', async () => {
            try {
                const res  = await fetch(`${API}/registrations/${sel.dataset.regId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${getToken()}` },
                    body: JSON.stringify({ status: sel.value }),
                });
                const data = await res.json();
                if (data.success) showToast(`Status updated to "${sel.value}"`, 'success');
                else showToast(data.message || 'Update failed', 'error');
            } catch { showToast('Network error', 'error'); }
        });
    });

    // View detail
    section.querySelectorAll('.pt-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reg = JSON.parse(btn.dataset.reg.replace(/&#39;/g,"'"));
            showDetailModal(main, reg);
        });
    });
}

// ---- Detail Modal ----
function showDetailModal(main, reg) {
    const modal   = main.querySelector('#pt-modal');
    const content = main.querySelector('#pt-modal-content');
    const statusClass = reg.status === 'attended' ? 'badge-success' : reg.status === 'absent' ? 'badge-danger' : 'badge-warning';
    const initial = reg.studentName.charAt(0).toUpperCase();

    content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 28px;border-bottom:1px solid var(--border-primary);">
      <h3 style="font-size:var(--text-xl);font-weight:700;color:var(--text-primary);">Participant Details</h3>
      <button id="pt-modal-close" style="background:var(--bg-hover);border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div style="padding:28px;display:flex;flex-direction:column;gap:20px;">

      <!-- Student card -->
      <div style="display:flex;align-items:center;gap:16px;padding:20px;background:var(--bg-tertiary);border-radius:var(--radius-xl);border:1px solid var(--border-primary);">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;flex-shrink:0;">${initial}</div>
        <div>
          <div style="font-size:var(--text-xl);font-weight:700;color:var(--text-primary);">${reg.studentName}</div>
          <div style="font-size:var(--text-sm);color:var(--text-muted);margin-top:4px;">${reg.studentEmail}</div>
          <span class="badge ${statusClass}" style="margin-top:8px;display:inline-block;">${reg.status}</span>
        </div>
      </div>

      <!-- Student details -->
      <div>
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;">Student Information</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${[
            ['College',    reg.college],
            ['Department', reg.department],
            ['Year',       reg.year !== '—' ? `Year ${reg.year}` : '—'],
            ['Registered On', reg.registeredOn],
          ].map(([label, val]) => `
          <div style="background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);padding:14px;">
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${label}</div>
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">${val}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Event details -->
      <div>
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;">Event Information</div>
        <div style="background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:var(--radius-xl);padding:16px;display:flex;flex-direction:column;gap:12px;">
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Event Name</div>
            <div style="font-size:var(--text-md);font-weight:700;color:var(--text-primary);">${reg.eventTitle}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            ${[
              ['Date',     reg.eventDate],
              ['Venue',    reg.eventVenue],
              ['Hosted By',reg.eventCollege],
              ['Category', reg.eventCategory],
              ['Status',   reg.eventStatus],
            ].map(([label, val]) => `
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${label}</div>
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">${val}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>

    </div>

    <div style="display:flex;justify-content:flex-end;gap:12px;padding:16px 28px;border-top:1px solid var(--border-primary);background:var(--bg-tertiary);border-radius:0 0 var(--radius-2xl) var(--radius-2xl);">
      <button class="btn btn-secondary" id="pt-modal-close-btn">Close</button>
      <button class="btn btn-primary" id="pt-export-single-btn">${icons.download} Export Record</button>
    </div>`;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const close = () => { modal.style.display = 'none'; document.body.style.overflow = ''; };
    content.querySelector('#pt-modal-close').addEventListener('click', close);
    content.querySelector('#pt-modal-close-btn').addEventListener('click', close);
    main.querySelector('#pt-modal-overlay').addEventListener('click', close);

    content.querySelector('#pt-export-single-btn').addEventListener('click', () => {
        exportExcel([{
            student: { name: reg.studentName, email: reg.studentEmail, college: reg.college, department: reg.department, year: reg.year },
            event:   { title: reg.eventTitle, date: reg.eventDate, college: reg.eventCollege, category: reg.eventCategory },
            status: reg.status, registeredAt: reg.registeredOn,
        }], `Participant_${reg.studentName.replace(/\s+/g,'_')}`);
    });
}

// ---- Export Excel ----
function exportExcel(registrations, filename) {
    const headers = ['#','Student Name','Email','College','Department','Year','Event','Event Date','Event College','Category','Status','Registered On'];
    const rows = registrations.map((reg, i) => {
        const s = reg.student || {};
        const e = reg.event   || {};
        const date = reg.registeredAt
            ? (typeof reg.registeredAt === 'string' && reg.registeredAt.includes('/')
                ? reg.registeredAt
                : new Date(reg.registeredAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}))
            : '—';
        const evDate = e.date
            ? (typeof e.date === 'string' && e.date.includes('/')
                ? e.date
                : new Date(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}))
            : '—';
        return [
            i+1,
            s.name||'—', s.email||'—', s.college||'—', s.department||'—',
            s.year ? `Year ${s.year}` : '—',
            e.title||'—', evDate, e.college||'—', e.category||'—',
            reg.status||'—', date,
        ];
    });

    const escape = v => `"${String(v).replace(/"/g,'""')}"`;
    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = (filename || `Participants_${new Date().toISOString().slice(0,10)}`)+'.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Excel file downloaded! 📊', 'success');
}
