// ============================================
// ADMIN DASHBOARD — Connected to backend
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { navigate, showToast } from '../main.js';

const API = 'http://localhost:5001/api';

function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

export function renderAdminDashboard(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user || user.role !== 'admin') { navigate('login'); return; }

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, 'admin', 'admin-dashboard');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, {
        showSearch: false,
        actions: [{ label: '+ Create Event', type: 'primary', action: 'create-event' }]
    });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <div class="overline">Admin Panel</div>
      <h1>Welcome back, ${user.name} 👋</h1>
      <p>Overview of your events and student registrations.</p>
    </div>

    <!-- STATS -->
    <div class="analytics-grid" id="stats-grid">
      <div class="analytics-card">
        <div class="card-icon purple">${icons.calendar}</div>
        <div class="card-info">
          <div class="card-label">Total Events</div>
          <div class="card-value" id="stat-events">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon blue">${icons.users}</div>
        <div class="card-info">
          <div class="card-label">Total Registrations</div>
          <div class="card-value" id="stat-regs">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon green">${icons.trophy}</div>
        <div class="card-info">
          <div class="card-label">Upcoming Events</div>
          <div class="card-value" id="stat-upcoming">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon orange">${icons.award}</div>
        <div class="card-info">
          <div class="card-label">Completed Events</div>
          <div class="card-value" id="stat-completed">—</div>
        </div>
      </div>
    </div>

    <!-- MY EVENTS -->
    <div class="card" style="margin-bottom:var(--space-8);">
      <div class="card-body">
        <div class="section-header">
          <h2>My Events</h2>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='create-event'">+ New Event</button>
        </div>
        <div id="my-events-list">
          <div class="loading-state" style="padding:var(--space-8);">Loading...</div>
        </div>
      </div>
    </div>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    loadDashboard(main, user);
}

async function loadDashboard(main, user) {
    try {
        const [statsRes, eventsRes] = await Promise.all([
            fetch(`${API}/analytics/admin`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API}/events`,          { headers: { 'Authorization': `Bearer ${getToken()}` } }),
        ]);

        const statsData  = await statsRes.json();
        const eventsData = await eventsRes.json();

        // ---- Stats ----
        if (statsData.success) {
            const s = statsData.stats;
            main.querySelector('#stat-events').textContent    = s.totalEvents;
            main.querySelector('#stat-regs').textContent      = s.totalRegistrations;
            main.querySelector('#stat-upcoming').textContent  = s.upcomingEvents;
            main.querySelector('#stat-completed').textContent = s.completedEvents;
        }

        // ---- My Events ----
        const myEvents = eventsData.success
            ? eventsData.events.filter(e => e.createdBy?._id === user.id || e.college === user.college)
            : [];

        renderMyEvents(main, myEvents);

    } catch (err) {
        console.error(err);
        showToast('Failed to load dashboard data', 'error');
    }
}

// ---- Render my events list ----
function renderMyEvents(main, events) {
    const list = main.querySelector('#my-events-list');

    if (!events.length) {
        list.innerHTML = `<div class="empty-state" style="padding:var(--space-8);">No events yet. <a href="#create-event" style="color:var(--primary-600);font-weight:600;">Create one →</a></div>`;
        return;
    }

    list.innerHTML = events.map(ev => {
        const date = new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const statusClass = ev.status === 'upcoming' ? 'badge-success' : ev.status === 'ongoing' ? 'badge-warning' : 'badge-info';

        return `
        <div class="admin-event-row" data-event-id="${ev._id}">
          <div class="admin-event-info">
            <div class="admin-event-name">${ev.title}</div>
            <div class="admin-event-meta">
              ${icons.calendar} ${date} &nbsp;·&nbsp;
              ${icons.users} ${ev.registeredCount}/${ev.maxParticipants}
            </div>
          </div>
          <div class="admin-event-actions">
            <span class="badge ${statusClass}">${ev.status}</span>
            <button class="btn btn-secondary btn-sm" onclick="window.location.hash='participant-tracking'" title="View participants">
              ${icons.users} Track
            </button>
          </div>
        </div>`;
    }).join('');
}

