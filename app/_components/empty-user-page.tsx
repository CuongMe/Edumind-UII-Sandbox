"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { getUserRole, roleDestinations, type UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/env";

type EmptyUserPageProps = {
  title: string;
  requiredRole: UserRole;
  children?: ReactNode;
};

type PageAuthState =
  | {
      status: "checking";
    }
  | {
      status: "missing-config";
    }
  | {
      status: "ready";
      userEmail: string;
    };

export function EmptyUserPage({ title, requiredRole, children }: EmptyUserPageProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<PageAuthState>({ status: "checking" });
  const canShowPageContent =
    authState.status === "ready" || authState.status === "missing-config";

  useEffect(() => {
    let isMounted = true;

    async function verifyLocalSession() {
      if (!getSupabaseConfig()) {
        setAuthState({ status: "missing-config" });
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (error || !user) {
        router.replace("/");
        return;
      }

      const userRole = getUserRole(user);

      if (!userRole) {
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      if (userRole !== requiredRole) {
        router.replace(roleDestinations[userRole]);
        return;
      }

      setAuthState({
        status: "ready",
        userEmail: user.email ?? "Signed-in user",
      });
    }

    verifyLocalSession();

    return () => {
      isMounted = false;
    };
  }, [requiredRole, router]);

  async function handleLogout() {
    if (getSupabaseConfig()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    router.replace("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#dcfce7_0,#f8fafc_42%,#ffffff_100%)] text-slate-950">
      <header className="border-b border-emerald-100 bg-white/80 px-5 py-5 sm:px-8">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="rounded-md text-xl font-bold text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            Edumind
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md text-sm font-semibold text-slate-700 transition hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
        <section aria-labelledby="page-title" className="w-full">
          <h1
            id="page-title"
            className="text-2xl font-bold text-emerald-950 sm:text-3xl"
          >
            {title}
          </h1>

          {authState.status === "checking" ? (
            <p className="mt-2 text-sm text-slate-600">Checking login session...</p>
          ) : null}

          {authState.status === "ready" ? (
            <p className="mt-2 text-sm text-slate-600">
              Signed in as {authState.userEmail}
            </p>
          ) : null}

          {authState.status === "missing-config" ? (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Supabase is not configured yet. Replace the placeholder project
              URL and publishable key in <code>.env.local</code>, then restart
              the dev server.
            </div>
          ) : null}

          {children && canShowPageContent ? (
            <div className="mt-8">{children}</div>
          ) : !children ? (
            // Empty content area for the teacher and parent dashboard milestones.
            <div
              aria-label={`${title} content area`}
              className="mt-8 min-h-[45vh] rounded-lg border border-dashed border-emerald-200 bg-white/70"
            />
          ) : (
            <div className="mt-8 min-h-[45vh]" />
          )}
        </section>
      </main>

      <footer className="border-t border-emerald-100 bg-white/80 px-5 py-5 text-center text-sm text-slate-600">
        <p>EduMind learning portal</p>
      </footer>
    </div>
  );
}
