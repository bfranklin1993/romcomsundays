export async function generateFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    screen.width + "x" + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    getOrCreateToken(),
  ];

  const raw = components.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getOrCreateToken(): string {
  const key = "rcs_token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

export function hasVoted(movieId: string): boolean {
  return localStorage.getItem(`rcs_voted_${movieId}`) === "true";
}

export function markVoted(movieId: string): void {
  localStorage.setItem(`rcs_voted_${movieId}`, "true");
}
