import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const body = await req.json()
    const authHeader = req.headers.get('Authorization') ?? ''

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-expiry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
        },
        body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}