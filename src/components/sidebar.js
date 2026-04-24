// ============================================
// SIDEBAR COMPONENT
// ============================================

import { icons } from './icons.js';
import { navigate } from '../main.js';

const studentNav = [
    { id: 'student-dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'my-registrations', label: 'My Registrations', icon: 'ticket' },
    { id: 'certificate', label: 'Certificates', icon: 'award' },
    { id: 'profile', label: 'Profile', icon: 'user' },
];

const adminNav = [
    { id: 'admin-dashboard',      label: 'Admin Dashboard',      icon: 'dashboard' },
    { id: 'create-event',         label: 'Event Management',     icon: 'calendar' },
    { id: 'participant-tracking', label: 'Participant Tracking',  icon: 'users' },
    { id: 'winner-management',    label: 'Winner Management',     icon: 'trophy' },
    { id: 'analytics',            label: 'Analytics',            icon: 'chart' },
];

// Get logged-in user from localStorage
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch { return null; }
}

export function renderSidebar(container, role = 'student', activeId = '') {
    const navItems = role === 'admin' ? adminNav : studentNav;
    const user = getUser();

    const brandName = 'Event Management';
    const brandSub  = role === 'admin' ? 'ADMIN PORTAL' : 'STUDENT PORTAL';
    const userName  = user?.name  || (role === 'admin' ? 'Admin User' : 'Student');
    const userSub   = user?.college || (role === 'admin' ? 'College Admin' : 'Student');

    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
    <div class="sidebar-brand">
      <h2>${brandName}</h2>
      <span>${brandSub}</span>
    </div>
    <nav class="sidebar-nav">
      ${navItems.map(item => `
        <button class="nav-item ${item.id === activeId ? 'active' : ''}" data-page="${item.id}">
          ${icons[item.icon]}
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-avatar" style="width:36px;height:36px;border-radius:9999px;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0;">
        ${userName.charAt(0).toUpperCase()}
      </div>
      <div class="sidebar-footer-info">
        <div class="name">${userName}</div>
        <div class="role">${userSub}</div>
      </div>
    </div>
  `;

    sidebar.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => navigate(btn.dataset.page));
    });

    container.appendChild(sidebar);
}
