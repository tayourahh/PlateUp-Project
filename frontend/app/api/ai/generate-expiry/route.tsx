import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { productName, category, productionTime } = await req.json()

        if (!productName || !productionTime) {
            return NextResponse.json(
                { error: "productName dan productionTime wajib diisi" },
                { status: 400 }
            )
        }

        const apiKey = process.env.OPENROUTER_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "API key missing" },
                { status: 500 }
            )
        }

        const prompt = `
Kamu adalah asisten food safety.

Tentukan estimasi waktu kadaluarsa makanan berikut:
- Nama: ${productName}
- Kategori: ${category}
- Waktu produksi: ${productionTime}

Jawab hanya JSON:
{ "expiryTime": "HH:MM", "note": "..." }
`

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
        })

        const data = await aiRes.json()

        return NextResponse.json(data)

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        )
    }
}