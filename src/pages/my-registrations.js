// ============================================
// MY REGISTRATIONS PAGE
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { navigate, showToast } from '../main.js';

const API = 'http://localhost:5001/api';
function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

const categoryColors = {
    technical: '#3B82F6', cultural: '#8B5CF6', sports: '#F59E0B',
    academic: '#10B981',  workshop: '#EF4444', other:  '#6B7280',
};

export function renderMyRegistrations(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user) { navigate('login'); return; }

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, 'student', 'my-registrations');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, { showSearch: false });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <div class="overline">My Activity</div>
      <h1>My Registrations</h1>
      <p>All events you have registered for.</p>
    </div>

    <!-- FILTER TABS -->
    <div class="reg-filter-tabs" id="reg-tabs">
      <button class="reg-tab active" data-status="">All</button>
      <button class="reg-tab" data-status="registered">Registered</button>
      <button class="reg-tab" data-status="attended">Attended</button>
      <button class="reg-tab" data-status="absent">Absent</button>
    </div>

    <!-- STATS ROW -->
    <div class="analytics-grid" style="margin-bottom:var(--space-8);">
      <div class="analytics-card">
        <div class="card-icon purple">${icons.ticket}</div>
        <div class="card-info">
          <div class="card-label">Total Registered</div>
          <div class="card-value" id="rs-total">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon green">${icons.check}</div>
        <div class="card-info">
          <div class="card-label">Attended</div>
          <div class="card-value" id="rs-attended">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon orange">${icons.clock}</div>
        <div class="card-info">
          <div class="card-label">Upcoming</div>
          <div class="card-value" id="rs-upcoming">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon blue">${icons.trophy}</div>
        <div class="card-info">
          <div class="card-label">Won</div>
          <div class="card-value" id="rs-won">—</div>
        </div>
      </div>
    </div>

    <!-- REGISTRATIONS LIST -->
    <div id="reg-list">
      <div class="loading-state">Loading your registrations...</div>
    </div>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    loadRegistrations(main, user);
}

async function loadRegistrations(main, user) {
    try {
        const [regsRes, winsRes] = await Promise.all([
            fetch(`${API}/registrations/my`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API}/winners/student/${user.id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
        ]);

        const regsData = await regsRes.json();
        const winsData = await winsRes.json();

        if (!regsData.success) {
            main.querySelector('#reg-list').innerHTML = '<div class="empty-state">Failed to load registrations.</div>';
            return;
        }

        const registrations = regsData.registrations || [];
        const winners       = winsData.success ? winsData.winners : [];

        // Build a set of won event IDs
        const wonEventIds = new Set(winners.map(w => w.event?._id || w.event));

        // Stats
        const attended = registrations.filter(r => r.status === 'attended').length;
        const upcoming = registrations.filter(r => {
            const ev = r.event || {};
            return ev.status === 'upcoming' || ev.status === 'ongoing';
        }).length;

        main.querySelector('#rs-total').textContent    = registrations.length;
        main.querySelector('#rs-attended').textContent = attended;
        main.querySelector('#rs-upcoming').textContent = upcoming;
        main.querySelector('#rs-won').textContent      = winners.length;

        // Render with current filter
        let activeFilter = '';
        renderList(main, registrations, wonEventIds, activeFilter);

        // Tab filter
        main.querySelectorAll('.reg-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                main.querySelectorAll('.reg-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeFilter = tab.dataset.status;
                renderList(main, registrations, wonEventIds, activeFilter);
            });
        });

    } catch (err) {
        main.querySelector('#reg-list').innerHTML = '<div class="empty-state">Network error. Is backend running?</div>';
    }
}

function renderList(main, registrations, wonEventIds, filter) {
    const list = main.querySelector('#reg-list');

    const filtered = filter
        ? registrations.filter(r => r.status === filter)
        : registrations;

    if (!filtered.length) {
        list.innerHTML = `<div class="empty-state" style="padding:var(--space-12);">
          ${filter ? `No ${filter} registrations.` : 'No registrations yet.'}
          <br><br>
          <button class="btn btn-primary" onclick="window.location.hash='events'">Browse Events →</button>
        </div>`;
        return;
    }

    list.innerHTML = `
    <div class="my-reg-list">
      ${filtered.map(reg => {
        const ev       = reg.event || {};
        const date     = ev.date ? new Date(ev.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—';
        const deadline = ev.registrationDeadline ? new Date(ev.registrationDeadline).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
        const regDate  = new Date(reg.registeredAt || reg.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
        const bg       = categoryColors[ev.category] || '#6B7280';
        const isWon    = wonEventIds.has(ev._id);

        const statusClass = reg.status === 'attended' ? 'badge-success'
                          : reg.status === 'absent'   ? 'badge-danger'
                          : 'badge-warning';

        const eventStatusClass = ev.status === 'upcoming'  ? 'badge-success'
                               : ev.status === 'ongoing'   ? 'badge-warning'
                               : ev.status === 'completed' ? 'badge-info'
                               : 'badge-info';

        return `
        <div class="my-reg-card ${isWon ? 'won-card' : ''}">
          <!-- Left color strip -->
          <div class="my-reg-strip" style="background:${bg};"></div>

          <!-- Event banner (small) -->
          <div class="my-reg-banner" style="background:linear-gradient(135deg,${bg}cc,${bg});">
            <span style="font-size:28px;">${isWon ? '🏆' : getCategoryEmoji(ev.category)}</span>
          </div>

          <!-- Main content -->
          <div class="my-reg-content">
            <div class="my-reg-top">
              <div>
                <div class="my-reg-title">${ev.title || '—'}</div>
                <div class="my-reg-college">${ev.college || '—'}</div>
              </div>
              <div class="my-reg-badges">
                <span class="badge ${eventStatusClass}">${ev.status || '—'}</span>
                <span class="badge ${statusClass}">${reg.status}</span>
                ${isWon ? '<span class="badge badge-warning">🏆 Winner</span>' : ''}
              </div>
            </div>

            <div class="my-reg-details">
              <div class="my-reg-detail-item">
                ${icons.calendar}
                <div>
                  <div class="my-reg-detail-label">Event Date</div>
                  <div class="my-reg-detail-value">${date}</div>
                </div>
              </div>
              <div class="my-reg-detail-item">
                ${icons.mapPin}
                <div>
                  <div class="my-reg-detail-label">Venue</div>
                  <div class="my-reg-detail-value">${ev.venue || 'TBA'}</div>
                </div>
              </div>
              <div class="my-reg-detail-item">
                ${icons.clock}
                <div>
                  <div class="my-reg-detail-label">Reg. Deadline</div>
                  <div class="my-reg-detail-value">${deadline}</div>
                </div>
              </div>
              <div class="my-reg-detail-item">
                ${icons.ticket}
                <div>
                  <div class="my-reg-detail-label">Registered On</div>
                  <div class="my-reg-detail-value">${regDate}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="my-reg-actions">
            ${isWon ? `
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='certificate'">
              ${icons.award} Certificate
            </button>` : ''}
            <span class="badge" style="background:${bg}22;color:${bg};font-size:11px;">${(ev.category || 'event').toUpperCase()}</span>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function getCategoryEmoji(category) {
    const map = { technical:'💻', cultural:'🎭', sports:'⚽', academic:'📚', workshop:'🔧', other:'📌' };
    return map[category] || '📌';
}
