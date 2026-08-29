const STORAGE_KEYS = {
  apiKey: "edumind.geminiApiKey",
  notes: "edumind.notes",
  theme: "edumind.theme",
};

const taskSets = [
  [
    ["Review traversal rules", "10 min read, then write each order from memory."],
    ["Trace one tree", "Draw a seven-node tree and list inorder, preorder, postorder."],
    ["Ask Gemini for recall", "Generate two short questions after the trace."],
    ["Close the loop", "Mark the confusing step and add it to notes."],
  ],
  [
    ["Skim source notes", "Find the exact definition and one worked example."],
    ["Explain aloud", "Record a one-minute explanation without looking."],
    ["Practice transfer", "Solve a similar problem with changed values."],
    ["Summarize gap", "Write the smallest question that remains unclear."],
  ],
  [
    ["Warm up", "List five keywords from memory before reading."],
    ["Deep focus", "Use one 25-minute block on the weakest concept."],
    ["Quiz", "Answer five recall questions without notes."],
    ["Reflect", "Keep one sentence on what improved."],
  ],
];

const elements = {
  body: document.body,
  themeToggle: document.querySelector("#themeToggle"),
  quickStart: document.querySelector("#quickStart"),
  samplePrompt: document.querySelector("#samplePrompt"),
  masteryScore: document.querySelector("#masteryScore"),
  apiKey: document.querySelector("#apiKey"),
  saveKey: document.querySelector("#saveKey"),
  keyStatus: document.querySelector("#keyStatus"),
  modelSelect: document.querySelector("#modelSelect"),
  studyMode: document.querySelector("#studyMode"),
  topicInput: document.querySelector("#topicInput"),
  promptInput: document.querySelector("#promptInput"),
  geminiForm: document.querySelector("#geminiForm"),
  askGemini: document.querySelector("#askGemini"),
  clearOutput: document.querySelector("#clearOutput"),
  copyResponse: document.querySelector("#copyResponse"),
  formMessage: document.querySelector("#formMessage"),
  responseOutput: document.querySelector("#responseOutput"),
  regeneratePlan: document.querySelector("#regeneratePlan"),
  taskList: document.querySelector("#taskList"),
  noteInput: document.querySelector("#noteInput"),
  noteStatus: document.querySelector("#noteStatus"),
};

let planIndex = 0;

function setMessage(text, type = "") {
  elements.formMessage.textContent = text;
  elements.formMessage.className = `form-message ${type}`.trim();
}

function setLoading(isLoading) {
  elements.askGemini.disabled = isLoading;
  elements.askGemini.innerHTML = isLoading
    ? "Thinking..."
    : '<svg aria-hidden="true"><use href="#icon-send"></use></svg>Ask Gemini';
}

function updateKeyStatus() {
  const hasKey = Boolean(localStorage.getItem(STORAGE_KEYS.apiKey));
  elements.keyStatus.textContent = hasKey ? "Key saved" : "No key saved";
  elements.keyStatus.className = `status-pill ${hasKey ? "ready" : "warn"}`;
}

function renderPlan() {
  const tasks = taskSets[planIndex % taskSets.length];
  elements.taskList.innerHTML = tasks
    .map(([title, detail]) => `<li><div><strong>${title}</strong><span>${detail}</span></div></li>`)
    .join("");
}

function buildGeminiPrompt() {
  return [
    "You are Edumind, a concise study tutor.",
    "Use clear sections, plain language, and short recall questions.",
    `Topic: ${elements.topicInput.value.trim()}`,
    `Mode: ${elements.studyMode.value}`,
    `Request: ${elements.promptInput.value.trim()}`,
  ].join("\n\n");
}

function extractGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
}

async function askGemini(event) {
  event.preventDefault();

  const apiKey = elements.apiKey.value.trim() || localStorage.getItem(STORAGE_KEYS.apiKey);
  const topic = elements.topicInput.value.trim();
  const request = elements.promptInput.value.trim();

  if (!apiKey) {
    setMessage("Enter a Gemini API key first.", "error");
    elements.apiKey.focus();
    return;
  }

  if (!topic || !request) {
    setMessage("Add both a topic and a request.", "error");
    (!topic ? elements.topicInput : elements.promptInput).focus();
    return;
  }

  setLoading(true);
  setMessage("Sending request to Gemini...");
  elements.responseOutput.textContent = "";

  try {
    const model = elements.modelSelect.value;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildGeminiPrompt() }],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 900,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const reason = data?.error?.message || "Gemini request failed.";
      throw new Error(reason);
    }

    const text = extractGeminiText(data);
    elements.responseOutput.textContent = text || "No text returned by Gemini.";
    setMessage("Response ready.", "success");
  } catch (error) {
    elements.responseOutput.textContent = "Check the API key, model access, and browser network permissions.";
    setMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function saveKey() {
  const key = elements.apiKey.value.trim();
  if (!key) {
    setMessage("Paste an API key before saving.", "error");
    elements.apiKey.focus();
    return;
  }
  localStorage.setItem(STORAGE_KEYS.apiKey, key);
  updateKeyStatus();
  setMessage("API key saved in this browser.", "success");
}

function loadState() {
  const savedKey = localStorage.getItem(STORAGE_KEYS.apiKey);
  const savedNotes = localStorage.getItem(STORAGE_KEYS.notes);
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (savedKey) {
    elements.apiKey.value = savedKey;
  }

  if (savedNotes) {
    elements.noteInput.value = savedNotes;
  }

  if (savedTheme === "dark") {
    elements.body.classList.add("dark");
  }

  updateKeyStatus();
  renderPlan();
}

elements.themeToggle.addEventListener("click", () => {
  elements.body.classList.toggle("dark");
  localStorage.setItem(STORAGE_KEYS.theme, elements.body.classList.contains("dark") ? "dark" : "light");
});

elements.quickStart.addEventListener("click", () => {
  const current = Number.parseInt(elements.masteryScore.textContent, 10);
  const next = Math.min(current + 3, 100);
  elements.masteryScore.textContent = `${next}%`;
  document.querySelector(".progress-track span").style.width = `${next}%`;
});

elements.samplePrompt.addEventListener("click", () => {
  elements.topicInput.value = "Limits and continuity";
  elements.promptInput.value = "Teach me the difference between a limit existing and a function being continuous. Use one numeric example and end with two recall questions.";
  elements.promptInput.focus();
});

elements.saveKey.addEventListener("click", saveKey);
elements.geminiForm.addEventListener("submit", askGemini);

elements.clearOutput.addEventListener("click", () => {
  elements.responseOutput.textContent = "Gemini output will appear here.";
  setMessage("");
});

elements.copyResponse.addEventListener("click", async () => {
  const text = elements.responseOutput.textContent.trim();
  if (!text || text === "Gemini output will appear here.") {
    setMessage("Nothing to copy yet.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setMessage("Response copied.", "success");
  } catch {
    setMessage("Clipboard access is unavailable in this browser.", "error");
  }
});

elements.regeneratePlan.addEventListener("click", () => {
  planIndex += 1;
  renderPlan();
});

elements.noteInput.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.notes, elements.noteInput.value);
  elements.noteStatus.textContent = "Saved";
  elements.noteStatus.className = "status-pill ready";
});

loadState();
