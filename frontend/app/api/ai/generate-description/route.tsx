import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.5-flash-lite";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!client) client = new GoogleGenAI({ apiKey });
    return client;
}

function fallbackDescription(category: string, plateUpPrice: number, expiryTime: string, discountPct: number): string {
    const cat = category.toLowerCase();
    const price = `Rp ${Math.round(plateUpPrice)}`;

    if (cat.includes("rice") || cat.includes("nasi")) {
        return `Nasi masih hangat dan baru matang, disimpan dalam wadah tertutup rapat. Bisa kamu dapatkan dengan harga spesial ${price} sebelum pukul ${expiryTime}.`;
    }
    if (cat.includes("noodle") || cat.includes("mie")) {
        return `Mie masih dalam kondisi baik dan baru dimasak, cocok langsung disantap. Ambil sekarang dengan harga ${price}, hemat ${discountPct}% dari harga normal.`;
    }
    if (cat.includes("bread") || cat.includes("roti") || cat.includes("bakery")) {
        return `Roti masih lembut dan segar dari dapur, belum melewati satu hari. Harga spesial ${price} untuk kamu yang mau hemat hari ini.`;
    }
    if (cat.includes("snack") || cat.includes("camilan")) {
        return `Camilan dalam kondisi baik dan dikemas dengan higienis. Dapatkan dengan harga ${price} sebelum pukul ${expiryTime}.`;
    }
    return `Makanan masih dalam kondisi layak konsumsi dan baru disiapkan. Tersedia dengan harga ${price}, hemat ${discountPct}% dari harga aslinya.`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const productName: string = body.product_name ?? body.productName ?? "";
        const category: string = body.category ?? "";
        const originalPrice = Number(body.original_price ?? body.originalPrice ?? 0) || 0;
        const plateUpPrice = Number(body.plate_up_price ?? body.plateUpPrice ?? 0) || 0;
        const expiryTime: string = body.expiry_time ?? body.expiryTime ?? "";

        const discountPct = originalPrice > 0 && plateUpPrice > 0
            ? Math.round((1 - plateUpPrice / originalPrice) * 100)
            : 0;

        const fallback = fallbackDescription(category, plateUpPrice, expiryTime, discountPct);

        const ai = getClient();
        if (!ai) return NextResponse.json({ description: fallback });

        const prompt = `Kamu copywriter untuk PlateUp, aplikasi surplus food Indonesia yang membantu mengurangi food waste.

PRODUK YANG DIJUAL:
- Nama: ${productName}
- Kategori: ${category}
- Harga asli: Rp ${Math.round(originalPrice)}
- Harga PlateUp: Rp ${Math.round(plateUpPrice)} (hemat ${discountPct}%)
- Batas konsumsi: sebelum pukul ${expiryTime} WIB

TUGAS:
Tulis deskripsi produk surplus dalam Bahasa Indonesia yang natural dan mengajak beli.
Maksimal 2 kalimat.

ATURAN KETAT:
- Gunakan HANYA Bahasa Indonesia, tidak boleh ada kata Inggris
- Kalimat pertama: kondisi/kualitas makanan sekarang
- Kalimat kedua: nilai/keuntungan beli (harga hemat ATAU batas waktu sebagai urgensi)
- Jangan gunakan kata: "lezat", "nikmat", "mantap", "yummy", "fresh" (terlalu generik)
- Nada: hangat, jujur, tidak lebay
- Jangan sebut nama produk lagi di deskripsi (sudah ada di judul)

Balas HANYA teks deskripsinya saja, tanpa tanda kutip, tanpa penjelasan.`;

        try {
            const response = await ai.models.generateContent({
                model: MODEL,
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: { maxOutputTokens: 200 },
            });

            const description = (response.text ?? "").trim().replace(/^["']|["']$/g, "");
            if (!description) return NextResponse.json({ description: fallback });

            return NextResponse.json({ description });
        } catch {
            return NextResponse.json({ description: fallback });
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
