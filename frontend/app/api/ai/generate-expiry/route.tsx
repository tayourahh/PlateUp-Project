import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: NextRequest) {
    const { product_name, category, production_time, original_price } = await req.json()

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: `Produk surplus: ${product_name}, ${category}, ${production_time}, Rp ${original_price}. Balas HANYA JSON: {"expiry_estimate": "...", "plate_up_price": 9000}`
        })
        const raw = (response.text ?? '').replace(/```json|```/g, '').trim()
        const result = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
        return NextResponse.json(result)
    } catch {
        return NextResponse.json({
            expiry_estimate: 'Konsumsi dalam 2 jam',
            plate_up_price: Math.floor(original_price * 0.55)
        })
    }
}