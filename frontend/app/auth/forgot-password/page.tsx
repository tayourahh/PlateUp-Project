'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setSent(true)
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-[#F5F5F5] py-10 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-10">

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {sent ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#eaf3de] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                stroke="#3a7d44" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">Check your email!</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            We sent a reset link to <strong>{email}</strong>
                        </p>
                        <Link href="/auth/login"
                            className="text-sm text-[#3a7d44] font-medium hover:underline">
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email" value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Your email" required
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d44]/20 focus:border-[#3a7d44]"
                                />
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-3 bg-[#3a7d44] hover:bg-[#2d6435] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Remember your password?{' '}
                            <Link href="/auth/login" className="text-[#3a7d44] font-medium">
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}