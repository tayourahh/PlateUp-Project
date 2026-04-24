import { NextRequest, NextResponse } from "next/server";

type ShelfLifeRule = {
    minHours: number;
    maxHours: number;
};

function parseHHMMToMinutes(value: string): number | null {
    const match = value.match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return hour * 60 + minute;
}

function formatMinutesToHHMM(totalMinutes: number): string {
    const dayMinutes = 24 * 60;
    const normalized = ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;
    const hour = Math.floor(normalized / 60)
        .toString()
        .padStart(2, "0");
    const minute = (normalized % 60).toString().padStart(2, "0");
    return `${hour}:${minute}`;
}

function getShelfLifeRule(
    productName: string,
    category?: string,
): ShelfLifeRule {
    const target = `${productName} ${category ?? ""}`.toLowerCase();

    // Bakery goods generally have short safe selling windows.
    if (/roti|bread|cake|pastry|bakery|donut|croissant/.test(target)) {
        return { minHours: 2, maxHours: 8 };
    }

    if (/nasi|rice|ayam|chicken|daging|meal|lauk|masakan/.test(target)) {
        return { minHours: 2, maxHours: 12 };
    }

    if (/minuman|drink|beverage|jus|juice|kopi|teh/.test(target)) {
        return { minHours: 2, maxHours: 24 };
    }

    return { minHours: 2, maxHours: 16 };
}

function clampExpiryTime(
    aiExpiryTime: string,
    productionTime: string,
    rule: ShelfLifeRule,
): string | null {
    const productionMinutes = parseHHMMToMinutes(productionTime);
    const aiMinutesRaw = parseHHMMToMinutes(aiExpiryTime);

    if (productionMinutes === null || aiMinutesRaw === null) return null;

    // Treat AI time as same day by default; if it looks earlier than production,
    // interpret it as crossing midnight to the next day.
    const aiMinutesAbsolute =
        aiMinutesRaw < productionMinutes ? aiMinutesRaw + 24 * 60 : aiMinutesRaw;

    const minAllowed = productionMinutes + rule.minHours * 60;
    const maxAllowed = productionMinutes + rule.maxHours * 60;
    const clamped = Math.max(minAllowed, Math.min(aiMinutesAbsolute, maxAllowed));

    return formatMinutesToHHMM(clamped);
}

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

        const shelfLifeRule = getShelfLifeRule(productName, category);

        const prompt = `
Kamu adalah asisten food safety.

Tentukan estimasi waktu kadaluarsa makanan berikut:
- Nama: ${productName}
- Kategori: ${category}
- Waktu produksi: ${productionTime}

    Aturan penting:
    - Estimasi kadaluarsa harus realistis untuk makanan siap jual.
    - Gunakan rentang ${shelfLifeRule.minHours}-${shelfLifeRule.maxHours} jam setelah waktu produksi.
    - Untuk roti/bakery, jangan berikan waktu terlalu lama.

Jawab hanya JSON:
    { "expiryTime": "HH:MM", "plateUpPrice": 0, "note": "..." }
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

        const safeExpiry = clampExpiryTime(
            validExpiry,
            productionTime,
            shelfLifeRule,
        );
        if (!safeExpiry) {
            return NextResponse.json(
                { error: "Format productionTime atau expiry_time tidak valid" },
                { status: 400 },
            );
        }

        const rawPrice =
            Number(parsed.plate_up_price ?? parsed.plateUpPrice ?? 0) || 0;
        const roundedPrice = Math.round(rawPrice / 500) * 500;
        const fallbackPrice = Math.round((originalPrice * 0.55) / 500) * 500;

        return NextResponse.json({
            expiry_time: safeExpiry,
            plate_up_price: roundedPrice > 0 ? roundedPrice : fallbackPrice,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
