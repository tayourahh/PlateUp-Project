// frontend/lib/api.ts

import { createClient } from '@/lib/supabase/client'

// Otomatis pakai Railway URL di production, localhost saat development
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ── Auth Helper ──────────────────────────────────────────────────
async function getAuthHeaders(): Promise<HeadersInit> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
        throw new Error('No active session')
    }

    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
    }
}

async function getAuthHeadersMultipart(): Promise<HeadersInit> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) throw new Error('No active session')

    return {
        'Authorization': `Bearer ${session.access_token}`,
        // Jangan set Content-Type — browser auto-set boundary multipart
    }
}

// ── Profile Routes ───────────────────────────────────────────────
export async function getProfile() {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/api/profile`, { headers })
    if (!response.ok) throw new Error(`Failed to fetch profile: ${response.status}`)
    return response.json()
}

export async function updateProfile(data: { full_name?: string; phone_number?: string }) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update profile')
    return response.json()
}

// ── Surplus Product Routes ───────────────────────────────────────
export async function createSurplusProduct(formData: FormData) {
    const headers = await getAuthHeadersMultipart()
    const response = await fetch(`${API_BASE}/api/surplus/products`, {
        method: 'POST',
        headers,
        body: formData,
    })
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Upload failed: ${response.status}`)
    }
    return response.json()
}

export async function getSurplusProducts() {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/api/surplus/products`, { headers })
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
}

// ── AI Routes ────────────────────────────────────────────────────
export async function generateAIDescription(payload: {
    product_name: string
    category: string
    original_price?: number
}) {
    const headers = await getAuthHeaders()
    const response = await fetch(`/api/ai/generate-description`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('AI description generation failed')
    return response.json() as Promise<{ description: string }>
}

export async function generateAIExpiry(payload: {
    product_name: string
    category: string
    production_time: string
    original_price?: number
}) {
    const headers = await getAuthHeaders()
    const response = await fetch(`/api/ai/generate-expiry`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('AI expiry generation failed')
    return response.json() as Promise<{
        expiry_estimate: string
        plate_up_price: number
    }>
}