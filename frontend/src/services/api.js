import { API_BASE } from "../config";

export async function uploadDocument(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/upload/`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = await res.json();
  return { id: data.filename, filename: data.filename, chunks: data.chunks };
}

export async function sendChatMessage(question, filename) {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, filename: filename || null }),
  });
  if (!res.ok) throw new Error(`Chat request failed (${res.status})`);
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/documents/`);
  if (!res.ok) throw new Error(`Fetching documents failed (${res.status})`);
  return res.json();
}

export async function deleteDocument(filename) {
  const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(filename)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  return res.json();
}

export async function summarizeDocument(filename) {
  const res = await fetch(`${API_BASE}/resume/${encodeURIComponent(filename)}`, { method: "POST" });
  if (!res.ok) throw new Error(`Summary failed (${res.status})`);
  return res.json();
}

export async function generateQuiz(filename) {
  const res = await fetch(
    `${API_BASE}/quiz/${encodeURIComponent(filename)}`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    throw new Error(`Quiz generation failed (${res.status})`);
  }

  return res.json();
}