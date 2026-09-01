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

const commonText = {
  en: {
    roles: { student: "Student", teacher: "Teacher", parent: "Parent" },
    loginScreen: "Login screen",
    geminiReady: "Gemini ready",
    missingKey: "Missing key",
    live: "Live",
  },
  vi: {
    roles: { student: "Học sinh", teacher: "Giáo viên", parent: "Phụ huynh" },
    loginScreen: "Màn hình đăng nhập",
    geminiReady: "Gemini sẵn sàng",
    missingKey: "Thiếu khóa",
    live: "Trực tiếp",
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

const teacherOverview = {
  stats: [
    ["Assignments scanned", "42", "AI feedback drafts waiting for review.", "icon-camera"],
    ["Exam matrix", "30 sec", "Recognition to advanced application.", "icon-book"],
    ["Class mastery", "81%", "Grade 12A is ready for mixed practice.", "icon-chart"],
  ],
  examRows: [
    ["Recognition", "4 questions", "Definitions, formulas, direct substitution."],
    ["Understanding", "3 questions", "Explain methods and compare solution paths."],
    ["Application", "2 questions", "Use concepts in familiar classroom contexts."],
    ["Advanced Application", "1 question", "Multi-step transfer problem with solution key."],
  ],
  competencyRows: [
    ["12A", 81, "Ready for harder mixed exercises."],
    ["12B", 68, "Needs another guided example before testing."],
    ["11C", 74, "Stable, but written reasoning is uneven."],
  ],
};

const pageText = {
  student: {
    en: {
      route: "Student route",
      mobileRoute: "Student",
      nav: ["Dashboard", "AI Tutor", "OCR Scan", "Review Path"],
      eyebrow: "Good evening, Linh",
      title: "Student Dashboard",
      lead: "Gemini guides your next step, checks scanned work, and recommends the right review workload for today.",
      askTutor: "Ask tutor",
      scanWork: "Scan work",
      tutorLabel: "24/7 Socratic AI Tutor",
      tutorTitle: "Think with Gemini, do not copy from it.",
      tutorPrompt: "Before solving, what operation would isolate the variable, and why does that operation preserve equality?",
      askLabel: "Ask the tutor",
      askNext: "Ask next question",
      demoPrompt: "Demo prompt",
      responseTitle: "Gemini tutor response",
      responseEmpty: "The tutor will answer with guided questions after a real backend Gemini request.",
      ocrLabel: "OCR scanning and grading",
      ocrTitle: "Capture a worksheet with the device camera.",
      camera: "Camera",
      cameraPlaceholder: "Point camera at written work",
      startCamera: "Start camera",
      gradeScan: "Grade scan",
      stop: "Stop",
      ocrResponse: "OCR demo response",
      ocrEmpty: "Start the camera and capture a frame. If Gemini is configured, the captured image is sent to the local backend for OCR-style feedback.",
      reviewLabel: "Personalized Review Pathway",
      reviewTitle: "Recommended for the next 43 minutes.",
      planned: "Gemini planned",
      stats: studentOverview.stats,
      pathway: studentOverview.pathway,
    },
    vi: {
      route: "Vai trò học sinh",
      mobileRoute: "Học sinh",
      nav: ["Tổng quan", "Gia sư AI", "Quét OCR", "Lộ trình ôn"],
      eyebrow: "Chào buổi tối, Linh",
      title: "Bảng điều khiển học sinh",
      lead: "Gemini gợi ý bước tiếp theo, kiểm tra bài scan và đề xuất khối lượng ôn tập phù hợp hôm nay.",
      askTutor: "Hỏi gia sư",
      scanWork: "Quét bài",
      tutorLabel: "Gia sư Socratic AI 24/7",
      tutorTitle: "Suy nghĩ cùng Gemini, không chép lời giải.",
      tutorPrompt: "Trước khi giải, phép toán nào giúp cô lập biến, và vì sao phép toán đó giữ nguyên đẳng thức?",
      askLabel: "Hỏi gia sư",
      askNext: "Hỏi câu tiếp theo",
      demoPrompt: "Gợi ý mẫu",
      responseTitle: "Phản hồi gia sư Gemini",
      responseEmpty: "Gia sư sẽ trả lời bằng câu hỏi gợi mở sau khi gửi yêu cầu Gemini thật qua backend.",
      ocrLabel: "Quét OCR và chấm điểm",
      ocrTitle: "Chụp bài làm bằng camera thiết bị.",
      camera: "Camera",
      cameraPlaceholder: "Hướng camera vào bài viết tay",
      startCamera: "Bật camera",
      gradeScan: "Chấm bài scan",
      stop: "Dừng",
      ocrResponse: "Phản hồi OCR mẫu",
      ocrEmpty: "Bật camera và chụp khung hình. Nếu đã cấu hình Gemini, ảnh sẽ được gửi tới backend cục bộ để nhận phản hồi OCR.",
      reviewLabel: "Lộ trình ôn tập cá nhân hóa",
      reviewTitle: "Đề xuất cho 43 phút tiếp theo.",
      planned: "Gemini đề xuất",
      stats: [
        ["Mức thành thạo", "78%", "Đại số và đọc đồ thị đang tiến bộ.", "icon-target"],
        ["Chuỗi học tập", "12 ngày", "Các buổi học ngắn đang được duy trì.", "icon-clock"],
        ["Hôm nay", "3 bài", "Khối lượng tập trung, không quá tải.", "icon-check"],
      ],
      pathway: [
        ["Phương trình tuyến tính", "Khởi động", "10 phút", 86, "Giải hai phương trình một bước và giải thích phép toán ngược."],
        ["Giao điểm đồ thị", "Lỗ hổng chính", "18 phút", 64, "Đọc giao điểm x và y trước khi viết phương trình."],
        ["Bài toán lời văn", "Nâng cao", "15 phút", 52, "Chuyển một câu thành phương trình trước khi tính."],
      ],
    },
  },
};

const parentOverview = {
  stats: [
    ["Weekly confidence", "High", "Your child completed 5 of 6 planned sessions.", "icon-check"],
    ["Calm check-in", "18 min", "Recommended emotional support window for tonight.", "icon-clock"],
    ["Ask teacher", "3 notes", "Prepared questions for the next check-in.", "icon-parent"],
  ],
  digest: [
    ["Math reasoning", "Improving", 76, "Explains the operation more clearly, but still skips one written justification step."],
    ["Chemistry recall", "Needs support", 58, "Formula recall drops when questions are timed or mixed with older topics."],
    ["Study habits", "Stable", 84, "Short evening sessions are working better than one long weekend session."],
  ],
  support: [
    ["Tonight", "Start with one calm check-in: ask how the lesson felt before discussing scores."],
    ["This week", "Praise one specific effort habit, then choose one small stress trigger to reduce."],
    ["Before test day", "Agree on a short break plan and remind the student that mistakes are feedback."],
  ],
  gradeReport: [
    ["Mathematics", "8.4", "+0.6", "Reasoning improved after guided review."],
    ["Chemistry", "7.1", "-0.2", "Formula recall still drops under time pressure."],
    ["Literature", "8.8", "+0.4", "Reading comprehension remains strong."],
  ],
};

pageText.teacher = {
  en: {
    route: "Teacher route",
    mobileRoute: "Teacher",
    nav: ["Dashboard", "Smart Grading", "Exam Matrix", "Reports"],
    eyebrow: "Teacher command center",
    title: "Grade faster. Plan sharper.",
    lead: "Scan handwritten work, generate differentiated exams, and review class competency signals from one teacher dashboard.",
    scan: "Scan assignment",
    buildExam: "Build exam",
    gradingLabel: "Smart Grading Assistant",
    gradingTitle: "Handwritten assignment grading and feedback suggestions.",
    gradingCopy: "Capture student work. EduMind can recognize solution steps, detect likely mistakes, and draft qualitative feedback for teacher review.",
    moet: "MOET aligned",
    scanPlaceholder: "Scan student solution",
    startCamera: "Start camera",
    generateFeedback: "Generate feedback",
    stop: "Stop",
    feedbackDraft: "Feedback draft",
    feedbackEmpty: "Start the camera and capture an assignment photo to generate a grading-feedback demo.",
    examLabel: "Auto Exam Matrix Generator",
    examTitle: "Differentiated exams from a standard matrix.",
    examPill: "30 sec demo",
    generateExam: "Generate exam preview",
    reportsLabel: "Classroom Competency Reports",
    reportsTitle: "Mastery charts for lesson adjustment.",
    modalLabel: "Generated exam preview",
    modalTitle: "Grade 12 Algebra - 30 minute matrix",
    discard: "Discard",
    download: "Download",
    chatLabel: "Gemini chatbot",
    chatTitle: "Teacher assistant",
    chatEmpty: "Ask for feedback wording, exam ideas, or lesson adjustments.",
    chatPrompt: "Draft qualitative feedback for a student who used the correct formula but skipped explanation steps.",
    send: "Send",
    stats: teacherOverview.stats,
    examRows: teacherOverview.examRows,
    competencyRows: teacherOverview.competencyRows,
  },
  vi: {
    route: "Vai trò giáo viên",
    mobileRoute: "Giáo viên",
    nav: ["Tổng quan", "Chấm thông minh", "Ma trận đề", "Báo cáo"],
    eyebrow: "Trung tâm giáo viên",
    title: "Chấm nhanh hơn. Dạy sát hơn.",
    lead: "Quét bài viết tay, tạo đề phân hóa và xem năng lực lớp trong một bảng điều khiển.",
    scan: "Quét bài làm",
    buildExam: "Tạo đề",
    gradingLabel: "Trợ lý chấm bài thông minh",
    gradingTitle: "Chấm bài viết tay và gợi ý nhận xét.",
    gradingCopy: "Chụp bài làm học sinh. EduMind nhận diện bước giải, phát hiện lỗi và soạn nhận xét định tính để giáo viên duyệt.",
    moet: "Theo định hướng MOET",
    scanPlaceholder: "Quét lời giải học sinh",
    startCamera: "Bật camera",
    generateFeedback: "Tạo nhận xét",
    stop: "Dừng",
    feedbackDraft: "Bản nháp nhận xét",
    feedbackEmpty: "Bật camera và chụp bài làm để tạo phản hồi chấm bài mẫu.",
    examLabel: "Tạo ma trận đề tự động",
    examTitle: "Đề phân hóa từ ma trận chuẩn.",
    examPill: "Demo 30 giây",
    generateExam: "Tạo bản xem trước",
    reportsLabel: "Báo cáo năng lực lớp",
    reportsTitle: "Biểu đồ mức thành thạo để điều chỉnh bài dạy.",
    modalLabel: "Bản xem trước đề kiểm tra",
    modalTitle: "Đại số lớp 12 - Ma trận 30 phút",
    discard: "Bỏ",
    download: "Tải xuống",
    chatLabel: "Chatbot Gemini",
    chatTitle: "Trợ lý giáo viên",
    chatEmpty: "Hỏi về cách viết nhận xét, ý tưởng đề kiểm tra hoặc điều chỉnh bài dạy.",
    chatPrompt: "Soạn nhận xét định tính cho học sinh dùng đúng công thức nhưng thiếu bước giải thích.",
    send: "Gửi",
    stats: [
      ["Bài đã quét", "42", "Bản nháp nhận xét AI đang chờ duyệt.", "icon-camera"],
      ["Ma trận đề", "30 giây", "Từ nhận biết đến vận dụng cao.", "icon-book"],
      ["Mức thành thạo", "81%", "Lớp 12A sẵn sàng luyện bài tổng hợp.", "icon-chart"],
    ],
    examRows: [
      ["Nhận biết", "4 câu", "Định nghĩa, công thức, thay số trực tiếp."],
      ["Thông hiểu", "3 câu", "Giải thích phương pháp và so sánh cách giải."],
      ["Vận dụng", "2 câu", "Dùng kiến thức trong ngữ cảnh quen thuộc."],
      ["Vận dụng cao", "1 câu", "Bài chuyển giao nhiều bước kèm đáp án."],
    ],
    competencyRows: [
      ["12A", 81, "Sẵn sàng luyện bài tổng hợp khó hơn."],
      ["12B", 68, "Cần thêm ví dụ có hướng dẫn trước khi kiểm tra."],
      ["11C", 74, "Ổn định, nhưng lập luận viết còn chưa đều."],
    ],
  },
};

pageText.parent = {
  en: {
    route: "Parent route",
    mobileRoute: "Parent",
    nav: ["Overview", "Learning Digest", "Emotional Support", "Grade Report"],
    eyebrow: "Parent insight dashboard",
    title: "Know how to help without becoming the teacher.",
    lead: "EduMind turns learning data into plain-language progress, home actions, and teacher questions parents can actually use.",
    tonight: "Tonight's parent action",
    supportWindow: "18 minutes",
    supportWindowCopy: "Best support window tonight: one explanation check and one short recall drill.",
    digestLabel: "Weekly Learning Digest",
    digestTitle: "Progress translated into parent language.",
    plain: "Plain English",
    supportLabel: "Emotional Support Plan",
    supportTitle: "Small check-ins that lower pressure before learning.",
    gradeLabel: "Grade Report",
    gradeTitle: "Recent scores with simple parent context.",
    gradePill: "3 subjects",
    advisorLabel: "Gemini Parent Advisor",
    advisorTitle: "Ask for a practical next step.",
    question: "Parent question",
    advisorPrompt: "Explain my child's Chemistry formula recall issue and give me three calm ways to help at home this week.",
    askAdvisor: "Ask advisor",
    advisorEmpty: "Gemini will explain the learning signal in parent-friendly language.",
    stats: parentOverview.stats,
    digest: parentOverview.digest,
    support: parentOverview.support,
    gradeReport: parentOverview.gradeReport,
  },
  vi: {
    route: "Vai trò phụ huynh",
    mobileRoute: "Phụ huynh",
    nav: ["Tổng quan", "Tóm tắt học tập", "Hỗ trợ cảm xúc", "Bảng điểm"],
    eyebrow: "Bảng thông tin phụ huynh",
    title: "Biết cách hỗ trợ mà không phải trở thành giáo viên.",
    lead: "EduMind chuyển dữ liệu học tập thành tiến bộ dễ hiểu, việc cần làm ở nhà và câu hỏi để trao đổi với giáo viên.",
    tonight: "Việc phụ huynh nên làm tối nay",
    supportWindow: "18 phút",
    supportWindowCopy: "Khoảng hỗ trợ tốt nhất tối nay: một lần kiểm tra giải thích và một bài nhớ công thức ngắn.",
    digestLabel: "Tóm tắt học tập hằng tuần",
    digestTitle: "Tiến bộ được diễn giải bằng ngôn ngữ phụ huynh.",
    plain: "Dễ hiểu",
    supportLabel: "Kế hoạch hỗ trợ cảm xúc",
    supportTitle: "Những lần hỏi han ngắn giúp giảm áp lực trước khi học.",
    gradeLabel: "Bảng điểm",
    gradeTitle: "Điểm gần đây kèm ngữ cảnh dễ hiểu cho phụ huynh.",
    gradePill: "3 môn",
    advisorLabel: "Cố vấn Gemini cho phụ huynh",
    advisorTitle: "Hỏi bước hỗ trợ thực tế tiếp theo.",
    question: "Câu hỏi của phụ huynh",
    advisorPrompt: "Giải thích vấn đề ghi nhớ công thức Hóa học của con tôi và gợi ý ba cách hỗ trợ bình tĩnh ở nhà tuần này.",
    askAdvisor: "Hỏi cố vấn",
    advisorEmpty: "Gemini sẽ giải thích tín hiệu học tập bằng ngôn ngữ thân thiện với phụ huynh.",
    stats: [
      ["Tự tin tuần này", "Cao", "Con hoàn thành 5 trong 6 buổi học đã lên kế hoạch.", "icon-check"],
      ["Hỏi han nhẹ nhàng", "18 phút", "Khoảng hỗ trợ cảm xúc được đề xuất cho tối nay.", "icon-clock"],
      ["Hỏi giáo viên", "3 ghi chú", "Câu hỏi đã chuẩn bị cho lần trao đổi tiếp theo.", "icon-parent"],
    ],
    digest: [
      ["Lập luận Toán", "Đang tiến bộ", 76, "Giải thích phép toán rõ hơn, nhưng còn thiếu một bước biện minh bằng lời."],
      ["Nhớ công thức Hóa", "Cần hỗ trợ", 58, "Khả năng nhớ công thức giảm khi bài có thời gian hoặc trộn chủ đề cũ."],
      ["Thói quen học", "Ổn định", 84, "Các buổi học ngắn buổi tối hiệu quả hơn một buổi dài cuối tuần."],
    ],
    support: [
      ["Tối nay", "Bắt đầu bằng một câu hỏi nhẹ: hôm nay con thấy bài học như thế nào trước khi nói về điểm."],
      ["Tuần này", "Khen một thói quen nỗ lực cụ thể, rồi chọn một nguyên nhân gây căng thẳng để giảm bớt."],
      ["Trước kiểm tra", "Thống nhất kế hoạch nghỉ ngắn và nhắc con rằng lỗi sai là tín hiệu để học tiếp."],
    ],
    gradeReport: [
      ["Toán", "8.4", "+0.6", "Lập luận tiến bộ sau các buổi ôn có hướng dẫn."],
      ["Hóa học", "7.1", "-0.2", "Nhớ công thức còn giảm khi làm bài có thời gian."],
      ["Ngữ văn", "8.8", "+0.4", "Đọc hiểu vẫn ổn định và tốt."],
    ],
  },
};

const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"></use></svg>`;
const roleLabel = (roleId) => commonText[loginLang].roles[roleId] || roles[roleId].label;
const route = () => location.hash.replace(/^#\/?/, "") || "login";
const setRoute = (path) => { location.hash = path; };
const currentRole = () => {
  const part = route().split("/")[1] || route().split("/")[0] || localStorage.getItem(storage.role) || "student";
  return roles[part] ? part : "student";
};

async function initBackend() {
  try {
    config = await fetch("/api/config").then((response) => response.json());
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

      ${languageSwitchMarkup()}

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
                ${roleLabel(id)}
              </a>
            `).join("")}
          </div>

          <div>
            <p class="signin-as">${t.choose} <strong style="color:${roleColor(roleId)}">${roleLabel(roleId)}</strong></p>
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

  wireLanguageSwitch(() => renderLogin(roleId));
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

function languageSwitchMarkup(extraClass = "") {
  return `
    <div class="language-switch ${extraClass}" aria-label="Language">
      <button class="${loginLang === "en" ? "active" : ""}" type="button" data-lang="en" aria-label="Switch to English">
        <span class="flag flag-en" aria-hidden="true"></span>
        <span>EN</span>
      </button>
      <button class="${loginLang === "vi" ? "active" : ""}" type="button" data-lang="vi" aria-label="Switch to Vietnamese">
        <span class="flag flag-vn" aria-hidden="true"></span>
        <span>VI</span>
      </button>
    </div>
  `;
}

function wireLanguageSwitch(refresh) {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      loginLang = button.dataset.lang;
      refresh();
    });
  });
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
  if (roleId === "teacher") return renderTeacherDashboard();
  if (roleId === "parent") return renderParentDashboard();
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
  const t = pageText.student[loginLang];
  localStorage.setItem(storage.role, "student");
  app.innerHTML = `
    <div class="student-shell">
      ${languageSwitchMarkup("dashboard-language-switch")}
      <aside class="student-sidebar" aria-label="Student navigation">
        <a class="student-brand" href="#/login/student">
          <span class="student-brand-mark">${icon("icon-eye-logo")}</span>
          <span><strong>EduMind</strong><small>${t.route}</small></span>
        </a>
        <nav class="student-nav" aria-label="Student dashboard sections">
          <a class="active" href="#/student">${icon("icon-home")} ${t.nav[0]}</a>
          <a href="#/student" data-scroll="ai-assistant">${icon("icon-brain")} ${t.nav[1]}</a>
          <a href="#/student" data-scroll="camera-ocr">${icon("icon-camera")} ${t.nav[2]}</a>
          <a href="#/student" data-scroll="review-pathway">${icon("icon-target")} ${t.nav[3]}</a>
        </nav>
        <button class="logout-button student-logout" id="logoutButton" type="button">${icon("icon-log-out")} ${commonText[loginLang].loginScreen}</button>
      </aside>

      <main class="student-main" id="main-content">
        <div class="student-mobile-top">
          <a class="student-brand" href="#/login/student">
            <span class="student-brand-mark">${icon("icon-eye-logo")}</span>
            <span><strong>EduMind</strong><small>${t.mobileRoute}</small></span>
          </a>
          ${languageSwitchMarkup("mobile-inline-language-switch")}
        </div>

        <header class="student-hero" aria-labelledby="student-title">
          <div>
            <p class="eyebrow">${t.eyebrow}</p>
            <h1 id="student-title">${t.title}</h1>
            <p>${t.lead}</p>
          </div>
          <div class="student-hero-actions">
            <button class="button primary" id="openAiSection" type="button">${icon("icon-brain")} ${t.askTutor}</button>
            <button class="button ghost" id="openCameraSection" type="button">${icon("icon-camera")} ${t.scanWork}</button>
          </div>
        </header>

        <section class="student-stats" aria-label="Student progress summary">
          ${t.stats.map(([label, value, copy, glyph]) => `
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
                <p class="eyebrow">${t.tutorLabel}</p>
                <h2 id="ai-title">${t.tutorTitle}</h2>
              </div>
              <span class="pill" id="keyStatus">${config.hasGeminiKey ? commonText[loginLang].geminiReady : commonText[loginLang].missingKey}</span>
            </div>
            <div class="student-tutor-prompt">
              <span class="student-card-icon">${icon("icon-spark")}</span>
              <p>${t.tutorPrompt}</p>
            </div>
            <form class="ai-form student-ai-form" id="aiForm">
              <label for="prompt">${t.askLabel}</label>
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
                <button class="button primary" id="askGemini" type="submit">${icon("icon-send")} ${t.askNext}</button>
                <button class="button ghost" id="fillPrompt" type="button">${icon("icon-check")} ${t.demoPrompt}</button>
              </div>
              <p class="form-message" id="aiMessage" role="status" aria-live="polite"></p>
            </form>
            <article class="student-response" aria-labelledby="response-title">
              <div class="response-head">
                <h3 id="response-title">${t.responseTitle}</h3>
                <span class="pill">${commonText[loginLang].live}</span>
              </div>
              <div class="response-output" id="responseOutput">${t.responseEmpty}</div>
            </article>
          </section>

          <section class="student-panel student-camera" id="camera-ocr" aria-labelledby="camera-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.ocrLabel}</p>
                <h2 id="camera-title">${t.ocrTitle}</h2>
              </div>
              <span class="pill">${t.camera}</span>
            </div>
            <div class="student-camera-grid">
              <div class="camera-preview student-camera-preview">
                <video id="cameraVideo" playsinline autoplay muted></video>
                <canvas id="cameraCanvas" hidden></canvas>
                <div class="camera-placeholder" aria-hidden="true">${icon("icon-camera")} ${t.cameraPlaceholder}</div>
              </div>
              <div class="student-camera-actions">
                <button class="button primary" id="startCamera" type="button">${icon("icon-camera")} ${t.startCamera}</button>
                <button class="button ghost" id="captureFrame" type="button">${icon("icon-check")} ${t.gradeScan}</button>
                <button class="button ghost" id="stopCamera" type="button">${icon("icon-log-out")} ${t.stop}</button>
              </div>
            </div>
            <p class="form-message" id="cameraMessage" role="status" aria-live="polite"></p>
            <article class="student-ocr-result" aria-labelledby="ocr-title">
              <span>84%</span>
              <div>
                <h3 id="ocr-title">${t.ocrResponse}</h3>
                <p id="ocrOutput">${t.ocrEmpty}</p>
              </div>
            </article>
          </section>

          <section class="student-panel student-review" id="review-pathway" aria-labelledby="review-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.reviewLabel}</p>
                <h2 id="review-title">${t.reviewTitle}</h2>
              </div>
              <span class="pill">${t.planned}</span>
            </div>
            <ol class="student-path-list">
              ${t.pathway.map(([name, tag, time, score, copy]) => `
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
          <a class="active" href="#/student">${icon("icon-home")}<span>${t.nav[0]}</span></a>
          <a href="#/student" data-scroll="ai-assistant">${icon("icon-brain")}<span>${t.nav[1]}</span></a>
          <a href="#/student" data-scroll="camera-ocr">${icon("icon-camera")}<span>${t.nav[2]}</span></a>
          <a href="#/student" data-scroll="review-pathway">${icon("icon-target")}<span>${t.nav[3]}</span></a>
        </nav>
      </main>
    </div>
  `;
  wireLanguageSwitch(renderStudentDashboard);
  wireDashboard("student");
}

function renderTeacherDashboard() {
  const t = pageText.teacher[loginLang];
  localStorage.setItem(storage.role, "teacher");
  app.innerHTML = `
    <div class="teacher-shell">
      ${languageSwitchMarkup("dashboard-language-switch")}
      <aside class="teacher-sidebar" aria-label="Teacher navigation">
        <a class="student-brand" href="#/login/teacher">
          <span class="student-brand-mark teacher-brand-mark">${icon("icon-eye-logo")}</span>
          <span><strong>EduMind</strong><small>${t.route}</small></span>
        </a>
        <nav class="student-nav teacher-nav" aria-label="Teacher dashboard sections">
          <a class="active" href="#/teacher">${icon("icon-home")} ${t.nav[0]}</a>
          <a href="#/teacher" data-scroll="teacher-grading">${icon("icon-camera")} ${t.nav[1]}</a>
          <a href="#/teacher" data-scroll="teacher-exam">${icon("icon-book")} ${t.nav[2]}</a>
          <a href="#/teacher" data-scroll="teacher-reports">${icon("icon-chart")} ${t.nav[3]}</a>
        </nav>
        <button class="logout-button student-logout" id="logoutButton" type="button">${icon("icon-log-out")} ${commonText[loginLang].loginScreen}</button>
      </aside>

      <main class="teacher-main">
        <div class="student-mobile-top teacher-mobile-top">
          <a class="student-brand" href="#/login/teacher">
            <span class="student-brand-mark teacher-brand-mark">${icon("icon-eye-logo")}</span>
            <span><strong>EduMind</strong><small>${t.mobileRoute}</small></span>
          </a>
          ${languageSwitchMarkup("mobile-inline-language-switch")}
        </div>

        <header class="teacher-hero" aria-labelledby="teacher-title">
          <div>
            <p class="eyebrow">${t.eyebrow}</p>
            <h1 id="teacher-title">${t.title}</h1>
            <p>${t.lead}</p>
          </div>
          <div class="student-hero-actions">
            <button class="button primary" id="openCameraSection" type="button">${icon("icon-camera")} ${t.scan}</button>
            <button class="button ghost" type="button" data-scroll="teacher-exam">${icon("icon-book")} ${t.buildExam}</button>
          </div>
        </header>

        <section class="student-stats teacher-stats" aria-label="Teacher summary">
          ${t.stats.map(([label, value, copy, glyph]) => `
            <article class="student-stat-card">
              <span class="student-card-icon teacher-icon">${icon(glyph)}</span>
              <p>${label}</p>
              <strong>${value}</strong>
              <span>${copy}</span>
            </article>
          `).join("")}
        </section>

        <div class="teacher-grid">
          <section class="student-panel teacher-grading" id="teacher-grading" aria-labelledby="teacher-grading-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.gradingLabel}</p>
                <h2 id="teacher-grading-title">${t.gradingTitle}</h2>
              </div>
              <span class="pill">${t.moet}</span>
            </div>
            <p class="teacher-panel-copy">${t.gradingCopy}</p>
            <div class="student-camera-grid">
              <div class="camera-preview student-camera-preview">
                <video id="cameraVideo" playsinline autoplay muted></video>
                <canvas id="cameraCanvas" hidden></canvas>
                <div class="camera-placeholder" aria-hidden="true">${icon("icon-camera")} ${t.scanPlaceholder}</div>
              </div>
              <div class="student-camera-actions">
                <button class="button primary" id="startCamera" type="button">${icon("icon-camera")} ${t.startCamera}</button>
                <button class="button ghost" id="captureFrame" type="button">${icon("icon-check")} ${t.generateFeedback}</button>
                <button class="button ghost" id="stopCamera" type="button">${icon("icon-log-out")} ${t.stop}</button>
              </div>
            </div>
            <p class="form-message" id="cameraMessage" role="status" aria-live="polite"></p>
            <article class="student-ocr-result teacher-feedback-result" aria-labelledby="ocr-title">
              <span>A-</span>
              <div>
                <h3 id="ocr-title">${t.feedbackDraft}</h3>
                <p id="ocrOutput">${t.feedbackEmpty}</p>
              </div>
            </article>
          </section>

          <section class="student-panel teacher-exam" id="teacher-exam" aria-labelledby="teacher-exam-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.examLabel}</p>
                <h2 id="teacher-exam-title">${t.examTitle}</h2>
              </div>
              <span class="pill">${t.examPill}</span>
            </div>
            <div class="teacher-exam-table">
              ${t.examRows.map(([level, count, copy]) => `
                <article>
                  <strong>${level}</strong>
                  <span>${count}</span>
                  <p>${copy}</p>
                </article>
              `).join("")}
            </div>
            <button class="button primary teacher-wide-action" id="teacherGenerateExam" type="button">${icon("icon-spark")} ${t.generateExam}</button>
            <p class="form-message" id="teacherExamMessage" role="status" aria-live="polite"></p>
          </section>

          <section class="student-panel teacher-reports" id="teacher-reports" aria-labelledby="teacher-reports-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.reportsLabel}</p>
                <h2 id="teacher-reports-title">${t.reportsTitle}</h2>
              </div>
            </div>
            <div class="teacher-chart-list">
              ${t.competencyRows.map(([klass, value, copy]) => `
                <article>
                  <div><strong>${klass}</strong><span>${value}% mastery</span></div>
                  <div class="progress-track" aria-label="${klass} mastery ${value} percent"><i style="width:${value}%"></i></div>
                  <p>${copy}</p>
                </article>
              `).join("")}
            </div>
          </section>
        </div>

        <div class="exam-modal-backdrop" id="examModalBackdrop" hidden></div>
        <section class="exam-modal" id="examModal" role="dialog" aria-modal="true" aria-labelledby="examModalTitle" hidden>
          <div class="exam-modal-head">
            <div>
              <p class="eyebrow">${t.modalLabel}</p>
              <h2 id="examModalTitle">${t.modalTitle}</h2>
            </div>
            <button type="button" id="examModalClose" aria-label="Close generated exam">${icon("icon-x")}</button>
          </div>
          <div class="exam-modal-body" id="examModalBody">
            ${t.examRows.map(([level, count, copy]) => `<article><strong>${level}</strong><p>${count}. ${copy}</p></article>`).join("")}
          </div>
          <div class="exam-modal-actions">
            <button class="button ghost" id="discardExam" type="button">${icon("icon-x")} ${t.discard}</button>
            <button class="button primary" id="downloadExam" type="button">${icon("icon-book")} ${t.download}</button>
          </div>
        </section>

        <button class="teacher-chat-fab" id="teacherChatToggle" type="button" aria-expanded="false" aria-controls="teacherChatBox" aria-label="Open teacher chatbot">
          ${icon("icon-brain")}
        </button>
        <section class="teacher-chat-box" id="teacherChatBox" aria-labelledby="teacher-chat-title" hidden>
          <div class="teacher-chat-head">
            <div>
              <p class="eyebrow">${t.chatLabel}</p>
              <h2 id="teacher-chat-title">${t.chatTitle}</h2>
            </div>
            <button type="button" id="teacherChatClose" aria-label="Close teacher chatbot">${icon("icon-x")}</button>
          </div>
          <div class="teacher-chat-output" id="teacherChatOutput">${t.chatEmpty}</div>
          <form class="teacher-chat-form" id="teacherChatForm">
            <label class="sr-only" for="teacherChatPrompt">Message</label>
            <textarea id="teacherChatPrompt">${t.chatPrompt}</textarea>
            <button class="button primary" id="teacherChatSend" type="submit">${icon("icon-send")} ${t.send}</button>
            <p class="form-message" id="teacherChatMessage" role="status" aria-live="polite"></p>
          </form>
        </section>
      </main>
    </div>
  `;
  wireLanguageSwitch(renderTeacherDashboard);
  wireDashboard("teacher");
  wireTeacherDashboard();
}

function renderParentDashboard() {
  const t = pageText.parent[loginLang];
  localStorage.setItem(storage.role, "parent");
  app.innerHTML = `
    <div class="parent-shell">
      ${languageSwitchMarkup("dashboard-language-switch")}
      <aside class="parent-sidebar" aria-label="Parent navigation">
        <a class="student-brand parent-brand" href="#/login/parent">
          <span class="student-brand-mark parent-brand-mark">${icon("icon-eye-logo")}</span>
          <span><strong>EduMind</strong><small>${t.route}</small></span>
        </a>
        <nav class="student-nav parent-nav" aria-label="Parent dashboard sections">
          <a class="active" href="#/parent">${icon("icon-home")} ${t.nav[0]}</a>
          <a href="#/parent" data-scroll="parent-digest">${icon("icon-chart")} ${t.nav[1]}</a>
          <a href="#/parent" data-scroll="parent-support">${icon("icon-clock")} ${t.nav[2]}</a>
          <a href="#/parent" data-scroll="parent-grades">${icon("icon-book")} ${t.nav[3]}</a>
        </nav>
        <button class="logout-button student-logout" id="logoutButton" type="button">${icon("icon-log-out")} ${commonText[loginLang].loginScreen}</button>
      </aside>

      <main class="parent-main">
        <div class="student-mobile-top parent-mobile-top">
          <a class="student-brand parent-brand" href="#/login/parent">
            <span class="student-brand-mark parent-brand-mark">${icon("icon-eye-logo")}</span>
            <span><strong>EduMind</strong><small>${t.mobileRoute}</small></span>
          </a>
          ${languageSwitchMarkup("mobile-inline-language-switch")}
        </div>

        <header class="parent-hero" aria-labelledby="parent-title">
          <div>
            <p class="eyebrow">${t.eyebrow}</p>
            <h1 id="parent-title">${t.title}</h1>
            <p>${t.lead}</p>
          </div>
          <div class="parent-hero-card" aria-label="${t.tonight}">
            <span class="student-card-icon parent-icon">${icon("icon-clock")}</span>
            <strong>${t.supportWindow}</strong>
            <p>${t.supportWindowCopy}</p>
          </div>
        </header>

        <section class="student-stats parent-stats" aria-label="Parent summary">
          ${t.stats.map(([label, value, copy, glyph]) => `
            <article class="student-stat-card parent-stat-card">
              <span class="student-card-icon parent-icon">${icon(glyph)}</span>
              <p>${label}</p>
              <strong>${value}</strong>
              <span>${copy}</span>
            </article>
          `).join("")}
        </section>

        <div class="parent-grid">
          <section class="parent-panel parent-digest" id="parent-digest" aria-labelledby="parent-digest-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.digestLabel}</p>
                <h2 id="parent-digest-title">${t.digestTitle}</h2>
              </div>
              <span class="pill">${t.plain}</span>
            </div>
            <div class="parent-digest-list">
              ${t.digest.map(([name, status, value, copy]) => `
                <article>
                  <div><strong>${name}</strong><span>${status}</span></div>
                  <div class="progress-track" aria-label="${name} ${value} percent"><i style="width:${value}%"></i></div>
                  <p>${copy}</p>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="parent-panel parent-support" id="parent-support" aria-labelledby="parent-support-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.supportLabel}</p>
                <h2 id="parent-support-title">${t.supportTitle}</h2>
              </div>
            </div>
            <ol class="parent-action-list">
              ${t.support.map(([when, copy]) => `
                <li><span>${when}</span><p>${copy}</p></li>
              `).join("")}
            </ol>
          </section>

          <section class="parent-panel parent-grades" id="parent-grades" aria-labelledby="parent-grades-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.gradeLabel}</p>
                <h2 id="parent-grades-title">${t.gradeTitle}</h2>
              </div>
              <span class="pill">${t.gradePill}</span>
            </div>
            <div class="parent-grade-list">
              ${t.gradeReport.map(([subject, score, trend, copy]) => `
                <article>
                  <div>
                    <strong>${subject}</strong>
                    <span>${trend}</span>
                  </div>
                  <b>${score}</b>
                  <p>${copy}</p>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="parent-panel parent-advisor" aria-labelledby="parent-advisor-title">
            <div class="student-panel-head">
              <div>
                <p class="eyebrow">${t.advisorLabel}</p>
                <h2 id="parent-advisor-title">${t.advisorTitle}</h2>
              </div>
              <span class="pill" id="keyStatus">${config.hasGeminiKey ? commonText[loginLang].geminiReady : commonText[loginLang].missingKey}</span>
            </div>
            <form class="parent-advisor-form" id="parentAdvisorForm">
              <label for="parentPrompt">${t.question}</label>
              <textarea id="parentPrompt">${t.advisorPrompt}</textarea>
              <button class="button primary" id="parentAskGemini" type="submit">${icon("icon-send")} ${t.askAdvisor}</button>
              <p class="form-message" id="parentAdvisorMessage" role="status" aria-live="polite"></p>
            </form>
            <article class="parent-advisor-output" id="parentAdvisorOutput">${t.advisorEmpty}</article>
          </section>
        </div>

        <nav class="student-bottom-nav parent-bottom-nav" aria-label="Parent mobile navigation">
          <a class="active" href="#/parent">${icon("icon-home")}<span>${t.nav[0]}</span></a>
          <a href="#/parent" data-scroll="parent-digest">${icon("icon-chart")}<span>${t.nav[1]}</span></a>
          <a href="#/parent" data-scroll="parent-support">${icon("icon-clock")}<span>${t.nav[2]}</span></a>
          <a href="#/parent" data-scroll="parent-grades">${icon("icon-book")}<span>${t.nav[3]}</span></a>
        </nav>
      </main>
    </div>
  `;
  wireLanguageSwitch(renderParentDashboard);
  wireParentDashboard();
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
  document.querySelector("#openAiSection")?.addEventListener("click", () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector("#ai-assistant").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });
  document.querySelector("#openCameraSection")?.addEventListener("click", () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = document.querySelector("#camera-ocr") || document.querySelector("#teacher-grading");
    target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
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
  document.querySelector("#fillPrompt")?.addEventListener("click", () => {
    document.querySelector("#prompt").value = roles[roleId].aiMode + " Topic: " + defaultTopic(roleId);
  });
  document.querySelector("#aiForm")?.addEventListener("submit", askGemini);
}

function wireTeacherDashboard() {
  document.querySelector("#teacherGenerateExam").addEventListener("click", () => {
    openExamModal();
    show(document.querySelector("#teacherExamMessage"), "Exam preview generated. Review it in the modal.", "success");
  });
  document.querySelector("#examModalClose").addEventListener("click", closeExamModal);
  document.querySelector("#discardExam").addEventListener("click", closeExamModal);
  document.querySelector("#downloadExam").addEventListener("click", downloadExam);

  const toggle = document.querySelector("#teacherChatToggle");
  const box = document.querySelector("#teacherChatBox");
  const close = document.querySelector("#teacherChatClose");
  toggle.addEventListener("click", () => {
    const opening = box.hidden;
    box.hidden = !opening;
    toggle.setAttribute("aria-expanded", String(opening));
    if (opening) document.querySelector("#teacherChatPrompt").focus();
  });
  close.addEventListener("click", () => {
    box.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });
  document.querySelector("#teacherChatForm").addEventListener("submit", askTeacherChat);
  document.removeEventListener("keydown", handleTeacherEscape);
  document.addEventListener("keydown", handleTeacherEscape);
}

function openExamModal() {
  document.querySelector("#examModalBackdrop").hidden = false;
  document.querySelector("#examModal").hidden = false;
  document.body.classList.add("modal-open");
  document.querySelector("#downloadExam").focus();
}

function closeExamModal() {
  document.querySelector("#examModalBackdrop").hidden = true;
  document.querySelector("#examModal").hidden = true;
  document.body.classList.remove("modal-open");
  document.querySelector("#teacherGenerateExam")?.focus();
}

function handleTeacherEscape(event) {
  if (event.key === "Escape" && !document.querySelector("#examModal")?.hidden) closeExamModal();
}

function downloadExam() {
  const t = pageText.teacher[loginLang];
  const text = [
    loginLang === "vi" ? "Bản xem trước đề kiểm tra EduMind" : "EduMind Generated Exam Preview",
    t.modalTitle,
    "",
    ...t.examRows.map(([level, count, copy]) => `${level}: ${count}. ${copy}`),
    "",
    loginLang === "vi" ? "Đáp án và lời giải chi tiết: có trong bản demo giáo viên." : "Answer keys and detailed solutions: included in teacher preview demo.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "edumind-exam-preview.txt";
  link.click();
  URL.revokeObjectURL(url);
  show(document.querySelector("#teacherExamMessage"), loginLang === "vi" ? "Đã tải bản xem trước đề." : "Exam preview downloaded.", "success");
}

function wireParentDashboard() {
  document.querySelector("#logoutButton").addEventListener("click", () => setRoute("login/parent"));
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(link.dataset.scroll)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });
  document.querySelector("#parentAdvisorForm").addEventListener("submit", askParentAdvisor);
}

async function askParentAdvisor(event) {
  event.preventDefault();
  const prompt = document.querySelector("#parentPrompt").value.trim();
  const output = document.querySelector("#parentAdvisorOutput");
  const message = document.querySelector("#parentAdvisorMessage");
  const button = document.querySelector("#parentAskGemini");
  if (!prompt) return show(message, loginLang === "vi" ? "Nhập câu hỏi trước." : "Enter a question first.", "error");
  button.disabled = true;
  button.innerHTML = loginLang === "vi" ? "Đang nghĩ..." : "Thinking...";
  show(message, loginLang === "vi" ? "Đang gửi tới Gemini..." : "Sending to Gemini...");
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3.6-flash",
        prompt: `You are EduMind's parent advisor. Explain learning data in calm, practical language for a parent. Avoid blame. Give concrete emotional support steps parents can use at home.\n\nParent language: ${loginLang === "vi" ? "Vietnamese" : "English"}\nParent request: ${prompt}`,
      }),
    });
    const data = await readResponseBody(response);
    if (!response.ok) throw new Error(data.error || "Gemini request failed.");
    output.textContent = data.text || (loginLang === "vi" ? "Gemini không trả về nội dung." : "Gemini returned no text.");
    show(message, loginLang === "vi" ? "Đã có phản hồi." : "Response ready.", "success");
  } catch (error) {
    output.textContent = loginLang === "vi"
      ? "Gợi ý mẫu: Hãy bắt đầu bằng một câu hỏi nhẹ nhàng, chọn một mục tiêu nhỏ trong tuần, và khen nỗ lực trước khi nhắc lỗi."
      : "Demo fallback: start with a calm question, choose one small target for the week, and praise effort before discussing the mistake.";
    show(message, error.message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = `${icon("icon-send")} ${pageText.parent[loginLang].askAdvisor}`;
  }
}

async function askTeacherChat(event) {
  event.preventDefault();
  const prompt = document.querySelector("#teacherChatPrompt").value.trim();
  const output = document.querySelector("#teacherChatOutput");
  const message = document.querySelector("#teacherChatMessage");
  const button = document.querySelector("#teacherChatSend");
  if (!prompt) return show(message, "Enter a message first.", "error");
  button.disabled = true;
  button.innerHTML = "Thinking...";
  show(message, "Sending to Gemini...");
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3.6-flash",
        prompt: `You are EduMind's teacher assistant. Help with grading feedback, differentiated exam generation, and classroom competency reports. Keep the answer practical and concise.\n\nTeacher request: ${prompt}`,
      }),
    });
    const data = await readResponseBody(response);
    if (!response.ok) throw new Error(data.error || "Gemini request failed.");
    output.textContent = data.text || "Gemini returned no text.";
    show(message, "Response ready.", "success");
  } catch (error) {
    output.textContent = "Demo fallback: acknowledge the correct method, identify the missing explanation step, and ask the student to justify why the formula applies before calculating.";
    show(message, error.message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = `${icon("icon-send")} Send`;
  }
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
  const roleId = currentRole();
  const demoText = roleId === "teacher"
    ? [
      "Detected assignment: handwritten algebra solution",
      "Recognized steps: formula selected correctly, substitution mostly accurate, explanation step missing.",
      "Feedback suggestion: You chose the correct method. Add one sentence explaining why this formula applies before calculating the final answer.",
    ].join("\n")
    : [
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
        prompt: roleId === "teacher"
          ? "You are EduMind's Smart Grading Assistant for teachers in Vietnam. Read this assignment photo, identify visible solution steps, detect likely mistakes, and draft concise qualitative feedback aligned with competency-based assessment. If unclear, say what to retake."
          : "You are EduMind OCR grading support. Read this worksheet photo, extract any visible math work, grade it briefly, and give Socratic next-step feedback. If the photo is unclear, say what to retake.",
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
