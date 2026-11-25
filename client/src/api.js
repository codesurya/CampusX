// Production API client for CampusX
// Dynamically normalizes VITE_API_URL with or without trailing slash or /api path
const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim().replace(/\/+$/, "");
const BASE = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

export const getToken = () => localStorage.getItem("campusx_token");
export const setToken = (t) =>
  t ? localStorage.setItem("campusx_token", t) : localStorage.removeItem("campusx_token");

export async function api(path, { method = "GET", body } = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${BASE}${cleanPath}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}
