// ============================================
// LANDING PAGE — Event Management
// Public-facing marketing/home page
// ============================================

import { navigate } from '../main.js';

export function renderLanding(container) {
  container.innerHTML = `
    <div class="landing-page">

      <!-- ===== NAVBAR ===== -->
      <nav class="landing-nav">
        <div class="landing-nav-inner">
          <div class="landing-logo">
            <div class="landing-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span>Event Management</span>
          </div>

          <div class="landing-nav-links">
            <a href="#features" class="nav-link">Features</a>
            <a href="#how-it-works" class="nav-link">How It Works</a>
            <a href="#stats" class="nav-link">Stats</a>
            <a href="#contact" class="nav-link">Contact</a>
          </div>

          <div class="landing-nav-actions">
            <button class="btn-nav-login" id="nav-login-btn">Log In</button>
            <button class="btn-nav-signup" id="nav-signup-btn">Get Started →</button>
          </div>

          <!-- Mobile menu toggle -->
          <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Mobile dropdown -->
        <div class="mobile-menu" id="mobile-menu">
          <a href="#features" class="mobile-nav-link">Features</a>
          <a href="#how-it-works" class="mobile-nav-link">How It Works</a>
          <a href="#stats" class="mobile-nav-link">Stats</a>
          <a href="#contact" class="mobile-nav-link">Contact</a>
          <div class="mobile-nav-actions">
            <button class="btn btn-secondary" id="mobile-login-btn">Log In</button>
            <button class="btn btn-primary" id="mobile-signup-btn">Get Started →</button>
          </div>
        </div>
      </nav>

      <!-- ===== HERO ===== -->
      <section class="hero-section">
        <div class="hero-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
          Trusted by 200+ colleges
        </div>

        <h1 class="hero-title">
          Elevating the Academic Experience
        </h1>

        <p class="hero-subtitle">
          Manage college events, track participation, and celebrate achievements — all in one seamless platform built for students and institutions.
        </p>

        <div class="hero-actions">
          <button class="btn-hero-primary" id="hero-cta-btn">
            Get Started Free
          </button>
          <button class="btn-hero-secondary" id="hero-login-btn">
            Sign In
          </button>
        </div>

        <div class="hero-stats-mini">
          <div class="stat-mini">
            <div class="stat-mini-value">12K+</div>
            <div class="stat-mini-label">Active Students</div>
          </div>
          <div class="stat-mini-divider"></div>
          <div class="stat-mini">
            <div class="stat-mini-value">3,500+</div>
            <div class="stat-mini-label">Events Hosted</div>
          </div>
          <div class="stat-mini-divider"></div>
          <div class="stat-mini">
            <div class="stat-mini-value">98%</div>
            <div class="stat-mini-label">Satisfaction</div>
          </div>
        </div>

        <!-- Floating category pills (Anyo style) -->
        <div class="hero-visual">
          <div class="center-logo-circle">
            <div class="center-logo-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="center-logo-text">Event<br/>Management</div>
          </div>
          
          <div class="floating-pill pill-1">Events</div>
          <div class="floating-pill pill-2">Certificates</div>
          <div class="floating-pill pill-3">Analytics</div>
          <div class="floating-pill pill-4">Winners</div>
          <div class="floating-pill pill-5">Registration</div>
          <div class="floating-pill pill-6">Multi-College</div>
        </div>
      </section>

      <!-- ===== GUIDANCE SECTION (Anyo style split layout) ===== -->
      <section class="guidance-section">
        <div class="guidance-left">
          <div class="guidance-tag">For Students</div>
          <h2>Get the guidance you need</h2>
          <p>Explore events from 200+ colleges. Register in one click, track your progress, and earn verified certificates for every achievement.</p>
          <button class="btn-hero-primary" id="guidance-student-btn">Explore Events</button>
          <div class="guidance-pills">
            <span class="gpill gpill-blue">Hackathons</span>
            <span class="gpill gpill-green">Cultural Fests</span>
            <span class="gpill gpill-purple">Sports</span>
            <span class="gpill gpill-coral">Workshops</span>
            <span class="gpill gpill-yellow">Debates</span>
            <span class="gpill gpill-teal">Tech Talks</span>
            <span class="gpill gpill-pink">Art &amp; Design</span>
            <span class="gpill gpill-orange">Quiz</span>
          </div>
        </div>
        <div class="guidance-right">
          <div class="guidance-card-mockup">
            <div class="gcm-header">
              <div class="gcm-back">← Events &amp; Competitions</div>
              <div class="gcm-title">Choose a Category</div>
            </div>
            <div class="gcm-categories">
              <div class="gcm-cat active">
                <div class="gcm-cat-icon" style="background:#EEF2FF">🎯</div>
                <span>Technical</span>
              </div>
              <div class="gcm-cat">
                <div class="gcm-cat-icon" style="background:#F0FDF4">🎨</div>
                <span>Cultural</span>
              </div>
              <div class="gcm-cat">
                <div class="gcm-cat-icon" style="background:#FFF7ED">⚽</div>
                <span>Sports</span>
              </div>
            </div>
            <div class="gcm-section-title">Featured Events</div>
            <div class="gcm-experts">
              <div class="gcm-expert">
                <div class="gcm-expert-avatar" style="background:linear-gradient(135deg,#6366F1,#8B5CF6)">A</div>
                <div class="gcm-expert-info">
                  <div class="gcm-expert-name">Anna University Hackathon</div>
                  <div class="gcm-expert-role">Technical · 240 registered</div>
                  <div class="gcm-expert-rating">★★★★★ <span>4.9</span></div>
                </div>
              </div>
              <div class="gcm-expert">
                <div class="gcm-expert-avatar" style="background:linear-gradient(135deg,#10B981,#059669)">V</div>
                <div class="gcm-expert-info">
                  <div class="gcm-expert-name">VIT Cultural Fest 2026</div>
                  <div class="gcm-expert-role">Cultural · 512 registered</div>
                  <div class="gcm-expert-rating">★★★★★ <span>4.8</span></div>
                </div>
              </div>
              <div class="gcm-expert">
                <div class="gcm-expert-avatar" style="background:linear-gradient(135deg,#F59E0B,#D97706)">P</div>
                <div class="gcm-expert-info">
                  <div class="gcm-expert-name">PSG Tech Quiz Bowl</div>
                  <div class="gcm-expert-role">Academic · 180 registered</div>
                  <div class="gcm-expert-rating">★★★★☆ <span>4.7</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== FEATURES ===== -->
      <section class="features-section" id="features">
        <div class="features-header">
          <div class="section-pill">Platform Features</div>
          <h2>Everything in one place</h2>
          <p>From event creation to certificate generation — the complete lifecycle, handled.</p>
        </div>

        <div class="features-bento">
          <div class="bento-card bento-large bento-purple">
            <div class="bento-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>Smart Event Management</h3>
            <p>Create, schedule, and manage events across multiple colleges. Set categories, deadlines, and participant limits with ease.</p>
            <div class="bento-pill-row">
              <span>Multi-college</span><span>Scheduling</span><span>Limits</span>
            </div>
          </div>

          <div class="bento-card bento-small bento-green">
            <div class="bento-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h3>Live Analytics</h3>
            <p>Real-time dashboards with participation trends and win ratios.</p>
          </div>

          <div class="bento-card bento-small bento-coral">
            <div class="bento-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <h3>Winner Management</h3>
            <p>Declare winners, assign positions, auto-update leaderboards.</p>
          </div>

          <div class="bento-card bento-small bento-blue">
            <div class="bento-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h3>Digital Certificates</h3>
            <p>Auto-generate beautiful, verifiable certificates instantly.</p>
          </div>

          <div class="bento-card bento-large bento-mint">
            <div class="bento-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="bento-content">
              <h3>Student Participation Tracking</h3>
              <p>Track registrations, attendance, and performance. Students get a personal dashboard to explore and register for events across all colleges.</p>
              <div class="bento-pill-row">
                <span>Dashboard</span><span>History</span><span>Achievements</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== HOW IT WORKS ===== -->
      <section class="how-section" id="how-it-works">
        <div class="section-pill">How It Works</div>
        <h2>Up and running in minutes</h2>
        <p>Three simple steps to get your college events live.</p>

        <div class="steps-row">
          <div class="step-card">
            <div class="step-number">01</div>
            <h3>Create Your Account</h3>
            <p>Sign up as a College Admin or Student. Admins get a full management dashboard; students get a personal portal.</p>
          </div>
          <div class="step-arrow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <div class="step-card">
            <div class="step-number">02</div>
            <h3>Publish Events</h3>
            <p>Admins create events with all details — date, venue, categories, and registration limits. Goes live instantly.</p>
          </div>
          <div class="step-arrow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <div class="step-card">
            <div class="step-number">03</div>
            <h3>Track &amp; Celebrate</h3>
            <p>Students register, participate, and earn certificates. Admins track everything in real-time with live analytics.</p>
          </div>
        </div>
      </section>

      <!-- ===== STATS ===== -->
      <section class="stats-section" id="stats">
        <div class="stats-inner">
          <div class="stat-item">
            <div class="stat-number">200+</div>
            <div class="stat-label">Colleges</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">12K+</div>
            <div class="stat-label">Active Students</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">3,500+</div>
            <div class="stat-label">Events Hosted</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">98%</div>
            <div class="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      <!-- ===== TESTIMONIALS ===== -->
      <section class="testimonials-section">
        <div class="section-pill">Testimonials</div>
        <h2>What our users say</h2>

        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p>"Managing inter-college events used to be a nightmare. Event Management made it effortless — from registration to certificates, everything is automated."</p>
            <div class="testimonial-author">
              <div class="t-avatar" style="background:linear-gradient(135deg,#6366F1,#8B5CF6)">R</div>
              <div>
                <div class="t-name">Dr. Ramesh Kumar</div>
                <div class="t-role">Event Coordinator, Anna University</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p>"I love how I can explore events from different colleges and register in one click. The certificate download feature is super convenient!"</p>
            <div class="testimonial-author">
              <div class="t-avatar" style="background:linear-gradient(135deg,#10B981,#059669)">P</div>
              <div>
                <div class="t-name">Priya Nair</div>
                <div class="t-role">3rd Year CSE, VIT Vellore</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p>"The analytics dashboard gives us insights we never had before. We can see participation trends and plan better events every semester."</p>
            <div class="testimonial-author">
              <div class="t-avatar" style="background:linear-gradient(135deg,#F59E0B,#D97706)">S</div>
              <div>
                <div class="t-name">Suresh Babu</div>
                <div class="t-role">Admin, PSG Tech</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== CTA SECTION ===== -->
      <section class="cta-section" id="contact">
        <div class="cta-inner">
          <div class="cta-badge">Get Started Today</div>
          <h2>Ready to transform your college events?</h2>
          <p>Join 200+ institutions already using Event Management to manage events, track students, and celebrate achievements.</p>
          <div class="cta-actions">
            <button class="cta-btn-white" id="cta-signup-btn">Create Free Account</button>
            <button class="cta-btn-outline" id="cta-login-btn">Sign In →</button>
          </div>
        </div>
      </section>

      <!-- ===== FOOTER ===== -->
      <footer class="landing-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="landing-logo">
              <div class="landing-logo-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>Event Management</span>
            </div>
            <p>Elevating the academic experience for students and institutions across India.</p>
          </div>

          <div class="footer-links-group">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#stats">Stats</a>
          </div>

          <div class="footer-links-group">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
          </div>

          <div class="footer-links-group">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Event Management. All rights reserved.</span>
          <span>Made with ♥ for students</span>
        </div>
      </footer>

    </div>
  `;

  // ---- Button handlers ----
  const goLogin = () => navigate('login');
  const goSignup = () => navigate('login');

  container.querySelector('#nav-login-btn').addEventListener('click', goLogin);
  container.querySelector('#nav-signup-btn').addEventListener('click', goSignup);
  container.querySelector('#hero-cta-btn').addEventListener('click', goSignup);
  container.querySelector('#hero-login-btn').addEventListener('click', goLogin);
  container.querySelector('#guidance-student-btn').addEventListener('click', goSignup);
  container.querySelector('#cta-signup-btn').addEventListener('click', goSignup);
  container.querySelector('#cta-login-btn').addEventListener('click', goLogin);

  // Mobile login/signup buttons
  const mobileLogin = container.querySelector('#mobile-login-btn');
  const mobileSignup = container.querySelector('#mobile-signup-btn');
  if (mobileLogin) mobileLogin.addEventListener('click', goLogin);
  if (mobileSignup) mobileSignup.addEventListener('click', goSignup);

  // Mobile menu toggle
  const menuBtn = container.querySelector('#mobile-menu-btn');
  const mobileMenu = container.querySelector('#mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // Close mobile menu when a link is clicked
  container.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });

  // Smooth scroll for anchor links
  container.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
