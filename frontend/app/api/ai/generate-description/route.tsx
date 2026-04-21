import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: NextRequest) {
    const { product_name, category, original_price } = await req.json()

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Buat deskripsi 2 kalimat untuk surplus food: ${product_name}, ${category}, Rp ${original_price}. Bahasa Indonesia. Balas HANYA teks deskripsi.`
        })

        return NextResponse.json({ description: response.text?.trim() ?? '' })
    } catch (e: any) {
        console.error('DESCRIPTION ERROR:', e.message)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}