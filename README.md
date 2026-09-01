# EduMind AI

EduMind is a simple HTML, CSS, and JavaScript demo web app for AI-supported education. It has separate demo routes for students, teachers, and parents, plus a Vercel backend endpoint that keeps the Gemini API key off the browser.

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js for local development
- Vercel Serverless Functions for production Gemini API calls

No React build is required.

## Routes

- `#/login/student` - Student login
- `#/login/teacher` - Teacher login
- `#/login/parent` - Parent login
- `#/student` - Student dashboard
- `#/teacher` - Teacher dashboard
- `#/parent` - Parent dashboard

The login is demo-only. Any filled email and password can continue.

## Features

### Student

- Socratic Gemini tutor
- Device camera worksheet capture
- OCR-style grading feedback through Gemini
- Personalized review pathway

### Teacher

- Smart handwritten assignment grading assistant
- Automated differentiated exam matrix generator
- Classroom competency reports
- Floating Gemini teacher chatbot
- Exam preview modal with Download and Discard actions

### Parent

- Weekly learning digest
- Emotional support plan
- Grade report
- Gemini parent advisor

## Language Support

The app supports English and Vietnamese. Use the flag language switch on the login and dashboard pages.

## Local Setup

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Install dependencies only if needed. This project currently has no external runtime dependencies.

Start the local server:

```powershell
npm start
```

Open:

```text
http://127.0.0.1:4174
```

If port `4174` is busy:

```powershell
$env:PORT=4175
npm start
```

## Vercel Deployment

This repo includes Vercel API functions:

- `api/config.js`
- `api/gemini.js`
- `api/gemini-core.js`

In Vercel, add this environment variable:

```text
GEMINI_API_KEY=your_gemini_api_key
```

Then deploy the project. The frontend calls:

- `/config`
- `/api/gemini`

The Gemini key stays in Vercel environment variables and is never sent to the browser.

## GitHub Pages Note

GitHub Pages is static hosting only. It can serve the frontend, but it cannot hide `GEMINI_API_KEY`.

If you use GitHub Pages for the frontend, deploy the backend somewhere else and set the backend URL in the browser:

```js
localStorage.setItem("edumind.apiBase", "https://your-backend-url.com")
```

Then reload the app.

For the simplest secure deployment, use Vercel for both frontend and backend.

## Camera Requirements

Camera access requires a secure context:

- `localhost` works for local testing.
- Production must use HTTPS.

Vercel provides HTTPS automatically.

## Files to Commit

Commit the app and Vercel backend files:

```powershell
git add .gitignore README.md index.html css/styles.css script/script.js local-server.js api package.json vercel.json scripts
git commit -m "Prepare EduMind for Vercel deployment"
git push origin $(git branch --show-current)
```

Do not commit:

- `.env`
- `penpotmcp`
- `.agents`
- `.codex`
- Penpot plugin notes
- skills lock files

These are ignored in `.gitignore`.

## Quick Checks

```powershell
node --check script/script.js
node --check local-server.js
node --check api/gemini.js
node --check api/config.js
node --check api/gemini-core.js
npm run build
```
