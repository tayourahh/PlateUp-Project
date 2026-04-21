import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: NextRequest) {
    const { product_name, category, original_price } = await req.json()

    // Debug: cek apakah API key terbaca
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 })
    }

    try {
        const ai = new GoogleGenAI({ apiKey })
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Buat deskripsi 2 kalimat untuk surplus food: ${product_name}, ${category}, Rp ${original_price}. Bahasa Indonesia. Balas HANYA teks deskripsi.`
        })

        return NextResponse.json({ description: response.text?.trim() ?? '' })
    } catch (e: any) {
        // Return error detail ke frontend supaya keliatan
        return NextResponse.json({
            error: e.message,
            detail: e.toString(),
            stack: e.stack?.split('\n').slice(0, 3)
        }, { status: 500 })
    }
}