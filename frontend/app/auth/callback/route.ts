import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Ambil role dari cookie yang disimpan sebelum Google OAuth
            const pendingRole = request.cookies.get('pending_role')?.value ?? null

            // Cek apakah profile sudah ada
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (!existingProfile) {
                // User baru via Google → buat profile dengan role dari cookie
                const role = pendingRole ?? 'customer'
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    full_name: data.user.user_metadata?.full_name
                        ?? data.user.user_metadata?.name
                        ?? '',
                    role,
                })

                // Hapus cookie pending_role
                const response = NextResponse.redirect(`${origin}/dashboard/${role}`)
                response.cookies.delete('pending_role')
                return response
            }

            // User sudah ada → pakai role yang sudah tersimpan
            const role = existingProfile.role ?? 'customer'
            const response = NextResponse.redirect(`${origin}/dashboard/${role}`)
            response.cookies.delete('pending_role')
            return response
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}