const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiPost(endpoint, body) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
    return data;
}