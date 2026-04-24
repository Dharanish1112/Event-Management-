// ============================================
// TOPBAR COMPONENT
// ============================================

import { icons } from './icons.js';
import { toggleTheme, navigate } from '../main.js';

function getUser() {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
}

export function renderTopbar(container, { title = '', subtitle = '', showSearch = true, actions = [] } = {}) {
    const topbar = document.createElement('header');
    topbar.className = 'topbar';
    const isDark = document.documentElement.classList.contains('dark');
    const user = getUser();
    const initial = user?.name?.charAt(0).toUpperCase() || 'U';

    topbar.innerHTML = `
    <div class="topbar-left">
      ${showSearch ? `
        <div class="topbar-search">
          ${icons.search}
          <input type="text" placeholder="Search events, participants..." id="topbar-search" />
        </div>
      ` : ''}
    </div>
    <div class="topbar-right">
      ${actions.map(a => `<button class="btn btn-${a.type || 'secondary'} btn-sm" data-action="${a.action || ''}">${a.icon ? icons[a.icon] : ''}${a.label}</button>`).join('')}
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme">
        ${isDark ? icons.sun : icons.moon}
      </button>
      <button class="topbar-icon-btn" id="notif-btn" title="Notifications">
        ${icons.bell}
        <span class="notification-dot"></span>
      </button>
      <div class="topbar-user-avatar" data-page="profile" title="My Profile" style="width:36px;height:36px;border-radius:9999px;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;cursor:pointer;">
        ${initial}
      </div>
    </div>
  `;

    topbar.querySelector('#theme-toggle').addEventListener('click', () => {
        toggleTheme();
        const nowDark = document.documentElement.classList.contains('dark');
        topbar.querySelector('#theme-toggle').innerHTML = nowDark ? icons.sun : icons.moon;
    });

    topbar.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => { if (btn.dataset.action) navigate(btn.dataset.action); });
    });

    // Avatar click → profile
    const avatar = topbar.querySelector('.topbar-user-avatar');
    if (avatar) avatar.addEventListener('click', () => navigate('profile'));

    container.appendChild(topbar);
}
