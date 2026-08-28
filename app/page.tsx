"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  getRoleLabel,
  getUserRole,
  roleDestinations,
  roleOptions,
  type UserRole,
} from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/env";

type LoginAccount = {
  label: "Student" | "Teacher" | "Parent";
};

const accountsByRole: Record<UserRole, LoginAccount> = {
  student: { label: "Student" },
  teacher: { label: "Teacher" },
  parent: { label: "Parent" },
};

const usernameEmailAliases: Record<string, string> = {
  student123: "student123@edumind.local",
  teacher123: "teacher123@edumind.local",
  parent123: "parent123@edumind.local",
};

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAccount = accountsByRole[selectedRole];

  function handleRoleChange(role: UserRole) {
    setSelectedRole(role);
    setMessage("");
    setIsAuthenticated(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsAuthenticated(false);

    if (!getSupabaseConfig()) {
      setIsSubmitting(false);
      setMessage("Supabase is not configured. Add real values to .env.local and restart dev.");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: getAuthEmail(username),
      password,
    });

    if (error || !data.user) {
      setIsSubmitting(false);
      setMessage(error?.message ?? "Unable to sign in with Supabase.");
      return;
    }

    const authenticatedRole = getUserRole(data.user);

    if (!authenticatedRole) {
      await supabase.auth.signOut();
      setIsSubmitting(false);
      setMessage("This Supabase user is missing student, teacher, or parent role metadata.");
      return;
    }

    if (authenticatedRole !== selectedRole) {
      await supabase.auth.signOut();
      setIsSubmitting(false);
      setMessage(`This account is registered as ${getRoleLabel(authenticatedRole)}.`);
      return;
    }

    setIsAuthenticated(true);
    setMessage(`Logged in as ${selectedAccount.label}.`);
    router.push(roleDestinations[authenticatedRole]);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#dcfce7_0,#f8fafc_42%,#ffffff_100%)] text-slate-950">
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <section className="w-full max-w-md" aria-labelledby="page-title">
          <h1
            id="page-title"
            className="text-center text-3xl font-bold leading-tight text-emerald-950 sm:text-4xl"
          >
            Edumind: AI Powered Education Assistant.
          </h1>

          <form
            className="mt-8 rounded-lg border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-950/10 sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-slate-800">
                Username or email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                disabled={isSubmitting}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-describedby="login-message"
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div className="mt-5 space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby="login-message"
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-emerald-700 px-5 text-base font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 active:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <fieldset className="mt-4">
              <legend className="sr-only">Choose login role</legend>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((role) => {
                  const account = accountsByRole[role];
                  const isSelected = selectedRole === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleRoleChange(role)}
                      aria-pressed={isSelected}
                      className={`h-11 rounded-md border px-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      {account.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <p
              id="login-message"
              role="status"
              aria-live="polite"
              className={`mt-4 min-h-6 text-center text-sm font-medium ${
                isAuthenticated ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {message}
            </p>
          </form>
        </section>
      </main>

      <footer className="border-t border-emerald-100 bg-white/80 px-5 py-5 text-center text-sm text-slate-600">
        <p>EduMind learning portal</p>
      </footer>
    </div>
  );
}

function getAuthEmail(identifier: string): string {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  // Supabase signs in with email/password. These aliases let early test users
  // keep typing student123, teacher123, and parent123 in the login form.
  return usernameEmailAliases[normalizedIdentifier] ?? normalizedIdentifier;
}
