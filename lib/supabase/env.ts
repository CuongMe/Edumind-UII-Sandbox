export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!isConfiguredValue(url) || !isConfiguredValue(publishableKey)) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }
  } catch {
    return null;
  }

  return { url, publishableKey };
}

export function requireSupabaseConfig(): SupabaseConfig {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Missing real NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return config;
}

function isConfiguredValue(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  const normalizedValue = value.toLowerCase();

  // Reject the sample values used in .env files so the app does not try to
  // call Supabase with documentation placeholders.
  return !(
    normalizedValue.includes("your-project-ref") ||
    normalizedValue.includes("your-supabase") ||
    normalizedValue.includes("replace-with")
  );
}
