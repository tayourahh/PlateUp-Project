import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Model yang sama dipakai di seluruh fitur AI PlateUp — satu provider,
// satu kuota, lebih gampang dipantau & didokumentasikan.
const MODEL = "gemini-3.5-flash-lite";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!client) client = new GoogleGenAI({ apiKey });
    return client;
}

function roundTo500(value: number): number {
    return Math.round(value / 500) * 500;
}

// Batas keamanan pangan per kategori (jam sejak produksi). Ini HARD LIMIT —
// AI boleh menyarankan waktu di dalam rentang ini, tapi hasil akhirnya
// selalu di-clamp supaya tidak pernah melewati batas aman, apapun jawaban AI.
const SHELF_LIFE_HOURS: Record<string, number> = {
    rice: 6, nasi: 6,
    noodles: 5, mie: 5,
    bread: 12, roti: 12, bakery: 12, pastry: 8, cake: 8, donut: 8, croissant: 8,
    snack: 24, camilan: 24,
    beverage: 8, drink: 8, minuman: 8, jus: 8, juice: 8,
    dessert: 8,
    salad: 4,
    meat: 4, daging: 4, ayam: 4, chicken: 4,
};

function getMaxShelfHours(category: string, productName: string): number {
    const target = `${category} ${productName}`.toLowerCase();
    for (const [key, hours] of Object.entries(SHELF_LIFE_HOURS)) {
        if (target.includes(key)) return hours;
    }
    return 6; // default konservatif kalau kategori tidak dikenali
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const productName: string = body.product_name ?? body.productName ?? "";
        const category: string = body.category ?? "";
        const productionTime: string = body.production_time ?? body.productionTime ?? "";
        const originalPrice = Number(body.original_price ?? body.originalPrice ?? 0) || 0;

        if (!productionTime || !/^\d{2}:\d{2}$/.test(productionTime)) {
            return NextResponse.json(
                { error: "production_time wajib diisi format HH:MM" },
                { status: 400 },
            );
        }

        const now = new Date();
        const [prodHour, prodMin] = productionTime.split(":").map(Number);
        const prodDate = new Date(now);
        prodDate.setHours(prodHour, prodMin, 0, 0);
        if (prodDate.getTime() > now.getTime()) {
            prodDate.setDate(prodDate.getDate() - 1); // dianggap kemarin kalau "di masa depan"
        }
        const elapsedHours = (now.getTime() - prodDate.getTime()) / (1000 * 60 * 60);

        const maxShelf = getMaxShelfHours(category, productName);
        const remainingHours = Math.max(0.5, maxShelf - elapsedHours);
        const latestSafe = new Date(now.getTime() + remainingHours * 60 * 60 * 1000);
        const latestSafeStr = `${String(latestSafe.getHours()).padStart(2, "0")}:${String(latestSafe.getMinutes()).padStart(2, "0")}`;
        const nowStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        const priceFloor = roundTo500(originalPrice * 0.5);
        const priceCeil = roundTo500(originalPrice * 0.6);
        const fallbackPrice = roundTo500(originalPrice * 0.55);

        // ─── Fallback yang selalu siap dipakai kalau AI gagal/limit ───
        const fallbackResult = { expiry_time: latestSafeStr, plate_up_price: fallbackPrice };

        const ai = getClient();
        if (!ai) {
            return NextResponse.json(fallbackResult); // GEMINI_API_KEY belum diset — tetap jalan pakai fallback
        }

        const prompt = `Kamu adalah sistem food safety otomatis untuk PlateUp, platform surplus food Indonesia.

KONTEKS SAAT INI:
- Waktu sekarang: ${nowStr} WIB
- Produk: ${productName}
- Kategori: ${category}
- Diproduksi pada: ${productionTime} WIB
- Sudah berlalu: ${elapsedHours.toFixed(1)} jam sejak produksi
- Harga asli: Rp ${Math.round(originalPrice)}

ATURAN WAJIB:
1. expiry_time HARUS format "HH:MM" (24 jam)
2. expiry_time TIDAK BOLEH lebih dari ${latestSafeStr} WIB (batas aman food safety)
3. expiry_time TIDAK BOLEH sebelum ${nowStr} WIB
4. plate_up_price HARUS kelipatan 500, antara Rp ${priceFloor} dan Rp ${priceCeil}

Balas HANYA JSON berikut, tanpa markdown, tanpa penjelasan:
{"expiry_time": "HH:MM", "plate_up_price": 0}`;

        try {
            const response = await ai.models.generateContent({
                model: MODEL,
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json", maxOutputTokens: 150 },
            });

            const text = response.text ?? "";
            const match = text.replace(/```(?:json)?/g, "").match(/\{[\s\S]*\}/);
            if (!match) return NextResponse.json(fallbackResult);

            const parsed = JSON.parse(match[0]);
            let expiryTime = String(parsed.expiry_time ?? "");
            if (!/^\d{2}:\d{2}$/.test(expiryTime)) expiryTime = latestSafeStr;

            let price = Number(parsed.plate_up_price ?? 0);
            if (!(price >= priceFloor && price <= priceCeil)) price = fallbackPrice;

            return NextResponse.json({ expiry_time: expiryTime, plate_up_price: price });
        } catch {
            // AI gagal (rate limit, network, dll) — tetap kasih jawaban aman, jangan block user.
            return NextResponse.json(fallbackResult);
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
