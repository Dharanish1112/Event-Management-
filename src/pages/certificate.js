// ============================================
// CERTIFICATE PAGE — Real data + PDF download
// ============================================

import { icons } from '../components/icons.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { showToast, navigate } from '../main.js';

const API = 'http://localhost:5001/api';
function getToken() { return localStorage.getItem('token') || ''; }
function getUser()  { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }

export function renderCertificate(container) {
    container.innerHTML = '';

    const user = getUser();
    if (!user) { navigate('login'); return; }

    const layout = document.createElement('div');
    layout.className = 'app-layout';
    renderSidebar(layout, 'student', 'certificate');

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-wrapper';
    renderTopbar(mainWrapper, { showSearch: false });

    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <div class="page-header">
      <div class="overline">Credentials</div>
      <h1>My Certificates</h1>
      <p>Your earned certificates from events you won or participated in.</p>
    </div>

    <div id="cert-list-section">
      <div class="loading-state">Loading your certificates...</div>
    </div>

    <!-- Certificate Preview Modal -->
    <div id="cert-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:var(--space-6);">
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);" id="cert-modal-overlay"></div>
      <div style="position:relative;z-index:1;background:var(--bg-card);border-radius:var(--radius-2xl);max-width:860px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,0.4);" id="cert-modal-inner">
        <div id="cert-modal-content"></div>
      </div>
    </div>
  `;

    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
    container.appendChild(layout);

    loadCertificates(main, user);
}

async function loadCertificates(main, user) {
    const section = main.querySelector('#cert-list-section');

    try {
        const res  = await fetch(`${API}/winners/student/${user.id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        const data = await res.json();

        if (!res.ok || !data.success || !data.winners.length) {
            section.innerHTML = `
            <div class="cert-empty">
              <div style="font-size:64px;margin-bottom:var(--space-4);">🏅</div>
              <h3>No certificates yet</h3>
              <p>Participate in events and win to earn certificates.</p>
              <button class="btn btn-primary" onclick="window.location.hash='events'" style="margin-top:var(--space-5);">
                Browse Events →
              </button>
            </div>`;
            return;
        }

        const posEmoji = { '1st':'🥇', '2nd':'🥈', '3rd':'🥉', 'participant':'🎖️' };
        const posLabel = { '1st':'First Place', '2nd':'Second Place', '3rd':'Third Place', 'participant':'Participant' };

        section.innerHTML = `
        <div class="cert-grid">
          ${data.winners.map((w, i) => {
            const ev   = w.event || {};
            const date = ev.date ? new Date(ev.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—';
            const categoryColors = { technical:'#3B82F6', cultural:'#8B5CF6', sports:'#F59E0B', academic:'#10B981', workshop:'#EF4444', other:'#6B7280' };
            const bg = categoryColors[ev.category] || '#6366F1';

            return `
            <div class="cert-card" data-winner-idx="${i}">
              <div class="cert-card-banner" style="background:linear-gradient(135deg,${bg}cc,${bg});">
                <div class="cert-card-emoji">${posEmoji[w.position] || '🏅'}</div>
              </div>
              <div class="cert-card-body">
                <div class="cert-card-position">${posLabel[w.position] || w.position}</div>
                <div class="cert-card-event">${ev.title || '—'}</div>
                <div class="cert-card-meta">
                  <span>${icons.building} ${ev.college || '—'}</span>
                  <span>${icons.calendar} ${date}</span>
                </div>
                ${w.prize ? `<div class="cert-card-prize">Prize: ${w.prize}</div>` : ''}
              </div>
              <div class="cert-card-footer">
                <button class="btn btn-secondary btn-sm view-cert-btn" data-winner-idx="${i}">
                  ${icons.eye} Preview
                </button>
                <button class="btn btn-primary btn-sm download-cert-btn" data-winner-idx="${i}">
                  ${icons.download} Download PDF
                </button>
              </div>
            </div>`;
          }).join('')}
        </div>`;

        // Attach handlers
        section.querySelectorAll('.view-cert-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const w = data.winners[parseInt(btn.dataset.winnerIdx)];
                showCertModal(main, w, user);
            });
        });

        section.querySelectorAll('.download-cert-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const w = data.winners[parseInt(btn.dataset.winnerIdx)];
                downloadCertPDF(w, user);
            });
        });

    } catch (err) {
        section.innerHTML = '<div class="empty-state">Failed to load certificates.</div>';
    }
}

// ---- Show certificate modal ----
function showCertModal(main, winner, user) {
    const modal   = main.querySelector('#cert-modal');
    const content = main.querySelector('#cert-modal-content');

    content.innerHTML = buildCertHTML(winner, user, true);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    main.querySelector('#cert-modal-overlay').addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });

    content.querySelector('#cert-close-btn')?.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });

    content.querySelector('#cert-download-btn')?.addEventListener('click', () => {
        downloadCertPDF(winner, user);
    });
}

// ---- Build certificate HTML ----
function buildCertHTML(winner, user, withActions = false) {
    const ev       = winner.event || {};
    const date     = ev.date ? new Date(ev.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—';
    const issued   = winner.createdAt ? new Date(winner.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : date;
    const posLabel = { '1st':'First Place', '2nd':'Second Place', '3rd':'Third Place', 'participant':'Participant' };
    const certId   = `EM-CERT-${winner._id?.slice(-8).toUpperCase() || '00000000'}`;

    return `
    ${withActions ? `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 28px;border-bottom:1px solid var(--border-primary);">
      <h3 style="font-size:var(--text-lg);font-weight:700;color:var(--text-primary);">Certificate Preview</h3>
      <div style="display:flex;gap:12px;align-items:center;">
        <button class="btn btn-primary btn-sm" id="cert-download-btn">${icons.download} Download PDF</button>
        <button class="btn btn-secondary btn-sm" id="cert-close-btn">Close</button>
      </div>
    </div>` : ''}

    <div id="certificate-print-area" style="padding:40px;">
      <div style="
        background: linear-gradient(180deg, #FAFAFE 0%, #F0EDFF 100%);
        border-radius: 16px;
        padding: 60px 56px;
        text-align: center;
        position: relative;
        border: 1px solid #E0D9FF;
        font-family: 'Poppins', 'Inter', sans-serif;
      ">
        <!-- Decorative border -->
        <div style="position:absolute;top:16px;left:16px;right:16px;bottom:16px;border:2px solid #C4B5FD;border-radius:12px;pointer-events:none;"></div>

        <!-- Corner decorations -->
        <div style="position:absolute;top:24px;left:24px;width:32px;height:32px;border-top:3px solid #7C3AED;border-left:3px solid #7C3AED;border-radius:4px 0 0 0;"></div>
        <div style="position:absolute;top:24px;right:24px;width:32px;height:32px;border-top:3px solid #7C3AED;border-right:3px solid #7C3AED;border-radius:0 4px 0 0;"></div>
        <div style="position:absolute;bottom:24px;left:24px;width:32px;height:32px;border-bottom:3px solid #7C3AED;border-left:3px solid #7C3AED;border-radius:0 0 0 4px;"></div>
        <div style="position:absolute;bottom:24px;right:24px;width:32px;height:32px;border-bottom:3px solid #7C3AED;border-right:3px solid #7C3AED;border-radius:0 0 4px 0;"></div>

        <!-- Logo -->
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:28px;">
          <div style="width:44px;height:44px;background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span style="font-size:18px;font-weight:700;background:linear-gradient(135deg,#4F46E5,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Event Management</span>
        </div>

        <div style="font-size:11px;letter-spacing:0.18em;color:#9CA3AF;text-transform:uppercase;margin-bottom:8px;">Certificate of Achievement</div>
        <div style="font-size:13px;color:#6B7280;margin-bottom:32px;">This is to proudly certify that</div>

        <!-- Name -->
        <div style="font-size:42px;font-weight:800;color:#1F2937;margin-bottom:16px;letter-spacing:-0.02em;font-family:'Poppins',sans-serif;">
          ${user.name}
        </div>

        <div style="font-size:14px;color:#6B7280;margin-bottom:28px;line-height:1.6;">
          from <strong style="color:#374151;">${user.college || '—'}</strong>${user.department ? `, ${user.department}` : ''}
          <br>has successfully achieved distinction in the
        </div>

        <!-- Event name -->
        <div style="display:inline-flex;align-items:center;gap:8px;background:#EDE9FE;color:#5B21B6;padding:10px 24px;border-radius:100px;font-size:15px;font-weight:600;margin-bottom:20px;">
          ⭐ ${ev.title || '—'}
        </div>

        <!-- Position badge -->
        <div style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;padding:8px 28px;border-radius:100px;font-size:16px;font-weight:700;margin-bottom:36px;letter-spacing:0.02em;">
          ${posLabel[winner.position] || winner.position} Winner
        </div>

        ${winner.prize ? `<div style="font-size:14px;color:#059669;font-weight:600;margin-bottom:28px;">Prize: ${winner.prize}</div>` : ''}

        <!-- Signatures -->
        <div style="display:flex;justify-content:center;gap:80px;margin-bottom:32px;">
          <div style="text-align:center;">
            <div style="width:48px;height:48px;border-radius:50%;background:#EDE9FE;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style="font-size:13px;font-weight:700;color:#1F2937;">${ev.college || 'Event Management'}</div>
            <div style="font-size:11px;color:#9CA3AF;">Organizing Committee</div>
          </div>
          <div style="text-align:center;">
            <div style="width:48px;height:48px;border-radius:50%;background:#EDE9FE;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div style="font-size:13px;font-weight:700;color:#1F2937;">${issued}</div>
            <div style="font-size:11px;color:#9CA3AF;">Date Issued</div>
          </div>
        </div>

        <!-- Certificate ID -->
        <div style="font-size:11px;color:#9CA3AF;letter-spacing:0.08em;">
          Certificate ID: ${certId}
        </div>
      </div>
    </div>`;
}

// ---- Download as PDF using print ----
function downloadCertPDF(winner, user) {
    const certHTML = buildCertHTML(winner, user, false);

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate — ${user.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #fff; font-family: 'Inter', sans-serif; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4 landscape; margin: 0; }
        }
      </style>
    </head>
    <body>
      ${certHTML}
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); window.close(); }, 500);
        };
      </script>
    </body>
    </html>`);
    printWindow.document.close();

    showToast('Certificate PDF downloading... 📄', 'success');
}
