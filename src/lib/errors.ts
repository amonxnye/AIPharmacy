// Narrow an unknown caught value to a human-readable message.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// Extract a Firebase-style error code (e.g. "auth/user-not-found") if present.
export function getErrorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    return String((err as { code: unknown }).code);
  }
  return undefined;
}
