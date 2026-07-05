import { API_BASE } from "../config";

export async function loginWithGoogle(credential) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error(`Google login failed (${res.status})`);
  return res.json(); // { email, name, picture }
}