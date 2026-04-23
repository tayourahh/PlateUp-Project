import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("Authorization") ?? "";

        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        let backendError = "";

        // Primary path: use Python backend endpoint when available.
        if (backendUrl) {
            try {
                const res = await fetch(`${backendUrl}/api/ai/generate-description`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: authHeader,
                    },
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(18000),
                });

                const data: unknown = await res.json();
                const description =
                    typeof data === "object" &&
                        data !== null &&
                        "description" in data &&
                        typeof data.description === "string"
                        ? data.description
                        : "";

                if (res.ok && description.trim()) {
                    return NextResponse.json({ description: description.trim() });
                }

                const errorMessage =
                    typeof data === "object" &&
                        data !== null &&
                        "error" in data &&
                        typeof data.error === "string"
                        ? data.error
                        : `Backend error ${res.status}`;
                backendError = errorMessage;
            } catch (err: unknown) {
                backendError =
                    err instanceof Error ? err.message : "Backend request failed";
            }
        } else {
            backendError = "NEXT_PUBLIC_API_URL belum diset";
        }

        // Fallback path: direct call to OpenRouter from this Next route.
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                {
                    error: `Generate description gagal. ${backendError}. OPENROUTER_API_KEY tidak tersedia.`,
                },
                { status: 502 },
            );
        }

        const productName = body.product_name ?? body.productName ?? "";
        const category = body.category ?? "";
        const originalPrice =
            Number(body.original_price ?? body.originalPrice ?? 0) || 0;
        const plateUpPrice =
            Number(body.plate_up_price ?? body.plateUpPrice ?? 0) || 0;
        const expiryTime = body.expiry_time ?? body.expiryTime ?? "";
        const discountPct =
            originalPrice > 0 && plateUpPrice > 0
                ? Math.round((1 - plateUpPrice / originalPrice) * 100)
                : 0;

        const prompt = `Kamu copywriter untuk PlateUp, aplikasi surplus food Indonesia yang membantu mengurangi food waste.

PRODUK YANG DIJUAL:
- Nama: ${productName}
- Kategori: ${category}
- Harga asli: Rp ${Math.floor(originalPrice)}
- Harga PlateUp: Rp ${Math.floor(plateUpPrice)} (hemat ${discountPct}%)
- Batas konsumsi: sebelum pukul ${expiryTime} WIB

TUGAS:
Tulis deskripsi produk surplus dalam Bahasa Indonesia yang natural dan mengajak beli.
Maksimal 2 kalimat.

Balas HANYA teks deskripsinya saja, tanpa tanda kutip, tanpa penjelasan.`;

        const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
            }),
            signal: AbortSignal.timeout(20000),
        });

        const aiData: unknown = await aiRes.json();
        const content =
            typeof aiData === "object" &&
                aiData !== null &&
                "choices" in aiData &&
                Array.isArray(aiData.choices) &&
                aiData.choices[0]?.message?.content
                ? String(aiData.choices[0].message.content)
                : "";

        const description = content.replace(/^"|"$/g, "").trim();
        if (!aiRes.ok || !description) {
            const fallbackError = backendError || "AI response kosong";
            return NextResponse.json(
                { error: `Generate description gagal. ${fallbackError}` },
                { status: 502 },
            );
        }

        return NextResponse.json({ description });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
