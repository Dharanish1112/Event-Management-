// ============================================
// ANALYTICS PAGE — Admin, connected to backend
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { createBarChart, createLineChart, createDoughnutChart } from '../components/charts.js';
import { navigate } from '../main.js';

const API = 'https://event-management-nroc.onrender.com/api';
function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

export function renderAnalytics(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user || user.role !== 'admin') { navigate('login'); return; }

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, 'admin', 'analytics');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, { showSearch: false });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <div class="overline">Admin Panel</div>
      <h1>Analytics</h1>
      <p>Insights and performance metrics for your college events.</p>
    </div>

    <!-- STAT CARDS -->
    <div class="analytics-grid" id="analytics-stats">
      <div class="analytics-card">
        <div class="card-icon purple">${icons.calendar}</div>
        <div class="card-info">
          <div class="card-label">Total Events</div>
          <div class="card-value" id="an-events">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon blue">${icons.users}</div>
        <div class="card-info">
          <div class="card-label">Total Registrations</div>
          <div class="card-value" id="an-regs">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon green">${icons.trophy}</div>
        <div class="card-info">
          <div class="card-label">Winners Declared</div>
          <div class="card-value" id="an-winners">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon orange">${icons.award}</div>
        <div class="card-info">
          <div class="card-label">Upcoming Events</div>
          <div class="card-value" id="an-upcoming">—</div>
        </div>
      </div>
    </div>

    <!-- CHARTS ROW 1 -->
    <div class="charts-row" style="margin-bottom:var(--space-8);">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Registrations per Event</h3>
        </div>
        <div style="height:280px;">
          <canvas id="chart-regs-per-event"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>Events by Category</h3>
        </div>
        <div style="position:relative;height:220px;display:flex;align-items:center;justify-content:center;">
          <canvas id="chart-category"></canvas>
        </div>
        <div id="category-legend" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:var(--space-4);justify-content:center;"></div>
      </div>
    </div>

    <!-- CHARTS ROW 2 -->
    <div class="charts-row" style="margin-bottom:var(--space-8);">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Registrations Over Time</h3>
        </div>
        <div style="height:280px;">
          <canvas id="chart-regs-time"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>Event Status Breakdown</h3>
        </div>
        <div style="position:relative;height:220px;display:flex;align-items:center;justify-content:center;">
          <canvas id="chart-status"></canvas>
        </div>
        <div id="status-legend" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:var(--space-4);justify-content:center;"></div>
      </div>
    </div>

    <!-- TOP EVENTS TABLE -->
    <div class="card" style="margin-bottom:var(--space-8);">
      <div class="card-body">
        <div class="section-header">
          <h2>Event Performance</h2>
        </div>
        <div id="event-performance-table">
          <div class="loading-state">Loading...</div>
        </div>
      </div>
    </div>

    <!-- COLLEGE BREAKDOWN -->
    <div class="card">
      <div class="card-body">
        <div class="section-header">
          <h2>Registrations by College</h2>
        </div>
        <div id="college-breakdown">
          <div class="loading-state">Loading...</div>
        </div>
      </div>
    </div>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    loadAnalytics(main, user);
}

async function loadAnalytics(main, user) {
    try {
        const [statsRes, eventsRes, regsRes] = await Promise.all([
            fetch(`${API}/analytics/admin`,         { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API}/events`,                  { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API}/registrations/all-admin`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
        ]);

        const statsData  = await statsRes.json();
        const eventsData = await eventsRes.json();
        const regsData   = await regsRes.json();

        const myEvents = eventsData.success
            ? eventsData.events.filter(e => e.college === user.college)
            : [];

        const allRegs = regsData.success ? regsData.registrations : [];

        // ---- Stat cards ----
        if (statsData.success) {
            const s = statsData.stats;
            main.querySelector('#an-events').textContent   = s.totalEvents;
            main.querySelector('#an-regs').textContent     = s.totalRegistrations;
            main.querySelector('#an-winners').textContent  = s.totalWinners;
            main.querySelector('#an-upcoming').textContent = s.upcomingEvents;
        }

        // Wait for DOM to be ready
        setTimeout(() => {
            buildCharts(main, myEvents, allRegs);
            buildEventTable(main, myEvents);
            buildCollegeBreakdown(main, allRegs);
        }, 100);

    } catch (err) {
        console.error(err);
    }
}

function buildCharts(main, events, registrations) {

    // ---- 1. Registrations per Event (bar) ----
    const regPerEventCanvas = main.querySelector('#chart-regs-per-event');
    if (regPerEventCanvas && events.length) {
        const labels = events.map(e => e.title.length > 18 ? e.title.slice(0,18)+'…' : e.title);
        const data   = events.map(e => e.registeredCount || 0);
        createBarChart(regPerEventCanvas, labels, data, 'Registrations');
    }

    // ---- 2. Events by Category (doughnut) ----
    const catCanvas = main.querySelector('#chart-category');
    if (catCanvas && events.length) {
        const catMap = {};
        events.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + 1; });
        const catLabels = Object.keys(catMap);
        const catData   = Object.values(catMap);
        const catColors = ['#6366F1','#10B981','#F59E0B','#3B82F6','#EF4444','#8B5CF6'];

        createDoughnutChart(catCanvas, catLabels, catData, catColors.slice(0, catLabels.length));

        // Legend
        const legend = main.querySelector('#category-legend');
        legend.innerHTML = catLabels.map((l, i) => `
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);">
          <span style="width:10px;height:10px;border-radius:50%;background:${catColors[i]};flex-shrink:0;"></span>
          ${l} (${catData[i]})
        </div>`).join('');
    }

    // ---- 3. Registrations over time (line) ----
    const timeCanvas = main.querySelector('#chart-regs-time');
    if (timeCanvas) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const counts = new Array(12).fill(0);
        registrations.forEach(r => {
            const m = new Date(r.registeredAt || r.createdAt).getMonth();
            if (m >= 0 && m < 12) counts[m]++;
        });
        createLineChart(timeCanvas, months, counts, 'Registrations');
    }

    // ---- 4. Event Status (doughnut) ----
    const statusCanvas = main.querySelector('#chart-status');
    if (statusCanvas && events.length) {
        const statusMap = { upcoming: 0, ongoing: 0, completed: 0, cancelled: 0 };
        events.forEach(e => { if (statusMap[e.status] !== undefined) statusMap[e.status]++; });
        const sLabels = Object.keys(statusMap).filter(k => statusMap[k] > 0);
        const sData   = sLabels.map(k => statusMap[k]);
        const sColors = { upcoming:'#10B981', ongoing:'#F59E0B', completed:'#6366F1', cancelled:'#EF4444' };

        createDoughnutChart(statusCanvas, sLabels, sData, sLabels.map(l => sColors[l]));

        const legend = main.querySelector('#status-legend');
        legend.innerHTML = sLabels.map(l => `
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);">
          <span style="width:10px;height:10px;border-radius:50%;background:${sColors[l]};flex-shrink:0;"></span>
          ${l} (${statusMap[l]})
        </div>`).join('');
    }
}

function buildEventTable(main, events) {
    const section = main.querySelector('#event-performance-table');

    if (!events.length) {
        section.innerHTML = '<div class="empty-state" style="padding:var(--space-8);">No events yet.</div>';
        return;
    }

    // Sort by registeredCount desc
    const sorted = [...events].sort((a, b) => b.registeredCount - a.registeredCount);

    section.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Event</th>
            <th>Category</th>
            <th>Date</th>
            <th>Registered</th>
            <th>Capacity</th>
            <th>Fill Rate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((ev, i) => {
            const date     = new Date(ev.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
            const fillRate = ev.maxParticipants > 0 ? Math.round((ev.registeredCount / ev.maxParticipants) * 100) : 0;
            const fillColor = fillRate >= 80 ? 'var(--danger)' : fillRate >= 50 ? 'var(--warning)' : 'var(--success)';
            const statusClass = ev.status === 'upcoming' ? 'badge-success' : ev.status === 'ongoing' ? 'badge-warning' : 'badge-info';

            return `
            <tr>
              <td style="color:var(--text-muted);font-size:var(--text-xs);">${i+1}</td>
              <td style="font-weight:600;color:var(--text-primary);max-width:200px;">${ev.title}</td>
              <td><span class="badge badge-primary" style="text-transform:capitalize;">${ev.category}</span></td>
              <td style="white-space:nowrap;font-size:var(--text-sm);">${date}</td>
              <td style="font-weight:700;color:var(--text-primary);">${ev.registeredCount}</td>
              <td style="color:var(--text-muted);">${ev.maxParticipants}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${fillRate}%;background:${fillColor};border-radius:3px;transition:width 0.5s;"></div>
                  </div>
                  <span style="font-size:var(--text-xs);font-weight:600;color:${fillColor};min-width:32px;">${fillRate}%</span>
                </div>
              </td>
              <td><span class="badge ${statusClass}">${ev.status}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function buildCollegeBreakdown(main, registrations) {
    const section = main.querySelector('#college-breakdown');

    if (!registrations.length) {
        section.innerHTML = '<div class="empty-state" style="padding:var(--space-8);">No registrations yet.</div>';
        return;
    }

    // Group by student college
    const collegeMap = {};
    registrations.forEach(r => {
        const college = r.student?.college || 'Unknown';
        collegeMap[college] = (collegeMap[college] || 0) + 1;
    });

    const sorted = Object.entries(collegeMap).sort((a, b) => b[1] - a[1]);
    const max    = sorted[0]?.[1] || 1;

    const colors = ['#6366F1','#10B981','#F59E0B','#3B82F6','#EF4444','#8B5CF6','#EC4899','#14B8A6'];

    section.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:var(--space-4);">
      ${sorted.map(([college, count], i) => {
        const pct   = Math.round((count / max) * 100);
        const color = colors[i % colors.length];
        return `
        <div style="display:flex;align-items:center;gap:var(--space-4);">
          <div style="width:180px;font-size:var(--text-sm);font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0;">${college}</div>
          <div style="flex:1;height:10px;background:var(--bg-tertiary);border-radius:5px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${color};border-radius:5px;transition:width 0.6s ease;"></div>
          </div>
          <div style="width:40px;text-align:right;font-size:var(--text-sm);font-weight:700;color:var(--text-primary);flex-shrink:0;">${count}</div>
        </div>`;
      }).join('')}
    </div>`;
}
