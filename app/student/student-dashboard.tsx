"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import { CameraCapture } from "@/app/student/camera-capture";
import { FloatingAiChat } from "@/app/student/floating-ai-chat";

type UploadMode = "file" | "camera" | "text";

type SelectedSubmission = {
  name: string;
  kind: string;
  sizeLabel: string;
};

const acceptedHomeworkTypes = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const acceptedCameraTypes = ["image/png", "image/jpeg", "image/webp", "image/heic"];

// Keep this browser-side limit easy to match when the backend upload API is added.
const maxFileSizeInBytes = 25 * 1024 * 1024;

export function StudentDashboard() {
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [selectedSubmission, setSelectedSubmission] =
    useState<SelectedSubmission | null>(null);
  const [typedHomework, setTypedHomework] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const hasHomeworkInput = useMemo(
    () => Boolean(selectedSubmission || typedHomework.trim()),
    [selectedSubmission, typedHomework],
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationMessage = validateHomeworkFile(file, uploadMode);

    if (validationMessage) {
      event.target.value = "";
      setSelectedSubmission(null);
      setUploadMessage(validationMessage);
      return;
    }

    setSelectedSubmission({
      name: file.name,
      kind: uploadMode === "camera" ? "Camera image" : "Homework file",
      sizeLabel: formatFileSize(file.size),
    });
    setUploadMessage(`${file.name} is ready for review.`);
  }

  function handleCameraCapture(file: File) {
    const validationMessage = validateHomeworkFile(file, "camera");

    if (validationMessage) {
      setSelectedSubmission(null);
      setUploadMessage(validationMessage);
      return;
    }

    setSelectedSubmission({
      name: file.name,
      kind: "Camera image",
      sizeLabel: formatFileSize(file.size),
    });
    setUploadMessage(`${file.name} is ready for OCR grading.`);
  }

  function handleAnalyze() {
    if (!hasHomeworkInput) {
      setUploadMessage("Add a file, camera image, or typed homework first.");
      return;
    }

    setIsAnalyzing(true);
    setUploadMessage("Preparing a demo OCR grading summary...");

    // Temporary local simulation until OCR grading is connected to a backend API.
    window.setTimeout(() => {
      setIsAnalyzing(false);
      setUploadMessage("Demo analysis ready. Open the floating AI chat for follow-up.");
    }, 700);
  }

  return (
    <div className="grid gap-6 pb-24">
      <section
        aria-labelledby="homework-upload-title"
        className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="homework-upload-title"
              className="text-xl font-bold text-emerald-950"
            >
              Homework Upload
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Submit Word, PDF, typed answers, or a camera image for OCR grading.
            </p>
          </div>
          <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
            Demo OCR
          </span>
        </div>

        <fieldset className="mt-6">
          <legend className="sr-only">Choose homework input type</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {(["file", "camera", "text"] satisfies UploadMode[]).map((mode) => {
              const isSelected = uploadMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setUploadMode(mode);
                    setUploadMessage("");
                  }}
                  aria-pressed={isSelected}
                  className={`h-11 rounded-md border px-3 text-sm font-semibold capitalize transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 ${
                    isSelected
                      ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6">
          {uploadMode === "file" ? (
            <FileInput
              id="homework-file"
              label="Upload Word, PDF, or text file"
              accept={acceptedHomeworkTypes.join(",")}
              onChange={handleFileChange}
            />
          ) : null}

          {uploadMode === "camera" ? (
            <CameraCapture onCapture={handleCameraCapture} />
          ) : null}

          {uploadMode === "text" ? (
            <div className="space-y-2">
              <label
                htmlFor="typed-homework"
                className="text-sm font-semibold text-slate-800"
              >
                Paste or type homework answer
              </label>
              <textarea
                id="typed-homework"
                rows={9}
                value={typedHomework}
                onChange={(event) => {
                  setTypedHomework(event.target.value);
                  setUploadMessage("");
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          ) : null}
        </div>

        {selectedSubmission ? (
          <div className="mt-5 rounded-md border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">
              {selectedSubmission.name}
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              {selectedSubmission.kind} - {selectedSubmission.sizeLabel}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex h-12 items-center justify-center rounded-md bg-emerald-700 px-5 text-base font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 active:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:w-auto"
          >
            {isAnalyzing ? "Analyzing..." : "Start OCR Grading"}
          </button>
          <p
            role="status"
            aria-live="polite"
            className="min-h-6 text-sm font-medium text-slate-600"
          >
            {uploadMessage}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="recent-work-title"
        className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm"
      >
        <h2 id="recent-work-title" className="text-lg font-bold text-emerald-950">
          Recent Work
        </h2>
        <div className="mt-4 rounded-md border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-sm text-slate-600">
          Submitted homework will appear here after Supabase storage and the
          submissions table are connected.
        </div>
      </section>

      <FloatingAiChat />
    </div>
  );
}

type FileInputProps = {
  id: string;
  label: string;
  accept: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function FileInput({ id, label, accept, onChange }: FileInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        className="block w-full rounded-md border border-dashed border-emerald-300 bg-emerald-50 px-4 py-6 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
      />
    </div>
  );
}

function validateHomeworkFile(file: File, uploadMode: UploadMode): string {
  if (file.size > maxFileSizeInBytes) {
    return "File is too large. Use a file under 25 MB.";
  }

  if (uploadMode === "camera") {
    return acceptedCameraTypes.includes(file.type)
      ? ""
      : "Camera OCR accepts image files only.";
  }

  const fileName = file.name.toLowerCase();
  const hasAcceptedExtension = [".pdf", ".doc", ".docx", ".txt"].some((extension) =>
    fileName.endsWith(extension),
  );

  if (!hasAcceptedExtension && !acceptedHomeworkTypes.includes(file.type)) {
    return "Upload a Word document, PDF, or text file.";
  }

  return "";
}

function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
  }

  return `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
}
