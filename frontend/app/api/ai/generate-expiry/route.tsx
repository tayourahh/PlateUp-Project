import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const body = await req.json()
    const authHeader = req.headers.get('Authorization') ?? ''

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-expiry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(25000),
        })

        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}