import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // JANGAN hapus baris ini — refresh session agar tidak expired
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes: redirect ke login kalau belum auth
    const protectedPaths = ['/dashboard', '/orders', '/profile']
    const isProtected = protectedPaths.some(p =>
        request.nextUrl.pathname.startsWith(p)
    )

    if (isProtected && !user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Kalau sudah login tapi akses /login atau /register → redirect dashboard
    const authPaths = ['/login', '/register']
    const isAuthPage = authPaths.some(p =>
        request.nextUrl.pathname.startsWith(p)
    )

    if (isAuthPage && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}