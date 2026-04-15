"use client";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [form, setForm] = useState({ email: "", password: "", role: "buyer", full_name: "" });
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const data = await apiPost("/api/auth/register", form);
            localStorage.setItem("token", data.token);  // Simpan JWT di client
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 flex flex-col gap-4">
            <h1 className="text-2xl font-medium">Daftar ke PlateUp!</h1>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input type="email" placeholder="Email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="border rounded-lg px-4 py-2" required />
            <input type="password" placeholder="Password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="border rounded-lg px-4 py-2" required />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="border rounded-lg px-4 py-2">
                <option value="buyer">Pembeli</option>
                <option value="mitra">Mitra UMKM</option>
            </select>
            <button type="submit" className="bg-green-600 text-white rounded-lg px-4 py-2">Daftar</button>
        </form>
    );
}