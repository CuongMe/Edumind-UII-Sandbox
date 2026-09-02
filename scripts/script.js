const app = document.querySelector("#app");

const storage = { role: "edumind.role", lang: "edumind.lang" };
let config = { hasGeminiKey: false };
let cameraStream = null;
let loginLang = localStorage.getItem(storage.lang) || "vi";
let flashcardIndex = 0;

const roles = {
  student: { icon: "icon-user", color: "#00b4d8", en: "Student", vi: "Học sinh" },
  teacher: { icon: "icon-teacher", color: "#06d6a0", en: "Teacher", vi: "Giáo viên" },
  parent: { icon: "icon-parent", color: "#a855f7", en: "Parent", vi: "Phụ huynh" },
};

const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"></use></svg>`;

const i18n = {
  en: {
    login: {
      title: "EduMind AI",
      subtitle: "Vietnamese Education",
      lead: "Gemini tutoring, real camera OCR, practice, and dashboards in one simple web app.",
      choose: "Sign in as",
      email: "Email",
      password: "Password",
      show: "show",
      hide: "hide",
      forgot: "Forgot password?",
      signIn: "Sign In",
      noAccount: "No account?",
      contact: "Contact your school admin",
      hint: "Demo login accepts any filled email and password.",
      footer: "2026 EduMind AI - Vietnamese Education",
      routeCopy: {
        student: "AI learning, OCR grading, exams, flashcards, arena, and math tools.",
        teacher: "Smart grading, exam matrix generation, and classroom reports.",
        parent: "Progress summaries, emotional support, grade reports, and parent advisor.",
      },
    },
    common: {
      loginScreen: "Login screen",
      geminiReady: "Gemini ready",
      missingKey: "Missing key",
      live: "Live",
      startCamera: "Start camera",
      capture: "Grade scan",
      stop: "Stop",
      enterPrompt: "Enter a prompt first.",
      sending: "Sending to Gemini...",
      thinking: "Thinking...",
      ready: "Response ready.",
      noText: "Gemini returned no text.",
      cameraUnsupported: "Camera access is not supported in this browser.",
      cameraLive: "Camera is live. Point it at a worksheet and capture.",
      cameraFirst: "Start the camera before capturing.",
      cameraStopped: "Camera stopped.",
      keyNeeded: "Frame captured. Add GEMINI_API_KEY for live image feedback.",
      imageSending: "Frame captured. Sending image to Gemini for OCR-style grading...",
      imageReady: "Gemini OCR-style feedback ready.",
      imageFallback: "Using demo OCR feedback because Gemini image analysis failed.",
    },
    student: {
      route: "Student route",
      mobileRoute: "Student",
      nav: ["Studio", "AI Tutor", "OCR", "Review"],
      eyebrow: "MathVision-style learning studio",
      title: "Study math with AI, practice, and camera feedback.",
      lead: "A bilingual student workspace with diagnostics, mind map, tutor, question generator, online exams, arena, leaderboard, flashcards, math tools, resources, FAQ, admin demo, and OCR.",
      askTutor: "Ask tutor",
      scanWork: "Scan work",
      openTools: "Open tools",
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
      cameraPlaceholder: "Point camera at written work",
      ocrResponse: "OCR demo response",
      ocrEmpty: "Start the camera and capture a frame. If Gemini is configured, the captured image is sent to the backend for OCR-style feedback.",
      reviewLabel: "Personalized Review Pathway",
      reviewTitle: "Recommended for the next 43 minutes.",
      planned: "Gemini planned",
      quick: "MathVision feature set",
      runDiagnostic: "Run with Gemini",
      generateQuestions: "Generate questions",
      openCalculator: "Open calculator",
      flipCard: "Flip card",
      nextCard: "Next card",
      calc: "Quick Calculator",
      calculate: "Calculate",
      stats: [
        ["Mastery", "78%", "Algebra and graph reading are trending up.", "icon-target"],
        ["Study streak", "12 days", "Short sessions are consistent this month.", "icon-clock"],
        ["Due today", "3 tasks", "Focused workload, not a long queue.", "icon-check"],
      ],
      features: [
        ["AI Gap Diagnostic", "Analyze weak concepts and recommend a workload.", "icon-target", "diagnostic", "runDiagnostic"],
        ["Math Mind Map", "A GDPT-style knowledge tree for connected math topics.", "icon-chart", "mindmap"],
        ["AI Question Generator", "Create a practice matrix by difficulty level.", "icon-spark", "generator", "generateQuestions"],
        ["Online Exams", "15-minute, 45-minute, and semester practice tests.", "icon-book", "exams"],
        ["Math Arena", "Timed challenge rounds with points and levels.", "icon-target", "arena"],
        ["Leaderboard", "Demo class ranking for healthy competition.", "icon-chart", "leaderboard"],
        ["Flashcards", "Fast formula recall practice.", "icon-book", "flashcards"],
        ["Math Tools", "Graph, geometry, statistics, and calculator demos.", "icon-key", "math-tools", "openCalculator"],
        ["Resource Library", "Lesson outlines, formula sheets, and teacher handouts.", "icon-book", "resources"],
        ["Guide & FAQ", "Short answers for how the learning studio works.", "icon-check", "guide"],
        ["Teacher Room", "Locked demo area for exercise and exam banks.", "icon-key", "admin"],
      ],
      pathway: [
        ["Linear equations", "Warm-up", "10 min", 86, "Solve two one-step equations and explain the inverse operation."],
        ["Graph intercepts", "Core gap", "18 min", 64, "Read x- and y-intercepts before writing the equation."],
        ["Word problems", "Stretch", "15 min", 52, "Translate one sentence into an equation before calculating."],
      ],
      flashcards: [
        ["Quadratic formula", "x = (-b +/- sqrt(b^2 - 4ac)) / 2a"],
        ["Slope", "m = (y2 - y1) / (x2 - x1)"],
        ["Circle area", "A = pi r^2"],
      ],
    },
    teacher: {
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
      generateFeedback: "Generate feedback",
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
    },
    parent: {
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
    },
  },
  vi: {
    login: {
      title: "EduMind AI",
      subtitle: "Giáo dục Việt Nam",
      lead: "Gia sư Gemini, OCR bằng camera thật, luyện tập và dashboard trong một web app đơn giản.",
      choose: "Đăng nhập với tư cách",
      email: "Email",
      password: "Mật khẩu",
      show: "hiện",
      hide: "ẩn",
      forgot: "Quên mật khẩu?",
      signIn: "Đăng nhập",
      noAccount: "Chưa có tài khoản?",
      contact: "Liên hệ quản trị nhà trường",
      hint: "Đăng nhập demo chấp nhận email và mật khẩu bất kỳ.",
      footer: "2026 EduMind AI - Giáo dục Việt Nam",
      routeCopy: {
        student: "Học AI, chấm OCR, đề luyện, thẻ nhớ, đấu trường và công cụ toán.",
        teacher: "Chấm bài thông minh, tạo ma trận đề và báo cáo năng lực lớp.",
        parent: "Tóm tắt tiến bộ, hỗ trợ cảm xúc, bảng điểm và cố vấn phụ huynh.",
      },
    },
    common: {
      loginScreen: "Màn hình đăng nhập",
      geminiReady: "Gemini sẵn sàng",
      missingKey: "Thiếu khóa",
      live: "Trực tiếp",
      startCamera: "Bật camera",
      capture: "Chấm bài scan",
      stop: "Dừng",
      enterPrompt: "Nhập câu hỏi trước.",
      sending: "Đang gửi tới Gemini...",
      thinking: "Đang nghĩ...",
      ready: "Đã có phản hồi.",
      noText: "Gemini không trả về nội dung.",
      cameraUnsupported: "Trình duyệt này không hỗ trợ camera.",
      cameraLive: "Camera đang bật. Hướng vào bài làm và chụp.",
      cameraFirst: "Hãy bật camera trước khi chụp.",
      cameraStopped: "Đã dừng camera.",
      keyNeeded: "Đã chụp khung hình. Thêm GEMINI_API_KEY để nhận phân tích ảnh thật.",
      imageSending: "Đã chụp. Đang gửi ảnh tới Gemini để phân tích OCR...",
      imageReady: "Đã có phản hồi OCR từ Gemini.",
      imageFallback: "Đang dùng phản hồi OCR demo vì phân tích ảnh Gemini thất bại.",
    },
    student: {
      route: "Vai trò học sinh",
      mobileRoute: "Học sinh",
      nav: ["Studio", "Gia sư AI", "OCR", "Ôn tập"],
      eyebrow: "Studio học toán theo phong cách MathVision",
      title: "Học toán với AI, luyện tập và phản hồi camera.",
      lead: "Không gian học sinh song ngữ có chẩn đoán, sơ đồ tư duy, gia sư, tạo câu hỏi, kiểm tra online, đấu trường, xếp hạng, thẻ nhớ, công cụ toán, tài liệu, FAQ, phòng giáo viên demo và OCR.",
      askTutor: "Hỏi gia sư",
      scanWork: "Quét bài",
      openTools: "Mở công cụ",
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
      cameraPlaceholder: "Hướng camera vào bài viết tay",
      ocrResponse: "Phản hồi OCR mẫu",
      ocrEmpty: "Bật camera và chụp khung hình. Nếu Gemini đã cấu hình, ảnh sẽ được gửi tới backend để nhận phản hồi OCR.",
      reviewLabel: "Lộ trình ôn tập cá nhân hóa",
      reviewTitle: "Đề xuất cho 43 phút tiếp theo.",
      planned: "Gemini đề xuất",
      quick: "Bộ tính năng MathVision",
      runDiagnostic: "Chạy bằng Gemini",
      generateQuestions: "Tạo câu hỏi",
      openCalculator: "Mở máy tính",
      flipCard: "Lật thẻ",
      nextCard: "Thẻ tiếp",
      calc: "Máy tính nhanh",
      calculate: "Tính",
      stats: [
        ["Mức thành thạo", "78%", "Đại số và đọc đồ thị đang tiến bộ.", "icon-target"],
        ["Chuỗi học tập", "12 ngày", "Các buổi học ngắn được duy trì đều.", "icon-clock"],
        ["Hôm nay", "3 bài", "Khối lượng tập trung, không quá tải.", "icon-check"],
      ],
      features: [
        ["Chẩn đoán lỗ hổng AI", "Phân tích điểm yếu và đề xuất khối lượng học.", "icon-target", "diagnostic", "runDiagnostic"],
        ["Sơ đồ tư duy Toán", "Cây tri thức theo chương trình mới cho các chủ đề liên kết.", "icon-chart", "mindmap"],
        ["AI tạo câu hỏi", "Tạo ma trận bài luyện theo mức độ.", "icon-spark", "generator", "generateQuestions"],
        ["Làm bài trực tuyến", "Đề luyện 15 phút, 45 phút và học kỳ.", "icon-book", "exams"],
        ["Đấu trường Toán học", "Vòng thử thách có thời gian, điểm và cấp độ.", "icon-target", "arena"],
        ["Bảng xếp hạng", "Xếp hạng lớp demo để tạo động lực lành mạnh.", "icon-chart", "leaderboard"],
        ["Thẻ ghi nhớ", "Luyện phản xạ công thức nhanh.", "icon-book", "flashcards"],
        ["Công cụ Toán học", "Demo vẽ đồ thị, hình học, thống kê và máy tính.", "icon-key", "math-tools", "openCalculator"],
        ["Kho tài liệu", "Đề cương, bảng công thức và tài liệu giáo viên.", "icon-book", "resources"],
        ["Hướng dẫn & FAQ", "Câu trả lời ngắn về cách dùng studio học tập.", "icon-check", "guide"],
        ["Phòng giáo viên", "Khu demo khóa cho ngân hàng bài tập và đề kiểm tra.", "icon-key", "admin"],
      ],
      pathway: [
        ["Phương trình tuyến tính", "Khởi động", "10 phút", 86, "Giải hai phương trình một bước và giải thích phép toán ngược."],
        ["Giao điểm đồ thị", "Lỗ hổng chính", "18 phút", 64, "Đọc giao điểm x và y trước khi viết phương trình."],
        ["Bài toán lời văn", "Nâng cao", "15 phút", 52, "Chuyển một câu thành phương trình trước khi tính."],
      ],
      flashcards: [
        ["Công thức nghiệm", "x = (-b +/- sqrt(b^2 - 4ac)) / 2a"],
        ["Hệ số góc", "m = (y2 - y1) / (x2 - x1)"],
        ["Diện tích hình tròn", "A = pi r^2"],
      ],
    },
    teacher: {
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
      generateFeedback: "Tạo nhận xét",
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
    parent: {
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
  },
};

const html = (strings, ...values) => strings.reduce((out, part, index) => out + part + (values[index] ?? ""), "");
const t = (area) => i18n[loginLang][area];
const roleLabel = (role) => roles[role][loginLang];
const routePath = () => location.hash.replace(/^#\/?/, "") || "login";
const setRoute = (path) => { location.hash = path; };
const currentRole = () => {
  const part = routePath().split("/")[1] || routePath().split("/")[0] || localStorage.getItem(storage.role) || "student";
  return roles[part] ? part : "student";
};

async function initBackend() {
  try {
    config = await fetch("/api/config").then((response) => response.json());
  } catch {
    config = { hasGeminiKey: false };
  }
}

function languageSwitch(extra = "") {
  return html`
    <div class="language-switch ${extra}" aria-label="Language">
      <button class="${loginLang === "en" ? "active" : ""}" type="button" data-lang="en" aria-label="Switch to English">
        <span class="flag flag-en" aria-hidden="true"></span><span>EN</span>
      </button>
      <button class="${loginLang === "vi" ? "active" : ""}" type="button" data-lang="vi" aria-label="Switch to Vietnamese">
        <span class="flag flag-vn" aria-hidden="true"></span><span>VI</span>
      </button>
    </div>
  `;
}

function wireLanguage(refresh) {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      loginLang = button.dataset.lang;
      localStorage.setItem(storage.lang, loginLang);
      refresh();
    });
  });
}

function renderLogin(role = currentRole()) {
  const l = t("login");
  app.innerHTML = html`
    <main class="login-page figma-login">
      <div class="ambient-bg" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
      ${languageSwitch()}
      <section class="login-stack" aria-labelledby="login-title">
        <div class="login-logo-wrap"><div class="login-logo-ring"><span class="login-logo-core">${icon("icon-eye-logo")}</span></div></div>
        <header class="login-title-block">
          <h1 id="login-title">${l.title}</h1>
          <p>${l.subtitle}</p>
          <span>${l.lead}</span>
        </header>
        <div class="rainbow-rule" aria-hidden="true"></div>
        <div class="login-card">
          <div class="role-selector" aria-label="Login route selector">
            ${Object.keys(roles).map((id) => html`
              <a class="${id === role ? "active" : ""}" href="#/login/${id}" style="--role-color:${roles[id].color}">
                <span class="route-icon">${icon(roles[id].icon)}</span>${roleLabel(id)}
              </a>
            `).join("")}
          </div>
          <div>
            <p class="signin-as">${l.choose} <strong style="color:${roles[role].color}">${roleLabel(role)}</strong></p>
            <h2>${l.routeCopy[role]}</h2>
          </div>
          <form class="login-form" id="loginForm">
            <div class="form-field"><label for="email">${l.email}</label><input id="email" type="email" value="${role}@edumind.demo" required /></div>
            <div class="form-field">
              <label for="password">${l.password}</label>
              <div class="password-field"><input id="password" type="password" value="demo12345" required /><button id="togglePassword" type="button">${l.show}</button></div>
              <p class="field-hint">${l.hint}</p>
            </div>
            <div class="forgot-row"><button type="button">${l.forgot}</button></div>
            <button class="button primary" type="submit">${l.signIn}</button>
            <p class="form-message" id="loginMessage" role="alert"></p>
          </form>
          <p class="admin-link">${l.noAccount} <button type="button">${l.contact}</button></p>
        </div>
        <footer class="login-footer">${l.footer}</footer>
      </section>
    </main>
  `;
  wireLanguage(() => renderLogin(role));
  document.querySelector("#togglePassword").addEventListener("click", (event) => {
    const input = document.querySelector("#password");
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    event.currentTarget.textContent = hidden ? l.hide : l.show;
  });
  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.setItem(storage.role, role);
    setRoute(role);
  });
}

function shell(role, nav) {
  const page = t(role);
  return html`
    <div class="${role}-shell app-shell">
      ${languageSwitch("dashboard-language-switch")}
      <aside class="${role}-sidebar student-sidebar" aria-label="${roleLabel(role)} navigation">
        <a class="student-brand ${role}-brand" href="#/login/${role}">
          <span class="student-brand-mark ${role}-brand-mark">${icon("icon-eye-logo")}</span>
          <span><strong>EduMind</strong><small>${page.route}</small></span>
        </a>
        <nav class="student-nav ${role}-nav">
          ${nav.map(([id, glyph, label], index) => html`<a class="${index === 0 ? "active" : ""}" href="#/${role}" data-scroll="${id}">${icon(glyph)} ${label}</a>`).join("")}
        </nav>
        <button class="logout-button student-logout" id="logoutButton" type="button">${icon("icon-log-out")} ${t("common").loginScreen}</button>
      </aside>
  `;
}

function mobileTop(role) {
  const page = t(role);
  return html`
    <div class="student-mobile-top ${role}-mobile-top">
      <a class="student-brand ${role}-brand" href="#/login/${role}">
        <span class="student-brand-mark ${role}-brand-mark">${icon("icon-eye-logo")}</span>
        <span><strong>EduMind</strong><small>${page.mobileRoute}</small></span>
      </a>
      ${languageSwitch("mobile-inline-language-switch")}
    </div>
  `;
}

function stat([label, value, text, glyph]) {
  return html`<article class="student-stat-card"><span class="student-card-icon">${icon(glyph)}</span><p>${label}</p><strong>${value}</strong><span>${text}</span></article>`;
}

function renderStudentDashboard() {
  const s = t("student");
  const nav = [["student-studio", "icon-home", s.nav[0]], ["ai-assistant", "icon-brain", s.nav[1]], ["camera-ocr", "icon-camera", s.nav[2]], ["review-pathway", "icon-target", s.nav[3]]];
  localStorage.setItem(storage.role, "student");
  app.innerHTML = html`
    ${shell("student", nav)}
      <main class="student-main">
        ${mobileTop("student")}
        <header class="student-hero" id="student-studio" aria-labelledby="student-title">
          <div><p class="eyebrow">${s.eyebrow}</p><h1 id="student-title">${s.title}</h1><p>${s.lead}</p></div>
          <div class="student-hero-actions">
            <button class="button primary" id="openAiSection" type="button">${icon("icon-brain")} ${s.askTutor}</button>
            <button class="button ghost" id="openCameraSection" type="button">${icon("icon-camera")} ${s.scanWork}</button>
            <button class="button ghost" type="button" data-scroll="math-tools">${icon("icon-key")} ${s.openTools}</button>
          </div>
        </header>
        <section class="student-stats">${s.stats.map(stat).join("")}</section>
        <section class="feature-hub" aria-label="${s.quick}">
          ${s.features.map(([title, text, glyph, id, action]) => html`
            <article class="feature-card" id="${id}">
              <span class="student-card-icon">${icon(glyph)}</span>
              <div><h2>${title}</h2><p>${text}</p></div>
              ${action ? `<button class="button ghost feature-action" type="button" data-feature="${id}">${s[action]}</button>` : ""}
            </article>
          `).join("")}
        </section>
        <div class="student-dashboard-grid">
          ${renderTutor(s)}
          ${renderOcr(s, "student")}
          ${renderReview(s)}
          ${renderMathStudio(s)}
        </div>
        ${bottomNav("student", nav)}
        ${calculatorModal(s)}
      </main>
    </div>
  `;
  wireLanguage(renderStudentDashboard);
  wireDashboard("student");
  wireStudentStudio();
}

function renderTutor(s) {
  return html`
    <section class="student-panel student-tutor" id="ai-assistant" aria-labelledby="ai-title">
      <div class="student-panel-head">
        <div><p class="eyebrow">${s.tutorLabel}</p><h2 id="ai-title">${s.tutorTitle}</h2></div>
        <span class="pill">${config.hasGeminiKey ? t("common").geminiReady : t("common").missingKey}</span>
      </div>
      <div class="student-tutor-prompt"><span class="student-card-icon">${icon("icon-spark")}</span><p>${s.tutorPrompt}</p></div>
      <form class="ai-form student-ai-form" id="aiForm">
        <label for="prompt">${s.askLabel}</label>
        <textarea id="prompt">${defaultPrompt("student")}</textarea>
        <label class="sr-only" for="model">Model</label>
        <select class="student-model-select" id="model" aria-label="Gemini model">
          <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
          <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
          <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite</option>
        </select>
        <div class="chat-form-actions">
          <button class="button primary" id="askGemini" type="submit">${icon("icon-send")} ${s.askNext}</button>
          <button class="button ghost" id="fillPrompt" type="button">${icon("icon-check")} ${s.demoPrompt}</button>
        </div>
        <p class="form-message" id="aiMessage" role="status" aria-live="polite"></p>
      </form>
      <article class="student-response">
        <div class="response-head"><h3>${s.responseTitle}</h3><span class="pill">${t("common").live}</span></div>
        <div class="response-output" id="responseOutput">${s.responseEmpty}</div>
      </article>
    </section>
  `;
}

function renderOcr(page, role) {
  const teacher = role === "teacher";
  return html`
    <section class="student-panel student-camera ${teacher ? "teacher-grading" : ""}" id="${teacher ? "teacher-grading" : "camera-ocr"}" aria-labelledby="camera-title">
      <div class="student-panel-head">
        <div><p class="eyebrow">${teacher ? page.gradingLabel : page.ocrLabel}</p><h2 id="camera-title">${teacher ? page.gradingTitle : page.ocrTitle}</h2></div>
        <span class="pill">${teacher ? page.moet : "OCR"}</span>
      </div>
      ${teacher ? `<p class="teacher-panel-copy">${page.gradingCopy}</p>` : ""}
      <div class="student-camera-grid">
        <div class="camera-preview student-camera-preview">
          <video id="cameraVideo" playsinline autoplay muted></video>
          <canvas id="cameraCanvas" hidden></canvas>
          <div class="camera-placeholder" aria-hidden="true">${icon("icon-camera")} ${teacher ? page.scanPlaceholder : page.cameraPlaceholder}</div>
        </div>
        <div class="student-camera-actions">
          <button class="button primary" id="startCamera" type="button">${icon("icon-camera")} ${t("common").startCamera}</button>
          <button class="button ghost" id="captureFrame" type="button">${icon("icon-check")} ${teacher ? page.generateFeedback : t("common").capture}</button>
          <button class="button ghost" id="stopCamera" type="button">${icon("icon-log-out")} ${t("common").stop}</button>
        </div>
      </div>
      <p class="form-message" id="cameraMessage" role="status" aria-live="polite"></p>
      <article class="student-ocr-result ${teacher ? "teacher-feedback-result" : ""}">
        <span>${teacher ? "A-" : "84%"}</span>
        <div><h3>${teacher ? page.feedbackDraft : page.ocrResponse}</h3><p id="ocrOutput">${teacher ? page.feedbackEmpty : page.ocrEmpty}</p></div>
      </article>
    </section>
  `;
}

function renderReview(s) {
  return html`
    <section class="student-panel student-review" id="review-pathway">
      <div class="student-panel-head"><div><p class="eyebrow">${s.reviewLabel}</p><h2>${s.reviewTitle}</h2></div><span class="pill">${s.planned}</span></div>
      <ol class="student-path-list">
        ${s.pathway.map(([name, tag, time, score, text]) => html`
          <li><div><strong>${name}</strong><p>${text}</p></div><span>${tag}</span><small>${time}</small><div class="progress-track"><i style="width:${score}%"></i></div></li>
        `).join("")}
      </ol>
    </section>
  `;
}

function renderMathStudio(s) {
  const card = s.flashcards[flashcardIndex];
  return html`
    <section class="student-panel math-studio">
      <div class="student-panel-head"><div><p class="eyebrow">${s.quick}</p><h2>${s.features[1][0]}</h2></div></div>
      <div class="mindmap"><span>Algebra</span><i></i><span>Functions</span><i></i><span>Geometry</span><i></i><span>Statistics</span></div>
      <div class="practice-grid">
        <article><strong>${s.features[3][0]}</strong><p>${s.features[3][1]}</p><b>15p / 45p / HK</b></article>
        <article><strong>${s.features[4][0]}</strong><p>${s.features[4][1]}</p><b>Level 6</b></article>
        <article><strong>${s.features[5][0]}</strong><ol><li>Linh - 980</li><li>Minh - 910</li><li>An - 870</li></ol></article>
        <article class="flashcard"><strong>${card[0]}</strong><p id="flashcardBack" hidden>${card[1]}</p><button class="button ghost" id="flipFlashcard" type="button">${s.flipCard}</button><button class="button ghost" id="nextFlashcard" type="button">${s.nextCard}</button></article>
      </div>
      <div class="resource-strip"><span>${s.features[8][0]}</span><span>${s.features[9][0]}</span><span>${s.features[10][0]}</span></div>
    </section>
  `;
}

function calculatorModal(s) {
  return html`
    <div class="exam-modal-backdrop" id="calculatorBackdrop" hidden></div>
    <section class="exam-modal calculator-modal" id="calculatorModal" role="dialog" aria-modal="true" aria-labelledby="calculatorTitle" hidden>
      <div class="exam-modal-head"><div><p class="eyebrow">Casio demo</p><h2 id="calculatorTitle">${s.calc}</h2></div><button type="button" id="calculatorClose" aria-label="Close calculator">${icon("icon-x")}</button></div>
      <input id="calculatorInput" value="12*(3+5)/4" aria-label="Calculator expression" />
      <output class="calculator-output" id="calculatorOutput">24</output>
      <div class="exam-modal-actions"><button class="button primary" id="calculatorRun" type="button">${icon("icon-check")} ${s.calculate}</button></div>
    </section>
  `;
}

function renderTeacherDashboard() {
  const p = t("teacher");
  const nav = [["teacher-top", "icon-home", p.nav[0]], ["teacher-grading", "icon-camera", p.nav[1]], ["teacher-exam", "icon-book", p.nav[2]], ["teacher-reports", "icon-chart", p.nav[3]]];
  localStorage.setItem(storage.role, "teacher");
  app.innerHTML = html`
    ${shell("teacher", nav)}
      <main class="teacher-main">
        ${mobileTop("teacher")}
        <header class="teacher-hero" id="teacher-top">
          <div><p class="eyebrow">${p.eyebrow}</p><h1>${p.title}</h1><p>${p.lead}</p></div>
          <div class="student-hero-actions"><button class="button primary" id="openCameraSection" type="button">${icon("icon-camera")} ${p.scan}</button><button class="button ghost" type="button" data-scroll="teacher-exam">${icon("icon-book")} ${p.buildExam}</button></div>
        </header>
        <section class="student-stats teacher-stats">${p.stats.map(stat).join("")}</section>
        <div class="teacher-grid">
          ${renderOcr(p, "teacher")}
          <section class="student-panel teacher-exam" id="teacher-exam">
            <div class="student-panel-head"><div><p class="eyebrow">${p.examLabel}</p><h2>${p.examTitle}</h2></div><span class="pill">${p.examPill}</span></div>
            <div class="teacher-exam-table">${p.examRows.map(([level, count, text]) => `<article><strong>${level}</strong><span>${count}</span><p>${text}</p></article>`).join("")}</div>
            <button class="button primary teacher-wide-action" id="teacherGenerateExam" type="button">${icon("icon-spark")} ${p.generateExam}</button>
            <p class="form-message" id="teacherExamMessage" role="status" aria-live="polite"></p>
          </section>
          <section class="student-panel teacher-reports" id="teacher-reports">
            <div class="student-panel-head"><div><p class="eyebrow">${p.reportsLabel}</p><h2>${p.reportsTitle}</h2></div></div>
            <div class="teacher-chart-list">${p.competencyRows.map(([klass, value, text]) => `<article><div><strong>${klass}</strong><span>${value}% mastery</span></div><div class="progress-track"><i style="width:${value}%"></i></div><p>${text}</p></article>`).join("")}</div>
          </section>
        </div>
        ${examModal(p)}
        ${teacherChat(p)}
      </main>
    </div>
  `;
  wireLanguage(renderTeacherDashboard);
  wireDashboard("teacher");
  wireTeacherDashboard();
}

function examModal(p) {
  return html`
    <div class="exam-modal-backdrop" id="examModalBackdrop" hidden></div>
    <section class="exam-modal" id="examModal" role="dialog" aria-modal="true" hidden>
      <div class="exam-modal-head"><div><p class="eyebrow">${p.modalLabel}</p><h2>${p.modalTitle}</h2></div><button type="button" id="examModalClose" aria-label="Close generated exam">${icon("icon-x")}</button></div>
      <div class="exam-modal-body">${p.examRows.map(([level, count, text]) => `<article><strong>${level}</strong><p>${count}. ${text}</p></article>`).join("")}</div>
      <div class="exam-modal-actions"><button class="button ghost" id="discardExam" type="button">${icon("icon-x")} ${p.discard}</button><button class="button primary" id="downloadExam" type="button">${icon("icon-book")} ${p.download}</button></div>
    </section>
  `;
}

function teacherChat(p) {
  return html`
    <button class="teacher-chat-fab" id="teacherChatToggle" type="button" aria-expanded="false" aria-label="Open teacher chatbot">${icon("icon-brain")}</button>
    <section class="teacher-chat-box" id="teacherChatBox" hidden>
      <div class="teacher-chat-head"><div><p class="eyebrow">${p.chatLabel}</p><h2>${p.chatTitle}</h2></div><button type="button" id="teacherChatClose" aria-label="Close teacher chatbot">${icon("icon-x")}</button></div>
      <div class="teacher-chat-output" id="teacherChatOutput">${p.chatEmpty}</div>
      <form class="teacher-chat-form" id="teacherChatForm">
        <label class="sr-only" for="teacherChatPrompt">Message</label>
        <textarea id="teacherChatPrompt">${p.chatPrompt}</textarea>
        <button class="button primary" id="teacherChatSend" type="submit">${icon("icon-send")} ${p.send}</button>
        <p class="form-message" id="teacherChatMessage" role="status" aria-live="polite"></p>
      </form>
    </section>
  `;
}

function renderParentDashboard() {
  const p = t("parent");
  const nav = [["parent-top", "icon-home", p.nav[0]], ["parent-digest", "icon-chart", p.nav[1]], ["parent-support", "icon-clock", p.nav[2]], ["parent-grades", "icon-book", p.nav[3]]];
  localStorage.setItem(storage.role, "parent");
  app.innerHTML = html`
    ${shell("parent", nav)}
      <main class="parent-main">
        ${mobileTop("parent")}
        <header class="parent-hero" id="parent-top">
          <div><p class="eyebrow">${p.eyebrow}</p><h1>${p.title}</h1><p>${p.lead}</p></div>
          <div class="parent-hero-card"><span class="student-card-icon parent-icon">${icon("icon-clock")}</span><strong>${p.supportWindow}</strong><p>${p.supportWindowCopy}</p></div>
        </header>
        <section class="student-stats parent-stats">${p.stats.map(stat).join("")}</section>
        <div class="parent-grid">
          <section class="parent-panel parent-digest" id="parent-digest">
            <div class="student-panel-head"><div><p class="eyebrow">${p.digestLabel}</p><h2>${p.digestTitle}</h2></div><span class="pill">${p.plain}</span></div>
            <div class="parent-digest-list">${p.digest.map(([name, status, value, text]) => `<article><div><strong>${name}</strong><span>${status}</span></div><div class="progress-track"><i style="width:${value}%"></i></div><p>${text}</p></article>`).join("")}</div>
          </section>
          <section class="parent-panel parent-support" id="parent-support">
            <div class="student-panel-head"><div><p class="eyebrow">${p.supportLabel}</p><h2>${p.supportTitle}</h2></div></div>
            <ol class="parent-action-list">${p.support.map(([when, text]) => `<li><span>${when}</span><p>${text}</p></li>`).join("")}</ol>
          </section>
          <section class="parent-panel parent-grades" id="parent-grades">
            <div class="student-panel-head"><div><p class="eyebrow">${p.gradeLabel}</p><h2>${p.gradeTitle}</h2></div><span class="pill">${p.gradePill}</span></div>
            <div class="parent-grade-list">${p.gradeReport.map(([subject, score, trend, text]) => `<article><div><strong>${subject}</strong><span>${trend}</span></div><b>${score}</b><p>${text}</p></article>`).join("")}</div>
          </section>
          <section class="parent-panel parent-advisor">
            <div class="student-panel-head"><div><p class="eyebrow">${p.advisorLabel}</p><h2>${p.advisorTitle}</h2></div><span class="pill">${config.hasGeminiKey ? t("common").geminiReady : t("common").missingKey}</span></div>
            <form class="parent-advisor-form" id="parentAdvisorForm">
              <label for="parentPrompt">${p.question}</label>
              <textarea id="parentPrompt">${p.advisorPrompt}</textarea>
              <button class="button primary" id="parentAskGemini" type="submit">${icon("icon-send")} ${p.askAdvisor}</button>
              <p class="form-message" id="parentAdvisorMessage" role="status" aria-live="polite"></p>
            </form>
            <article class="parent-advisor-output" id="parentAdvisorOutput">${p.advisorEmpty}</article>
          </section>
        </div>
        ${bottomNav("parent", nav)}
      </main>
    </div>
  `;
  wireLanguage(renderParentDashboard);
  wireParentDashboard();
}

function bottomNav(role, nav) {
  return html`<nav class="student-bottom-nav ${role}-bottom-nav">${nav.map(([id, glyph, label], index) => `<a class="${index === 0 ? "active" : ""}" href="#/${role}" data-scroll="${id}">${icon(glyph)}<span>${label}</span></a>`).join("")}</nav>`;
}

function wireDashboard(role) {
  document.querySelector("#logoutButton")?.addEventListener("click", () => setRoute(`login/${role}`));
  document.querySelector("#openAiSection")?.addEventListener("click", () => scrollTo("ai-assistant"));
  document.querySelector("#openCameraSection")?.addEventListener("click", () => scrollTo(role === "teacher" ? "teacher-grading" : "camera-ocr"));
  document.querySelectorAll("[data-scroll]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollTo(link.dataset.scroll);
  }));
  document.querySelector("#startCamera")?.addEventListener("click", startCamera);
  document.querySelector("#captureFrame")?.addEventListener("click", captureFrame);
  document.querySelector("#stopCamera")?.addEventListener("click", stopCamera);
  document.querySelector("#fillPrompt")?.addEventListener("click", () => { document.querySelector("#prompt").value = defaultPrompt(role); });
  document.querySelector("#aiForm")?.addEventListener("submit", askGemini);
}

function wireStudentStudio() {
  document.querySelectorAll("[data-feature]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.feature === "math-tools") return openCalculator();
      document.querySelector("#prompt").value = featurePrompt(button.dataset.feature);
      scrollTo("ai-assistant");
    });
  });
  document.querySelector("#flipFlashcard")?.addEventListener("click", () => {
    document.querySelector("#flashcardBack").hidden = !document.querySelector("#flashcardBack").hidden;
  });
  document.querySelector("#nextFlashcard")?.addEventListener("click", () => {
    flashcardIndex = (flashcardIndex + 1) % t("student").flashcards.length;
    renderStudentDashboard();
  });
  document.querySelector("#calculatorClose")?.addEventListener("click", closeCalculator);
  document.querySelector("#calculatorBackdrop")?.addEventListener("click", closeCalculator);
  document.querySelector("#calculatorRun")?.addEventListener("click", runCalculator);
}

function wireTeacherDashboard() {
  document.querySelector("#teacherGenerateExam").addEventListener("click", () => {
    document.querySelector("#examModalBackdrop").hidden = false;
    document.querySelector("#examModal").hidden = false;
    document.body.classList.add("modal-open");
    show(document.querySelector("#teacherExamMessage"), loginLang === "vi" ? "Đã tạo bản xem trước đề." : "Exam preview generated.", "success");
  });
  document.querySelector("#examModalClose").addEventListener("click", closeExamModal);
  document.querySelector("#discardExam").addEventListener("click", closeExamModal);
  document.querySelector("#downloadExam").addEventListener("click", downloadExam);
  document.querySelector("#teacherChatToggle").addEventListener("click", () => {
    const box = document.querySelector("#teacherChatBox");
    box.hidden = !box.hidden;
    document.querySelector("#teacherChatToggle").setAttribute("aria-expanded", String(!box.hidden));
  });
  document.querySelector("#teacherChatClose").addEventListener("click", () => {
    document.querySelector("#teacherChatBox").hidden = true;
    document.querySelector("#teacherChatToggle").setAttribute("aria-expanded", "false");
  });
  document.querySelector("#teacherChatForm").addEventListener("submit", askTeacherChat);
}

function wireParentDashboard() {
  document.querySelector("#logoutButton").addEventListener("click", () => setRoute("login/parent"));
  document.querySelectorAll("[data-scroll]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollTo(link.dataset.scroll);
  }));
  document.querySelector("#parentAdvisorForm").addEventListener("submit", askParentAdvisor);
}

function scrollTo(id) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

function openCalculator() {
  document.querySelector("#calculatorBackdrop").hidden = false;
  document.querySelector("#calculatorModal").hidden = false;
  document.body.classList.add("modal-open");
  document.querySelector("#calculatorInput").focus();
}

function closeCalculator() {
  document.querySelector("#calculatorBackdrop").hidden = true;
  document.querySelector("#calculatorModal").hidden = true;
  document.body.classList.remove("modal-open");
}

function runCalculator() {
  const value = document.querySelector("#calculatorInput").value;
  const output = document.querySelector("#calculatorOutput");
  if (!/^[\d+\-*/().\s]+$/.test(value)) {
    output.textContent = loginLang === "vi" ? "Chỉ hỗ trợ biểu thức số cơ bản." : "Only basic numeric expressions are supported.";
    return;
  }
  try {
    output.textContent = String(Function(`"use strict";return (${value})`)());
  } catch {
    output.textContent = loginLang === "vi" ? "Biểu thức không hợp lệ." : "Invalid expression.";
  }
}

function closeExamModal() {
  document.querySelector("#examModalBackdrop").hidden = true;
  document.querySelector("#examModal").hidden = true;
  document.body.classList.remove("modal-open");
}

function downloadExam() {
  const p = t("teacher");
  const body = [p.modalTitle, "", ...p.examRows.map(([level, count, text]) => `${level}: ${count}. ${text}`)].join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "edumind-exam-preview.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function show(el, text, type = "") {
  if (!el) return;
  el.textContent = text;
  el.className = `form-message ${type}`.trim();
}

function defaultPrompt(role) {
  if (role === "teacher") return t("teacher").chatPrompt;
  if (role === "parent") return t("parent").advisorPrompt;
  return loginLang === "vi"
    ? "Hướng dẫn em giải phương trình 2x + 7 = 19 bằng câu hỏi Socratic. Đừng cho đáp án cuối ngay."
    : "Guide me through solving 2x + 7 = 19 using Socratic questions. Do not give the final answer immediately.";
}

function featurePrompt(feature) {
  const prompts = {
    diagnostic: loginLang === "vi"
      ? "Chẩn đoán lỗ hổng Toán lớp 9 từ dữ liệu demo: phương trình tuyến tính 86%, giao điểm đồ thị 64%, bài toán lời văn 52%. Đề xuất lộ trình học 43 phút."
      : "Diagnose Grade 9 math gaps from demo data: linear equations 86%, graph intercepts 64%, word problems 52%. Recommend a 43-minute review plan.",
    generator: loginLang === "vi"
      ? "Tạo 8 câu hỏi Toán theo ma trận: nhận biết, thông hiểu, vận dụng, vận dụng cao. Chủ đề: hàm số bậc nhất."
      : "Generate 8 math questions by matrix: recognition, understanding, application, advanced application. Topic: linear functions.",
  };
  return prompts[feature] || defaultPrompt("student");
}

function systemPrompt(role, prompt) {
  const language = loginLang === "vi" ? "Vietnamese" : "English";
  const system = {
    student: "You are EduMind's Socratic math tutor. Ask guiding questions first and avoid giving final answers immediately.",
    teacher: "You are EduMind's teacher assistant. Help with grading feedback, differentiated exam generation, and classroom competency reports.",
    parent: "You are EduMind's parent advisor. Explain learning data calmly and give practical home support steps.",
  }[role];
  return `${system}\nRespond in ${language}.\n\nRequest: ${prompt}`;
}

async function askGemini(event) {
  event.preventDefault();
  const c = t("common");
  const message = document.querySelector("#aiMessage");
  const output = document.querySelector("#responseOutput");
  const prompt = document.querySelector("#prompt").value.trim();
  if (!prompt) return show(message, c.enterPrompt, "error");
  const button = document.querySelector("#askGemini");
  button.disabled = true;
  button.textContent = c.thinking;
  show(message, c.sending);
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: document.querySelector("#model").value, prompt: systemPrompt("student", prompt) }),
    });
    const data = await readResponseBody(response);
    if (!response.ok) throw new Error(data.error || "Gemini request failed.");
    output.textContent = data.text || c.noText;
    show(message, c.ready, "success");
  } catch (error) {
    output.textContent = loginLang === "vi" ? "Kiểm tra GEMINI_API_KEY trên Vercel hoặc local server." : "Check GEMINI_API_KEY on Vercel or the local server.";
    show(message, error.message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = `${icon("icon-send")} ${t("student").askNext}`;
  }
}

async function askTeacherChat(event) {
  event.preventDefault();
  await askRoleGemini("teacher", "#teacherChatPrompt", "#teacherChatOutput", "#teacherChatMessage", "#teacherChatSend", t("teacher").send);
}

async function askParentAdvisor(event) {
  event.preventDefault();
  await askRoleGemini("parent", "#parentPrompt", "#parentAdvisorOutput", "#parentAdvisorMessage", "#parentAskGemini", t("parent").askAdvisor);
}

async function askRoleGemini(role, promptSelector, outputSelector, messageSelector, buttonSelector, label) {
  const c = t("common");
  const prompt = document.querySelector(promptSelector).value.trim();
  const output = document.querySelector(outputSelector);
  const message = document.querySelector(messageSelector);
  const button = document.querySelector(buttonSelector);
  if (!prompt) return show(message, c.enterPrompt, "error");
  button.disabled = true;
  button.textContent = c.thinking;
  show(message, c.sending);
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemini-3.6-flash", prompt: systemPrompt(role, prompt) }),
    });
    const data = await readResponseBody(response);
    if (!response.ok) throw new Error(data.error || "Gemini request failed.");
    output.textContent = data.text || c.noText;
    show(message, c.ready, "success");
  } catch (error) {
    output.textContent = role === "parent"
      ? (loginLang === "vi" ? "Gợi ý mẫu: hỏi nhẹ nhàng, chọn một mục tiêu nhỏ và khen nỗ lực trước khi nhắc lỗi." : "Demo fallback: ask calmly, choose one small target, and praise effort before discussing mistakes.")
      : (loginLang === "vi" ? "Gợi ý mẫu: ghi nhận công thức đúng, chỉ ra bước giải thích còn thiếu." : "Demo fallback: acknowledge the correct formula and identify the missing explanation step.");
    show(message, error.message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = `${icon("icon-send")} ${label}`;
  }
}

async function startCamera() {
  const c = t("common");
  const video = document.querySelector("#cameraVideo");
  const message = document.querySelector("#cameraMessage");
  if (!navigator.mediaDevices?.getUserMedia) return show(message, c.cameraUnsupported, "error");
  try {
    stopCamera(false);
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    video.srcObject = cameraStream;
    video.classList.add("is-live");
    show(message, c.cameraLive, "success");
  } catch (error) {
    show(message, error.message || "Camera permission was blocked.", "error");
  }
}

async function captureFrame() {
  const c = t("common");
  const video = document.querySelector("#cameraVideo");
  const canvas = document.querySelector("#cameraCanvas");
  const output = document.querySelector("#ocrOutput");
  const message = document.querySelector("#cameraMessage");
  if (!cameraStream || !video.videoWidth) return show(message, c.cameraFirst, "error");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const role = currentRole();
  const demo = demoOcr(role);
  if (!config.hasGeminiKey) {
    output.textContent = demo;
    return show(message, c.keyNeeded, "success");
  }
  show(message, c.imageSending);
  try {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: document.querySelector("#model")?.value || "gemini-3.6-flash",
        prompt: imagePrompt(role),
        image: { mimeType: "image/jpeg", data: dataUrl.split(",")[1] },
      }),
    });
    const data = await readResponseBody(response);
    if (!response.ok) throw new Error(data.error || "Gemini image request failed.");
    output.textContent = data.text || demo;
    show(message, c.imageReady, "success");
  } catch (error) {
    output.textContent = `${demo}\n\n${error.message}`;
    show(message, c.imageFallback, "error");
  }
}

function stopCamera(clear = true) {
  if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  const video = document.querySelector("#cameraVideo");
  if (video) {
    video.srcObject = null;
    video.classList.remove("is-live");
  }
  if (clear) show(document.querySelector("#cameraMessage"), t("common").cameraStopped);
}

function demoOcr(role) {
  if (loginLang === "vi") {
    return role === "teacher"
      ? "Bài viết tay: lời giải đại số. Nhận diện: chọn đúng công thức, thay số gần đúng, thiếu bước giải thích. Gợi ý: thêm một câu giải thích vì sao công thức áp dụng."
      : "Phiếu bài tập: giải x^2 - 5x + 6 = 0. Phản hồi mẫu: kiểm tra phân tích (x - 2)(x - 3), viết đủ hai nghiệm và giải thích.";
  }
  return role === "teacher"
    ? "Detected assignment: handwritten algebra solution. Correct formula, mostly accurate substitution, missing explanation. Feedback: add one sentence explaining why the formula applies."
    : "Detected worksheet: solve x^2 - 5x + 6 = 0. Demo feedback: check factorization, both roots, and written justification.";
}

function imagePrompt(role) {
  const language = loginLang === "vi" ? "Vietnamese" : "English";
  return role === "teacher"
    ? `Read this assignment photo, identify solution steps, detect mistakes, and draft concise qualitative feedback. Respond in ${language}.`
    : `Read this worksheet photo, extract visible math work, grade it briefly, and give Socratic next-step feedback. Respond in ${language}.`;
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
  stopCamera(false);
  const [first, second] = routePath().split("/");
  if (first === "login") return renderLogin(roles[second] ? second : currentRole());
  if (first === "student") return renderStudentDashboard();
  if (first === "teacher") return renderTeacherDashboard();
  if (first === "parent") return renderParentDashboard();
  renderLogin(currentRole());
}

window.addEventListener("hashchange", render);
initBackend().then(render);
