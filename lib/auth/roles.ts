import type { User } from "@supabase/supabase-js";

export type UserRole = "student" | "teacher" | "parent";

export const roleDestinations: Record<UserRole, `/${UserRole}`> = {
  student: "/student",
  teacher: "/teacher",
  parent: "/parent",
};

export const roleOptions: UserRole[] = ["student", "teacher", "parent"];

export function getRoleLabel(role: UserRole): "Student" | "Teacher" | "Parent" {
  if (role === "teacher") {
    return "Teacher";
  }

  if (role === "parent") {
    return "Parent";
  }

  return "Student";
}

export function isUserRole(value: unknown): value is UserRole {
  return value === "student" || value === "teacher" || value === "parent";
}

export function getUserRole(user: User): UserRole | null {
  const appRole = readRoleFromMetadata(user.app_metadata);

  if (appRole) {
    return appRole;
  }

  return readRoleFromMetadata(user.user_metadata);
}

function readRoleFromMetadata(metadata: unknown): UserRole | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  // Supabase stores custom role data in metadata. We support app_metadata first
  // because users cannot edit it themselves from the browser.
  const role = (metadata as { role?: unknown }).role;

  return isUserRole(role) ? role : null;
}
