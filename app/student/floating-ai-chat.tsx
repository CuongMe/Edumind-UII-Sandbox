"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = {
  id: number;
  sender: "assistant" | "student";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "assistant",
    text: "Ask me about your homework when you are ready.",
  },
];

export function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextMessageId = useRef(2);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = chatInput.trim();

    if (!trimmedInput) {
      return;
    }

    appendMessage("student", trimmedInput);
    setChatInput("");

    // Local demo response until the AI chat endpoint is connected.
    window.setTimeout(() => {
      appendMessage(
        "assistant",
        "Demo reply: I can check reasoning, explain the next step, or make practice questions.",
      );
    }, 300);
  }

  function appendMessage(sender: ChatMessage["sender"], text: string) {
    setChatMessages((messages) => [
      ...messages,
      { id: nextMessageId.current++, sender, text },
    ]);
  }

  return (
    <>
      {isOpen ? (
        <section
          id="floating-ai-chat"
          role="dialog"
          aria-label="AI chat window"
          className="fixed inset-0 z-40 flex flex-col border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/20 sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[min(640px,calc(100vh-2.5rem))] sm:w-[min(420px,calc(100vw-2.5rem))] sm:rounded-lg"
        >
          <header className="flex items-center justify-between border-b border-emerald-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-emerald-950">AI Chat</h2>
              <p className="text-sm text-slate-600">Homework help</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex size-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
              aria-label="Close AI chat"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </header>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-emerald-50/50 p-4">
            {chatMessages.map((message) => (
              <article
                key={message.id}
                className={`relative max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.sender === "student"
                    ? "self-end bg-emerald-700 text-white"
                    : "self-start border border-emerald-100 bg-white text-slate-700"
                }`}
              >
                {message.text}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 size-3 rotate-45 ${
                    message.sender === "student"
                      ? "-right-1 bg-emerald-700"
                      : "-left-1 border-b border-l border-emerald-100 bg-white"
                  }`}
                />
              </article>
            ))}
          </div>

          <form className="flex gap-3 border-t border-emerald-100 p-4" onSubmit={handleChatSubmit}>
            <label htmlFor="floating-chat-message" className="sr-only">
              Message AI chat
            </label>
            <input
              ref={inputRef}
              id="floating-chat-message"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask a question"
              className="h-12 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />
            <button
              type="submit"
              className="flex h-12 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
            >
              Send
            </button>
          </form>
        </section>
      ) : null}

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-controls="floating-ai-chat"
          aria-expanded={isOpen}
          aria-label="Open AI chat"
          className="fixed right-5 bottom-5 z-40 flex size-16 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xl shadow-emerald-950/25 transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 active:bg-emerald-900"
        >
          <span className="absolute right-12 bottom-12 rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm font-bold text-emerald-950 shadow-lg">
            AI
            <span
              aria-hidden="true"
              className="absolute right-3 -bottom-1 size-3 rotate-45 border-r border-b border-emerald-100 bg-white"
            />
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-8"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
          </svg>
        </button>
      ) : null}
    </>
  );
}
