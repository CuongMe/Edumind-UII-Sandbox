# Edumind Page Plan

This document defines what each page should become, what content belongs there,
and the best-practice recommendations to follow while building the demo into a
clear MVP.

## Product Direction

Edumind is an AI powered education assistant for three audiences:

- Students use it to submit homework and receive guided feedback.
- Teachers use it to review submissions, identify class learning gaps, and plan support.
- Parents use it to understand student progress without needing teacher-level detail.

The first complete product loop should be:

```text
Student submits work -> AI analyzes it -> Student gets feedback -> Teacher sees learning gaps -> Parent sees progress summary
```

## Current Routes

| Route | User | Current State | Goal |
| --- | --- | --- | --- |
| `/` | Public | Login page | Role-based login entry point |
| `/student` | Student | Empty protected demo page | Student dashboard |
| `/teacher` | Teacher | Empty protected demo page | Teacher dashboard |
| `/parent` | Parent | Empty protected demo page | Parent dashboard |

## Page 1: Login

Route: `/`

Purpose:

Give users one simple place to enter the app as Student, Teacher, or Parent.

Recommended content:

- Title: `Edumind: AI Powered Education Assistant.`
- Username or email input
- Password input
- Login button
- Role buttons: Student, Teacher, Parent
- Clear login error message
- Footer

Best practices:

- Keep this page minimal. Do not add marketing copy until the core app works.
- Use visible labels for inputs.
- Disable inputs while login is submitting.
- Show errors in an `aria-live` region for accessibility.
- Do not show secret keys or backend details on the page.
- For demo auth, browser localStorage is acceptable. For production, move back to server-readable cookie auth.

## Page 2: Student Dashboard

Route: `/student`

Purpose:

Help the student submit homework and continue learning through an AI chat section.

Recommended first sections:

- Homework upload area with Word document and PDF support
- Camera OCR grading for photographed homework
- Recent submissions
- AI chat section
- Practice suggestions

MVP layout:

```text
Header
Main content
  Upload homework
  AI chat section
  Practice next
Footer
```

Recommended components:

- `HomeworkUpload`
- `SubmissionPreview`
- `AiChatSection`
- `PracticeSuggestions`
- `EmptyState`

Best practices:

- Build upload with clear file type and size limits.
- Support typed text, Word documents, PDFs, and camera-captured homework images.
- Use OCR results as reviewable text before AI grading when possible.
- Show upload progress and failure states.
- Allow students to preview files before submitting.
- Keep AI chat responses short, actionable, and focused on learning.
- Avoid overwhelming students with teacher-only analytics.

## Page 3: Teacher Dashboard

Route: `/teacher`

Purpose:

Help teachers review class performance and identify where students need support.

Recommended first sections:

- Class overview
- Submissions awaiting review
- Common mistakes
- Knowledge gaps
- Student list

MVP layout:

```text
Header
Main content
  Class summary
  Submission queue
  Learning gaps
  Student progress table
Footer
```

Recommended components:

- `ClassSummary`
- `SubmissionQueue`
- `LearningGapList`
- `StudentProgressTable`
- `TeacherFeedbackPanel`

Best practices:

- Prioritize dense, scannable information.
- Use tables for student lists, not decorative cards.
- Add filters for class, subject, date, and status.
- Use charts only when they help comparison.
- Teacher actions should be explicit and reversible where possible.

## Page 4: Parent Dashboard

Route: `/parent`

Purpose:

Help parents understand progress and support their child at home.

Recommended first sections:

- Student progress summary
- Recent feedback
- Strengths
- Support areas
- Suggested home practice

MVP layout:

```text
Header
Main content
  Progress summary
  Recent teacher or AI feedback
  Home support suggestions
Footer
```

Recommended components:

- `ProgressSummary`
- `RecentFeedback`
- `StrengthsList`
- `SupportAreas`
- `HomePracticeSuggestions`

Best practices:

- Use plain language.
- Avoid technical grading language unless explained.
- Show trends instead of raw analytics.
- Keep parent content privacy-safe and student-focused.
- Do not expose teacher-only internal notes.

## Recommended Future Pages

### Submission Detail

Route: `/submissions/[submissionId]`

Purpose:

Show one homework submission, OCR text, AI feedback, and teacher comments.

Recommended users:

- Student: can view own submission.
- Teacher: can view class submissions.
- Parent: can view their linked child's submission summary.

Best practices:

- Enforce ownership checks before showing data.
- Separate original work, AI analysis, and teacher comments.
- Keep the visual hierarchy clear on mobile.

### Class Detail

Route: `/teacher/classes/[classId]`

Purpose:

Show one class with student progress, assignments, and common gaps.

Best practices:

- Use a table for students.
- Add filters before adding more charts.
- Show empty states when no submissions exist.

### Profile Settings

Route: `/settings`

Purpose:

Let users see account information and basic preferences.

Best practices:

- Do not let users change their own role from the client.
- Keep account identity data separate from learning data.
- Add logout and session status clearly.

## Shared Layout Recommendations

Build shared UI once, then reuse it:

- `AppShell`
- `PageHeader`
- `Footer`
- `RoleGuard`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `PrimaryButton`
- `TextField`

Best practices:

- Keep one `<main>` element per page.
- Use semantic landmarks: `header`, `nav`, `main`, `section`, `footer`.
- Keep cards at 8px border radius or less.
- Use stable spacing and responsive grid constraints.
- Make touch targets at least 44px high.
- Keep focus states visible.
- Avoid large decorative layouts for dashboards.

## Data Model Recommendations

Start with these Supabase tables later:

```text
profiles
students
teachers
parents
classes
class_students
submissions
ai_feedback
learning_gaps
practice_items
```

Recommended role metadata:

```json
{
  "role": "student"
}
```

Use `app_metadata.role` when possible because normal users should not be able
to edit their own role.

## Authentication Recommendation

Current demo:

- Supabase email/password auth
- Browser localStorage session
- Client-side role guard

Production recommendation:

- Supabase auth with server-readable cookies
- Server-side route protection
- Supabase Row Level Security
- Role checks close to every data query

Demo warning:

Client-side guards are fine for a visual demo, but they are not enough for
private student data. Before real users, enforce access through Supabase RLS and
server-side checks.

## Build Order Recommendation

1. Finish login and role routing.
2. Build the Student dashboard upload flow with mock results.
3. Save submissions in Supabase.
4. Add the AI chat section using mock OCR text.
5. Add Mathpix OCR.
6. Build Teacher dashboard summaries.
7. Build Parent progress summaries.
8. Add real authorization and RLS policies.
9. Add charts and analytics only after core data exists.

## Definition of Done for Each Page

Each page should have:

- Responsive layout for mobile, tablet, and desktop.
- Loading state.
- Empty state.
- Error state.
- Accessible labels and focus states.
- Clear footer.
- No hardcoded private data.
- No broken navigation.
- Passing lint and production build.
