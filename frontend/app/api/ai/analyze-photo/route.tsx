import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Model dipilih karena kuota gratis-nya paling tinggi (RPM/RPD) di antara
// model Gemini yang tersedia — cocok untuk beban demo/portfolio.
const MODEL = "gemini-2.0-flash-lite";

// Dipanggil langsung ke Google AI Studio (bukan lewat OpenRouter), supaya
// kuota gratisnya dedicated untuk project ini, tidak dibagi user lain.
let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!client) client = new GoogleGenAI({ apiKey });
    return client;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PhotoAnalysisResult {
    visual_condition: string;
    notes: string;
    confidence: "low" | "medium" | "high";
}

function parseAnalysis(text: string): PhotoAnalysisResult | null {
    const cleaned = text.replace(/```(?:json)?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
        const parsed = JSON.parse(match[0]);
        const visualCondition =
            typeof parsed.visual_condition === "string" ? parsed.visual_condition.trim() : "";
        const notes = typeof parsed.notes === "string" ? parsed.notes.trim() : "";
        const confidenceRaw = String(parsed.confidence ?? "").toLowerCase();
        const confidence: PhotoAnalysisResult["confidence"] =
            confidenceRaw === "high" || confidenceRaw === "low" ? confidenceRaw : "medium";

        if (!visualCondition) return null;
        return { visual_condition: visualCondition, notes, confidence };
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const imageBase64: string | undefined = body.image_base64 ?? body.imageBase64;
        const mimeType: string = body.mime_type ?? body.mimeType ?? "image/jpeg";
        const productName: string = body.product_name ?? body.productName ?? "";
        const category: string = body.category ?? "";

        if (!imageBase64) {
            return NextResponse.json({ error: "image_base64 wajib diisi" }, { status: 400 });
        }

        const ai = getClient();
        if (!ai) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY belum diset di environment." },
                { status: 500 },
            );
        }

        // Foto yang dikirim ke sini sudah dikompres di sisi browser (max ~800px)
        // sebelum sampai ke endpoint ini — mengurangi konsumsi token per request.
        const base64Data = imageBase64.includes(",")
            ? imageBase64.split(",")[1]
            : imageBase64;

        const prompt = `Kamu adalah asisten yang membantu partner UMKM PlateUp menilai TAMPILAN VISUAL foto makanan surplus sebelum diunggah ke platform.

KONTEKS:
- Nama produk: ${productName || "(tidak diisi)"}
- Kategori: ${category || "(tidak diisi)"}

PENTING — BATASAN:
Kamu TIDAK BISA menentukan keamanan pangan (food safety) secara ilmiah hanya dari foto — itu butuh indra penciuman, tekstur fisik, dan suhu yang tidak bisa dinilai dari gambar. Jangan pernah mengklaim makanan "pasti aman" atau "pasti tidak aman" dikonsumsi. Fokus HANYA pada penilaian visual: kerapian penyajian, warna, kondisi kemasan, dan kesan kesegaran dari tampilan.

TUGAS:
Nilai tampilan visual foto ini dalam 1 kalimat singkat Bahasa Indonesia (visual_condition), plus catatan tambahan jika ada hal yang perlu diperhatikan partner sebelum upload (notes, boleh string kosong jika tidak ada catatan khusus).

Balas HANYA JSON berikut, tanpa markdown, tanpa penjelasan lain:
{"visual_condition": "...", "notes": "...", "confidence": "low|medium|high"}`;

        const maxAttempts = 2;
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: MODEL,
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: prompt },
                                { inlineData: { data: base64Data, mimeType } },
                            ],
                        },
                    ],
                    config: {
                        responseMimeType: "application/json",
                        maxOutputTokens: 200,
                    },
                });

                const text = response.text ?? "";
                const parsed = parseAnalysis(text);

                if (parsed) {
                    return NextResponse.json(parsed);
                }
                lastError = new Error("Format respons AI tidak valid");
            } catch (err: unknown) {
                lastError = err;
                const message = err instanceof Error ? err.message : String(err);
                const isRateLimit = message.includes("429") || message.toLowerCase().includes("resource_exhausted");

                if (isRateLimit && attempt < maxAttempts) {
                    // Backoff singkat sebelum retry sekali — cukup untuk rate limit
                    // sesaat, tidak bikin user nunggu lama.
                    await sleep(1500);
                    continue;
                }
                break;
            }
        }

        const errorMessage = lastError instanceof Error ? lastError.message : "AI gagal menganalisis foto";
        const isRateLimit = errorMessage.includes("429") || errorMessage.toLowerCase().includes("resource_exhausted");

        return NextResponse.json(
            {
                error: isRateLimit
                    ? "AI sedang sibuk (rate limit), coba lagi sebentar lagi."
                    : `Analisis foto gagal. ${errorMessage}`,
            },
            { status: isRateLimit ? 429 : 502 },
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
