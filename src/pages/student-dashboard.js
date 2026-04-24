// ============================================
// STUDENT DASHBOARD — Connected to backend
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { createBarChart, createDoughnutChart } from '../components/charts.js';
import { navigate } from '../main.js';

const API = 'http://localhost:5001/api';
function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

export function renderStudentDashboard(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user) { navigate('login'); return; }

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, 'student', 'student-dashboard');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, {
        showSearch: false,
        actions: [{ label: 'Browse Events', type: 'primary', icon: 'sparkles', action: 'events' }]
    });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <div class="overline">Student Dashboard</div>
      <h1>Welcome back, ${user.name} 👋</h1>
      <p>${user.college || ''} ${user.department ? '· ' + user.department : ''} ${user.year ? '· Year ' + user.year : ''}</p>
    </div>

    <!-- STATS -->
    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="card-icon purple">${icons.calendar}</div>
        <div class="card-info">
          <div class="card-label">Events Registered</div>
          <div class="card-value" id="stat-registered">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon green">${icons.trophy}</div>
        <div class="card-info">
          <div class="card-label">Events Won</div>
          <div class="card-value" id="stat-wins">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon orange">${icons.award}</div>
        <div class="card-info">
          <div class="card-label">Certificates Earned</div>
          <div class="card-value" id="stat-certs">—</div>
        </div>
      </div>
      <div class="analytics-card">
        <div class="card-icon blue">${icons.target}</div>
        <div class="card-info">
          <div class="card-label">Win Rate</div>
          <div class="card-value" id="stat-winrate">—</div>
        </div>
      </div>
    </div>

    <!-- CHARTS -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h3>My Registrations</h3>
        </div>
        <div style="height:260px;">
          <canvas id="participation-chart"></canvas>
        </div>
      </div>
      <div class="chart-card win-ratio-card">
        <div class="chart-header" style="width:100%;">
          <h3>Win Ratio</h3>
        </div>
        <div class="win-ratio-chart">
          <canvas id="win-ratio-chart"></canvas>
          <div class="win-ratio-center">
            <div class="percentage" id="win-ratio-pct">0%</div>
            <div class="label">Overall</div>
          </div>
        </div>
        <div class="win-ratio-stats">
          <div class="win-ratio-stat">
            <span class="stat-label"><span class="dot" style="background:#6366F1"></span> Wins</span>
            <span class="stat-value" id="wr-wins">0</span>
          </div>
          <div class="win-ratio-stat">
            <span class="stat-label"><span class="dot" style="background:#C7D2FE"></span> Registered</span>
            <span class="stat-value" id="wr-regs">0</span>
          </div>
        </div>
      </div>
    </div>

    <!-- MY REGISTRATIONS -->
    <div class="section-header">
      <h2>My Registered Events</h2>
      <a class="link" onclick="window.location.hash='events'">Browse More →</a>
    </div>
    <div id="my-events-section">
      <div class="loading-state">Loading your events...</div>
    </div>

    <!-- RECENT WINS -->
    <div class="section-header" style="margin-top:var(--space-8);">
      <h2>My Wins & Certificates</h2>
      <a class="link" onclick="window.location.hash='certificate'">View All →</a>
    </div>
    <div id="my-wins-section">
      <div class="loading-state">Loading...</div>
    </div>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    loadDashboardData(main, user);
}

async function loadDashboardData(main, user) {
    try {
        const [statsRes, regsRes, winsRes] = await Promise.all([
            fetch(`${API}/analytics/student`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API}/registrations/my`,  { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API}/winners/student/${user.id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
        ]);

        const statsData = await statsRes.json();
        const regsData  = await regsRes.json();
        const winsData  = await winsRes.json();

        // ---- Stats ----
        if (statsData.success) {
            const s = statsData.stats;
            main.querySelector('#stat-registered').textContent = s.totalRegistrations;
            main.querySelector('#stat-wins').textContent       = s.wins;
            main.querySelector('#stat-certs').textContent      = s.wins;
            main.querySelector('#stat-winrate').textContent    = s.winRate + '%';
            main.querySelector('#win-ratio-pct').textContent   = s.winRate + '%';
            main.querySelector('#wr-wins').textContent         = s.wins;
            main.querySelector('#wr-regs').textContent         = s.totalRegistrations;

            // Charts
            setTimeout(() => {
                const partCanvas = document.getElementById('participation-chart');
                if (partCanvas) {
                    // Group registrations by month
                    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    const counts = new Array(12).fill(0);
                    if (regsData.success) {
                        regsData.registrations.forEach(r => {
                            const m = new Date(r.registeredAt || r.createdAt).getMonth();
                            counts[m]++;
                        });
                    }
                    createBarChart(partCanvas, months, counts);
                }
                const winCanvas = document.getElementById('win-ratio-chart');
                if (winCanvas) {
                    const wins = s.wins || 0;
                    const rest = Math.max(0, (s.totalRegistrations || 0) - wins);
                    createDoughnutChart(winCanvas, ['Wins','Others'], [wins || 0, rest || 1], ['#6366F1','#E0E7FF']);
                }
            }, 100);
        }

        // ---- My Registrations ----
        renderMyRegistrations(main, regsData.success ? regsData.registrations : []);

        // ---- My Wins ----
        renderMyWins(main, winsData.success ? winsData.winners : []);

    } catch (err) {
        console.error(err);
    }
}

function renderMyRegistrations(main, registrations) {
    const section = main.querySelector('#my-events-section');

    if (!registrations.length) {
        section.innerHTML = `<div class="empty-state" style="padding:var(--space-8);">
          No events registered yet. <a href="#events" style="color:var(--primary-600);font-weight:600;">Browse events →</a>
        </div>`;
        return;
    }

    const categoryColors = { technical:'#3B82F6', cultural:'#8B5CF6', sports:'#F59E0B', academic:'#10B981', workshop:'#EF4444', other:'#6B7280' };

    section.innerHTML = `<div class="events-scroll">
      ${registrations.slice(0, 6).map(reg => {
        const ev   = reg.event || {};
        const date = ev.date ? new Date(ev.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
        const bg   = categoryColors[ev.category] || '#6B7280';
        const statusClass = reg.status === 'attended' ? 'badge-success' : reg.status === 'absent' ? 'badge-danger' : 'badge-warning';

        return `
        <div class="event-card-dash">
          <div class="event-img" style="background:linear-gradient(135deg,${bg}cc,${bg});">
            <span class="badge badge-primary event-badge">${(ev.category || 'event').toUpperCase()}</span>
          </div>
          <div class="event-body">
            <div class="event-date">${date}</div>
            <div class="event-title">${ev.title || '—'}</div>
            <div class="event-location">${icons.mapPin} ${ev.venue || ev.college || 'TBA'}</div>
            <div class="event-footer">
              <span class="badge ${statusClass}">${reg.status}</span>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function renderMyWins(main, winners) {
    const section = main.querySelector('#my-wins-section');

    if (!winners.length) {
        section.innerHTML = `<div class="empty-state" style="padding:var(--space-8);">
          No wins yet. Keep participating! 💪
        </div>`;
        return;
    }

    const posEmoji = { '1st':'🥇', '2nd':'🥈', '3rd':'🥉', 'participant':'🎖️' };

    section.innerHTML = `
    <div class="activity-feed">
      ${winners.map(w => {
        const ev   = w.event || {};
        const date = ev.date ? new Date(ev.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
        return `
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--warning-bg);font-size:20px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;">
            ${posEmoji[w.position] || '🏅'}
          </div>
          <div class="activity-content">
            <div class="activity-title">${ev.title || '—'}</div>
            <div class="activity-desc">${w.position} Place · ${ev.college || '—'} · ${date}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='certificate'">
            ${icons.award} Certificate
          </button>
        </div>`;
      }).join('')}
    </div>`;
}
