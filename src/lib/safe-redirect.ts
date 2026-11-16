/** Only same-site relative paths are allowed as post-login destinations. */
export function safeRedirect(target: string | null, fallback: string) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }
  return target;
}
