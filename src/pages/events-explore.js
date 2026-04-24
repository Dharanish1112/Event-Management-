// ============================================
// EVENTS EXPLORE PAGE — Connected to backend
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { showToast } from '../main.js';

const API = 'http://localhost:5001/api';

function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

const categoryColors = {
    technical: '#3B82F6', cultural: '#8B5CF6', sports: '#F59E0B',
    academic: '#10B981',  workshop: '#EF4444', other: '#6B7280',
};

// ============================================
export function renderEventsExplore(container) {
    container.innerHTML = '';
    const user = getUser();
    const role = user?.role || 'student';

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, role, 'events');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, { showSearch: false });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <h1>Explore Events</h1>
      <p>Discover and register for events across colleges. Find your next milestone here.</p>
    </div>

    <div class="filter-bar">
      <div class="search-input">
        ${icons.search}
        <input type="text" placeholder="Search events..." id="event-search" />
      </div>
      <select id="filter-category">
        <option value="">All Categories</option>
        <option value="technical">Technical</option>
        <option value="cultural">Cultural</option>
        <option value="sports">Sports</option>
        <option value="academic">Academic</option>
        <option value="workshop">Workshop</option>
      </select>
      <select id="filter-status">
        <option value="">All Status</option>
        <option value="upcoming">Upcoming</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
      </select>
      <button class="btn btn-primary btn-sm" id="apply-filter">${icons.search} Filter</button>
    </div>

    <div class="events-grid" id="events-grid">
      <div class="loading-state">Loading events...</div>
    </div>

    <div class="modal" id="event-modal" style="display:none;">
      <div class="modal-overlay" id="modal-overlay"></div>
      <div class="modal-content" id="modal-content"></div>
    </div>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    // Load events on mount
    loadEvents(main, {});

    // Filter handlers
    const searchInput = main.querySelector('#event-search');
    const categorySelect = main.querySelector('#filter-category');
    const statusSelect = main.querySelector('#filter-status');

    main.querySelector('#apply-filter').addEventListener('click', () => {
        loadEvents(main, {
            search: searchInput.value.trim(),
            category: categorySelect.value,
            status: statusSelect.value,
        });
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            loadEvents(main, {
                search: searchInput.value.trim(),
                category: categorySelect.value,
                status: statusSelect.value,
            });
        }
    });
}

// ---- Load events ----
async function loadEvents(main, filters) {
    const grid = main.querySelector('#events-grid');
    grid.innerHTML = '<div class="loading-state">Loading events...</div>';

    try {
        const params = new URLSearchParams();
        if (filters.search)   params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.status)   params.append('status', filters.status);

        const res  = await fetch(`${API}/events?${params}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            grid.innerHTML = '<div class="empty-state">Failed to load events.</div>';
            return;
        }

        if (!data.events.length) {
            grid.innerHTML = '<div class="empty-state">No events found.</div>';
            return;
        }

        grid.innerHTML = data.events.map(e => renderEventCard(e)).join('');

        grid.querySelectorAll('.view-event-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ev = data.events.find(e => e._id === btn.dataset.eventId);
                if (ev) showEventModal(main, ev);
            });
        });

    } catch (err) {
        console.error(err);
        grid.innerHTML = '<div class="empty-state">Network error. Is backend running?</div>';
    }
}

// ---- Render card ----
function renderEventCard(event) {
    const date      = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const spotsLeft = event.maxParticipants - event.registeredCount;
    const bg        = categoryColors[event.category] || '#6B7280';

    return `
    <div class="event-card">
      <div class="event-banner" style="background:linear-gradient(135deg,${bg}cc,${bg});">
        <span class="badge event-category" style="background:rgba(255,255,255,0.25);color:#fff;backdrop-filter:blur(4px);">${event.category.toUpperCase()}</span>
        <span class="badge event-status-badge ${event.status}">${event.status}</span>
      </div>
      <div class="event-content">
        <div class="event-college">
          <span class="college-dot" style="background:${bg}"></span>
          <span>${event.college}</span>
        </div>
        <h3 class="event-title">${event.title}</h3>
        <div class="event-meta">
          <div class="event-meta-item">${icons.calendar} <span>${date}</span></div>
          <div class="event-meta-item">${icons.mapPin} <span>${event.venue || 'TBA'}</span></div>
          <div class="event-meta-item">${icons.users} <span>${event.registeredCount}/${event.maxParticipants} registered</span></div>
        </div>
        <div class="event-card-footer">
          <span class="spots-left ${spotsLeft < 10 ? 'low' : ''}">${spotsLeft} spots left</span>
          <button class="btn btn-primary btn-sm view-event-btn" data-event-id="${event._id}">View Details</button>
        </div>
      </div>
    </div>`;
}

// ---- Modal ----
function showEventModal(main, event) {
    const modal   = main.querySelector('#event-modal');
    const content = main.querySelector('#modal-content');

    const date     = new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const deadline = new Date(event.registrationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const spots    = event.maxParticipants - event.registeredCount;
    const bg       = categoryColors[event.category] || '#6B7280';

    content.innerHTML = `
    <button class="modal-close" id="modal-close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <div class="modal-banner" style="background:linear-gradient(135deg,${bg}cc,${bg});">
      <div class="modal-banner-content">
        <span class="badge" style="background:rgba(255,255,255,0.25);color:#fff;backdrop-filter:blur(4px);margin-bottom:10px;display:inline-block;">${event.category.toUpperCase()}</span>
        <h2>${event.title}</h2>
        <div class="modal-college">
          <span class="college-dot" style="background:#fff"></span>
          <span>${event.college}</span>
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div class="modal-main">

        <div class="modal-section">
          <h3>About This Event</h3>
          <p>${event.description}</p>
        </div>

        <div class="modal-section">
          <h3>Event Details</h3>
          <div class="detail-grid">
            <div class="detail-item">
              ${icons.calendar}
              <div><div class="detail-label">Event Date</div><div class="detail-value">${date}</div></div>
            </div>
            <div class="detail-item">
              ${icons.clock}
              <div><div class="detail-label">Registration Deadline</div><div class="detail-value">${deadline}</div></div>
            </div>
            <div class="detail-item">
              ${icons.mapPin}
              <div><div class="detail-label">Venue</div><div class="detail-value">${event.venue || 'To be announced'}</div></div>
            </div>
            <div class="detail-item">
              ${icons.users}
              <div><div class="detail-label">Participants</div><div class="detail-value">${event.registeredCount} / ${event.maxParticipants} registered</div></div>
            </div>
          </div>
        </div>

        ${event.prizes?.first ? `
        <div class="modal-section">
          <h3>Prizes</h3>
          <div class="prizes-row">
            <div class="prize-item gold"><span>🥇</span><span>1st Place</span><strong>${event.prizes.first}</strong></div>
            ${event.prizes.second ? `<div class="prize-item silver"><span>🥈</span><span>2nd Place</span><strong>${event.prizes.second}</strong></div>` : ''}
            ${event.prizes.third  ? `<div class="prize-item bronze"><span>🥉</span><span>3rd Place</span><strong>${event.prizes.third}</strong></div>`  : ''}
          </div>
        </div>` : ''}

        ${event.tags?.length ? `
        <div class="modal-section">
          <h3>Tags</h3>
          <div class="tags-row">
            ${event.tags.map(t => `<span class="tag-pill">#${t}</span>`).join('')}
          </div>
        </div>` : ''}

      </div>

      <div class="modal-sidebar">
        <div class="modal-sidebar-card">
          <div class="spots-indicator ${spots < 10 ? 'low' : ''}">
            <div class="spots-number">${spots}</div>
            <div class="spots-label">Spots Left</div>
          </div>
          <button class="btn btn-primary" style="width:100%;margin-top:16px;" id="register-event-btn" data-event-id="${event._id}">
            ${icons.check} Register Now
          </button>
          <div class="modal-meta-list">
            <div class="modal-meta-item">
              <span>Status</span>
              <span class="badge badge-${event.status === 'upcoming' ? 'success' : event.status === 'ongoing' ? 'warning' : 'info'}">${event.status}</span>
            </div>
            <div class="modal-meta-item">
              <span>Category</span>
              <span>${event.category}</span>
            </div>
            <div class="modal-meta-item">
              <span>Max Seats</span>
              <span>${event.maxParticipants}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    content.querySelector('#modal-close').addEventListener('click', () => closeModal(main));
    main.querySelector('#modal-overlay').addEventListener('click', () => closeModal(main));

    content.querySelector('#register-event-btn').addEventListener('click', () => {
        showRegistrationForm(main, content, event);
    });
}

function closeModal(main) {
    main.querySelector('#event-modal').style.display = 'none';
    document.body.style.overflow = '';
}

// ---- Registration Form (shown inside modal) ----
function showRegistrationForm(main, content, event) {
    const user = getUser();

    content.innerHTML = `
    <button class="modal-close" id="modal-close-reg">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <div class="reg-form-header">
      <div class="reg-form-event-badge" style="background:${categoryColors[event.category] || '#6B7280'}22;color:${categoryColors[event.category] || '#6B7280'};">
        ${event.category.toUpperCase()}
      </div>
      <h2>Register for Event</h2>
      <p>${event.title}</p>
      <div class="reg-form-meta">
        <span>${icons.calendar} ${new Date(event.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
        <span>${icons.mapPin} ${event.venue || 'TBA'}</span>
        <span>${icons.users} ${event.maxParticipants - event.registeredCount} spots left</span>
      </div>
    </div>

    <form class="reg-form-body" id="reg-form" novalidate>

      <div class="reg-form-section">
        <h4>Personal Details</h4>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">FULL NAME <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.user}
              <input type="text" id="reg-name" class="form-input" value="${user?.name || ''}" placeholder="Your full name" required />
            </div>
            <span class="field-error" id="reg-name-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">EMAIL <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.mail}
              <input type="email" id="reg-email" class="form-input" value="${user?.email || ''}" placeholder="you@gmail.com" required />
            </div>
            <span class="field-error" id="reg-email-err"></span>
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">COLLEGE <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.building}
              <input type="text" id="reg-college" class="form-input" value="${user?.college || ''}" placeholder="Your college name" required />
            </div>
            <span class="field-error" id="reg-college-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">DEPARTMENT <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.book}
              <input type="text" id="reg-dept" class="form-input" value="${user?.department || ''}" placeholder="e.g. CSE, ECE" required />
            </div>
            <span class="field-error" id="reg-dept-err"></span>
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">YEAR OF STUDY <span class="req">*</span></label>
            <select id="reg-year" class="form-input" required>
              <option value="">Select year</option>
              ${[1,2,3,4,5].map(y => `<option value="${y}" ${Number(user?.year) === y ? 'selected' : ''}>${y}${['st','nd','rd','th','th'][y-1]} Year</option>`).join('')}
            </select>
            <span class="field-error" id="reg-year-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">PHONE NUMBER</label>
            <div class="form-input-icon">
              ${icons.zap}
              <input type="tel" id="reg-phone" class="form-input" placeholder="+91 9876543210" />
            </div>
          </div>
        </div>
      </div>

      <div class="reg-form-section">
        <h4>Event Specific</h4>
        <div class="form-group">
          <label class="form-label">WHY DO YOU WANT TO PARTICIPATE? <span class="req">*</span></label>
          <textarea id="reg-reason" class="form-input" rows="3" placeholder="Tell us briefly why you want to join this event..." required></textarea>
          <span class="field-error" id="reg-reason-err"></span>
        </div>
        <div class="form-group">
          <label class="form-label">RELEVANT SKILLS / EXPERIENCE</label>
          <textarea id="reg-skills" class="form-input" rows="2" placeholder="Any relevant skills or prior experience..."></textarea>
        </div>
      </div>

      <div class="reg-form-section">
        <h4>Confirmation</h4>
        <div class="reg-checkbox-row">
          <input type="checkbox" id="reg-terms" />
          <label for="reg-terms">I confirm that all details provided are accurate and I agree to the event rules and code of conduct.</label>
        </div>
        <span class="field-error" id="reg-terms-err"></span>
      </div>

      <div class="reg-form-actions">
        <button type="button" class="btn btn-secondary" id="reg-back-btn">← Back to Details</button>
        <button type="submit" class="btn btn-primary" id="reg-submit-btn">
          ${icons.check} Confirm Registration
        </button>
      </div>

    </form>`;

    // Back button
    content.querySelector('#modal-close-reg').addEventListener('click', () => closeModal(main));
    content.querySelector('#reg-back-btn').addEventListener('click', () => showEventModal(main, event));

    // Submit
    content.querySelector('#reg-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name    = content.querySelector('#reg-name').value.trim();
        const email   = content.querySelector('#reg-email').value.trim();
        const college = content.querySelector('#reg-college').value.trim();
        const dept    = content.querySelector('#reg-dept').value.trim();
        const year    = content.querySelector('#reg-year').value;
        const reason  = content.querySelector('#reg-reason').value.trim();
        const terms   = content.querySelector('#reg-terms').checked;

        // Clear errors
        ['reg-name-err','reg-email-err','reg-college-err','reg-dept-err','reg-year-err','reg-reason-err','reg-terms-err']
            .forEach(id => { const el = content.querySelector(`#${id}`); if(el){el.textContent='';el.style.display='none';} });

        let valid = true;
        const showErr = (id, msg) => {
            const el = content.querySelector(`#${id}`);
            if(el){ el.textContent = msg; el.style.display = 'block'; }
            valid = false;
        };

        if (!name)                                          showErr('reg-name-err',    'Full name is required');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) showErr('reg-email-err',   'Enter a valid email');
        if (!college)                                       showErr('reg-college-err', 'College name is required');
        if (!dept)                                          showErr('reg-dept-err',    'Department is required');
        if (!year)                                          showErr('reg-year-err',    'Select your year of study');
        if (!reason)                                        showErr('reg-reason-err',  'Please tell us why you want to participate');
        if (!terms)                                         showErr('reg-terms-err',   'You must agree to the terms to register');

        if (!valid) return;

        const btn = content.querySelector('#reg-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Registering...';

        try {
            const res  = await fetch(`${API}/registrations/${event._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ name, email, college, department: dept, year: Number(year), reason }),
            });
            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || 'Registration failed', 'error');
                btn.disabled = false;
                btn.innerHTML = `${icons.check} Confirm Registration`;
                return;
            }

            // Success screen
            content.innerHTML = `
            <div class="reg-success">
              <div class="reg-success-icon">🎉</div>
              <h2>You're Registered!</h2>
              <p>Successfully registered for <strong>${event.title}</strong></p>
              <div class="reg-success-details">
                <div class="reg-success-item">${icons.calendar} ${new Date(event.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
                <div class="reg-success-item">${icons.mapPin} ${event.venue || 'TBA'}</div>
                <div class="reg-success-item">${icons.building} ${event.college}</div>
              </div>
              <button class="btn btn-primary" id="reg-done-btn" style="margin-top:24px;">Done</button>
            </div>`;

            content.querySelector('#reg-done-btn').addEventListener('click', () => {
                closeModal(main);
                loadEvents(main, {});
            });

            showToast('Registered successfully! 🎉', 'success');

        } catch (err) {
            showToast('Network error. Is backend running?', 'error');
            btn.disabled = false;
            btn.innerHTML = `${icons.check} Confirm Registration`;
        }
    });
}

// ---- Register ----
async function registerForEvent(main, eventId) {
    const btn = main.querySelector('#register-event-btn');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = 'Registering...';

    try {
        const res  = await fetch(`${API}/registrations/${eventId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        });
        const data = await res.json();

        if (!res.ok) {
            showToast(data.message || 'Registration failed', 'error');
            btn.disabled = false;
            btn.innerHTML = `${icons.check} Register Now`;
            return;
        }

        showToast('Registered successfully! 🎉', 'success');
        closeModal(main);
        loadEvents(main, {});
    } catch (err) {
        showToast('Network error. Is backend running?', 'error');
        btn.disabled = false;
        btn.innerHTML = `${icons.check} Register Now`;
    }
}
