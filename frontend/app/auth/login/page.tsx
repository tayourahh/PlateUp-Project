'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        })

        if (signInError) {
            setError(signInError.message)
            setLoading(false)
            return
        }

        // Cek role lalu redirect ke dashboard yang sesuai
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles').select('role').eq('id', user.id).single()
            const role = profile?.role ?? 'customer'
            router.push(`/dashboard/${role}`)
            router.refresh()
        }
    }

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        })
        if (error) setError(error.message)
    }

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[#F5F5F5] py-10 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h2>
                    <p className="text-sm text-gray-500">
                        Sign in to continue reducing food waste.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" name="email" value={form.email}
                            onChange={handleChange} placeholder="Your Email" required
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d44]/20 focus:border-[#3a7d44]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" name="password" value={form.password}
                            onChange={handleChange} placeholder="Your password" required
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d44]/20 focus:border-[#3a7d44]" />
                    </div>

                    <div className="text-right">
                        <Link href="/auth/forgot-password" className="text-sm text-gray-500 hover:text-[#3a7d44]">
                            Forgot your password?
                        </Link>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-[#3a7d44] hover:bg-[#2d6435] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or sign in with</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button onClick={handleGoogleLogin}
                    className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <p className="text-center text-sm text-gray-500 mt-5">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-[#3a7d44] font-medium">Sign up</Link>
                </p>
            </div>
        </div>
    )
}   