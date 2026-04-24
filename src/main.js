// ============================================
// MAIN APP — Event Management
// Hash-based SPA Router + Dark Mode
// ============================================

import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderStudentDashboard } from './pages/student-dashboard.js';
import { renderEventsExplore } from './pages/events-explore.js';
import { renderAdminDashboard } from './pages/admin-dashboard.js';
import { renderCreateEvent } from './pages/create-event.js';
import { renderWinnerManagement } from './pages/winner-management.js';
import { renderCertificate } from './pages/certificate.js';
import { renderProfile } from './pages/profile.js';
import { renderMyRegistrations } from './pages/my-registrations.js';
import { renderParticipantTracking } from './pages/participant-tracking.js';
import { renderAnalytics } from './pages/analytics.js';

const app = document.getElementById('app');

// ---- DARK MODE ----
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  }
}
export function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

// ---- TOAST SYSTEM ----
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---- ROUTER ----
const routes = {
  '': renderLanding,
  'login': renderLogin,
  'student-dashboard': renderStudentDashboard,
  'events': renderEventsExplore,
  'admin-dashboard': renderAdminDashboard,
  'create-event': renderCreateEvent,
  'winner-management': renderWinnerManagement,
  'certificate': renderCertificate,
  'profile': renderProfile,
  'my-registrations': renderMyRegistrations,
  'participant-tracking': renderParticipantTracking,
  'analytics': renderAnalytics,
};

function getHash() {
  return window.location.hash.slice(1) || '';
}

function router() {
  const route = getHash();
  const renderer = routes[route] || renderLanding;
  app.innerHTML = '';
  renderer(app);
}

export function navigate(hash) {
  window.location.hash = hash;
}

// ---- INIT ----
initTheme();
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
router();
