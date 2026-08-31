const app = document.querySelector("#app");

const storage = { role: "edumind.role" };
let config = { hasGeminiKey: false };
let cameraStream = null;
let loginLang = "en";

const loginText = {
  en: {
    title: "EduMind AI",
    subtitle: "Vietnamese Education",
    hero: "Personal learning paths for every role.",
    lead: "Demo role login, real Gemini answer generation, and live device camera capture with simulated OCR feedback.",
    choose: "Sign in as",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    signin: "Sign In",
    noAccount: "No account?",
    contactAdmin: "Contact your school admin",
    footer: "2026 EduMind AI - Vietnamese Education",
  },
  vi: {
    title: "EduMind AI",
    subtitle: "Giao duc Viet Nam",
    hero: "Lo trinh hoc tap ca nhan hoa cho moi vai tro.",
    lead: "Dang nhap demo, cau tra loi Gemini that, camera thiet bi that va phan hoi OCR mau.",
    choose: "Dang nhap voi tu cach",
    email: "Email",
    password: "Mat khau",
    forgot: "Quen mat khau?",
    signin: "Dang nhap",
    noAccount: "Chua co tai khoan?",
    contactAdmin: "Lien he quan tri nha truong",
    footer: "2026 EduMind AI - Giao duc Viet Nam",
  },
};

const roles = {
  student: {
    label: "Student",
    icon: "icon-user",
    loginTitle: "Student learning route",
    loginCopy: "A Socratic tutor, gap map, and daily pathway for focused self-study.",
    title: "Personal AI Tutor",
    subtitle: "Close the right knowledge gaps with guided questions, not copied answers.",
    stats: [["Gap closed", "68%", "Trigonometry foundation is improving."], ["Review path", "7 tasks", "Balanced for tonight's workload."], ["Tutor sessions", "12", "Most questions are now solved independently."]],
    heroStats: [["Mastery", "74%"], ["Focus", "45m"], ["Next review", "Integrals"]],
    panels: [
      { title: "Knowledge gap map", items: [["Grade 11 trigonometry", "Root cause behind Grade 12 integral errors.", 62], ["Derivative chain rule", "Needs two more application drills.", 76], ["Graph interpretation", "Stable enough for mixed practice.", 88]] },
      { title: "Review pathway", items: [["Warm-up recall", "Define sine, cosine, and tangent without notes."], ["Guided problem", "Solve one integral using substitution hints."], ["Reflection", "Write one line about the step that caused friction."]] },
    ],
    aiMode: "Guide the student using Socratic questions. Do not give the final answer immediately.",
  },
  teacher: {
    label: "Teacher",
    icon: "icon-teacher",
    loginTitle: "Teacher dashboard route",
    loginCopy: "Demo grading, exam matrix, and class competency reports for busy classrooms.",
    title: "Teaching Command Center",
    subtitle: "Turn assessment workload into clear feedback, exam structure, and class insight.",
    stats: [["Assignments scanned", "42", "Demo OCR queue for written Math work."], ["Time saved", "70%", "Modeled after the project outline target."], ["Exam matrix", "30s", "Recognition to advanced application."]],
    heroStats: [["Class mastery", "81%"], ["Needs feedback", "9"], ["Next lesson", "Applications"]],
    panels: [
      { title: "Class competency report", items: [["Recognition", "Students identify formulas accurately.", 91], ["Understanding", "Most errors come from explaining method choice.", 78], ["Application", "Mixed-topic transfer needs another example.", 65]] },
      { title: "Exam generator demo", items: [["Recognition", "4 short questions checking definitions."], ["Understanding", "3 explanation questions with diagrams."], ["Advanced application", "1 multi-step problem with solution key."]] },
    ],
    aiMode: "Assist the teacher with concise grading feedback and differentiated exam ideas aligned to competency assessment.",
  },
  parent: {
    label: "Parent",
    icon: "icon-parent",
    loginTitle: "Parent insight route",
    loginCopy: "Progress, weak competencies, and next actions in language parents can act on.",
    title: "Parent Progress View",
    subtitle: "See learning progress from real competency signals instead of only final scores.",
    stats: [["Progress trend", "+12%", "Four-week learning growth."], ["Risk areas", "2", "Math proof and Chemistry formula recall."], ["Teacher notes", "5", "Recent qualitative feedback items."]],
    heroStats: [["Confidence", "High"], ["Weekly work", "5h"], ["Next action", "Review plan"]],
    panels: [
      { title: "Competency snapshot", items: [["Mathematics reasoning", "Improving with guided practice.", 72], ["Chemistry formulas", "Recall is inconsistent under time pressure.", 58], ["Reading comprehension", "Strong and stable.", 91]] },
      { title: "Parent action list", items: [["Tonight", "Ask the student to explain one solved problem aloud."], ["This week", "Check completion of the personalized review path."], ["Next meeting", "Discuss formula recall strategy with the teacher."]] },
    ],
    aiMode: "Explain progress to a parent in plain language with practical support steps.",
  },
};

const studentOverview = {
  stats: [
    ["Mastery", "78%", "Algebra and graph reading are trending up.", "icon-target"],
    ["Study streak", "12 days", "Consistent short sessions this month.", "icon-clock"],
    ["Due today", "3 tasks", "A focused workload, not a long queue.", "icon-check"],
  ],
  pathway: [
    ["Linear equations", "Warm-up", "10 min", 86, "Solve two one-step equations and explain the inverse operation."],
    ["Graph intercepts", "Core gap", "18 min", 64, "Read x- and y-intercepts from a graph before writing the equation."],
    ["Word problems", "Stretch", "15 min", 52, "Translate one sentence into an equation before calculating."],
  ],
};

const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"></use></svg>`;
const route = () => location.hash.replace(/^#\/?/, "") || "login";
const setRoute = (path) => { location.hash = path; };
const currentRole = () => {
  const part = route().split("/")[1] || route().split("/")[0] || localStorage.getItem(storage.role) || "student";
  return roles[part] ? part : "student";
};

async function initBackend() {
  try {
    config = await fetch("/config").then((response) => response.json());
  } catch {
    config = { hasGeminiKey: false };
  }
}

function roleCard(roleId) {
  const role = roles[roleId];
  return `
    <a class="route-card" href="#/login/${roleId}">
      <span class="route-icon">${icon(role.icon)}</span>
      <span><strong>${role.label}</strong><p>${role.loginCopy}</p></span>
    </a>
  `;
}

function renderLogin(roleId = currentRole()) {
  const role = roles[roleId];
  const t = loginText[loginLang];
  app.innerHTML = `
    <main class="login-page figma-login">
      <div class="ambient-bg" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>

      <div class="language-switch" aria-label="Language">
        <button class="${loginLang === "en" ? "active" : ""}" type="button" data-lang="en" aria-label="Switch to English">
          <span class="flag flag-en" aria-hidden="true"></span>
          <span>EN</span>
        </button>
        <button class="${loginLang === "vi" ? "active" : ""}" type="button" data-lang="vi" aria-label="Switch to Vietnamese">
          <span class="flag flag-vn" aria-hidden="true"></span>
          <span>VI</span>
        </button>
      </div>

      <section class="login-stack" aria-labelledby="login-title">
        <div class="login-logo-wrap">
          <div class="login-logo-ring">
            <span class="login-logo-core">${icon("icon-eye-logo")}</span>
          </div>
        </div>

        <header class="login-title-block">
          <h1 id="login-title">${t.title}</h1>
          <p>${t.subtitle}</p>
          <span>${t.lead}</span>
        </header>

        <div class="rainbow-rule" aria-hidden="true"></div>

        <div class="login-card" aria-labelledby="route-title">
          <div class="role-selector" aria-label="Login route selector">
            ${Object.keys(roles).map((id) => `
              <a class="${id === roleId ? "active" : ""}" href="#/login/${id}" style="--role-color:${roleColor(id)}">
                <span class="route-icon">${icon(roles[id].icon)}</span>
                ${roles[id].label}
              </a>
            `).join("")}
          </div>

          <div>
            <p class="signin-as">${t.choose} <strong style="color:${roleColor(roleId)}">${role.label}</strong></p>
            <h2 id="route-title">${t.hero}</h2>
          </div>

          <form class="login-form" id="loginForm">
            <div class="form-field">
              <label for="email">${t.email}</label>
              <input id="email" type="email" autocomplete="email" value="${roleId}@edumind.demo" required />
            </div>
            <div class="form-field">
              <label for="password">${t.password}</label>
              <div class="password-field">
                <input id="password" type="password" autocomplete="current-password" value="demo12345" required />
                <button id="togglePassword" type="button">show</button>
              </div>
              <p class="field-hint">Demo login accepts any filled email and password.</p>
            </div>
            <div class="forgot-row">
              <button type="button">${t.forgot}</button>
            </div>
            <button class="button primary" type="submit">${t.signin}</button>
            <p class="form-message" id="loginMessage" role="alert"></p>
          </form>

          <p class="admin-link">${t.noAccount} <button type="button">${t.contactAdmin}</button></p>
        </div>

        <footer class="login-footer">${t.footer}</footer>
      </section>
    </main>
  `;

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      loginLang = button.dataset.lang;
      renderLogin(roleId);
    });
  });
  document.querySelector("#togglePassword").addEventListener("click", (event) => {
    const input = document.querySelector("#password");
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    event.currentTarget.textContent = hidden ? "hide" : "show";
  });
  document.querySelector("#loginForm").addEventListener("submit", (event) => login(event, roleId));
}

function roleColor(roleId) {
  return { student: "#00b4d8", teacher: "#06d6a0", parent: "#a855f7" }[roleId];
}

function login(event, roleId) {
  event.preventDefault();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();
  const message = document.querySelector("#loginMessage");
  if (!email || !password) return show(message, "Enter email and password to continue.", "error");
  localStorage.setItem(storage.role, roleId);
  setRoute(roleId);
}

function metricCard([title, value, copy]) {
  return `<article class="metric-card"><div class="metric-title"><span class="eyebrow">${title}</span><span class="metric-icon">${icon("icon-chart")}</span></div><strong>${value}</strong><p>${copy}</p></article>`;
}

function panelItem(item) {
  if (item.length === 3) return `<li class="competency-row"><strong>${item[0]}</strong><span>${item[1]}</span><div class="progress-track" aria-label="${item[0]} ${item[2]} percent"><i style="width:${item[2]}%"></i></div></li>`;
  return `<li><strong>${item[0]}</strong><span>${item[1]}</span></li>`;
}

function panel(section) {
  const id = section.title.replace(/\s+/g, "-").toLowerCase();
  return `<section class="panel" aria-labelledby="${id}"><div class="section-head"><div><p class="eyebrow">Demo module</p><h2 id="${id}">${section.title}</h2></div></div><ul class="panel-list">${section.items.map(panelItem).join("")}</ul></section>`;
}

function renderDashboard(roleId = currentRole()) {
  if (roleId === "student") return renderStudentDashboard();
  const role = roles[roleId];
  localStorage.setItem(storage.role, roleId);
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar" aria-label="Primary navigation">
        <a class="nav-brand" href="#/login/${roleId}"><span class="brand-mark">${icon("icon-brain")}</span><span class="brand-name">AI EduMind</span></a>
        <nav class="nav" aria-label="Role dashboards">${Object.entries(roles).map(([id, item]) => `<a class="${id === roleId ? "active" : ""}" href="#/${id}"><span class="nav-icon">${icon(item.icon)}</span>${item.label}</a>`).join("")}</nav>
        <button class="logout-button" id="logoutButton" type="button">${icon("icon-log-out")} Login screen</button>
      </aside>
      <main class="main">
        <header class="topbar"><div><p class="eyebrow">${role.label} route</p><h1>${role.title}</h1></div><div class="role-tabs" aria-label="Quick role switcher">${Object.keys(roles).map((id) => `<a class="role-chip ${id === roleId ? "active" : ""}" href="#/${id}">${roles[id].label}</a>`).join("")}</div></header>
        <div class="dashboard-grid">
          <section class="hero-panel" aria-labelledby="dashboard-title">
            <div class="hero-panel-copy"><p class="eyebrow">Hard-coded demo</p><h2 id="dashboard-title">${role.subtitle}</h2><p>Gemini runs through this local server so the API key stays off the client. Camera capture uses the real device camera.</p><div class="button-row"><button class="button primary" id="openAiSection" type="button">${icon("icon-send")} Open Gemini AI</button><button class="button ghost" id="openCameraSection" type="button">${icon("icon-chart")} Open camera OCR</button></div></div>
            <div class="hero-stats">${role.heroStats.map(([label, value], index) => `<div class="hero-stat ${index === 2 ? "wide" : ""}"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>
          </section>
          <section class="metric-grid" aria-label="${role.label} metrics">${role.stats.map(metricCard).join("")}</section>
          ${role.panels.map(panel).join("")}
          ${renderCameraCard(roleId)}
          <section class="panel"><div class="section-head"><div><p class="eyebrow">Pilot KPIs</p><h2>Evaluation targets</h2></div><span class="pill">${role.label}</span></div><div class="timeline"><article class="timeline-item"><strong>OCR accuracy</strong><p>Target: at least 90 percent handwriting and formula recognition.</p></article><article class="timeline-item"><strong>Mistake detection</strong><p>Target: at least 85 percent detection accuracy in student work.</p></article><article class="timeline-item"><strong>Learning outcome</strong><p>Target: at least 75 percent of students solve problems after tutor interaction.</p></article></div></section>
          ${renderAiCard(roleId)}
        </div>
      </main>
    </div>
  `;
  wireDashboard(roleId);
}

function renderStudentDashboard() {
  localStorage.setItem(storage.role, "student");
  app.innerHTML = `
    <div class="student-shell">
      <aside class="student-sidebar" aria-label="Student navigation">
        <a class="student-brand" href="#/login/student">
          <span class="student-brand-mark">${icon("icon-eye-logo")}</span>
          <span><strong>EduMind</strong><small>Student route</small></span>
        </a>
        <nav class="student-nav" aria-label="Student dashboard sections">
          <a class="active" href="#/student">${icon("icon-home")} Dashboard</a>
          <a href="#/student" data-scroll="ai-assistant">${icon("icon-brain")} AI Tutor</a>
          <a href="#/student" data-scroll="camera-ocr">${icon("icon-camera")} OCR Scan</a>
          <a href="#/student" data-scroll="review-pathway">${icon("icon-target")} Review Path</a>
        </nav>
        <button class="logout-button student-logout" id="logoutButton" type="button">${icon("icon-log-out")} Login screen</button>
      </aside>

      <main class="student-main" id="main-content">
        <div class="student-mobile-top">
          <a class="student-brand" href="#/login/student">
            <span class="student-brand-mark">${icon("icon-eye-logo")}</span>
            <span><strong>EduMind</strong><small>Student</small></span>
          </a>
          <span class="student-language-pill"><span class="flag flag-en" aria-hidden="true"></span> EN</span>
        </div>

        <header class="student-hero" aria-labelledby="student-title">
          <div>
            <p class="eyebrow">Good evening, Linh</p>
            <h1 id="student-title">Student Dashboard</h1>
            <p>Gemini guides your next step, checks scanned work, and recommends the right review workload for today.</p>
          </div>
          <div class="student-hero-actions">
            <button class="button primary" id="openAiSection" type="button">${icon("icon-brain")} Ask tutor</button>
            <button class="button ghost" id="openCameraSection" type="button">${icon("icon-camera")} Scan work</button>
          </div>
        </header>

        <section class="student-stats" aria-label="Student progress summary">
          ${studentOverview.stats.map(([label, value, copy, glyph]) => `
            <article class="student-stat-card">
              <span class="student-card-icon">${icon(glyph)}</span>
              <p>${label}</p>
              <strong>${value}</strong>
              <span>${copy}</span>
            </article>
          `).join("")}
        </section>

        <div class="student-dashboard-grid">
          <section class="student-panel student-tutor" id="ai-assistant" aria-labelledby="ai-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">24/7 Socratic AI Tutor</p>
                <h2 id="ai-title">Think with Gemini, do not copy from it.</h2>
              </div>
              <span class="pill" id="keyStatus">${config.hasGeminiKey ? "Gemini ready" : "Missing key"}</span>
            </div>
            <div class="student-tutor-prompt">
              <span class="student-card-icon">${icon("icon-spark")}</span>
              <p>Before solving, what operation would isolate the variable, and why does that operation preserve equality?</p>
            </div>
            <form class="ai-form student-ai-form" id="aiForm">
              <label for="prompt">Ask the tutor</label>
              <textarea id="prompt">Guide me through solving 2x + 7 = 19 using Socratic questions. Do not give the final answer immediately.</textarea>
              <label class="sr-only" for="model">Model</label>
              <select class="student-model-select" id="model" aria-label="Gemini model">
                <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
                <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
              </select>
              <div class="chat-form-actions">
                <button class="button primary" id="askGemini" type="submit">${icon("icon-send")} Ask next question</button>
                <button class="button ghost" id="fillPrompt" type="button">${icon("icon-check")} Demo prompt</button>
              </div>
              <p class="form-message" id="aiMessage" role="status" aria-live="polite"></p>
            </form>
            <article class="student-response" aria-labelledby="response-title">
              <div class="response-head">
                <h3 id="response-title">Gemini tutor response</h3>
                <span class="pill">Live</span>
              </div>
              <div class="response-output" id="responseOutput">The tutor will answer with guided questions after a real backend Gemini request.</div>
            </article>
          </section>

          <section class="student-panel student-camera" id="camera-ocr" aria-labelledby="camera-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">OCR scanning and grading</p>
                <h2 id="camera-title">Capture a worksheet with the device camera.</h2>
              </div>
              <span class="pill">Camera</span>
            </div>
            <div class="student-camera-grid">
              <div class="camera-preview student-camera-preview">
                <video id="cameraVideo" playsinline autoplay muted></video>
                <canvas id="cameraCanvas" hidden></canvas>
                <div class="camera-placeholder" aria-hidden="true">${icon("icon-camera")} Point camera at written work</div>
              </div>
              <div class="student-camera-actions">
                <button class="button primary" id="startCamera" type="button">${icon("icon-camera")} Start camera</button>
                <button class="button ghost" id="captureFrame" type="button">${icon("icon-check")} Grade scan</button>
                <button class="button ghost" id="stopCamera" type="button">${icon("icon-log-out")} Stop</button>
              </div>
            </div>
            <p class="form-message" id="cameraMessage" role="status" aria-live="polite"></p>
            <article class="student-ocr-result" aria-labelledby="ocr-title">
              <span>84%</span>
              <div>
                <h3 id="ocr-title">OCR demo response</h3>
                <p id="ocrOutput">Start the camera and capture a frame. If Gemini is configured, the captured image is sent to the local backend for OCR-style feedback.</p>
              </div>
            </article>
          </section>

          <section class="student-panel student-review" id="review-pathway" aria-labelledby="review-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">Personalized Review Pathway</p>
                <h2 id="review-title">Recommended for the next 43 minutes.</h2>
              </div>
              <span class="pill">Gemini planned</span>
            </div>
            <ol class="student-path-list">
              ${studentOverview.pathway.map(([name, tag, time, score, copy]) => `
                <li>
                  <div>
                    <strong>${name}</strong>
                    <p>${copy}</p>
                  </div>
                  <span>${tag}</span>
                  <small>${time}</small>
                  <div class="progress-track" aria-label="${name} readiness ${score} percent"><i style="width:${score}%"></i></div>
                </li>
              `).join("")}
            </ol>
          </section>

        </div>

        <nav class="student-bottom-nav" aria-label="Student mobile navigation">
          <a class="active" href="#/student">${icon("icon-home")}<span>Home</span></a>
          <a href="#/student" data-scroll="ai-assistant">${icon("icon-brain")}<span>Tutor</span></a>
          <a href="#/student" data-scroll="camera-ocr">${icon("icon-camera")}<span>Scan</span></a>
          <a href="#/student" data-scroll="review-pathway">${icon("icon-target")}<span>Review</span></a>
        </nav>
      </main>
    </div>
  `;
  wireDashboard("student");
}

function renderCameraCard(roleId) {
  return `
    <section class="camera-card panel" id="camera-ocr" aria-labelledby="camera-title">
      <div class="section-head">
        <div><p class="eyebrow">Real camera, demo OCR</p><h2 id="camera-title">Assignment scanner</h2></div>
        <span class="pill">${roles[roleId].label}</span>
      </div>
      <div class="camera-grid">
        <div class="camera-preview">
          <video id="cameraVideo" playsinline autoplay muted></video>
          <canvas id="cameraCanvas" hidden></canvas>
        </div>
        <div class="camera-actions">
          <button class="button primary" id="startCamera" type="button">${icon("icon-chart")} Start camera</button>
          <button class="button ghost" id="captureFrame" type="button">${icon("icon-check")} Capture</button>
          <button class="button ghost" id="stopCamera" type="button">${icon("icon-log-out")} Stop</button>
          <p class="form-message" id="cameraMessage" role="status" aria-live="polite"></p>
        </div>
      </div>
      <article class="ocr-result" aria-labelledby="ocr-title">
        <h3 id="ocr-title">OCR demo response</h3>
        <p id="ocrOutput">Start the camera and capture a frame to simulate OCR analysis.</p>
      </article>
    </section>
  `;
}

function renderAiCard(roleId) {
  const role = roles[roleId];
  return `
    <section class="ai-card" id="ai-assistant" aria-labelledby="ai-title">
      <div>
        <div class="ai-toolbar"><div><p class="eyebrow">Backend Gemini key</p><h2 id="ai-title">Local AI proxy</h2></div><span class="pill" id="keyStatus">${config.hasGeminiKey ? "Gemini ready" : "Missing key"}</span></div>
        <form class="ai-form" id="aiForm">
          <div class="form-grid">
            <div class="form-field"><label for="model">Model</label><select id="model"><option value="gemini-3.6-flash">Gemini 3.6 Flash</option><option value="gemini-3.5-flash">Gemini 3.5 Flash</option><option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite</option><option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option><option value="gemini-3.7-flash">Gemini 3.7 Flash</option></select></div>
            <div class="form-field"><label for="audience">Route context</label><input id="audience" value="${role.label}" readonly /></div>
          </div>
          <div class="form-field"><label for="prompt">Prompt</label><textarea id="prompt">${role.aiMode} Topic: ${defaultTopic(roleId)}</textarea></div>
          <div class="chat-form-actions"><button class="button primary" id="askGemini" type="submit">${icon("icon-send")} Ask Gemini</button><button class="button ghost" id="fillPrompt" type="button">${icon("icon-check")} Demo prompt</button></div>
          <p class="form-message" id="aiMessage" role="status" aria-live="polite"></p>
        </form>
      </div>
      <article class="response-box" aria-labelledby="response-title"><div class="response-head"><h3 id="response-title">Gemini response</h3><span class="pill">Live</span></div><div class="response-output" id="responseOutput">The AI response will appear here after a real backend Gemini request.</div></article>
    </section>
  `;
}

function defaultTopic(roleId) {
  if (roleId === "teacher") return "Create qualitative feedback for a student who understands the formula but made an algebra mistake.";
  if (roleId === "parent") return "Explain a student's weak Chemistry formula recall and suggest three practical support actions.";
  return "Guide me through solving a Grade 12 integral using Socratic questions.";
}

function show(element, text, type = "") {
  element.textContent = text;
  element.className = `form-message ${type}`.trim();
}

function setAiLoading(loading) {
  const button = document.querySelector("#askGemini");
  const label = currentRole() === "student" ? "Ask next question" : "Ask Gemini";
  button.disabled = loading;
  button.innerHTML = loading ? "Thinking..." : `${icon("icon-send")} ${label}`;
}

function wireDashboard(roleId) {
  document.querySelector("#logoutButton").addEventListener("click", () => setRoute(`login/${roleId}`));
  document.querySelector("#openAiSection").addEventListener("click", () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector("#ai-assistant").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });
  document.querySelector("#openCameraSection").addEventListener("click", () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector("#camera-ocr").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(link.dataset.scroll)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });
  document.querySelector("#startCamera").addEventListener("click", startCamera);
  document.querySelector("#captureFrame").addEventListener("click", captureFrame);
  document.querySelector("#stopCamera").addEventListener("click", stopCamera);
  document.querySelector("#fillPrompt").addEventListener("click", () => {
    document.querySelector("#prompt").value = roles[roleId].aiMode + " Topic: " + defaultTopic(roleId);
  });
  document.querySelector("#aiForm").addEventListener("submit", askGemini);
}

async function askGemini(event) {
  event.preventDefault();
  const message = document.querySelector("#aiMessage");
  const output = document.querySelector("#responseOutput");
  const prompt = document.querySelector("#prompt").value.trim();
  if (!prompt) return show(message, "Enter a prompt first.", "error");
  setAiLoading(true);
  show(message, "Sending request to local Gemini backend...");
  output.textContent = "";
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: document.querySelector("#model").value, prompt }),
    });
    const data = await readResponseBody(response);
    if (!response.ok) throw new Error(data.error || "Gemini request failed.");
    output.textContent = data.text || "Gemini returned no text.";
    show(message, "Response ready.", "success");
  } catch (error) {
    output.textContent = "Check .env, selected model, Gemini API access, and server logs.";
    show(message, error.message, "error");
  } finally {
    setAiLoading(false);
  }
}

async function startCamera() {
  const video = document.querySelector("#cameraVideo");
  const message = document.querySelector("#cameraMessage");
  if (!navigator.mediaDevices?.getUserMedia) return show(message, "Camera access is not supported in this browser.", "error");
  try {
    stopCamera(false);
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    video.srcObject = cameraStream;
    video.classList.add("is-live");
    show(message, "Camera is live. Point it at a worksheet and capture.", "success");
  } catch (error) {
    show(message, error.message || "Camera permission was blocked.", "error");
  }
}

async function captureFrame() {
  const video = document.querySelector("#cameraVideo");
  const canvas = document.querySelector("#cameraCanvas");
  const output = document.querySelector("#ocrOutput");
  const message = document.querySelector("#cameraMessage");
  if (!cameraStream || !video.videoWidth) return show(message, "Start the camera before capturing.", "error");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const demoText = [
    "Detected worksheet: Math assignment photo",
    "Extracted text: Solve x^2 - 5x + 6 = 0 and explain each step.",
    "Demo feedback: The solution likely factors into (x - 2)(x - 3). Check whether the student wrote both roots and justified the factorization.",
  ].join("\n");

  if (!config.hasGeminiKey) {
    output.textContent = demoText;
    return show(message, "Frame captured. Add GEMINI_API_KEY for live image feedback.", "success");
  }

  show(message, "Frame captured. Sending image to Gemini for OCR-style grading...");
  output.textContent = "Analyzing captured worksheet image...";
  try {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: document.querySelector("#model")?.value || "gemini-3.6-flash",
        prompt: "You are EduMind OCR grading support. Read this worksheet photo, extract any visible math work, grade it briefly, and give Socratic next-step feedback. If the photo is unclear, say what to retake.",
        image: {
          mimeType: "image/jpeg",
          data: dataUrl.split(",")[1],
        },
      }),
    });
    const data = await readResponseBody(response);
    if (!response.ok) throw new Error(data.error || "Gemini image request failed.");
    output.textContent = data.text || demoText;
    show(message, "Gemini OCR-style feedback ready.", "success");
  } catch (error) {
    output.textContent = `${demoText}\n\nLive Gemini image feedback failed: ${error.message}`;
    show(message, "Using demo OCR feedback because Gemini image analysis failed.", "error");
  }
}

function stopCamera(clearMessage = true) {
  if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  const video = document.querySelector("#cameraVideo");
  if (video) {
    video.srcObject = null;
    video.classList.remove("is-live");
  }
  if (clearMessage) show(document.querySelector("#cameraMessage"), "Camera stopped.");
}

async function readResponseBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || response.statusText || "Request failed" };
  }
}

function render() {
  const [first, second] = route().split("/");
  if (first === "login") return renderLogin(roles[second] ? second : currentRole());
  if (roles[first]) return renderDashboard(first);
  renderLogin(currentRole());
}

window.addEventListener("hashchange", render);
initBackend().then(render);
