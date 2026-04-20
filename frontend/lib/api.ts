// frontend/lib/api.ts — FULL FILE

import { createClient } from '@/lib/supabase/client'

// ── Auth Helper ──────────────────────────────────────────────────
async function getAuthHeaders(): Promise<HeadersInit> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
        throw new Error('No active session')
        // ⚠️ Kalau error ini muncul: user belum login atau session expired
        // Frontend harus handle dengan redirect ke /auth/login
    }

    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
    }
}

// Versi tanpa Content-Type — untuk FormData (ada file upload)
// Browser akan auto-set Content-Type: multipart/form-data dengan boundary yang benar
async function getAuthHeadersMultipart(): Promise<HeadersInit> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) throw new Error('No active session')

    return {
        'Authorization': `Bearer ${session.access_token}`,
        // ⚠️ JANGAN tambahkan Content-Type di sini!
        // Browser HARUS yang set sendiri supaya boundary multipart terbentuk
    }
}

// ── Profile Routes ───────────────────────────────────────────────
export async function getProfile() {
    const headers = await getAuthHeaders()
    const response = await fetch('/api/backend/profile', { headers })
    if (!response.ok) throw new Error(`Failed to fetch profile: ${response.status}`)
    return response.json()
}

export async function updateProfile(data: { full_name?: string; phone_number?: string }) {
    const headers = await getAuthHeaders()
    const response = await fetch('/api/backend/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update profile')
    return response.json()
}

// ── Surplus Product Routes ───────────────────────────────────────

/**
 * Upload surplus product baru
 * Menggunakan FormData karena ada file image
 * 
 * Cara pakai di component:
 *   const fd = new FormData()
 *   fd.append('product_name', 'Bakmie Ayam')
 *   fd.append('image', fileObject)  ← File dari input atau drag-drop
 *   await createSurplusProduct(fd)
 */
export async function createSurplusProduct(formData: FormData) {
    const headers = await getAuthHeadersMultipart()
    const response = await fetch('http://localhost:5000/api/surplus/products', {
        method: 'POST',
        headers,
        body: formData,
    })
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Upload failed: ${response.status}`)
        // ⚠️ 400 = validasi gagal (nama kosong, dll)
        // ⚠️ 401 = token expired, perlu refresh session
        // ⚠️ 500 = error di Flask atau Supabase
    }
    return response.json()
}

/**
 * Ambil semua produk surplus milik partner yang sedang login
 */
export async function getSurplusProducts() {
    const headers = await getAuthHeaders()
    const response = await fetch('http://localhost:5000/api/surplus/products', { headers })
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
}

/**
 * Generate deskripsi produk via Gemini AI
 * Panggil setelah user isi product_name dan category
 */
export async function generateAIDescription(payload: {
    product_name: string
    category: string
    original_price?: number
}) {
    const headers = await getAuthHeaders()
    const response = await fetch('http://localhost:5000/api/ai/generate-description', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('AI description generation failed')
    return response.json() as Promise<{ description: string }>
}

/**
 * Generate expiry estimate + PlateUp price via Gemini AI
 * Satu call menghasilkan dua field sekaligus karena logikanya terkait
 */
export async function generateAIExpiry(payload: {
    product_name: string
    category: string
    production_time: string
    original_price?: number
}) {
    const headers = await getAuthHeaders()
    const response = await fetch('http://localhost:5000/api/ai/generate-expiry', {
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