// ============================================
// CREATE EVENT PAGE — Connected to backend
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { showToast, navigate } from '../main.js';

const API = 'http://localhost:5001/api';

function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

export function renderCreateEvent(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user || user.role !== 'admin') { navigate('login'); return; }

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, 'admin', 'create-event');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, { showSearch: false });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <div class="overline">Admin Panel</div>
      <h1>Create New Event</h1>
      <p>Design an event and publish it for students across all colleges.</p>
    </div>

    <form class="create-event-form" id="create-event-form" novalidate>

      <div class="form-section">
        <div class="form-section-header">
          <div class="form-section-icon">${icons.file}</div>
          <h3>Basic Information</h3>
        </div>

        <div class="form-group">
          <label class="form-label">EVENT TITLE <span class="req">*</span></label>
          <input type="text" id="e-title" class="form-input" placeholder='e.g. "National Hackathon 2026"' required />
          <span class="field-error" id="e-title-err"></span>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">CATEGORY <span class="req">*</span></label>
            <select id="e-category" class="form-input" required>
              <option value="">Select category</option>
              <option value="technical">Technical</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="academic">Academic</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
            <span class="field-error" id="e-category-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">MAX PARTICIPANTS <span class="req">*</span></label>
            <input type="number" id="e-max" class="form-input" placeholder="e.g. 200" min="1" required />
            <span class="field-error" id="e-max-err"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">DESCRIPTION <span class="req">*</span></label>
          <textarea id="e-desc" class="form-input" rows="4" placeholder="Describe the event goals, activities, and what participants can expect..." required></textarea>
          <span class="field-error" id="e-desc-err"></span>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-header">
          <div class="form-section-icon">${icons.mapPin}</div>
          <h3>Logistics</h3>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">EVENT DATE <span class="req">*</span></label>
            <input type="date" id="e-date" class="form-input" required />
            <span class="field-error" id="e-date-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">REGISTRATION DEADLINE <span class="req">*</span></label>
            <input type="date" id="e-deadline" class="form-input" required />
            <span class="field-error" id="e-deadline-err"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">VENUE</label>
          <input type="text" id="e-venue" class="form-input" placeholder="e.g. Main Auditorium or Virtual Link" />
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-header">
          <div class="form-section-icon">${icons.trophy}</div>
          <h3>Prizes (Optional)</h3>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">1ST PRIZE</label>
            <input type="text" id="e-prize1" class="form-input" placeholder="e.g. ₹50,000" />
          </div>
          <div class="form-group">
            <label class="form-label">2ND PRIZE</label>
            <input type="text" id="e-prize2" class="form-input" placeholder="e.g. ₹25,000" />
          </div>
        </div>
        <div class="form-group" style="max-width:50%;">
          <label class="form-label">3RD PRIZE</label>
          <input type="text" id="e-prize3" class="form-input" placeholder="e.g. ₹10,000" />
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-header">
          <div class="form-section-icon">${icons.sparkles}</div>
          <h3>Tags (Optional)</h3>
        </div>
        <div class="form-group">
          <label class="form-label">TAGS</label>
          <input type="text" id="e-tags" class="form-input" placeholder="e.g. coding, innovation, tech (comma separated)" />
          <small style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px;display:block;">Separate tags with commas</small>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
        <button type="submit" class="btn btn-primary" id="publish-btn">
          ${icons.zap} Publish Event
        </button>
      </div>
    </form>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    // Cancel
    main.querySelector('#cancel-btn').addEventListener('click', () => navigate('admin-dashboard'));

    // Submit
    main.querySelector('#create-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const title    = main.querySelector('#e-title').value.trim();
        const category = main.querySelector('#e-category').value;
        const maxPart  = main.querySelector('#e-max').value;
        const desc     = main.querySelector('#e-desc').value.trim();
        const date     = main.querySelector('#e-date').value;
        const deadline = main.querySelector('#e-deadline').value;
        const venue    = main.querySelector('#e-venue').value.trim();
        const prize1   = main.querySelector('#e-prize1').value.trim();
        const prize2   = main.querySelector('#e-prize2').value.trim();
        const prize3   = main.querySelector('#e-prize3').value.trim();
        const tagsStr  = main.querySelector('#e-tags').value.trim();

        // Clear errors
        ['e-title-err','e-category-err','e-max-err','e-desc-err','e-date-err','e-deadline-err']
            .forEach(id => { const el = main.querySelector(`#${id}`); if(el){el.textContent='';el.style.display='none';} });

        let valid = true;
        const showErr = (id, msg) => {
            const el = main.querySelector(`#${id}`);
            if(el){ el.textContent = msg; el.style.display = 'block'; }
            valid = false;
        };

        if (!title)    showErr('e-title-err',    'Event title is required');
        if (!category) showErr('e-category-err', 'Select a category');
        if (!maxPart || maxPart < 1) showErr('e-max-err', 'Enter max participants (min 1)');
        if (!desc)     showErr('e-desc-err',     'Description is required');
        if (!date)     showErr('e-date-err',     'Event date is required');
        if (!deadline) showErr('e-deadline-err', 'Registration deadline is required');

        if (!valid) return;

        const btn = main.querySelector('#publish-btn');
        btn.disabled = true;
        btn.textContent = 'Publishing...';

        try {
            const body = {
                title,
                description: desc,
                category,
                date,
                registrationDeadline: deadline,
                venue,
                maxParticipants: Number(maxPart),
                prizes: { first: prize1, second: prize2, third: prize3 },
                tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
            };

            const res  = await fetch(`${API}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || 'Failed to create event', 'error');
                btn.disabled = false;
                btn.innerHTML = `${icons.zap} Publish Event`;
                return;
            }

            showToast('Event published successfully! 🎉', 'success');
            setTimeout(() => navigate('admin-dashboard'), 800);

        } catch (err) {
            showToast('Network error. Is backend running?', 'error');
            btn.disabled = false;
            btn.innerHTML = `${icons.zap} Publish Event`;
        }
    });
}
