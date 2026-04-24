// ============================================
// LOGIN / REGISTER PAGE
// ============================================

import { icons } from '../components/icons.js';
import { navigate, showToast } from '../main.js';

const API = 'http://localhost:5001/api';

// ---- helpers ----
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pw) {
  return pw.length >= 6;
}

// ---- left panel HTML (shared) ----
function leftPanel() {
  return `
    <div class="login-left">
      <div class="login-brand">
        <div class="login-brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h3>Event Management</h3>
      </div>
      <h1>
        Elevating the
        <span class="highlight">Academic</span>
        <span class="highlight">Experience.</span>
      </h1>
      <div class="login-divider"></div>
      <p class="login-quote">"Education is not the learning of facts, but the training of the mind to think."</p>
      <p class="login-quote-author">— ALBERT EINSTEIN</p>
      <div class="login-social-proof">
        <div class="login-avatars">
          <div class="avatar" style="background:#6366F1">A</div>
          <div class="avatar" style="background:#8B5CF6">B</div>
          <div class="avatar" style="background:#A78BFA">C</div>
          <div class="avatar" style="background:#4F46E5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
        </div>
        <span>Joined by <strong style="color:#fff">12,000+</strong> members today</span>
      </div>
    </div>`;
}

// ---- SIGN IN form ----
function signInHTML(role) {
  return `
    <div class="login-card" id="login-card">
      <h2>Welcome Back</h2>
      <p class="subtitle">Sign in to access your ${role === 'admin' ? 'admin' : 'student'} portal.</p>

      <div class="role-toggle" id="role-toggle">
        <button class="${role === 'student' ? 'active' : ''}" data-role="student">Student</button>
        <button class="${role === 'admin' ? 'active' : ''}" data-role="admin">College Admin</button>
      </div>

      <form class="login-form" id="signin-form" novalidate>
        <div class="form-group">
          <label class="form-label">EMAIL</label>
          <div class="form-input-icon">
            ${icons.mail}
            <input type="email" id="si-email" class="form-input" placeholder="you@gmail.com" required />
          </div>
          <span class="field-error" id="si-email-err"></span>
        </div>

        <div class="form-group">
          <div class="form-row">
            <label class="form-label">PASSWORD</label>
          </div>
          <div class="form-input-icon">
            ${icons.lock}
            <input type="password" id="si-password" class="form-input" placeholder="••••••••" required />
            <button type="button" class="toggle-pw" tabindex="-1">${icons.eye}</button>
          </div>
          <span class="field-error" id="si-pw-err"></span>
        </div>

        <div class="remember-row">
          <input type="checkbox" id="remember" />
          <label for="remember">Remember me for 30 days</label>
        </div>

        <button type="submit" class="btn btn-primary login-btn" id="signin-btn">
          Sign in to Dashboard →
        </button>
      </form>

      <p class="login-footer">
        New here? <a href="#" id="go-register">Create Account</a>
      </p>
      <div class="login-bottom-links">
        <a href="#">Privacy Policy</a> · <a href="#">Terms of Service</a> · <a href="#">Help Center</a>
      </div>
    </div>`;
}

// ---- SIGN UP form — Student ----
function signUpStudentHTML() {
  return `
    <div class="login-card" id="login-card">
      <h2>Create Student Account</h2>
      <p class="subtitle">Fill in your details to get started.</p>

      <div class="role-toggle" id="role-toggle-reg">
        <button class="active" data-role="student">Student</button>
        <button data-role="admin">College Admin</button>
      </div>

      <form class="login-form" id="register-form" novalidate>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">FULL NAME <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.user}
              <input type="text" id="r-name" class="form-input" placeholder="Your full name" required />
            </div>
            <span class="field-error" id="r-name-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">EMAIL <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.mail}
              <input type="email" id="r-email" class="form-input" placeholder="you@gmail.com" required />
            </div>
            <span class="field-error" id="r-email-err"></span>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">PASSWORD <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.lock}
              <input type="password" id="r-password" class="form-input" placeholder="Min 6 characters" required />
              <button type="button" class="toggle-pw" tabindex="-1">${icons.eye}</button>
            </div>
            <span class="field-error" id="r-pw-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">CONFIRM PASSWORD <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.lock}
              <input type="password" id="r-confirm" class="form-input" placeholder="Re-enter password" required />
            </div>
            <span class="field-error" id="r-confirm-err"></span>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">COLLEGE NAME <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.building}
              <input type="text" id="r-college" class="form-input" placeholder="e.g. Anna University" required />
            </div>
            <span class="field-error" id="r-college-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">DEPARTMENT <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.book}
              <input type="text" id="r-dept" class="form-input" placeholder="e.g. CSE, ECE, IT" required />
            </div>
            <span class="field-error" id="r-dept-err"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">YEAR OF STUDY <span class="req">*</span></label>
          <select id="r-year" class="form-input" required>
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
          </select>
          <span class="field-error" id="r-year-err"></span>
        </div>

        <button type="submit" class="btn btn-primary login-btn" id="register-btn">
          Create Student Account →
        </button>
      </form>

      <p class="login-footer">
        Already have an account? <a href="#" id="go-signin">Sign In</a>
      </p>
    </div>`;
}

// ---- SIGN UP form — Admin ----
function signUpAdminHTML() {
  return `
    <div class="login-card" id="login-card">
      <h2>Create Admin Account</h2>
      <p class="subtitle">Register as a College Admin to manage events.</p>

      <div class="role-toggle" id="role-toggle-reg">
        <button data-role="student">Student</button>
        <button class="active" data-role="admin">College Admin</button>
      </div>

      <form class="login-form" id="register-form" novalidate>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">FULL NAME <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.user}
              <input type="text" id="r-name" class="form-input" placeholder="Your full name" required />
            </div>
            <span class="field-error" id="r-name-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">EMAIL <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.mail}
              <input type="email" id="r-email" class="form-input" placeholder="you@gmail.com" required />
            </div>
            <span class="field-error" id="r-email-err"></span>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">PASSWORD <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.lock}
              <input type="password" id="r-password" class="form-input" placeholder="Min 6 characters" required />
              <button type="button" class="toggle-pw" tabindex="-1">${icons.eye}</button>
            </div>
            <span class="field-error" id="r-pw-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">CONFIRM PASSWORD <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.lock}
              <input type="password" id="r-confirm" class="form-input" placeholder="Re-enter password" required />
            </div>
            <span class="field-error" id="r-confirm-err"></span>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">COLLEGE NAME <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.building}
              <input type="text" id="r-college" class="form-input" placeholder="e.g. Anna University" required />
            </div>
            <span class="field-error" id="r-college-err"></span>
          </div>
          <div class="form-group">
            <label class="form-label">DESIGNATION <span class="req">*</span></label>
            <div class="form-input-icon">
              ${icons.badge}
              <input type="text" id="r-designation" class="form-input" placeholder="e.g. Event Coordinator" required />
            </div>
            <span class="field-error" id="r-desig-err"></span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary login-btn" id="register-btn">
          Create Admin Account →
        </button>
      </form>

      <p class="login-footer">
        Already have an account? <a href="#" id="go-signin">Sign In</a>
      </p>
    </div>`;
}

// ---- set loading state on button ----
function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.dataset.label = btn.dataset.label || btn.textContent;
    btn.textContent = 'Please wait...';
  } else {
    btn.textContent = btn.dataset.label || btn.textContent;
  }
}

// ---- show/clear field error ----
function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}
function clearErrors(...ids) {
  ids.forEach(id => showErr(id, ''));
}

// ============================================
// MAIN RENDER
// ============================================
export function renderLogin(container) {
  let mode = 'register';   // Start with register, not signin
  let role = 'student';    // Default to student

  function render() {
    let rightHTML = '';
    if (mode === 'signin') {
      rightHTML = signInHTML(role);
    } else {
      rightHTML = role === 'student' ? signUpStudentHTML() : signUpAdminHTML();
    }

    container.innerHTML = `
      <div class="login-page">
        ${leftPanel()}
        <div class="login-right">
          ${rightHTML}
        </div>
      </div>`;

    attachEvents();
  }

  // ---- attach all event listeners ----
  function attachEvents() {
    let submitting = false; // prevent double submit
    // Password visibility toggles
    container.querySelectorAll('.toggle-pw').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        input.type = input.type === 'password' ? 'text' : 'password';
      });
    });

    if (mode === 'signin') {
      // Role toggle on sign in
      container.querySelectorAll('#role-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('#role-toggle button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          role = btn.dataset.role;
          render();
        });
      });

      // Go to register
      const goReg = container.querySelector('#go-register');
      if (goReg) goReg.addEventListener('click', (e) => { e.preventDefault(); mode = 'register'; render(); });

      // Sign in submit
      const form = container.querySelector('#signin-form');
      const btn = container.querySelector('#signin-btn');
      if (btn) btn.dataset.label = btn.textContent;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitting) return;
        clearErrors('si-email-err', 'si-pw-err');

        const email = document.getElementById('si-email').value.trim();
        const password = document.getElementById('si-password').value;

        let valid = true;
        if (!validateEmail(email)) { showErr('si-email-err', 'Enter a valid email address'); valid = false; }
        if (!validatePassword(password)) { showErr('si-pw-err', 'Password must be at least 6 characters'); valid = false; }
        if (!valid) return;

        setLoading(btn, true);
        submitting = true;
        try {
          const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();

          if (!res.ok) {
            showToast(data.message || 'Login failed', 'error');
            submitting = false;
            setLoading(btn, false);
            return;
          }

          // Save token + user
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          showToast(`Welcome back, ${data.user.name}!`, 'success');
          setTimeout(() => {
            navigate(data.user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
          }, 600);
        } catch (err) {
          console.error('Login error:', err);
          showToast(`Network error: ${err.message}. Check if backend is running on port 5001.`, 'error');
          submitting = false;
          setLoading(btn, false);
        }
      });

    } else {
      // Role toggle on register
      container.querySelectorAll('#role-toggle-reg button').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('#role-toggle-reg button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          role = btn.dataset.role;
          render();
        });
      });

      // Go back to sign in
      const goSI = container.querySelector('#go-signin');
      if (goSI) goSI.addEventListener('click', (e) => { e.preventDefault(); mode = 'signin'; render(); });

      // Register submit
      const form = container.querySelector('#register-form');
      const btn = container.querySelector('#register-btn');
      if (btn) btn.dataset.label = btn.textContent;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitting) return;

        const name     = document.getElementById('r-name')?.value.trim();
        const email    = document.getElementById('r-email')?.value.trim();
        const password = document.getElementById('r-password')?.value;
        const confirm  = document.getElementById('r-confirm')?.value;
        const college  = document.getElementById('r-college')?.value.trim();

        // Clear all errors
        clearErrors('r-name-err','r-email-err','r-pw-err','r-confirm-err','r-college-err','r-dept-err','r-year-err','r-desig-err');

        let valid = true;

        if (!name || name.length < 2) { showErr('r-name-err', 'Enter your full name'); valid = false; }
        if (!validateEmail(email))    { showErr('r-email-err', 'Enter a valid email (e.g. you@gmail.com)'); valid = false; }
        if (!validatePassword(password)) { showErr('r-pw-err', 'Password must be at least 6 characters'); valid = false; }
        if (password !== confirm)     { showErr('r-confirm-err', 'Passwords do not match'); valid = false; }
        if (!college)                 { showErr('r-college-err', 'Enter your college name'); valid = false; }

        let body = { name, email, password, role, college };

        if (role === 'student') {
          const department = document.getElementById('r-dept')?.value.trim();
          const year       = document.getElementById('r-year')?.value;
          if (!department) { showErr('r-dept-err', 'Enter your department'); valid = false; }
          if (!year)        { showErr('r-year-err', 'Select your year of study'); valid = false; }
          body = { ...body, department, year: Number(year) };
        } else {
          const designation = document.getElementById('r-designation')?.value.trim();
          if (!designation) { showErr('r-desig-err', 'Enter your designation'); valid = false; }
          body = { ...body, department: designation };
        }

        if (!valid) return;

        setLoading(btn, true);
        submitting = true;
        try {
          const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();

          if (!res.ok) {
            showToast(data.message || 'Registration failed', 'error');
            submitting = false;
            setLoading(btn, false);
            return;
          }

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          showToast(`Account created! Welcome, ${data.user.name}!`, 'success');
          setTimeout(() => {
            navigate(data.user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
          }, 600);
        } catch (err) {
          console.error('Register error:', err);
          showToast(`Network error: ${err.message}. Check if backend is running on port 5001.`, 'error');
          submitting = false;
          setLoading(btn, false);
        }
      });
    }
  }

  render();
}
