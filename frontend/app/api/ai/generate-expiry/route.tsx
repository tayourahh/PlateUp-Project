import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const productName = body.productName ?? body.product_name;
        const category = body.category;
        const productionTime = body.productionTime ?? body.production_time;
        const originalPrice =
            Number(body.originalPrice ?? body.original_price ?? 0) || 0;

        if (!productName || !productionTime) {
            return NextResponse.json(
                { error: "productName dan productionTime wajib diisi" },
                { status: 400 },
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key missing" }, { status: 500 });
        }

        const prompt = `
Kamu adalah asisten food safety.

Tentukan estimasi waktu kadaluarsa makanan berikut:
- Nama: ${productName}
- Kategori: ${category}
- Waktu produksi: ${productionTime}

Jawab hanya JSON:
{ "expiryTime": "HH:MM", "note": "..." }
`;

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
        });

        const data = await aiRes.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== "string") {
            return NextResponse.json(
                { error: "Format respons AI tidak valid" },
                { status: 502 },
            );
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json(
                { error: "Respons AI tidak mengandung JSON" },
                { status: 502 },
            );
        }

        let parsed: Record<string, unknown>;
        try {
            const parsedUnknown: unknown = JSON.parse(jsonMatch[0]);
            if (!parsedUnknown || typeof parsedUnknown !== "object") {
                return NextResponse.json(
                    { error: "JSON AI bukan object" },
                    { status: 502 },
                );
            }
            parsed = parsedUnknown as Record<string, unknown>;
        } catch {
            return NextResponse.json(
                { error: "Gagal parsing JSON dari respons AI" },
                { status: 502 },
            );
        }

        const expiryTime = parsed.expiry_time ?? parsed.expiryTime;
        const validExpiry =
            typeof expiryTime === "string" && /^\d{2}:\d{2}$/.test(expiryTime)
                ? expiryTime
                : null;

        if (!validExpiry) {
            return NextResponse.json(
                { error: "AI tidak mengembalikan expiry_time valid" },
                { status: 502 },
            );
        }

        const rawPrice =
            Number(parsed.plate_up_price ?? parsed.plateUpPrice ?? 0) || 0;
        const roundedPrice = Math.round(rawPrice / 500) * 500;
        const fallbackPrice = Math.round((originalPrice * 0.55) / 500) * 500;

        return NextResponse.json({
            expiry_time: validExpiry,
            plate_up_price: roundedPrice > 0 ? roundedPrice : fallbackPrice,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
